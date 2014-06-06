var express = require('express');
var http = require('http');
var sockjs = require('sockjs');

var connections = [];
var numbers = [];

var chat = sockjs.createServer();
chat.on('connection', function (conn) {
    connections.push(conn);
    var number;
    var i = 1;

    while (true) {
        if (numbers.indexOf(i) == -1) {
            number = i;
            numbers.push(i);
            break;
        }
        i++;
    }

    conn.write("Welcome, User " + number);
    console.log("Users connected: " + connections.length);
    conn.on('data', function (message) {
        for (var ii = 0; ii < connections.length; ii++) {
            connections[ii].write("User " + number + " says: " + message);
        }
    });
    conn.on('close', function () {
        for (var ii = 0; ii < connections.length; ii++) {
            connections[ii].write("User " + number + " has disconnected");
        }
        var index = connections.indexOf(conn);
        connections.splice(index, 1);
        numbers.splice(index, 1);

        console.log("Someone disconnected, now connected: " + connections.length);
    });
});


var app = express();
app.set('port', process.env.PORT || 9999);
app.use('/', express.static(__dirname + '/public'));
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
chat.installHandlers(server, {prefix: '/chat'});
