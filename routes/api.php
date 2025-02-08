<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\NotificationController;

Route::group(['middleware' => ['throttle:60,1'], 'as' => 'api.'], function () {

    # AUTH APIS
    Route::controller(AuthController::class)->group(function () {
        Route::post('social_login', 'social_login')->name('login');
        Route::post('refresh_token', 'refresh_token');    

        Route::middleware('auth')->group( function () {
            Route::post('user_logout', 'user_logout');
            Route::post('edit_user', 'edit_user');
            Route::post('user_profile', 'user_profile');
            Route::post('verify_token', 'verify_token');
           
            Route::post('get_privacy', 'get_privacy');    
        });
    });

    # GENERAL APIS
    Route::controller(ApiController::class)->group(function () {
        Route::post('check_version', 'check_version');
        Route::post('verify_purchase','verify_purchase');    

        Route::middleware('auth')->group( function () {

            # BOTH USER
            Route::post('update_location','update_location');        // queue notification (outside zone)

            # CHILD USER
            Route::post('verify_join_data', 'verify_join_data');
            Route::post('join_user', 'join_user');                  // queue notification
            Route::post('located_user_history','located_user_history');  

            # PARENT USER
            Route::post('get_home_data','get_home_data');
            Route::post('all_locating_user_list','all_locating_user_list');
            Route::post('user_location_details','user_location_details');  
            Route::post('user_hold_location_details','user_hold_location_details');  

            Route::post('disconnect_user','disconnect_user');
            Route::post('remove_user_history','remove_user_history');

            Route::post('manage_user_geojson','manage_user_geojson');  
        });
    });

    # NOTIFICATION APIS
    Route::controller(NotificationController::class)->group(function () {

        Route::middleware('auth')->group( function () {
            Route::post('send_call_notification', 'send_call_notification');   
            Route::post('notification_list', 'notification_list');   
        });
    });

});
