<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BaseController extends Controller
{
    public function sendResponse($result, $message)
    {
    	$response = [
            'success' => true,
            'message' => $message,
            'data'    => $result,
        ];
        return response()->json($response, 200);
    }

    public function sendResponseSuccess($message)
    {
    	$response = [
            'success' => true,
            'message' => $message,
        ];
        return response()->json($response, 200);
    }

    // public function sendError($error, $code = 422)
    public function sendError($error, $code = 500)
    {
    	$response = [
            'success' => false,
            'message' => $error,
        ];

        return response()->json($response, $code);
    }

    public function encryptData($response)
    {
        // $key = 'abcdefghijklmnopqrstuvwx12345678';
        // $iv = '1234567890123456';
        $key = 'a8b7c6d/5ef+4gh3#ij2kl@1m(n0o1pq';    # 32 bytes
        $iv = 'p/3(04-3*22!9j%8';           # 16 bytes
        $dataString  = json_encode($response);

        $sec_response = openssl_encrypt($dataString, 'AES-256-CBC', $key, 0, $iv);
        return $sec_response;
    }

    public function generateRandomToken($tokenLength = 32)
    {
        return bin2hex(random_bytes($tokenLength));
    }

}
