function menu_goto( menuform )
{
    var ip = location.host;
  var baseurl = 'http://' + ip + '/';
  selecteditem = menuform.url.selectedIndex ;
  newurl = menuform.url.options[ selecteditem ].value ;
  if (newurl.length != 0) {
    location.href = baseurl + newurl ;
  }
}
document.writeln( '<form action="menu" method="get">' );
document.writeln( '<select name="url" onchange="menu_goto(this.form)">' );
document.writeln( '<option value="#">Select Data to View</option>' );
document.writeln( '<option value="/index.html">Home</option>' );
document.writeln( '<option value="views/all-sensors.html">All Sensors</option>' );
document.writeln( '<option value="views/gyroscope.html">Gyroscope</option>' );
document.writeln( '<option value="views/accelerometer.html">Accelerometer</option>' );
document.writeln( '<option value="views/magnetometer.html">Magnetometer</option>' );
document.writeln( '<option value="views/temperature.html">Temperature</option>' );
document.writeln( '<option value="views/pitch.html">Pitch (Gyro X-Axis)</option>' );
document.writeln( '<option value="views/roll.html">Roll (Gyro Y-Axis)</option>' );
document.writeln( '<option value="views/yaw.html">Yaw (Gyro Z-Axis)</option>' );
document.writeln( '<option value="views/accel-x.html">Accelerometer X-Axis</option>' );
document.writeln( '<option value="views/accel-y.html">Accelerometer Y-Axis</option>' );
document.writeln( '<option value="views/accel-z.html">Accelerometer Z-Azis</option>' );
document.writeln( '<option value="views/mag-x.html">Magnetometer X-Axis</option>' );
document.writeln( '<option value="views/mag-y.html">Magnetometer Y-Axis</option>' );
document.writeln( '<option value="views/mag-z.html">Magnetometer Z-Axis</option>' );
document.writeln( '</select>' );
document.writeln( '</form>' );



