var es = require('event-stream');
module.exports = function(app) {
  var myApp = app.models.Sensor;
  myApp.createChangeStream(function(err, changes) {
    changes.pipe(es.stringify()).pipe(process.stdout);
  });
}