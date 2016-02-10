module.exports = function(server) {

    server.get('/', function(req, res) {
        res.render('index', {});
    });
    
    server.get('/sensors/:type', function(req, res) {
        res.render('sensors', {
            type: req.params.type
        });
    });

};
