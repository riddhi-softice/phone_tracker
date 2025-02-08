<?php
namespace App\Http\Middleware;

use Closure;
use App\Models\Admin;
use Illuminate\Support\Facades\Session;


class TwoFactorAuth
{
    public function handle($request, Closure $next)
    {
        if (Session::has('admin_id') && !Session::has('2fa_verified')) {
            return redirect()->route('2fa.form');
        }
        return $next($request);
    }

    /*# CUSTOM HANDLE
    public function handle($request, Closure $next)
    {
        $user = Admin::find(session('admin_id'));
        if ($user && $user->google2fa_secret && !session('2fa_verified')) {
            return redirect()->route('2fa.form');
        }
        return $next($request);
    }*/

}
