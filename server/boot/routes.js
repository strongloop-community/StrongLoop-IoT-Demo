
var exec = require('child_process').exec;

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
        console.log('Resetting Mongo');
        
        exec('sh ' + __dirname + '/../reset-mongo.sh', function(err, stdout, stderr) {
            if (err) {
                console.error('Problem resetting mongo:', err.stack);
                return res.status(500).end(err.message);
            }
            if (stderr && stderr.length) {
                console.error('Problem resetting mongo:', stderr.toString());
                return res.status(500).end(stderr.toString());
            }
            
            res.status(200).end('Mongo reset successfully');
        });
    });
    
    server.post('/reset-sensors', function(req, res) {
        console.log('Resetting Sensors');
        
        exec('sh ' + __dirname + '/../reset-sensors.sh', function(err, stdout, stderr) {
            if (err) {
                console.error('Problem resetting sensors:', err.stack);
                return res.status(500).end(err.message);
            }
            if (stderr && stderr.length) {
                console.error('Problem resetting sensors:', stderr.toString());
                return res.status(500).end(stderr.toString());
            }
            
            res.status(200).end('Sensors reset successfully');
        });
    });

};
