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
use App\Models\ApplicationNotificationModel;
use App\Models\UserPurchaseModel;
use App\Models\GeoJson;
use DB;
use DateTime;
use App\Jobs\SendNotificationJob;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
define('PACKAGE_NAME', 'com.l.fs');

class ApiController extends BaseController
{
    public function user_hold_location_details(Request $request)  
    {
        try {
            $request->validate([
                'user_id' => 'required', // child user id
                'date' => 'required',    // date - filter data
            ]);
            $user = Auth::user();
            if (!$user) {
                return $this->sendError("Authentication failed! The provided token is invalid, and the specified user could not be located.", 401);
            }
            $history_date = JoinUserModel::where(['parent_user_id'=>$user->id,'child_user_id'=>$request->user_id,'location_history_status'=>"is_removed",'is_deleted' => 0])->pluck('history_remove_date')->first();
          
            $query = DB::table('location_history as lh')
                ->join('users as u', 'lh.user_id', '=', 'u.id')         // Join the users table
                ->where('lh.user_id', $request->user_id)                // Filter by child user id
                ->whereDate('lh.datetime', $request->date)              // Filter by date only
                ->where('u.location_status', 'on');                     // Ensure user has location_status 'on'
            if($history_date){
                $query->where('lh.datetime','>=', $history_date);       // Filter by remove history date
            }
            $latestHistory = $query->select('lh.*', 'u.name', 'u.profile_pic')->get();    // Select necessary fields from both tables
            // if ($latestHistory->isEmpty()) {
            //     $message = "Unfortunately, there is no data available for this user today.";
            //     return $this->sendError($message, 401);
            // }
            if ($latestHistory->isEmpty()) {
                $date = Carbon::parse($request->date);
                $today = Carbon::today();
                $yesterday = Carbon::yesterday();

                if ($date->equalTo($today)) {
                    $day = "Today";
                } elseif ($date->equalTo($yesterday)) {
                    $day = "Yesterday";
                } else {
                    $day = $date->format('l');
                }
                $message = "Unfortunately, there is no data available for this user ".$day;
                return $this->sendError($message, 401);
            }
            
            # Initialize variables to track total distance and total time
            $totalDistance = 0;
            $startTime = null;
            $endTime = null;
            # Map through the location data
            $result = $latestHistory->map(function ($item, $index) use (&$totalDistance, &$startTime, &$endTime, $latestHistory) {

                static $holdStartTime = null; # Track when the hold starts
                static $isHolding = false;    # Track if the user is holding
                static $currentLocation = null; # Track the current hold location
            
                if ($index == 0) {
                    # Set the start time
                    $startTime = new DateTime($item->datetime);
                }
                if ($index == $latestHistory->count() - 1) {
                    # Set the end time
                    $endTime = new DateTime($item->datetime);
                }
                # Calculate the distance between consecutive records using the Haversine formula
                if ($index > 0) {
                    $previousItem = $latestHistory[$index - 1];
                    $distance = $this->haversineGreatCircleDistance(
                        $previousItem->lattitude,
                        $previousItem->longitude,
                        $item->lattitude,
                        $item->longitude
                    );
                    $totalDistance += $distance; # Accumulate total distance
            
                    # Check if the user is holding
                    if ($distance < 0.01) { # Threshold in KM (10 meters)
                        if (!$isHolding) {
                            $holdStartTime = new DateTime($previousItem->datetime);
                            $isHolding = true;
                        }
            
                        $holdDuration = $holdStartTime->diff(new DateTime($item->datetime));
                        $holdMinutes = ($holdDuration->h * 60) + $holdDuration->i;
            
                        if ($holdMinutes >= 10) { # Threshold in minutes
                            $item->hold_status = 'on';
                        } else {
                            $item->hold_status = 'off';
                        }
                    } else {
                        $isHolding = false;
                        $item->hold_status = 'off';
                    }
                } else {
                    $item->hold_status = 'off'; # Default for the first record
                }
                return [
                    'user_id'      => $item->user_id,
                    'phone_battery_status'  => $item->phone_battery_status,
                    'user_name'    => $item->name,
                    'profile_pic'  => $item->profile_pic,
                    'lattitude'    => $item->lattitude,
                    'longitude'    => $item->longitude,
                    'address'      => $item->address,
                    'user_speed'   => $item->user_speed,
                    'phone_bettery'=> $item->phone_bettery,
                    'datetime'     => $item->datetime,
                    'hold_status'  => $item->hold_status, // Include hold status
                    'course'       => $item->course,
                    'accuracy'     => $item->accuracy,  
                    'isMock'       => $item->isMock == 1 ? true : false,
                ];
            })->filter(function ($item) {
                return $item['hold_status'] === 'on';  // Filter to include only 'on' hold_status
            })->values()->all();

            $zone = DB::table('geo_jsons')->where(['child_user_id'=>$request->user_id, 'parent_user_id'=>$user->id])->select('zone_km','geojson','noti_status')->first();
            $timeSpent = $startTime->diff($endTime);  
            $response = [
                'total_distance'=> round($totalDistance, 2) . ' KM',            // Total distance traveled in KM
                'total_time'    => $timeSpent->format('%h hours %i minutes'),   // Total time spent in hours and minutes
                'user_data'     => $result
            ];

            $encryptedResponse = $this->encryptData($response);
            return $this->sendResponse($response, 'User data retrieved successfully');
        } catch (ValidationException $e) {
           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function check_version(Request $request)
    {
        try {
            $request->validate([
                'app_version' => 'required',
            ]);
            $currentVersion = CommonSettingModel::where('setting_key', 'app_version')->value('setting_value');
            if ($request->app_version === $currentVersion) {

                $encryptedResponse = $this->encryptData($request->all());
                return $this->sendResponse($encryptedResponse, 'Application is up-to-date!');
            }
            return $this->sendError('Please update the application. Thank you!');
        } catch (ValidationException $e) {
           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    # GET PARENT USER DATA :  DEVICE NAME AND ID
    public function verify_join_data(Request $request)
    {
        $request->validate([
            'join_type' => 'required',
            'join_data' => 'required',
        ]);
        $joinCode = $this->processJoinCode($request->join_data, $request->join_type);
        $parentUser = User::where('join_code', $joinCode)->first();
        if (!$parentUser) {
            return $this->sendError('Oops! The join code you entered is invalid.');
        }
        $response = ['parent_user_id'=>$parentUser->id,'device_name'=>$parentUser->device_name];

        $encryptedResponse = $this->encryptData($response);
        return $this->sendResponse($encryptedResponse, "The user's join data has been successfully verified.");
    }

    # with well-structure with location data store # WITHOUT VERIFY JOIN DATA # queue notification
    public function join_user(Request $request)
    {
        try {
            // Step 1: Validate the incoming request
            $this->validateRequest($request);
            $parentUserId = $request->parent_user_id;
            $childUser = Auth::user();

            if ($childUser->id == $parentUserId) {
                return $this->sendError("The user cannot join it themselves.");
            }
            // Step 4: Check if the child user is already joined
            if ($this->isUserAlreadyJoined($childUser->id, $parentUserId)) {
                return $this->sendError('The user has already joined.');
            }
            // Step 5: Join the user and respond
            $joinData = $this->createJoinRecord($childUser->id, $parentUserId, $request->device_name, $request->join_type,$request->today_date);

            $maxValue = 9999999999.9999999;  // For DECIMAL(17,7), this is the max value
            $minValue = -9999999999.9999999; // For DECIMAL(17,7), this is the min value
            $course = number_format($request->course, 7, '.', '');
            $accuracy = number_format($request->accuracy, 7, '.', '');

            if ($accuracy > $maxValue || $accuracy < $minValue) {
                // Log::info('Accuricy out of range,from join user: ', ['accuracy' => $accuracy]);
                $accuracy = '0.0000000';  // Default value for accuracy
            }
            if ($course > $maxValue || $course < $minValue) {
                // Log::info('Course out of range,from join user: ', ['course' => $course]);
                $course = '0.0000000';  // Default value for course
            }
            # Prepare location data for insertion
            $location = [
                'isMock' => $request->isMock,
                'accuracy' => $accuracy,
                'course' => $course,
                'lattitude' => $request->child_u_lattitude,
                'longitude' => $request->child_u_longitude,
                'address' => $request->address,
                'phone_bettery' => $request->phone_bettery,
                'user_speed' => $request->user_speed,
                'phone_battery_status' => $request->phone_battery_status,
                'user_id' => $childUser->id,
                'datetime' => $request->today_date
            ];
            LocationHistoryModel::create($location);

            // Step 6: Dispatch notification job
            $title = $childUser->name . " accepted your invitation";
            $noti_data = [
                'noti_date' => $request->today_date,
                'msg' => "Accepted your invitation",
                'noti_type' => "join_user",
            ];
            SendNotificationJob::dispatch($childUser, $parentUserId,$title,$noti_data);

            /*  #  SEND PUSH NOTIFICATION TO PARENT USER
            $notificationSendData['player_ids'] = User::where('id',$parentUserId)->pluck('player_id')->toArray();
            $notificationSendData['notification_title'] = $childUser->name . " accept your invitation";
            $notificationSendData['notification_url'] = "";
            $notificationSendData['notification_description'] = $childUser->name . " accept your invitation";
            $notificationSendData['notification_time'] = date('Y-m-d H:i:s');
            $notificationSendData['notification_image'] = ($childUser->profile_pic == null) ? asset('public/assets/img/logo.png') : $childUser->profile_pic;
            $send_notification = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData); */

            // Step 7: Encrypt and return the response
            $encryptedResponse = $this->encryptData($joinData);
            return $this->sendResponse($encryptedResponse, 'User joined successfully.');
        } catch (ValidationException $e) {
           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function verify_purchase(Request $request)
    {
        try {
            // Step 1: Validate the input
            $request->validate([
                'purchase_json' => 'required', // Ensure it's a valid JSON
            ]);

            // Step 2: Parse the purchase data
            $purchaseData = $request->input('purchase_json'); // Decode raw JSON data
            // $purchaseData = json_decode($request->input('purchase_json'), true); // Decode body form data

            // Extract values from purchase data
            $orderId = $purchaseData['orderId'] ?? null;
            $packageName = $purchaseData['packageName'] ?? null;
            $purchaseState = $purchaseData['purchaseState'] ?? null;

            // Step 3: Store the purchase data in the database
            $purchaseDataJson = json_encode($purchaseData); // Encode the array as a JSON string
            $store = UserPurchaseModel::create([
                'purchase_json' => $purchaseDataJson
            ]);

            // Retrieve inserted purchase record ID
            $p_id = $store->id;

            // Step 4: Validate orderId
            if (!isset($orderId) || strpos($orderId, 'GPA') !== 0) {
                $payment_status = "Failed";
                $reason = "The order ID provided is not valid.";
                UserPurchaseModel::find($p_id)->update(['payment_status' => $payment_status, 'reason' => $reason]);
                return $this->sendError($reason, 400);
            }

            // Step 5: Validate packageName
            if ($packageName !== env('PACKAGE_NAME')) { // Assuming PACKAGE_NAME is defined in the environment file
                $payment_status = "Failed";
                $reason = "The package name is invalid";
                UserPurchaseModel::find($p_id)->update(['payment_status' => $payment_status, 'reason' => $reason]);
                return $this->sendError($reason, 400);
            }

            $payment_status = 'Failed'; // Default to failed
            $reason = 'Unknown error';  // Default reason

            // Step 5: Handle purchase states directly
            switch ($purchaseState) {
                case 0:
                    $payment_status = "Success";
                    $reason = "Payment was successful.";
                    break;
                case 1:
                    $payment_status = "Failed";
                    $reason = "The payment has been canceled.";
                    break;
                case 2:
                    $payment_status = "Pending";
                    $reason = "Payment is currently pending.";
                    break;
                default:
                    return $this->sendError('The purchase state is invalid.', 400);
            }

            // Step 6: Update payment status and reason in one go
            $store->update([
                'payment_status' => $payment_status,
                'reason' => $reason
            ]);

            // Step 7: Return success or failure response based on the state
            if ($payment_status === 'Success') {
                return $this->sendResponse([], 'Payment was successful.');
            } else {
                return $this->sendError($reason, 400);
            }

        } catch (ValidationException $e) {
            return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage(), 500);
        }
    }

    # singal location data store
    /* public function update_location(Request $request)  # queue notification (outside zone)
    {
        try {
            $request->validate([
                'lattitude' => 'required',
                'longitude' => 'required',
                'address' => 'required',
                'phone_bettery' => 'required',
                'user_speed' => 'required',
                'phone_battery_status' => 'required',
                'today_date' => 'required',
                 'course' => 'required',
                 'accuracy' => 'required',
                 'isMock' => 'required',
            ]);
            $user = Auth::user();
            if ($user) {              
                # Prepare location data for insertion
                $data = array_merge($request->all(), [
                    'datetime' => $request->today_date,
                    'user_id' => $user->id
                ]);
                unset($data['today_date']);
                LocationHistoryModel::create($data);
                
                # USER STATUS UPDATE
                $join_status = JoinUserModel::where(['child_user_id'=>$user->id,'is_deleted'=>0])->get();
                foreach ($join_status as $key => $value1) {
                    $value1->update(['phone_battery_status'=>$request->phone_battery_status]);
                }
                
                # OUT SIDE ZONE NOTIFICATION
                // Get all GeoJSON records for the child user with 'noti_status' as 'on'
                $geojsonDataList = GeoJson::where('child_user_id', $user->id)->where('noti_status', 'on')->get();
                if ($geojsonDataList->isNotEmpty()) {

                    foreach ($geojsonDataList as $geojsonData) {
                        $geojsonString = is_array($geojsonData->geojson) ? json_encode($geojsonData->geojson) : $geojsonData->geojson;

                        $geometry = DB::selectOne("
                            SELECT ST_Contains(
                                ST_GeomFromGeoJSON(?),
                                ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'))
                            ) AS is_inside", [$geojsonString, $request->longitude, $request->latitude]);

                        if (!$geometry->is_inside) {
                            $parentUserId = $geojsonData->parent_user_id; // Get the parent user ID
                            $title = $user->name . " is going outside the restricted area";
                            $noti_data = [
                                'noti_date' => $request->today_date,
                                'msg' => "Going outside the restricted area",
                                'noti_type' => "outside_zone",
                            ];
                            // Dispatch notification for each parent user
                            SendNotificationJob::dispatch($user, $parentUserId, $title, $noti_data);
                        }
                    }
                }

                $parent_count = JoinUserModel::where(['child_user_id'=>$user->id,'is_deleted'=>0])->count();
                $data['located_parent_user'] = $parent_count;

                $encryptedResponse = $this->encryptData($data);
                return $this->sendResponse($encryptedResponse, 'User location updated successfully');
            }
            return $this->sendError("user not found");
        } catch (ValidationException $e) {
           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    } */
    
    # multiple location data store from array # Address not found
    public function update_location(Request $request)  # Queue notification (outside zone)
    {
        try {
            $request->validate([
                'locations' => 'required|array',
                'locations.*.lattitude' => 'required',
                'locations.*.longitude' => 'required',
                'locations.*.address' => 'required',
                'locations.*.phone_bettery' => 'required|integer',
                'locations.*.user_speed' => 'required',
                'locations.*.phone_battery_status' => 'required',
                'locations.*.today_date' => 'required|date',
                'locations.*.course' => 'required',
                'locations.*.accuracy' => 'required',
                'locations.*.isMock' => 'required|boolean',
            ]);
            $user = Auth::user();
            if (!$user) {
                return $this->sendError("Authentication failed! The provided token is invalid, and the specified user could not be located", 404);
            }

            $locations = $request->input('locations');
            foreach ($locations as $location) {

                $maxValue = 9999999999.9999999;  // For DECIMAL(17,7), this is the max value
                $minValue = -9999999999.9999999; // For DECIMAL(17,7), this is the min value
                $course = number_format($location['course'], 7, '.', '');
                $accuracy = number_format($location['accuracy'], 7, '.', '');

                if ($accuracy > $maxValue || $accuracy < $minValue) {
                    Log::info('Accuricy out of range:', ['accuracy' => $accuracy]);
                    $accuracy = '0.0000000';  // Default value for accuracy
                }
                if ($course > $maxValue || $course < $minValue) {
                    Log::info('Course out of range:', ['course' => $course]);
                    $course = '0.0000000';  // Default value for course
                }
                if ($location['address'] == "Address not found") {
                    $location['address'] = $this->getAddressFromLatLongHere($location['lattitude'], $location['longitude']);
                }
                # Prepare location data for insertion
                $data = array_merge($location, [
                    'datetime' => $location['today_date'],
                    'user_id' => $user->id,
                    'course' => $course, // Format course to 7 decimal places
                    'accuracy' => $accuracy, // Format accuracy to 7 decimal places
                ]);
                unset($data['today_date']);
                LocationHistoryModel::create($data);

                # Update user status
                $join_status = JoinUserModel::where(['child_user_id' => $user->id, 'is_deleted' => 0])->get();
                foreach ($join_status as $key => $value1) {
                    $value1->update(['phone_battery_status' => $location['phone_battery_status']]);
                }

                # OUTSIDE ZONE NOTIFICATION
                $geojsonDataList = GeoJson::where('child_user_id', $user->id)->where('noti_status', 'on')->get();
                if ($geojsonDataList->isNotEmpty()) {
                    foreach ($geojsonDataList as $geojsonData) {
                        $geojsonString = is_array($geojsonData->geojson) ? json_encode($geojsonData->geojson) : $geojsonData->geojson;

                        $geometry = DB::selectOne("
                            SELECT ST_Contains(
                                ST_GeomFromGeoJSON(?),
                                ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'))
                            ) AS is_inside", [$geojsonString, $location['longitude'], $location['lattitude']]);

                        if (!$geometry->is_inside) {
                            $parentUserId = $geojsonData->parent_user_id; // Get the parent user ID
                            $title = $user->name . " is going outside the restricted area";
                            $noti_data = [
                                'noti_date' => $location['today_date'],
                                'msg' => "Going outside the restricted area",
                                'noti_type' => "outside_zone",
                            ];
                            // Dispatch notification for each parent user
                            SendNotificationJob::dispatch($user, $parentUserId, $title, $noti_data);
                        }
                    }
                }
            }
            # Calculate parent count
            $parent_count = JoinUserModel::where(['child_user_id' => $user->id, 'is_deleted' => 0])->count();
            $responseData['located_parent_user'] = $parent_count;
            $responseData['locations'] = $locations;

            $encryptedResponse = $this->encryptData($responseData);
            return $this->sendResponse($encryptedResponse, 'User locations updated successfully');
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage(), 500);
        }
    }

    # PARENT USER HISTORY # who see your location # for child user
    public function located_user_history(Request $request)
    {
        try {
            // Step 2: Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located', 401);
            }
            // Step 3: Fetch the located user history with parent user data in a single query
            /* $locatedUsers = JoinUserModel::with('parentUser')
                ->where([
                    // 'join_type' => $request->join_type,
                    'child_user_id' => $user->id,
                ])->get(); */

            $locatedUsers = DB::table('join_user as jum')
            ->join('users as u', 'jum.parent_user_id', '=', 'u.id')
            ->where('jum.child_user_id', $user->id)
            ->where('jum.is_deleted',0)
            ->select('u.id as parent_user_id', 'u.name', 'u.profile_pic', 'u.device_name', 'jum.created_at','jum.join_type')
            ->get();

            // Step 4: Build the result
            $result = $locatedUsers->map(function ($locatedUser) {
                return [
                    'parent_user_id' => $locatedUser->parent_user_id,
                    'user_name'      => $locatedUser->name,
                    'join_type'      => $locatedUser->join_type,
                    'profile_pic'    => $locatedUser->profile_pic,
                    'device_name'    => $locatedUser->device_name,
                    'created_at'     => $locatedUser->created_at,
                ];
            });

            // Step 5: Return successful response
            $encryptedResponse = $this->encryptData($result);
            return $this->sendResponse($encryptedResponse, 'Data retrieved successfully.');
        } catch (ValidationException $e) {
            return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    # PARENT USER ADD RED/SAFE ZONE
    public function manage_user_geojson(Request $request)
    {
        try {
            $request->validate([
                'zone_km' => 'required',
                'geojson' => 'required',
                'noti_status' => 'required',
                'child_user_id' => 'required',
            ]);
            $user = Auth::user();
            if (!$user) {
                return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located', 401);
            }
            // Parse geojson into a valid polygon format for storage
            // $geojson = json_encode($request['geojson']);

            $data = $request->all();
            $data['parent_user_id'] = $user->id;

            // Find existing record or create a new one
            $geoJsonRecord  = GeoJson::where(['parent_user_id'=>$user->id,'child_user_id'=> $request->child_user_id])->first();
             if($geoJsonRecord){
                $geoJsonRecord->update($data);
            }else{
                $geoJsonRecord  = GeoJson::create($data);
            }

            $encryptedResponse = $this->encryptData($geoJsonRecord);
            return $this->sendResponse($encryptedResponse, 'User zone added successfully');
        } catch (ValidationException $e) {

           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    # both user use api
    public function disconnect_user(Request $request)
    {
        try {
            $request->validate([
                'child_user_id' => 'required',
                'parent_user_id' => 'required',
            ]);
            $user = Auth::user();
            if (!$user) {
                return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located', 401);
            }
            $data = JoinUserModel::where(['parent_user_id'=>$request->parent_user_id, 'child_user_id'=>$request->child_user_id,'is_deleted'=> 0])->first();
            if($data){
                $data->update(['is_deleted'=>1]);
                $join_data = JoinUserModel::where(['child_user_id'=>$request->child_user_id,'is_deleted'=> 0])->count();
                if($join_data == 0){
                    LocationHistoryModel::where(['user_id'=>$request->child_user_id])->delete();
                }
                return $this->sendResponse([], 'The user has successfully disconnected.');
            } else {
                return $this->sendError('User is currently not connected.', 400);
            }
        } catch (ValidationException $e) {
           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    # remove location history
    public function remove_user_history(Request $request)
    {
        try {
            $request->validate([
                'child_user_id' => 'required',
                'today_date' => 'required'
            ]);
            $user = Auth::user();
            if (!$user) {
                return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located', 401);
            }
            if($user->id == $request->child_user_id) {
                return $this->sendError('The user is unable to delete their data.', 401);
            }
            # manage location history in join table
            $data = JoinUserModel::where(['parent_user_id'=>$user->id, 'child_user_id'=>$request->child_user_id,'is_deleted'=>0])->first();
            if ($data) {
                $data->update(['location_history_status'=>'is_removed','history_remove_date'=>$request->today_date]);
                return $this->sendResponse([], 'User location history remove successfully');
            } else {
                return $this->sendError('User is currently not connected', 400);
            }
        } catch (ValidationException $e) {

           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    # PARENT USER VIEW THERE ALL CHILD USERS
    public function all_locating_user_list(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $pageNumber = $request->input('page_no', 1);

            $user = Auth::user();
            if (!$user) {
                return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located', 401);
            }

           $locatedUsers = DB::table('join_user as j')
                ->join('users as u', 'j.child_user_id', '=', 'u.id')
                ->where('j.parent_user_id', $user->id)
                ->select('u.id as child_user_id', 'u.name', 'u.profile_pic', 'u.device_name', 'j.phone_battery_status')
                ->paginate($perPage, ['*'], 'page', $pageNumber);
            // ->get();

            $result = $locatedUsers->map(function ($value) {
                return [
                    'child_user_id' => $value->child_user_id,
                    'user_name'     => $value->name,
                    'profile_pic'   => $value->profile_pic,
                    'phone_battery_status'   => $value->phone_battery_status,
                ];
            });
            
            $paginationDetails = [
                'total_record' => $locatedUsers->total(),
                'per_page' => $locatedUsers->perPage(),
                'current_page' => $locatedUsers->currentPage(),
                'last_page' => $locatedUsers->lastPage(),
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

    # ALL USER LIST # 11 limit
    public function get_home_data(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located.', 401);
        }
        try {
            $join_user_ids = DB::table('join_user')->where(['parent_user_id'=>$user->id,'is_deleted' => 0])->pluck('child_user_id')->toArray();
            if (!empty($join_user_ids)) {

                $join_user_ids_str = implode(',', $join_user_ids);   // Convert array to comma-separated string
                $query = DB::table('location_history as lh')
                    ->join(DB::raw('(SELECT user_id, MAX(id) as latest_id
                                    FROM location_history
                                    WHERE user_id IN ('.$join_user_ids_str.')
                                    GROUP BY user_id) as latest'),
                                    'lh.id', '=', 'latest.latest_id') // users latest location data
                    ->join('users as u', 'lh.user_id', '=', 'u.id')   // Join the users table
                    ->whereIn('lh.user_id', $join_user_ids)           // Filter by parent_user_id
                    ->where('u.location_status', 'on');               // Ensure user has location_status 'on'

                $latestHistory =  $query->select('lh.*', 'u.name', 'u.profile_pic')->get();       // Select necessary fields from both tables
            } else {
                // Handle the case where there are no child_user_ids
                $latestHistory = collect(); // Return an empty collection or handle it as needed
            }

            // Collect up to 11 valid results
            $result = [];
            foreach ($latestHistory as $item) {
                // Check the remove date
                $remove_date = DB::table('join_user')
                    ->where([
                        'parent_user_id' => $user->id,
                        'child_user_id' => $item->user_id,
                        'location_history_status' => 'is_removed',
                        'is_deleted' => 0
                    ])
                    ->pluck('history_remove_date')
                    ->first();

                // dd($item->datetime ."   >=   ". $remove_date);
                if (!$remove_date || $item->datetime >= $remove_date) {
                    $result[] = [
                        'id' => $item->id,
                        'user_id' => $item->user_id,
                        'user_name' => $item->name,
                        'phone_battery_status' => $item->phone_battery_status,
                        'profile_pic' => $item->profile_pic,
                        'latitude' => $item->lattitude,
                        'longitude' => $item->longitude,
                        'address' => $item->address,
                        'user_speed' => $item->user_speed,
                        'course' => $item->course,
                        'accuracy' => $item->accuracy,
                        'isMock' =>  $item->isMock == 1 ? true : false,
                    ];
                }
                // Stop the loop if we have 11 results
                if (count($result) >= 11) {
                    break;
                }
            }
            $noti_count = DB::table('user_notifications')->where(['receiver_user_id'=>$user->id])->count();
            $response['noti_count'] = $noti_count;
            $response['locating_count'] = count($join_user_ids);
            $response['home_data'] = $result;

            $encryptedResponse = $this->encryptData($response);
            return $this->sendResponse($response, 'User data get successfully');
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }
    
    # USER LOCATION HISTORY DATE WISE WITH JOIN DATA
    public function user_location_details(Request $request)  # with hold status and geo-json data
    {
        try {
            $request->validate([
                'user_id' => 'required', // child user id
                // 'date' => 'required',    // date - filter data
                // 'start_date' => 'required',    // date - filter data
                // 'end_date' => 'required',    // date - filter data
            ]);
            $user = Auth::user();
            if (!$user) {
                return $this->sendError("Authentication failed! The provided token is invalid, and the specified user could not be located.", 401);
            }
            $history_date = JoinUserModel::where(['parent_user_id'=>$user->id,'child_user_id'=>$request->user_id,'location_history_status'=>"is_removed",'is_deleted'=>0])->pluck('history_remove_date')->first();
          
            // Retrieve user's location history
            $query = DB::table('location_history as lh')
                ->join('users as u', 'lh.user_id', '=', 'u.id')          // Join the users table
                ->where('lh.user_id', $request->user_id);                // Filter by child user id

                if($request->date){
                    $query->whereDate('lh.datetime', $request->date);              // Filter by date only
                }
                if($request->start_date && $request->end_time){
                    $query->whereBetween('lh.datetime', [$request->start_date, $request->end_time]); // Filter by datetime range
                }

                # YYYY-DD-MM HH:MM:SS formate
                // if ($request->date) {
                //     // Convert ISO 8601 date to Y-m-d format (Extract only the date part)
                //     $date = Carbon::parse($request->date)->format('Y-m-d');
                //     $query->whereDate('lh.datetime', $date);
                // }
                
                // if ($request->start_date && $request->end_time) {
                //     // Convert ISO 8601 datetime to MySQL Y-m-d H:i:s format
                //     $startDate = Carbon::parse($request->start_date)->format('Y-m-d H:i:s');
                //     $endDate = Carbon::parse($request->end_time)->format('Y-m-d H:i:s');
                
                //     $query->whereBetween('lh.datetime', [$startDate, $endDate]);
                // }
                $query->where('u.location_status', 'on');                     // Ensure user has location_status 'on'
                if($history_date){
                    $query->where('lh.datetime','>=', $history_date);       // Filter by remove history date
                }
            $latestHistory = $query->select('lh.*', 'u.name', 'u.profile_pic')->get();    // Select necessary fields from both tables
            // if ($latestHistory->isEmpty()) {
            //     return $this->sendError('No data found for this user and date.', 401);
            // }
            
            if ($latestHistory->isEmpty()) {
                // Parse the date and set it to UTC
                $date = Carbon::parse($request->start_date)->setTimezone('UTC');
                // Get today's and yesterday's date in UTC
                $today = Carbon::today('UTC');
                $yesterday = Carbon::yesterday('UTC');          
                if ($date->isSameDay($today)) {
                    $day = "Today";
                } elseif ($date->isSameDay($yesterday)) {
                    $day = "Yesterday";
                } else {
                    $day = $date->format('l'); // Returns weekday name (e.g., Monday, Tuesday)
                }
                $message = "Unfortunately, there is no data available for this user on " . $day;
                return $this->sendError($message, 401);
            }            
            # Initialize variables to track total distance and total time
            $totalDistance = 0;
            $startTime = null;
            $endTime = null;

            # Map through the location data
            $result = $latestHistory->map(function ($item, $index) use (&$totalDistance, &$startTime, &$endTime, $latestHistory) {

                static $holdStartTime = null; # Track when the hold starts
                static $isHolding = false;   # Track if the user is holding
                static $currentLocation = null; # Track the current hold location

                if ($index == 0) {
                    # Set the start time
                    $startTime = new DateTime($item->datetime);
                }
                if ($index == $latestHistory->count() - 1) {
                    # Set the end time
                    $endTime = new DateTime($item->datetime);
                }

                # Calculate the distance between consecutive records using the Haversine formula
                if ($index > 0) {
                    $previousItem = $latestHistory[$index - 1];
                    $distance = $this->haversineGreatCircleDistance(
                        $previousItem->lattitude,
                        $previousItem->longitude,
                        $item->lattitude,
                        $item->longitude
                    );
                    $totalDistance += $distance; # Accumulate total distance

                    # Check if the user is holding
                    if ($distance < 0.01) { # Threshold in KM (10 meters)
                        if (!$isHolding) {
                            $holdStartTime = new DateTime($previousItem->datetime);
                            $isHolding = true;
                        }

                        $holdDuration = $holdStartTime->diff(new DateTime($item->datetime));
                        $holdMinutes = ($holdDuration->h * 60) + $holdDuration->i;

                        if ($holdMinutes >= 10) { # Threshold in minutes
                            $item->hold_status = 'on';
                        } else {
                            $item->hold_status = 'off';
                        }
                    } else {
                        $isHolding = false;
                        $item->hold_status = 'off';
                    }
                } else {
                    $item->hold_status = 'off'; # Default for the first record
                }
                return [
                    'user_id'      => $item->user_id,
                    'phone_battery_status'  => $item->phone_battery_status,
                    'user_name'    => $item->name,
                    'profile_pic'  => $item->profile_pic,
                    'lattitude'    => $item->lattitude,
                    'longitude'    => $item->longitude,
                    'address'      => $item->address,
                    'user_speed'   => $item->user_speed,
                    'phone_bettery'=> $item->phone_bettery,
                    'datetime'     => $item->datetime,
                    'hold_status'  => $item->hold_status, // Include hold status
                    'course'       => $item->course,
                    'accuracy'     => $item->accuracy,  
                    'isMock'     =>  $item->isMock == 1 ? true : false,
                ];
            })->all();

            $zone = DB::table('geo_jsons')->where(['child_user_id'=>$request->user_id, 'parent_user_id'=>$user->id])->select('zone_km','geojson','noti_status')->first();
            $timeSpent = $startTime->diff($endTime);  // Calculate total time spent
            // Return the response with total distance and time spent
            $response = [
                'total_distance'=> round($totalDistance, 2) . ' KM',            // Total distance traveled in KM
                'total_time'    => $timeSpent->format('%h hours %i minutes'),   // Total time spent in hours and minutes
                'zone_data'     => $zone,
                'user_data'     => $result
            ];
            // Encrypt and send the response
            $encryptedResponse = $this->encryptData($response);
            return $this->sendResponse($encryptedResponse, 'User data retrieved successfully');
        } catch (ValidationException $e) {
           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }
    
    # ALL USER LIST # 11 limit
    public function old_get_home_data_old(Request $request) # without parent remove history status
    {
        $user = Auth::user();
        if (!$user) {
            return $this->sendError('Authentication failed! The provided token is invalid, and the specified user could not be located', 401);
        }
        try {
            $join_user_ids = DB::table('join_user')->where('parent_user_id', $user->id)->pluck('child_user_id')->toArray();
            if (!empty($join_user_ids)) {

                $join_user_ids_str = implode(',', $join_user_ids); // Convert array to comma-separated string
                $latestHistory = DB::table('location_history as lh')
                    ->join(
                        DB::raw('(SELECT user_id, MAX(id) as latest_id
                                    FROM location_history
                                    WHERE user_id IN ('.$join_user_ids_str.')
                                    GROUP BY user_id) as latest'),
                        'lh.id', '=', 'latest.latest_id'
                    )                                                // users latest location data
                    ->join('users as u', 'lh.user_id', '=', 'u.id')  // Join the users table
                    ->whereIn('lh.user_id', $join_user_ids)          // Filter by parent_user_id
                    ->where('u.location_status', 'on')               // Ensure user has location_status 'on'
                    ->select('lh.*', 'u.name', 'u.profile_pic')      // Select necessary fields from both tables
                    ->limit(11)                                      // Limit the results to 11
                    ->get();
            } else {
                // Handle the case where there are no child_user_ids
                $latestHistory = collect(); // Return an empty collection or handle it as needed
            }

            $result = $latestHistory->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'user_id'     => $item->user_id,
                    'user_name'   => $item->name,
                    'phone_battery_status' => $item->phone_battery_status,
                    'profile_pic' => $item->profile_pic,
                    'lattitude'   => $item->lattitude,
                    'longitude'   => $item->longitude,
                    'address'     => $item->address,
                    'user_speed'  => $item->user_speed,
                ];
            })->all();

            $encryptedResponse = $this->encryptData($result);
            return $this->sendResponse($encryptedResponse, 'User data get successfully');
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    /*# USER LOCATION HISTORY DATE WISE WITH JOIN DATA
    public function user_location_details(Request $request)  # with hold status # without parent remove history status
    {
        try {
            $request->validate([
                'user_id' => 'required', // child user id
                'date' => 'required',    // date - filter data
            ]);

            $user = Auth::user();
            if (!$user) {
                return $this->sendError("Authentication failed! The provided token is invalid, and the specified user could not be located.", 401);
            }

            // Retrieve user's location history
            $latestHistory = DB::table('location_history as lh')
                ->join('users as u', 'lh.user_id', '=', 'u.id')         // Join the users table
                ->where('lh.user_id', $request->user_id)                // Filter by child user id
                ->whereDate('lh.datetime', $request->date)              // Filter by date only
                ->where('u.location_status', 'on')                      // Ensure user has location_status 'on'
                ->select('lh.*', 'u.name', 'u.profile_pic')             // Select necessary fields from both tables
                ->get();

            if ($latestHistory->isEmpty()) {
                return $this->sendError('No data found for this user and date.', 401);
            }

            // Initialize variables to track total distance and total time
            $totalDistance = 0;
            $startTime = null;
            $endTime = null;

            // Map through the location data
            $result = $latestHistory->map(function ($item, $index) use (&$totalDistance, &$startTime, &$endTime, $latestHistory) {

                static $holdStartTime = null; // Track when the hold starts
                static $isHolding = false;   // Track if the user is holding
                static $currentLocation = null; // Track the current hold location

                if ($index == 0) {
                    // Set the start time
                    $startTime = new DateTime($item->datetime);
                }

                if ($index == $latestHistory->count() - 1) {
                    // Set the end time
                    $endTime = new DateTime($item->datetime);
                }

                // Calculate the distance between consecutive records using the Haversine formula
                if ($index > 0) {
                    $previousItem = $latestHistory[$index - 1];
                    $distance = $this->haversineGreatCircleDistance(
                        $previousItem->lattitude,
                        $previousItem->longitude,
                        $item->lattitude,
                        $item->longitude
                    );
                    $totalDistance += $distance; // Accumulate total distance

                    // Check if the user is holding
                    if ($distance < 0.01) { // Threshold in KM (10 meters)
                        if (!$isHolding) {
                            $holdStartTime = new DateTime($previousItem->datetime);
                            $isHolding = true;
                        }

                        $holdDuration = $holdStartTime->diff(new DateTime($item->datetime));
                        $holdMinutes = ($holdDuration->h * 60) + $holdDuration->i;

                        if ($holdMinutes >= 10) { // Threshold in minutes
                            $item->hold_status = 'on';
                        } else {
                            $item->hold_status = 'off';
                        }
                    } else {
                        $isHolding = false;
                        $item->hold_status = 'off';
                    }
                } else {
                    $item->hold_status = 'off'; // Default for the first record
                }

                return [
                    'user_id'      => $item->user_id,
                    'phone_battery_status'  => $item->phone_battery_status,
                    'user_name'    => $item->name,
                    'profile_pic'  => $item->profile_pic,
                    'lattitude'    => $item->lattitude,
                    'longitude'    => $item->longitude,
                    'address'      => $item->address,
                    'user_speed'   => $item->user_speed,
                    'phone_bettery'=> $item->phone_bettery,
                    'datetime'=> $item->datetime,
                    'hold_status'      => $item->hold_status, // Include hold status
                ];
            })->all();

            // $zone = DB::table('safe_zone')->where(['child_user_id'=>$request->user_id, 'parent_user_id'=>$user->id])
            // ->select('id','zone_km','user_lattitude','user_longitude')->first();
             $zone = DB::table('geo_jsons')->where(['child_user_id'=>$request->user_id, 'parent_user_id'=>$user->id])
            ->select('zone_km','geojson','noti_status')->first();


            // Calculate total time spent
            $timeSpent = $startTime->diff($endTime);
            // Return the response with total distance and time spent
            $response = [
                'total_distance'=> round($totalDistance, 2) . ' KM',        // Total distance traveled in KM
                'total_time'    => $timeSpent->format('%h hours %i minutes'), // Total time spent in hours and minutes
                'zone_data'     => $zone,
                'user_data'     => $result
            ];

            // Encrypt and send the response
            $encryptedResponse = $this->encryptData($response);
            return $this->sendResponse($encryptedResponse, 'User data retrieved successfully');
        } catch (ValidationException $e) {

           return $this->sendError($e->validator->errors()->first(), 422);
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }*/ 

    ############################# COMMON METHODS ########################
    private function validateRequest($request)
    {
        $request->validate([
            'join_type' => 'required',
            'parent_user_id' => 'required',
            'device_name' => 'required',
            'child_u_lattitude' => 'required',
            'child_u_longitude' => 'required',
             'address' => 'required',
            'phone_bettery' => 'required',
            'user_speed' => 'required',
            'phone_battery_status' => 'required',
            'today_date' => 'required',
            'course' => 'required',
            'accuracy' => 'required',
            'isMock' => 'required',
        ]);
    }

    private function processJoinCode($joinData, $joinType)
    {
        if ($joinType == "link") {
            // Parse URL and extract the last segment as the join code
            $parsedUrl = parse_url($joinData);
            $path = $parsedUrl['path'];
            $segments = explode('/', $path);
            return end($segments);
        }

        if ($joinType == "bar_code") {
            // Extract the last segment from a barcode-style string
            $segments = explode('-', $joinData);
            return end($segments);
        }

        return $joinData; // Fallback if no special processing is needed
    }

    private function getParentUserIdByJoinCode($joinCode)
    {
        return User::where('join_code', $joinCode)->value('id');
    }

    private function isUserAlreadyJoined($childUserId, $parentUserId)
    {
        return JoinUserModel::where([
            'child_user_id' => $childUserId,
            'parent_user_id' => $parentUserId,
            'is_deleted' => 0
        ])->exists();
    }

    private function createJoinRecord($childUserId, $parentUserId, $deviceName, $joinType,$today_date)
    {
        return JoinUserModel::create([
            'parent_user_id' => $parentUserId,
            'child_user_id' => $childUserId,
            'device_name' => $deviceName,
            'join_type' => $joinType,
            'join_date' => $today_date,
        ]);
    }

    private function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo)
    {
        $earthRadius = 6371;  // Earth's radius in kilometers

        // Convert latitude and longitude from degrees to radians
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        // Haversine formula
        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) + cos($latFrom) * cos($latTo) * sin($lonDelta / 2) * sin($lonDelta / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;  // Distance in kilometers
    }

    // Haversine formula function for distance calculation
    private function haversineGreatCircleDistanceZone($lat1, $lon1, $lat2, $lon2, $earthRadius = 6371)
    {
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $latDelta = $lat2 - $lat1;
        $lonDelta = $lon2 - $lon1;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($lat1) * cos($lat2) * pow(sin($lonDelta / 2), 2)));
        return $angle * $earthRadius;
    }

    # get address from latitude and longitude
    private function getAddressFromLatLongHere($latitude, $longitude)  
    {
        $apiKey = "tyKsAV0joMSJi3Bokx3UMXuJruCPngEgb6LANtuMUoE";
        $url = "https://revgeocode.search.hereapi.com/v1/revgeocode?apikey=tyKsAV0joMSJi3Bokx3UMXuJruCPngEgb6LANtuMUoE&lang=en-US&at={$latitude},{$longitude}";
        // $url = "https://revgeocode.search.hereapi.com/v1/revgeocode?at={$latitude},{$longitude}&apikey={$apiKey}";
        $response = Http::get($url);
        $data = $response->json();
        return $data['items'][0]['address']['label'] ?? "Address not found";
    }

}
