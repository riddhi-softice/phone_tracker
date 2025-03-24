<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\ApplicationNotificationModel;
use DB;
use App\Services\FirebaseNotificationService;

class NotificationController extends BaseController
{
    protected $firebaseService;

    public function __construct(FirebaseNotificationService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    } 

    public function firebase_noti_single()
    {
        // $deviceToken = 'dJgYmsrqSsK5o9aZWGrnQT:APA91bH67R2fmj5CHYwwg-pLRoUPrt3S5jLLNH9mWJKFwxvxapIydQNKzdoUQn51NbQ6WJ-6QJ8tXt87hztR9110GDfAJIhqHIgwcGnJYmS3qJQ6iEU8hdI';  // FCM device token
        //  $deviceToken = 'cOEaQTAZTrWICYNGlEw2rZ:APA91bHCGFiigQmTCQjusKe2VFb08pKxhegwUPSGD5WdSvRf7u5lM3ir9yn8GVQwaJqexwVgUY-DQNpc5gxVAK--mh7Jt62cul-X5rt8vv7wWA_LNOqECnc'; // rcom
        // $deviceToken = 'fsBthzDZRX2yMxnswcNl5Y:APA91bGES56KN5rBytmsLk5mK5tNqogjhb2k96BhJrPBognFgKVRf022y4PllmMcbBhlGJmzWuraUAPbFEehhTnlvpWqKcc789VxJDDVvU9x1rBRzRGDGXA'; // suraj 
        $deviceToken = 'fQv50PEtQaGYu56PIXvyEp:APA91bHfd8unoucuN4lD0XaWvZkpPhrxr3dS9PImeNpN3vWCX_rV7Ob36TJ7flB_jNxLb4ezVJD2q46EqWbrASqykRo3eaawAByChp7YdJu6XCI1wZVANoo'; // suraj 

        // $tokens = ['cOEaQTAZTrWICYNGlEw2rZ:APA91bHCGFiigQmTCQjusKe2VFb08pKxhegwUPSGD5WdSvRf7u5lM3ir9yn8GVQwaJqexwVgUY-DQNpc5gxVAK--mh7Jt62cul-X5rt8vv7wWA_LNOqECnc',
        //             'eYlPpxp4TMSIpqDiqZgPpJ:APA91bGoRD6QevvjewgDOq_oXlA5BLc7Kjkga_mq-UhuQxvUaE09KNIthg3K5cJe1w2eavO6Ek7BjAK6laFtUxrftaxXE_2BNtv1j6EPmEr_BdNmjd9x_sg'];

        $tokens = ['fsBthzDZRX2yMxnswcNl5Y:APA91bGES56KN5rBytmsLk5mK5tNqogjhb2k96BhJrPBognFgKVRf022y4PllmMcbBhlGJmzWuraUAPbFEehhTnlvpWqKcc789VxJDDVvU9x1rBRzRGDGXA', // nirav
                    // 'cOEaQTAZTrWICYNGlEw2rZ:APA91bHCGFiigQmTCQjusKe2VFb08pKxhegwUPSGD5WdSvRf7u5lM3ir9yn8GVQwaJqexwVgUY-DQNpc5gxVAK--mh7Jt62cul-X5rt8vv7wWA_LNOqECnc',
                    'fQv50PEtQaGYu56PIXvyEp:APA91bHfd8unoucuN4lD0XaWvZkpPhrxr3dS9PImeNpN3vWCX_rV7Ob36TJ7flB_jNxLb4ezVJD2q46EqWbrASqykRo3eaawAByChp7YdJu6XCI1wZVANoo'];  // rasik
        // dd($notificationSendData);
        $result = $this->firebaseService->sendDataMessage_signle($deviceToken,[]);

        dd($result);
        if ($result) {
            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'failed']);
    }

    public function firebase_noti()
    {
        // dd("here");
        // $deviceToken = 'dJgYmsrqSsK5o9aZWGrnQT:APA91bH67R2fmj5CHYwwg-pLRoUPrt3S5jLLNH9mWJKFwxvxapIydQNKzdoUQn51NbQ6WJ-6QJ8tXt87hztR9110GDfAJIhqHIgwcGnJYmS3qJQ6iEU8hdI';  // FCM device token
         // $deviceToken = 'cOEaQTAZTrWICYNGlEw2rZ:APA91bHCGFiigQmTCQjusKe2VFb08pKxhegwUPSGD5WdSvRf7u5lM3ir9yn8GVQwaJqexwVgUY-DQNpc5gxVAK--mh7Jt62cul-X5rt8vv7wWA_LNOqECnc'; // rcom
        // $deviceToken = 'eYlPpxp4TMSIpqDiqZgPpJ:APA91bGoRD6QevvjewgDOq_oXlA5BLc7Kjkga_mq-UhuQxvUaE09KNIthg3K5cJe1w2eavO6Ek7BjAK6laFtUxrftaxXE_2BNtv1j6EPmEr_BdNmjd9x_sg'; // suraj 

        // $tokens = ['cOEaQTAZTrWICYNGlEw2rZ:APA91bHCGFiigQmTCQjusKe2VFb08pKxhegwUPSGD5WdSvRf7u5lM3ir9yn8GVQwaJqexwVgUY-DQNpc5gxVAK--mh7Jt62cul-X5rt8vv7wWA_LNOqECnc',
        //             'eYlPpxp4TMSIpqDiqZgPpJ:APA91bGoRD6QevvjewgDOq_oXlA5BLc7Kjkga_mq-UhuQxvUaE09KNIthg3K5cJe1w2eavO6Ek7BjAK6laFtUxrftaxXE_2BNtv1j6EPmEr_BdNmjd9x_sg'];

        $tokens = ['fsBthzDZRX2yMxnswcNl5Y:APA91bGES56KN5rBytmsLk5mK5tNqogjhb2k96BhJrPBognFgKVRf022y4PllmMcbBhlGJmzWuraUAPbFEehhTnlvpWqKcc789VxJDDVvU9x1rBRzRGDGXA',
                    // 'cOEaQTAZTrWICYNGlEw2rZ:APA91bHCGFiigQmTCQjusKe2VFb08pKxhegwUPSGD5WdSvRf7u5lM3ir9yn8GVQwaJqexwVgUY-DQNpc5gxVAK--mh7Jt62cul-X5rt8vv7wWA_LNOqECnc',
                    'fQv50PEtQaGYu56PIXvyEp:APA91bHfd8unoucuN4lD0XaWvZkpPhrxr3dS9PImeNpN3vWCX_rV7Ob36TJ7flB_jNxLb4ezVJD2q46EqWbrASqykRo3eaawAByChp7YdJu6XCI1wZVANoo'];

        $notificationSendData['device_tokens'] = $tokens;
        $notificationSendData['notification_title'] = "Testing";
        $notificationSendData['notification_description'] = "user1 is calling you.";
        $notificationSendData['notification_image'] =  asset('public/assets/img/logo.png') ;

        // dd($notificationSendData);
        $result = $this->firebaseService->sendDataMessage($notificationSendData);

        dd($result);
        if ($result) {
            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'failed']);
    }

    public function send_call_notification(Request $request)
    {
        try {
            $request->validate([
                'receiver_user_id' => 'required',
            ]);
            $user = Auth::user();
            if ($user) {

                # SEND PUSH NOTIFICATION TO PARENT USER
                $notificationSendData['device_tokens'] = User::where('id',$request->receiver_user_id)->pluck('player_id')->toArray();
                // $notificationSendData['device_tokens'] = User::whereIn('id',[22,23])->pluck('player_id')->toArray();
                $notificationSendData['notification_title'] = "Incoming Call from " . $user->name;
                $notificationSendData['notification_description'] = $user->name . " is calling you. Tap to answer.";
                $notificationSendData['notification_image'] = ($user->profile_pic == null) ? asset('public/assets/img/logo.png') : $user->profile_pic;
                $notificationSendData['noti_type'] = "sos_call";
                // dd($notificationSendData);
                $result = $this->firebaseService->sendDataMessage($notificationSendData);

                dd($result);
                
                # STORE NOTIFICATION DATA
                $noti_date = date('Y-m-d H:i:s'); 
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

    public function send_call_notification_old(Request $request)
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
