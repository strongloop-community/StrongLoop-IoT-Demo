#!/usr/bin/env sh

echo "Finding sensor pid"
pid=`pidof sensors`
if [ $pid ]; then
    echo "Killing sensor program $pid"
    kill $pid
fi
echo "Restarting sensor program"
cd /home/root/LSM9DS0
./sensors --output json --dbhost localhost &
echo "Sensor reset complete"