#!/bin/bash
nohup /usr/local/bin/php /home/softice/public_html/phonetracker.videoapps.club/project/artisan queue:work --sleep=3 --tries=3 >> /home/softice/public_html/phonetracker.videoapps.club/project/storage/logs/queue.log 2>&1 &
