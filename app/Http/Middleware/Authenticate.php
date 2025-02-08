<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Auth;
use Closure;
use Illuminate\Support\Facades\Request;

class Authenticate
{
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'Authentication fail'], 401);
        }

        return $next($request);
    }
}
