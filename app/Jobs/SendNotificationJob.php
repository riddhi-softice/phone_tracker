<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\ApplicationNotificationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use DB;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $childUser;
    protected $parentUserId;
    protected $title;
    protected $noti_data;

    /**
     * Create a new job instance.
     */
    public function __construct($childUser, $parentUserId,$title,$noti_data)
    {
        $this->childUser = $childUser;
        $this->parentUserId = $parentUserId;
        $this->title = $title;
        $this->noti_data = $noti_data;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        // \Log::info("SendNotificationJob is now running for parentUserId");
        // \Log::info("hello..."); 
        $notificationSendData['player_ids'] = User::where('id', $this->parentUserId)->pluck('player_id')->toArray();
        $notificationSendData['notification_url'] = "";
        // $notificationSendData['notification_title'] = $this->childUser->name . " accepted your invitation";
        // $notificationSendData['notification_description'] = $this->childUser->name . " accepted your invitation";
        $notificationSendData['notification_title'] = $this->title;
        $notificationSendData['notification_description'] = $this->title;
        $notificationSendData['notification_time'] = date('Y-m-d H:i:s');
        $notificationSendData['notification_image'] = ($this->childUser->profile_pic == null) ? asset('public/assets/img/logo.png') : $this->childUser->profile_pic;

        $data = ApplicationNotificationModel::sendOneSignalNotificationSchedule($notificationSendData);
        
  
        $receiver_user_ids = $this->parentUserId;
        $sender_user_id = $this->childUser->id;
        $noti_type = $this->noti_data['noti_type']; // Use array key access
        $msg = $this->noti_data['msg']; // Use array key access
        $noti_date = $this->noti_data['noti_date']; // Use array key access
      
        $input = ['sender_user_id'=>$sender_user_id, 'receiver_user_id'=>$receiver_user_ids,'title'=>$msg,'noti_type'=>$noti_type,'noti_date'=>$noti_date];
        DB::table('user_notifications')->insert($input);
    }
}

