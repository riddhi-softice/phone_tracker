<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use GuzzleHttp\Client;

class ApplicationNotificationModel extends Model
{
    protected $table = "app_notifications";
    protected $guarded = [];

    public static function sendOneSignalNotificationSchedule($notificationData) {
        
        //  \Log::info("SendNotificationJob is now running for ,,,,");
         
        # old web
        $appId = "0c341937-b7e1-44ac-88c0-c5adc1040882";
        $apiKey = "ZjZhOTBkYzMtZTllYy00ZTlmLWJjYTEtYjVlZjZmMTgzZWU5";

        $notification_title = $notificationData['notification_title'];
        $notification_message = $notificationData['notification_description'];
        $notification_image = $notificationData['notification_image'];
        $player_ids = $notificationData['player_ids']; # Array of specific player IDs
        # Chunk the player IDs into smaller batches to send notifications in chunks
        // $chunks = array_chunk($player_ids, 200); # Chunk size of 200 IDs per request

        $client = new Client();
        // foreach ($chunks as $chunk) {
            $response = $client->post("https://onesignal.com/api/v1/notifications", [
                'headers' => [
                    'Authorization' => 'Basic ' . $apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'app_id' => $appId,
                    'contents' => ['en' => $notification_message],
                    'headings' => ['en' => $notification_title],
                    'big_picture' => $notification_image,
                    'large_icon' => $notification_image,
                    'chrome_web_image' => $notification_image,
                    'include_player_ids' => $player_ids,
                    // 'included_segments' => ['All'],
                ],
            ]);
        // }
    }

}
