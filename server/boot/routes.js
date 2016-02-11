module.exports = function(server) {

    server.get('/', function(req, res) {
        res.render('index', {});
    });
    
    server.get('/sensors/:type', function(req, res) {
        res.render('sensors', {
            type: req.params.type
        });
    });
    
    server.post('/reset-mongo', function(req, res) {
        var resSent = false;
        var exec_cmd = '/usr/lib/edison_config_tools/findmongo.sh';
        console.log('Resetting Mongo with: ' + exec_cmd);
        
        var mongopid = spawn(exec_cmd, []);
        mongopid.stdout.on('data', function(data) {
            console.log('Result of mongo reset:', data);
            if(data == ''){
                console.log('Reset mongod: ' + data);
                if (!resSent) {
                    resSent = true;
                    res.end('Mongo reset.');
                }
            } else {
                if (!resSent) {
                    resSent = true;
                    res.status(500).end(''+data);
                }
            }
        });

        // listen for data on stderr
        mongopid.stderr.on('data', function(data){
            console.log('Error resetting Mongo:', data);
            if (!resSent) {
                resSent = true;
                res.status(500).end(''+data);
            }
        });
    });
    
    server.post('/reset-sensors', function(req, res) {
        var resSent = false;
        var exec_cmd = '/usr/lib/edison_config_tools/resetSensors.sh';
        console.log('Finding Sensors with: ' + exec_cmd);
        
        var sensorpid = spawn(exec_cmd, []);
        sensorpid.stdout.on('data', function(data) {
            console.log('Result of sensor reset:', data);
            if(data == ''){
                console.log('Sensors reset');
                if (!resSent) {
                    resSent = true;
                    res.end('Sensors reset.');
                }
            } else {
                if (!resSent) {
                    resSent = true;
                    res.status(500).end(''+data);
                }
            }
        }
        
        sensorpid.stderr.on('data', function(data) {
            console.log('Error resetting sensors:', data);
            if (!resSent) {
                resSent = true;
                res.status(500).end(''+data);
            }
        });
    });

};
