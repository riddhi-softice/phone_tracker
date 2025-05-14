<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use DB;
use Tymon\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use Illuminate\Support\Facades\Cache;


class AuthController extends BaseController
{
    public function app_common_data(Request $request)
    {
        //  \Log::info("common setting..: ". request()->ip()); 
        
        $cacheKey = 'common_setting_data';
        $settings = Cache::remember($cacheKey, 1440, function() {
            return DB::table('common_settings')->where('setting_key','!=','admin_ip')->get();
        });
        
        // $settings = DB::table('common_settings')
        // ->where('setting_key', '!=', 'admin_ip')
        // ->get();   
    
        $formattedSettings = [];
        foreach ($settings as $setting) {
            $decodedValue = json_decode($setting->setting_value, true);
            $value = is_array($decodedValue) ? $decodedValue : $setting->setting_value;
        
            if ($setting->setting_key === 'privacy_policy') {
                // Directly set privacy_policy
                $formattedSettings['privacy_policy'] = $value;
            } else {
                // Group everything else under app_update_dialog
                if (in_array($setting->setting_key, ['action_button', 'action_button_text'])) {
                    // Specially handle action_button nested array
                    $formattedSettings['app_update_dialog']['action_button'][$setting->setting_key] = $value;
                } else {
                    $formattedSettings['app_update_dialog'][$setting->setting_key] = $value;
                }
            }
        }        
        
        $encryptedData = $this->encryptData($formattedSettings);
        return $this->sendResponse($formattedSettings, 'Data get Successfully!');
    }

    public function social_login(Request $request) # version
    {
        try {
            $request->validate([
                'email' => 'required',
                'social_id' => 'required',
            ]);

            $email = $request->email;
            $social_id = $request->social_id;
            $joinToken = $this->generateRandomString();

            $user = User::where('email', $email)->where('social_id', $social_id)->first();
            if ($user) {
                // $updateData = $request->only(['name', 'profile_pic', 'source_lan']);
                $updateData = $request->all();
                $token = $this->generateJwtToken($user);
                $updateData['remember_token'] = $token;
                $user->update($updateData);

                # Prepare response data for new user
                $response = $this->prepareUserResponse($user, $token);
                $encryptedResponse = $this->encryptData($response);
                return $this->sendResponse($encryptedResponse, 'User login successful.');
            }
            if (User::where('social_id', $social_id)->exists()) {
                return $this->sendError('Social Id must be unique.');
            }

            $request->validate([
                'device_name' => 'required',
                'player_id' => 'required',
            ]);

            // $input = $request->only(['name', 'email', 'social_id', 'profile_pic', 'source_lan']);
            $input = $request->all();
            $input['join_code'] = $joinToken;
            $user = User::create($input);
            $token = $this->generateJwtToken($user);
            $user->update(['remember_token' => $token]);

            # Prepare response data for new user
            $response = $this->prepareUserResponse($user, $token);
            $encryptedResponse = $this->encryptData($response);
            return $this->sendResponse($encryptedResponse, 'User sign-up successful.');
        } catch (ValidationException $e) {

            return $this->sendError($e->validator->errors()->first());
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function user_logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            // Invalidate the token
            JWTAuth::invalidate($token);
            $user = User::where('remember_token',$token)->first();
            if (!$user) {
                return $this->sendError('Invalid token,User not found.', 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out',
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to log out, please try again',
            ], 500);
        }
    }

    public function edit_user(Request $request)
    {
        try {
            $user = Auth::user();
            if ($user) {
                $updateData = $request->all();
                $user->update($updateData);

                $encryptedResponse = $this->encryptData($updateData);
                return $this->sendResponse($encryptedResponse, 'User updated successfully');
            }
            return $this->sendError("user not found");
        } catch (\Exception $e) {
            return $this->sendError('An unexpected error occurred: ' . $e->getMessage());
        }
    }

    public function user_profile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return $this->sendError('Invalid token,User not found.', 401);
        }
        # Hide unwanted fields
        $user->makeHidden(['remember_token', 'created_at', 'updated_at']);
        
        $result = DB::table('users')
        ->selectRaw("
            SUM(CASE WHEN location_status = 'on' THEN 1 ELSE 0 END) as active_users,
            SUM(CASE WHEN location_status = 'off' THEN 1 ELSE 0 END) as inactive_users
        ")
        ->whereIn('id', function($query) use ($user) {
            $query->select('child_user_id')->from('join_user')->where('parent_user_id', $user->id);
        })->first();
        $user->enabled = (int)$result->active_users;
        $user->disabled = (int)$result->inactive_users;

        $user->bar_code = $this->generateBarCode($user->join_code);
        $user->join_link = $this->generateJoinLink($user->join_code);

        $encryptedResponse = $this->encryptData($user);
        return $this->sendResponse($encryptedResponse, 'User data get successfully');
    }

    public function verify_token(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return $this->sendError('Invalid token,User not found.', 401);
        }
        return $this->sendResponseSuccess('User token verify successfully.');
    }

    public function refresh_token(Request $request)
    {
        try {          
            $tokenString = $request->header('Authorization');
            $old_token = str_replace('Bearer ', '', $tokenString);
            
            
            // dd($token);
            // Log::info('refresh token before....', ['old_token'=>$old_token]);
            
            $user = User::where('remember_token',$old_token)->first();
            if (!$user) {
                return $this->sendError('Invalid token,User not found.', 401);
            }
            $token = JWTAuth::getToken();
            $newToken = JWTAuth::refresh($token);

            $updateData['remember_token'] = $newToken;
            $user->update($updateData);

            // # Prepare response data for new user
            $response = $this->prepareUserResponse($user, $newToken);
            $encryptedResponse = $this->encryptData($response);
            
            // Log::info('refresh token after....', ['user_data' => $user,'token'=>$newToken,'old_token'=>$token]);
             
            return $this->sendResponse($encryptedResponse, 'User token refresh successful.');
            // } catch (\Exception $e) {
            //     Log::error('Unhandled exception during token refresh', [
            //         'message' => $e->getMessage(),
            //         'trace' => $e->getTraceAsString(),
            //     ]);
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'An unexpected error occurred.'
            //     ], 500);

        } catch (\Exception $e) {
            // } catch (TokenExpiredException $e) { // not working when expired and can no longer be refreshed
            $tokenString = $request->header('Authorization');
            $old_token = str_replace('Bearer ', '', $tokenString);
            
            // Log::info('exipred token before....', ['old_token'=>$old_token]);
            $user = User::where('remember_token',$old_token)->first();
            if (!$user) {
                return $this->sendError('Expired token,User not found.', 401);
            }

            $newToken = $this->generateJwtToken($user);

            $updateData['remember_token'] = $newToken;
            $user->update($updateData);

            // # Prepare response data for new user
            $response = $this->prepareUserResponse($user, $newToken);
            $encryptedResponse = $this->encryptData($response);
            
            // Log::info('exipred token refresh after.', ['refresh_token' => $user,'token'=>$newToken,'old_token'=>$old_token]);
            
            return $this->sendResponse($encryptedResponse, 'User token refresh successful.');
            
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not refresh the token. Please log in again.'
            ], 401);
        }
    }

    public function get_privacy(Request $request)
    {
        $settings = DB::table('common_settings')->where('setting_key','=','privacy_policy')->pluck('setting_value')->first();

        $formattedSettings['privacy_policy'] = $settings;

        return $this->sendResponse($formattedSettings, 'Data get Successfully!');
    }

    ############### COMMON FUNCTION #####################
    protected function generateJwtToken($user)
    {
        return JWTAuth::fromUser($user);
        // return  Auth::login($user);
    }

    protected function prepareUserResponse($user, $token)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'token' => $token,
        ];
    }

    function generateRandomString($length = 8) {
        return substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, $length);
    }

    public function generateJoinLink($code)
    {
        $baseUrl = url('generateLink');
        $joinLink = $baseUrl . '/join/' . $code;
        return $joinLink;
    }

    public function generateBarCode($code) {
        $time = time();
        $joinLink = $time . '-' . $code;
        return $joinLink;
    }


}
