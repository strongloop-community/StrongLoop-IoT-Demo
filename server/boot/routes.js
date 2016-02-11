
var spawn = require('child_process').spawn,
    path = require('path');

module.exports = function(server) {

    server.get('/', function(req, res) {
        res.render('index', {});
    });
    
    server.get('/sensors/:type', function(req, res) {
        res.render('sensors', {
            type: req.params.type
        });
    });
    
    server.post('/script/:name', function(req, res) {
        var scripts = ['reset-mongo', 'reset-sensors'];
        
        if (scripts.indexOf(req.params.name) < 0) {
            return res.status(400).end('Invalid script execution request', req.params.name);
        }
        
        executeCommand(req.params.name, function(err) {
            res
                .status((err) ? 500 : 200)
                .end((err) ? err.message : ('script success:' + req.params.name));
        });
    });
    
    function executeCommand(script, cb) {
        console.log('Running ' + script);
        
        var handle = spawn(path.join(__dirname, '..', script + '.sh'), []);
        
        handle.stdout.on('data', function(data) {
            console.log(data.toString());
        });
        handle.stderr.on('data', function(data) {
            console.error(data.toString());
        });
        handle.on('error', cb);
        handle.on('exit', function(code) {
            cb((code) ? (new Error('Failed to run ' + script + ': ' + code)) : null);
        });
    }

};
