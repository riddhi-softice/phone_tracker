<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\ApplicationNotificationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use DB;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $childUser;
    protected $parentUserId;
    protected $title;
    protected $noti_data;

    public function __construct($childUser, $parentUserId,$title,$noti_data)
    {
        $this->childUser = $childUser;
        $this->parentUserId = $parentUserId;
        $this->title = $title;
        $this->noti_data = $noti_data;
    }
    
    public function handle()
    {
        // \Log::info("SendNotificationJob is now running for parentUserId :" );

        $parentUserIds = is_array($this->parentUserId) ? $this->parentUserId : [$this->parentUserId];

        $notificationSendData['device_tokens'] = User::whereIn('id', $parentUserIds)->pluck('player_id')->toArray();
        $notificationSendData['notification_title'] = $this->title;
        $notificationSendData['notification_description'] = $this->title;
        // $notificationSendData['notification_title'] = $this->noti_data['noti_title'];
        // $notificationSendData['notification_description'] = $this->noti_data['noti_desc'];
        // $notificationSendData['other_data'] = $this->noti_data;
        $notificationSendData['notification_image'] = $this->childUser->profile_pic ?? asset('public/assets/img/logo.png');

        // ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);

        ApplicationNotificationModel::sendFirebaseNotification($notificationSendData);

        $sender_user_id = $this->childUser->id;
        $noti_type = $this->noti_data['noti_type'];
        $msg = $this->noti_data['msg'];
        $noti_date = $this->noti_data['noti_date'];

        $notificationData = [];
        foreach ($parentUserIds as $receiver_user_id) {
            $notificationData[] = [
                'sender_user_id' => $sender_user_id,
                'receiver_user_id' => $receiver_user_id,
                'title' => $msg,
                'noti_type' => $noti_type,
                'noti_date' => $noti_date,
            ];
        }
        DB::table('user_notifications')->insert($notificationData);
    }


    public function handle_single()
    {
        \Log::info("SendNotificationJob is now running for parentUserId :" .  $this->parentUserId);
        // \Log::info("hello..."); 
        $notificationSendData['player_ids'] = User::where('id', $this->parentUserId)->pluck('player_id')->toArray();
        $notificationSendData['notification_url'] = "";
        // $notificationSendData['notification_title'] = $this->childUser->name . " accepted your invitation";
        // $notificationSendData['notification_description'] = $this->childUser->name . " accepted your invitation";
        $notificationSendData['notification_title'] = $this->title;
        $notificationSendData['notification_description'] = $this->title;
        $notificationSendData['notification_time'] = date('Y-m-d H:i:s');
        $notificationSendData['notification_image'] = ($this->childUser->profile_pic == null) ? asset('public/assets/img/logo.png') : $this->childUser->profile_pic;

        $data = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);

        $receiver_user_ids = $this->parentUserId;
        $sender_user_id = $this->childUser->id;
        $noti_type = $this->noti_data['noti_type']; 
        $msg = $this->noti_data['msg']; 
        $noti_date = $this->noti_data['noti_date']; 
      
        $input = ['sender_user_id'=>$sender_user_id, 'receiver_user_id'=>$receiver_user_ids,'title'=>$msg,'noti_type'=>$noti_type,'noti_date'=>$noti_date];
        DB::table('user_notifications')->insert($input);
    }
}

