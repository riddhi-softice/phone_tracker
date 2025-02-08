<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use DB;

class BlockIpMiddleware
{
    # 182.65.76.116 - same ip for all same router
    public $blockIps = ['192.168.1.6','182.65.76.116','27.56.151.238','208.109.10.232','122.182.131.212'];  # on a LAN or Wi-Fi connection - ipv4
    // public $blockIps = ['2401:4900:8899:7a8b:f5d7:b388:69d0:ea8a'];  # on a LAN or Wi-Fi connection - ipv6
    
    
    public function handle(Request $request, Closure $next)
    {
        $deviceToken = $request->input('device_token');
        dd($deviceToken);
        
        $ips = DB::table('common_settings')->where('setting_key','admin_ip')->pluck('setting_value')->first();
        $ip_array = explode(',',$ips);

        if (!in_array($request->ip(), $ip_array)) {
            abort(403, "You are restricted to access the site.");
        }
        return $next($request);
    }

}
