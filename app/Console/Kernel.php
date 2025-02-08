<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('location:history-cron')->everyMinute();

        // $schedule->command('location:history-cron')->dailyAt('00:00');
        
         $schedule->command('queue:work --sleep=3 --tries=3 --timeout=90')
             ->withoutOverlapping()
             ->runInBackground();
    }
    
    
    

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
