<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ApplicationNotificationModel;
use Carbon\Carbon;
use DB;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class AppNotificationController extends Controller
{
    public function index()
    {
        $appNoti = ApplicationNotificationModel::where('notification_type','1')->latest()->get();
        return view('app_notification.index', compact('appNoti'));
    }

    public function create()
    {
        return view('app_notification.create');
    }

    public function store(Request $request)
    {
        // dd($request->all());
        // $other_type                 = strip_tags($request->input('type'));
        $type                       = strip_tags($request->input('notification_type'));
        $notification_title         = strip_tags($request->input('notification_title'));
        $notification_url           = strip_tags($request->input('notification_url'));
        $notification_description   = strip_tags($request->input('notification_description'));
        $notification_image         = 'img/favicon.png';
        $notification_time          = ($type == 'direct')? null: strip_tags($request->input('schedule_time'));

        if ($request->hasFile('notification_image')) {
            $image = $request->file('notification_image');
            $directory = 'notification_images';
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('img/'.$directory), $imageName);
            $notification_image = 'img/'.$directory . '/' . $imageName;
        }

        $notification_data = [
            'notification_title' => $notification_title ,
            'notification_url' => $notification_url ,
            'notification_description' => $notification_description ,
            'notification_image' => $notification_image,
            'notification_time' => $notification_time ,
        ];
        $notification_data = json_encode($notification_data);

        if ($type == 'direct') {
            $player_ids = User::pluck('player_id')->toArray();
            if(count($player_ids) > 0){

                // $notificationSendData['noti_type'] = 'noti_9';
                $notificationSendData['player_ids'] = $player_ids;
                $notificationSendData['notification_title'] = $notification_title;
                $notificationSendData['notification_url'] = $notification_url;
                $notificationSendData['notification_description'] = $notification_description;
                $notificationSendData['notification_image'] = asset($notification_image);
                $send_notification = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);
            }
        }
        $notificationData['notification_type'] = ($type == 'direct')? 0:1;
        $notificationData['notification_data'] = $notification_data;
        $notificationData['type'] = 'other';
        $notificationData['created_at'] = Carbon::now();
        DB::table('app_notifications')->insert($notificationData);

        $message = ($type == 'direct') ? 'Notification sent successfully.':'Notification scheduled successfully.';

        // return redirect()->route('app_notification.create')->with('success',$message);
        return redirect()->route('app_notification.index')->with('success',$message);
    }

    public function edit(ApplicationNotificationModel $app_notification)
    {
        return view('app_notification.edit', compact('app_notification'));
    }

    public function update(Request $request, ApplicationNotificationModel $app_notification)
    {
        // $other_type              = strip_tags($request->input('type'));
        $type                       = strip_tags($request->input('notification_type'));
        $notification_title         = strip_tags($request->input('notification_title'));
        $notification_url           = strip_tags($request->input('notification_url'));
        $notification_description   = strip_tags($request->input('notification_description'));
        $notification_image         = 'img/favicon.png';
        $notification_time          = ($type == 'direct')? null: strip_tags($request->input('schedule_time'));

        if ($request->hasFile('notification_image')) {
            $old_Data = json_decode($app_notification->notification_data);
            // $imagePath = public_path($old_Data->notification_image);
            // unlink($imagePath);
            $imagePath = public_path($old_Data->notification_image);
            if (strpos($imagePath, 'favicon.png') !== true) {
                unlink($imagePath);
            }

            $image = $request->file('notification_image');
            $directory = 'notification_images';
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('img/'.$directory), $imageName);
            $notification_image = 'img/'.$directory . '/' . $imageName;
        }

        $notification_data = [
            'notification_title' => $notification_title ,
            'notification_url' => $notification_url ,
            'notification_description' => $notification_description ,
            'notification_image' => $notification_image,
            'notification_time' => $notification_time ,
        ];
        $notification_data = json_encode($notification_data);
        $notificationData['notification_type'] = ($type == 'direct')? 0:1;
        $notificationData['notification_data'] = $notification_data;
        $notificationData['type'] = 'other';

        $app_notification->update($notificationData);

        return redirect()->route('app_notification.index')->with('success', 'notification updated successfully.');
    }

    public function destroy(ApplicationNotificationModel $app_notification)
    {
        $notification_data = json_decode($app_notification->notification_data);
        $imagePath = public_path($notification_data->notification_image);
        // if (strpos($imagePath, 'favicon.png') !== true) {
        //     unlink($imagePath);
        // }
        $app_notification->delete();
        return redirect()->route('app_notification.index')->with('success', 'notification deleted successfully.');
    }


}
