<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CommonSettingController;
use App\Http\Controllers\Admin\AppNotificationController;
use App\Http\Controllers\Admin\TwoFactorAuthController;
use App\Http\Controllers\Admin\UserController;

Route::get('cache_clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('config:cache');
    Artisan::call('route:clear');
    echo "cache cleared..";
});

Route::get('privacypolicy', function () {
    return view('privacy_policy');
});

// Route::middleware(['blockIP'])->group(function () {
//     Route::get('test', function () {
//         return "Hello..";
//     });
// });


// Route::middleware(['blockIP'])->group(function () {
   
    Route::group(['middleware' => ['admin']], function() {
        Route::get('2fa/setup', [TwoFactorAuthController::class, 'show2faForm'])->name('2fa.form');
        Route::post('2fa/setup', [TwoFactorAuthController::class, 'setup2fa'])->name('2fa.setup');
        Route::get('2fa/verify', [TwoFactorAuthController::class, 'showVerifyForm'])->name('2fa.verifyForm');
        Route::post('2fa/verify', [TwoFactorAuthController::class, 'verify2fa'])->name('2fa.verify');
    });

    /* ------ Authentication --------  */
    Route::get('login', [AuthController::class, 'index'])->name('login');
    Route::post('post-login', [AuthController::class, 'postLogin'])->name('login.post');

    Route::middleware(['2fa','session.timeout','admin'])->group(function () {

        Route::resource('users', UserController::class);
        Route::get('get_purchase_list', [UserController::class, 'get_purchase_list'])->name('get_purchase_list');

        Route::get('dashboard', [AuthController::class, 'dashboard'])->name('dashboard');
        Route::get('account_setting', [AuthController::class, 'account_setting'])->name('account_setting');
        Route::post('account_setting_change', [AuthController::class, 'account_setting_change'])->name('post.account_setting');
        Route::get('logout', [AuthController::class, 'logout'])->name('logout');

        Route::get('get_setting', [CommonSettingController::class, 'get_setting'])->name('get_setting');
        Route::post('change_setting', [CommonSettingController::class, 'change_setting'])->name('change_setting');

        Route::get('privacy_policy', [CommonSettingController::class, 'privacy_policy'])->name('privacy_policy');
        Route::post('change_privacy', [CommonSettingController::class, 'change_privacy'])->name('change_privacy');

        Route::resource('app_notification', AppNotificationController::class);
    });

// });

Route::get('privacypolicy', function () {
    return view('privacy_policy');
});

Route::get('/', function () {
    return view('landing_page');
});
