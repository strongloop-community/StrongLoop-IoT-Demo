#!/usr/bin/env sh

echo "Finding sensor pid"
pid=`ps | grep sensors | grep -v grep | awk '{print $1}'`
if [ $pid ]; then
    echo "Killing sensor program"
    kill $pid
fi
echo "Restarting sensor program"
cd /home/root/LSM9DS0
./sensors --output json --dbhost localhost &
echo "Sensor reset complete"