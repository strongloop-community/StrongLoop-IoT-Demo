
(function($, d3, c3) {
    var dateFormat, evSrc;
    
    $(function() {
        connectResetLinks();
        
        var chartDiv = $('#sensor-chart');
        if (chartDiv.length) {
            initChart(chartDiv);
        }
    });
    
    
    function connectResetLinks() {
        var url = ['http', location.hostname, '/submitForm'].join('');
        
        $('.reset-mongo').on('click', function resetMongo() {
            $.ajax({
                url: url,
                type: 'POST',
                data: 'data=findMongo'
            }).then(function() {
                console.info('Mongo reset');
            }).fail(function(xhr, status, e) {
                console.error('Unable to reset mongo', e);
            });
        });

        $('.reset-sensors').on('click', function resetSensors() {
            $.ajax({
                url: url,
                type: 'POST',
                data: 'data=resetSensors'
            }).then(function() {
                console.info('Sensors reset');
            }).fail(function(xhr, status, e) {
                console.error('Unable to reset sensors', e);
            });
        });
    }
    
    
    function initChart(div) {
        
        dateFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
        evSrc = new EventSource('/api/Sensors/change-stream?_format=event-stream');
        
        getAndFormatData(div.data('sensor'))
            .then(function(columns) {
                
                console.info('creating graph from data', columns);
                
                var chart = c3.generate({
                    bindto: div[0],
                    data: {
                        x: 'x',
                        columns: columns
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%H:%M:%S'
                            }
                        }
                    }
                });
                
                initLiveButtons(chart, div.data('sensor'));
                
            })
            .fail(function(e) {
                return console.error('Unable to get sensor data:', e);
            });
    }
    
    function initLiveButtons(chart, type) {
        var handler = $.proxy(handleLiveData, {
            chart: chart,
            type: type
        });
        
        $('.live')
            .on('click', function() {
                var n = $(this);
                if (n.data('live') === 'on'){
                    n.text('Show Live Data').data('live', 'off');
                    evSrc.removeEventListener('data', handler);
                } else {
                    n.text('Stop Live Data').data('live', 'on');
                    evSrc.addEventListener('data', handler);
                }
            });
    }
    
    function handleLiveData(msg) {
        var data = JSON.parse(msg.data).data;
        
        this.chart.flow({
            columns: dataFormatters[this.type]([data]), // formatters expect an array
            length: 0,
            duration: 10
        });
    }
    
    function getAndFormatData(type, cb) {
        var d = $.Deferred();
        
        if (!dataFormatters[type]) {
            return d.reject(new Error('No data formatter for ' + type));
        }
        
        $.ajax({
            url: '/api/Sensors',
            dataType: 'json'
        }).then(function (data) {
            
            console.info('data retrieved, parsing for %s', type, data);
            
            d.resolve(dataFormatters[type](data));
            
        }).fail(function(xhr, status, e) {
            d.reject(e);
        });
        
        return d;
    }
    
    var dataFormatters = {
        accelerometer: function(data) {
            return formatThreeDegreeData(data, 'Accelerometer', 'accelX', 'accelY', 'accelZ');
        },
        magnetometer: function(data) {
            return formatThreeDegreeData(data, 'Magnetometer', 'magX', 'magY', 'accelZ');
        },
        gyroscope: function(data) {
            return formatThreeDegreeData(data, 'Gyroscope', 'roll', 'pitch', 'yaw');
        },
        temperature: function(data) {
            var graphData = [];
            
            data.forEach(function(point) {
                point.date_posted = dateFormat.parse(point.time);
                point.temp = +point.temp;
            });
    
            graphData[0] = data.map(function(p) { return p.temp; });
            graphData[1] = data.map(function(p) { return p.date_posted; });
            graphData[0].splice(0,0,'Temperature');
            graphData[1].splice(0,0,'x');
            
            return [
                graphData[1],
                graphData[0]
            ];
        }
    };
    
    function formatThreeDegreeData(data, title, x, y, z) {
        var graphData = [];
        
        data.forEach(function(point) {
            point.date_posted = dateFormat.parse(point.time);
            point[x] = +point[x];
            point[y] = +point[y];
            point[z] = +point[z];
        });

        graphData[0] = data.map(function(p) { return p[x]; });
        graphData[1] = data.map(function(p) { return p[y]; });
        graphData[2] = data.map(function(p) { return p[z]; });
        graphData[3] =  data.map(function(p) { return p.date_posted; });
        graphData[0].splice(0, 0, title + ' X-Axis');
        graphData[1].splice(0, 0, title + ' Y-Axis');
        graphData[2].splice(0, 0, title + ' Z-Axis');
        graphData[3].splice(0, 0, 'x');
        
        return [
            graphData[3],
            graphData[0],
            graphData[1],
            graphData[2]
        ];
    }
    
    
})(window.jQuery, window.d3, window.c3);
