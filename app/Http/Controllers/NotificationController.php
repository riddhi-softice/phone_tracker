<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\ApplicationNotificationModel;
use DB;

class NotificationController extends BaseController
{
    public function send_call_notification(Request $request)
    {
        try {
            $request->validate([
                'receiver_user_id' => 'required',
            ]);

            $user = Auth::user();
            if ($user) {

                #  SEND PUSH NOTIFICATION TO PARENT USER
                $notificationSendData['player_ids'] = User::where('id',$request->receiver_user_id)->pluck('player_id')->toArray();
                $notificationSendData['notification_url'] = "";
                $notificationSendData['notification_title'] = $user->name . " is calling you.";
                $notificationSendData['notification_description'] = $user->name . " is calling you.";
                $notificationSendData['notification_time'] = date('Y-m-d H:i:s');
                $notificationSendData['notification_image'] = ($user->profile_pic == null) ? asset('public/assets/img/logo.png') : $user->profile_pic;
                $send_notification = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);
                
                 # STORE NOTIFICATION DATA
                $noti_date = date('Y-m-d H:i:s'); // Use array key access
                $input = ['sender_user_id'=>$user->id, 'receiver_user_id'=>$request->receiver_user_id,'title'=>"Calling you",'noti_type'=>"sos_call",'noti_date'=>$noti_date];
                DB::table('user_notifications')->insert($input);


                return $this->sendResponse([], 'Notification sent successfully.');
            }
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }
    
    public function notification_list(Request $request)
    {
            try {
            $perPage = $request->input('per_page', 10);
            $pageNumber = $request->input('page_no', 1);

            $user = Auth::user();
            if (!$user) {
                return $this->sendError('User not authenticated', 401);
            }
            // Query with join to fetch sender user details
            $getData = DB::table('user_notifications')
            ->join('users', 'user_notifications.sender_user_id', '=', 'users.id')
            ->where('user_notifications.receiver_user_id', $user->id)
            ->select(
                'user_notifications.sender_user_id',
                'user_notifications.title',
                'user_notifications.noti_date',
                'users.name as user_name',
                'users.profile_pic'
            )
            ->paginate($perPage, ['*'], 'page', $pageNumber);

            $result = $getData->map(function ($value) {
                return [
                    'sender_user_id' => $value->sender_user_id,
                    'user_name'     => $value->user_name,
                    'profile_pic'   => $value->profile_pic,
                    'title'   => $value->title,
                ];
            });

            $paginationDetails = [
                'total_record' => $getData->total(),
                'per_page' => $getData->perPage(),
                'current_page' => $getData->currentPage(),
                'last_page' => $getData->lastPage(),
            ];

            $responseData['pagination'] = $paginationDetails;
            $responseData['user_data'] = $result;

            $encryptedResponse = $this->encryptData($responseData);
            return $this->sendResponse($encryptedResponse, 'Data retrieved successfully.');
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }



}
