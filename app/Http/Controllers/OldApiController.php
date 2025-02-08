<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CommonSettingModel;
use App\Models\User;
use App\Models\JoinUserModel;
use App\Models\LocationHistoryModel;
use App\Models\SafeZoneModel;
use DB;
use DateTime;

class ApiController extends BaseController
{
    public function join_user_OOO(Request $request) # with well-structure with location data store // VERIFY CODE
    {
        try {
            // Step 1: Validate the incoming request
            $this->validateRequest($request);

            // Step 2: Process join code based on join_type
            $joinCode = $this->processJoinCode($request->join_data, $request->join_type);

            // Step 3: Find parent user by join code
            $parentUserId = $this->getParentUserIdByJoinCode($joinCode);
            if (!$parentUserId) {
                return $this->sendError('Oops! Invalid join code.');
            }

            // Step 4: Check if the child user is already joined
            $childUser = Auth::user();
            if ($this->isUserAlreadyJoined($childUser->id, $parentUserId)) {
                return $this->sendError('User already joined.');
            }

            // Step 5: Join the user and respond
            $joinData = $this->createJoinRecord($childUser->id, $parentUserId, $request->device_name, $request->join_type);


            $location = [
                'lattitude' => $request->lattitude,
                'longitude' => $request->longitude,
                'phone_bettery' => $request->phone_bettery,
                'user_speed' => $request->user_speed,
                'user_status' => $request->user_status,
                'user_id' => $childUser->id,
                'user_type' => "child",
                'datetime' => date('Y-m-d H:i:s')
            ];
            LocationHistoryModel::create($location);

            if($request->user_type == "child") {
                JoinUserModel::where(['parent_user_id'=>$user->id,'child_user_id'=>$request->user_id])->update(['user_status'=>$request->user_status]);
            }


            // Step 6: Encrypt and return the response
            $encryptedResponse = $this->encryptData($joinData);
            return $this->sendResponse($encryptedResponse, 'User joined successfully.');

        } catch (ValidationException $e) {
            return $this->sendError($e->validator->errors()->first());
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function join_user_old(Request $request) #  well-structure without store location data
    {
        try {
            // Step 1: Validate the incoming request
            $this->validateRequest($request);

            // Step 2: Process join code based on join_type
            $joinCode = $this->processJoinCode($request->join_data, $request->join_type);

            // Step 3: Find parent user by join code
            $parentUserId = $this->getParentUserIdByJoinCode($joinCode);

            if (!$parentUserId) {
                return $this->sendError('Oops! Invalid join code.');
            }

            // Step 4: Check if the child user is already joined
            $childUser = Auth::user();
            if ($this->isUserAlreadyJoined($childUser->id, $parentUserId)) {
                return $this->sendError('User already joined.');
            }

            // Step 5: Join the user and respond
            $joinData = $this->createJoinRecord($childUser->id, $parentUserId, $request->device_name, $request->join_type);

            // Step 6: Encrypt and return the response
            $encryptedResponse = $this->encryptData($joinData);
            return $this->sendResponse($encryptedResponse, 'User joined successfully.');

        } catch (ValidationException $e) {
            return $this->sendError($e->validator->errors()->first());
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function join_user_(Request $request) # without well-structure
    {
        try {
            $request->validate([
                'join_type' => 'required',
                'join_data' => 'required',
                'device_name' => 'required',
            ]);

            $join_data = $request->join_data;
            $join_type = $request->join_type;
            $childUser = Auth::user();

            $join_code = $join_data;
            if($join_type == "link"){
                $parsedUrl = parse_url($join_data);
                $path = $parsedUrl['path'];
                $segments = explode('/', $path);
                $join_code = end($segments);
            }
            if($join_type == "bar_code"){
                $segments = explode('-', $join_data);
                $join_code = end($segments);
            }

            $parent_user_id = User::where('join_code', $join_code)->value('id');
            if ($parent_user_id) {

                $verifyJoin = JoinUserModel::where(['child_user_id'=>$childUser->id,'parent_user_id'=>$parent_user_id,'is_deleted'=> 0])->exists();
                if($verifyJoin){
                    return $this->sendError('User already join');
                }

                $input['parent_user_id'] = $parent_user_id;
                $input['child_user_id'] = $childUser->id;
                $input['device_name'] = $request->device_name;
                $input['join_type'] = $request->join_type;
                $input['join_date'] = date('Y-m-d H:i:s');
                $user = JoinUserModel::create($input);

                $encryptedResponse = $this->encryptData($input);
                return $this->sendResponse($encryptedResponse, 'User join successfully');
            }
            return $this->sendError('Oops! Invalidate join code.');
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first());
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }


    # USER LOCATION HISTORY DATE WISE
    public function user_location_details_old(Request $request)   // without km and hours
    {
        try {
            $request->validate([
                'user_id' => 'required', // child user id
                'date' => 'required', // date - filter data
            ]);

            $user = Auth::user();
            if (!$user) {
                return $this->sendError('Invalid token,User not found.', 401);
            }

            $latestHistory = DB::table('location_history as lh')
            ->join('users as u', 'lh.user_id', '=', 'u.id')         // Join the users table
            ->where('lh.parent_user_id', $user->id)                 // Filter by parent_user_id
            ->where('lh.user_id', $request->user_id)                // Filter by child user id
            ->whereDate('lh.datetime', $request->date)              // Filter by date only
            ->where('u.location_status', 'on')                      // Ensure user has location_status 'on'
            ->select('lh.*', 'u.name', 'u.profile_pic')             // Select necessary fields from both tables
            // ->orderBy('lh.datetime', 'desc')                        // Order by the most recent date (optional)
            ->get();

            $result = $latestHistory->map(function ($item) {
                return [
                    'user_id'     => $item->user_id,
                    'user_status'   => $item->user_status,
                    'user_name'   => $item->name,
                    'profile_pic' => $item->profile_pic,
                    'lattitude'   => $item->lattitude,
                    'longitude'   => $item->longitude,
                    'address'     => $item->address,
                    'user_speed'  => $item->user_speed,
                    'phone_bettery'  => $item->phone_bettery,
                ];
            })->all();

            $encryptedResponse = $this->encryptData($result);
            return $this->sendResponse($result, 'User data get successfully');
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first());
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }


    public function join_user(Request $request) # with well-structure with location data store # WITHOUT VERIFY JOIN DATA # with noti
    {
        try {
            // Step 1: Validate the incoming request
            $this->validateRequest($request);
            $parentUserId = $request->parent_user_id;

            // Step 4: Check if the child user is already joined
            $childUser = Auth::user();
            if ($this->isUserAlreadyJoined($childUser->id, $parentUserId)) {
                return $this->sendError('User already joined.');
            }

            // Step 5: Join the user and respond
            $joinData = $this->createJoinRecord($childUser->id, $parentUserId, $request->device_name, $request->join_type);

            $location = [
                'lattitude' => $request->lattitude,
                'longitude' => $request->longitude,
                'phone_bettery' => $request->phone_bettery,
                'user_speed' => $request->user_speed,
                'user_status' => $request->user_status,
                'user_id' => $childUser->id,
                'user_type' => "child",
                'datetime' => date('Y-m-d H:i:s')
            ];
            LocationHistoryModel::create($location);

            #  SEND PUSH NOTIFICATION TO PARENT USER
            $notificationSendData['player_ids'] = User::where('id',$parentUserId)->pluck('player_id')->toArray();
            $notificationSendData['notification_title'] = $childUser->name . " accept your invitation";
            $notificationSendData['notification_url'] = "";
            $notificationSendData['notification_description'] = $childUser->name . " accept your invitation";
            $notificationSendData['notification_time'] = date('Y-m-d H:i:s');
            $notificationSendData['notification_image'] = ($childUser->profile_pic == null) ? asset('public/assets/img/logo.png') : asset($childUser->profile_pic);
            $send_notification = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);

            // Step 6: Encrypt and return the response
            $encryptedResponse = $this->encryptData($joinData);
            return $this->sendResponse($encryptedResponse, 'User joined successfully.');

        } catch (ValidationException $e) {
            return $this->sendError($e->validator->errors()->first());
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function update_location(Request $request)  # update status in join table PENDING
    {
        try {
            $request->validate([
                'lattitude' => 'required',
                'longitude' => 'required',
                'phone_bettery' => 'required',
                'user_speed' => 'required',
                'user_status' => 'required',
                'user_id' => 'required',
                'user_type' => 'required',
            ]);

            $user = Auth::user();
            if ($user) {
                /* if($request->phone_bettery <= "10"){
                    $user_status = "low_bettery";
                }else{
                    $user_status = "active";
                } */
                $data = $request->all();
                $data['datetime'] = date('Y-m-d H:i:s');
                $data['parent_user_id'] = $user->id;
                $data['user_id'] = $request->user_id;
                LocationHistoryModel::create($data);

                if($request->user_type == "child") {
                    $join_status = JoinUserModel::where(['parent_user_id'=>$user->id,'child_user_id'=>$request->user_id])->first();
                    $join_status->update(['user_status'=>$request->user_status]);


                    // Fetch the child's safe zone
                    /* $safeZone = SafeZone::where(['parent_user_id' => $user->id, 'child_user_id' => $request->user_id,'noti_status'=>'on'])->first();
                    if ($safeZone) {

                        $distance = $this->haversineGreatCircleDistanceZone(
                            $safeZone->user_lattitude,
                            $safeZone->user_longitude,
                            $request->lattitude,
                            $request->longitude
                        );
                        // Check if user is outside the safe zone
                        if ($distance > $safeZone->zone_km) {
                            // User is outside the zone
                            return $this->sendResponse(['outside_zone' => true], 'User is outside the safe zone.');
                        }
                    }*/

                }


                // $encryptedResponse = $this->encryptData($data);
                return $this->sendResponse([], 'User location updated successfully');
            }
            return $this->sendError("user not found");
        } catch (ValidationException $e) {

           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function send_out_side_zone_noti(Request $request) # not need
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
                $notificationSendData['notification_title'] = $user->name . " is going outside the restricted area.";
                $notificationSendData['notification_description'] = $user->name . " is going outside the restricted area.";
                $notificationSendData['notification_time'] = date('Y-m-d H:i:s');
                $notificationSendData['notification_image'] = ($user->profile_pic == null) ? asset('public/assets/img/logo.png') : $user->profile_pic;
                $send_notification = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);

                return $this->sendResponse([], 'Notification sent successfully.');
            }
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    # ALL USER LIST
    public function get_home_data(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return $this->sendError('Invalid token,User not found.', 401);
        }
        try {

            /* $latestHistory = DB::table('location_history as lh')
            ->join(
                DB::raw('(SELECT user_id, MAX(id) as latest_id
                        FROM location_history
                        WHERE parent_user_id = 2
                        GROUP BY user_id) as latest'),
                'lh.id', '=', 'latest.latest_id'
            )
            ->where('lh.parent_user_id', 2)
            ->select('u.id as user_id',
                    'u.name',
                    'u.profile_pic',
                    'lh.*')
            ->get(); */

            // DB::table('location_history as lh')

            # LOCATION HISTORY TABLE DIRECT PARENT USER ID WISE
            $latestHistory = DB::table('location_history as lh')
            ->join(
                DB::raw('(SELECT user_id, MAX(id) as latest_id
                    FROM location_history
                    WHERE parent_user_id = '.$user->id.'
                    GROUP BY user_id) as latest'),
                'lh.id', '=', 'latest.latest_id'
            )                                                // users latest location data
            ->join('users as u', 'lh.user_id', '=', 'u.id')  // Join the users table
            ->where('lh.parent_user_id', $user->id)          // Filter by parent_user_id
            ->where('u.location_status', 'on')               // Ensure user has location_status 'on'
            ->select('lh.*', 'u.name', 'u.profile_pic')      // Select necessary fields from both tables
            ->limit(11)                                      // Limit the results to 11
            ->get();


            $result = $latestHistory->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'user_id'     => $item->user_id,
                    'user_name'   => $item->name,
                    'user_type'   => $item->user_type,
                    'profile_pic' => $item->profile_pic,
                    'lattitude'   => $item->lattitude,
                    'longitude'   => $item->longitude,
                    'address'     => $item->address,
                    'user_speed'  => $item->user_speed,
                ];
            })->all();

            $encryptedResponse = $this->encryptData($result);
            return $this->sendResponse($result, 'User data get successfully');
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }
}
