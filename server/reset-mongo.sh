#!/usr/bin/env sh

echo "Finding mongo pid"
pid=`pidof mongod`
if [ $pid ]; then
    echo "killing mongo $pid"
    kill $pid
fi
echo "Removing Mongo Data"
rm -rf /data/db/edison*
echo "Restarting Mongo"
/usr/local/bin/mongod --storageEngine=mmapv1 > /home/root/mongo.log &
echo "Mongo reset complete"