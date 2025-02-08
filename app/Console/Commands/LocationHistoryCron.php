<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LocationHistoryCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'location:history-cron';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove location history older than one week and retrieve latest history';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $oneWeekAgo = now()->subWeek();

        DB::table('location_history')->where('datetime', '<', $oneWeekAgo)->delete();

        // Clear the log file (optional, if you want to clear all logs)
        $logFile = storage_path('logs/laravel.log');
        file_put_contents($logFile, ''); // Clears the log file
    }
}
