<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FirebaseNotificationService
{
    // protected $firebase;
    // protected $messaging;

    // public function __construct()
    // {
    //     // dd(storage_path('app/firebase/credentials.json'));
    //     $this->firebase = (new Factory)->withServiceAccount(storage_path('app/firebase/credentials.json'));
    //     $this->messaging = $this->firebase->createMessaging();
    // }

    public function sendDataMessage($notificationSendData)
    {
        $factory = (new Factory)->withServiceAccount(storage_path('app/firebase/credentials.json'));
        $messaging = $factory->createMessaging();

        $title = $notificationSendData['notification_title'];
        $description = $notificationSendData['notification_description'];
        $tokens = $notificationSendData['device_tokens'];
        $notification_image = $notificationSendData['notification_image'];

        $data_payload = [
            // 'notification_type' => 'post_type',
            'redirect_to' => 'REDIRECT',
            'title' => $title,
            'body' => $description,
            // 'image' => $notification_image
        ];

        // Create the message template
        $message = CloudMessage::new()
            ->withNotification(['title' => $title, 'body' => $description])
            ->withAndroidConfig([
                'priority' => 'high',
            ])
            ->withApnsConfig([
                'payload' => [
                    'aps' => [
                        'contentAvailable' => true,
                        'sound' => 'default',
                    ],
                ],
            ])
            ->withData($data_payload);
        $report = $messaging->sendMulticast($message, $tokens);

        $failureCount = $report->failures()->count();
        if ($failureCount > 0) {
            Log::error('FCM Notification Error:', [
                'title' => $title,
                'failure_count' => $failureCount,
                'failures' => $report->failures()->map(fn ($failure) => $failure->error()->getMessage()),
            ]);
        }

        return [
            'success_count' => $report->successes()->count(),
            'failure_count' => $report->failures()->count(),
            'failures' => $report->failures()->map(fn ($failure) => $failure->error()->getMessage()),
        ];
    }

    public function sendDataMessage_signle($token, $data)
    {
        $factory = (new Factory)->withServiceAccount(storage_path('app/firebase/credentials.json'));
        // dd($factory);
        $title = 'testing..';
        $descripion = 'Your post.';
        // $notification_image =  asset('public/assets/img/logo.png');
        $notification_image =  "https://developer.apple.com/news/images/og/notifications-og-twitter.jpg";
        $messaging = $factory->createMessaging();

        $data_payload = [
            // 'notification_type' => 'post_type',
            'redirect_to' => 'REDIRECT',
            'title' => $title,
            'body' => $descripion,
            // 'image' => $notification_image  // not working
        ];

        // Create the message
        $message = CloudMessage::withTarget('token', $token)
            ->withNotification(['title' => $title, 'body' => $descripion])
            ->withAndroidConfig([
                'priority' => 'high',
            ])
            ->withApnsConfig([
                'payload' => [
                    'aps' => [
                        'contentAvailable' => true,
                        'sound' => 'default',
                    ],
                ],
            ])
            ->withData($data_payload);
        $response = $messaging->send($message); 
    }
    
}
