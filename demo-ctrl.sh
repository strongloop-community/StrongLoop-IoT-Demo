#!/usr/bin/env sh


if [ $# -lt 1 ]; then
   echo "Usage: start-demo.sh <install|start|stop|update|clear>"
   exit
fi
if [ $1 = "install" ]; then
    # set up the ropsitories for Edison and make sure everything's up to date,
    # then install git and cmake, if it's not already there
    echo ""
    echo "*********************************************"
    echo "We're going to set up a whole bunch of stuff, and it's going to take a while ." 
    echo "When we're done, your Edison will be ready to run the StrongLoop Demo without"
    echo "any further alterations."
    echo ""
    echo "So let's get started!"
    echo ""
    echo "*********************************************"
    sleep 5

    # This has to be done manually -- covered in the ReadMe
    # echo "Setting up repositories ..."
    # echo ""
    # echo "src all     http://iotdk.intel.com/repos/1.1/iotdk/all" >> /etc/opkg/base-feeds.conf
    # echo "src x86 http://iotdk.intel.com/repos/1.1/iotdk/x86" >> /etc/opkg/base-feeds.conf
    # echo "src i586    http://iotdk.intel.com/repos/1.1/iotdk/i586" >> /etc/opkg/base-feeds.conf
    # echo ""
    # echo "*********************************************"
    echo "Updating Repositories ..."
    echo ""
    opkg update
    opkg upgrade
    echo ""
    echo "*********************************************"
    echo "Installing git ..."
    opkg install git
    echo ""
    echo "*********************************************"
    echo "Installing cmake ..."
    opkg install cmake

    # Install the Demo Application
    echo ""
    echo "*********************************************"
    echo "Installing the StrongLoop-IoT-Demo Application ..."
    git clone https://github.com/strongloop-community/StrongLoop-IoT-Demo

    # The version of node that comes with Edison is too old. The latest versions
    # won't build, so use the last version that WILL
    # This can take upwards of 2 hours to complete
    # source is on my server since wget on Edison can't do https
    echo ""
    echo "*********************************************"
    echo "Installing node ... (this will take a while!)"
    wget http://downloads.mongodb.org/linux/mongodb-linux-i686-3.2.0.tgz
    tar xzf StrongLoop-IoT-Demo/lib/node-v0.12.5.tar.gz
    rm *.tar*
    cd node-v0.12.5
    ./configure
    make install
    cd ..
    rm -rf node*
    
    echo ""
    echo "*********************************************"
    echo "Installing Demo app dependencies"
    cd StrongLoop-IoT-Demo
    npm install
    cd ..
    cp StrongLoop-IoT-Demo/demo-ctrl.sh .

    # IS THIS STILL REQUIRED?
    # the root partition will fill up if we don't move /usr/local
    # so move it to the /home partition
    # this HAS to be done after node is built, not before, or building 
    # Node.js will fail inexplicably
    # mkdir /home/usr
    # mv /usr/local /home/usr
    # ln -s /home/usr/local /usr/local

    # Build and install the MongoDB C-Libraries which are required
    # source is on my server since wget on Edison can't do https
    echo ""
    echo "*********************************************"
    echo "Installing MongoDB C Library ..."
    # wget http://dragonflyiot.com/demoSoftware/mongo-c-driver-1.3.1.tar.gz
    tar xzf StrongLoop-IoT-Demo/lib/mongo-c-driver-1.3.1.tar.gz
    rm mongo*.gz
    cd mongo-c-driver-1.3.1/
    ./configure
    make install
    cd ..
    rm -rf mongo*

    # Build and install the MQTT libraries
    # make install fails, so we do the install manually
    echo ""
    echo "*********************************************"
    echo "Installing MQTT Libraries ... "
    git clone https://git.eclipse.org/r/paho/org.eclipse.paho.mqtt.c
    cd org.eclipse.paho.mqtt.c/
    make
    cp src/*.h /usr/local/include
    cp build/output/*.so.1.0 /usr/local/lib
    cd /usr/local/lib/
    ln -s libpaho-mqtt3a.so.1.0 libpaho-mqtt3a.so.1
    ln -s libpaho-mqtt3a.so.1 libpaho-mqtt3a.so
    ln -s libpaho-mqtt3as.so.1.0 libpaho-mqtt3as.so.1
    ln -s libpaho-mqtt3as.so.1 libpaho-mqtt3as.so
    ln -s libpaho-mqtt3c.so.1.0 libpaho-mqtt3c.so.1
    ln -s libpaho-mqtt3c.so.1 libpaho-mqtt3c.so
    ln -s libpaho-mqtt3cs.so.1.0 libpaho-mqtt3cs.so.1
    ln -s libpaho-mqtt3cs.so.1 libpaho-mqtt3cs.so
    cd
    rm -rf org.eclipse.paho.mqtt.c/

    # install the couchbase libraries
    # the configure script needs to be altered to work
    echo ""
    echo "*********************************************"
    echo "Installing Couchbase Libraries ..."
    git clone git://github.com/couchbase/libcouchbase.git
    cd libcouchbase
    sed -i '/RealBin/s/^/#/' configure.pl
    sed -i '/RealBin/s/^/#/' cmake/configure

    sed -i "166i my \$srcdir =\"/home/root/libcouchbase/\";" configure.pl
    sed -i "166i my \$srcdir =\"/home/root/libcouchbase/\";" cmake/configure

    mkdir build
    cd build 
    ../cmake/configure --disable-plugins
    make
    make install
    cd
    rm -rf libcouchbase

    # install mongodb for 32-bit linux
    # source is on my server since wget on Edison can't do https
    # the database is supposed to live in /data/db 
    echo ""
    echo "*********************************************"
    echo "Installing MongoDB ..."
    # wget http://dragonflyiot.com/demoSoftware/mongodb-linux-i686-3.2.0.tgz
    tar xzf StrongLoop-IoT-Demo/lib/mongodb-linux-i686-3.2.0.tgz
    cp mongodb-linux-i686-3.2.0/bin/* /usr/local/bin
    rm -rf mongodb*
    rm ._mongodb-linux-i686-3.2.0
    mkdir /data
    mkdir /data/db

    # update the library cache for all the stuff we just installed
    echo ""
    echo "*********************************************"
    echo "Updating Library Caches ..."
    echo "/usr/local/lib" >> /etc/ld.so.conf
    ldconfig

    # npm installs will fail without some directory permission fixes
    # so we make sure those are done first
    cd
    mkdir .npm
    chmod -R a+rw .npm
    chmod a+w .

    # this may not be strictly necessary, but ...
    echo ""
    echo "*********************************************"
    echo "Installing sqlite3 ..."
    npm install -g sqlite3

    # Install Strong-pm, set it up as a system process and start it
    # echo ""
    # echo "*********************************************"
    # echo "Installing Strong-pm ..."
    # npm install -g strong-pm
    # sl-pm-install --systemd
    # systemctl start strong-pm

    # Finally we grab the sensor reader code and build it.
    echo ""
    echo "*********************************************"
    echo "Installing the Sensor Code ..."
    git clone https://github.com/strongloop-community/LSM9DS0
    cd LSM9DS0/
    make
    cd ..
    echo ""
    echo "*********************************************"
    echo "After Installation you should run the following commands to calibrate the sensors:"
    echo "    cd LSM9DS0"
    echo "    ./calibrate-mag"
    echo "    ./calibrate-acc-gyro"
    echo "Follow the on-screen instructions from those commands, and when calibrating the "
    echo "Accelerometer and Gyro, make sure the device is sitting flat on a stabel surface"
    echo "with no vibration from music, typing, computers, etc."
    echo "Whenever the Edison reboots the MongoDB will automatically start, as will the "
    echo "StrongLoop Application. Use the demo-crtl.sh script to stop or restart the demo."
    echo "*********************************************"
    exit 0
elif [ $1 = "start" ]; then
    echo "Killing Mongo DB ..."
    proc=`pidof mongod`
    kill $proc
    rm -rf /data/db/edison*
    echo "Starting Mongo DB ..."
    mongod --storageEngine=mmapv1 2>$1 > mongo.log &
    sleep 5
    echo "Clearing out the Mongo Datastore ..."
    mongo mongo  --eval "db.dropDatabase()"
    sleep 5
    echo "Killing the StrongLoop application ..."
    proc=`pidof node`
    kill $proc
    sleep 3
    echo "Starting Strongloop application ..."
    cd StrongLoop-IoT-Demo
    node .  1>loopback.log 2>loopback-error.log &
    sleep 15
    echo "Starting the sensor logger ... "
    cd ../LSM9DS0
    ./sensors --output json --dbhost localhost &
    cd ..
    ip_addr=`ifconfig wlan0 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://'`
    echo "Connect to your application at http://$ip_addr:3000/"
elif [ $1 = "update" ]; then
    cd StrongLoop-IoT-Demo
    git pull
    npm install
    cd ../LSM9DS0
    git pull
    make clean
    make
    echo "Update compelted..."
    echo "You may want to copy the demo controller out to the parent directory!"
    echo "    cp StrongLoop-IoT-Demo/demo-ctrl.sh ."
    cd ..
elif [ $1 = "clear" ]; then
    echo "Killing Mongo DB ..."
    proc=`pidof mongod`
    kill $proc
    rm -rf /data/db/edison*
    echo "Starting Mongo DB ..."
    mongod --storageEngine=mmapv1 2>$1 > mongo.log &
    sleep 5
    echo "Clearing out the Mongo Datastore ..."
    mongo mongo  --eval "db.dropDatabase()"
    sleep 5
elif [ $1 = "stop" ]; then
    echo "Killing sensor logger ..."
    proc=`pidof sensors`
    kill $proc
    echo "Killing mongod ..."
    proc=`pidof mongod`
    kill $proc
    rm -rf /data/db/edison*
    echo "Killing the application ..."
    proc=`pidof node`
    kill $proc
else
    echo "Usage: demo-ctrl.sh <install|start|stop|update|clear>"
    echo "  install:  Install all software (requires Internet access)"
    echo "    start:  Start all the processes required for the demo"
    echo "            Any running processes will be killed first."
    echo "    stop:   Stop all processes associated with the demo."
    echo "    update: update all git repositories and re-build"
    echo "    clear:  Stop the MongoDB instance and clear out the data"
    echo "            and then re-start MongoDB."
fi

