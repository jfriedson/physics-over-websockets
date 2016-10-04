var tickrate = process.argv[2];
var world = {};
var update = {};

process.on('message', function(data) {
    update = data;

    applyChanges(world, data);
});


function applyChanges(a, b) {
    for(var i in b) {
        if(!Array.isArray(b[i])) {
            if(b[i] != null) {
                a[i] = b[i];
            }
        } else {
            if(a[i] == null) {
                a[i] = [];
            }
            applyChanges(a[i], b[i]);
        }
    }
}

var express = require('express')();
var server = require('http').Server(express).listen(process.env.PORT || 28888);


express.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


//var SOCKET_LIST = {};

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket) {
    //SOCKET_LIST[socket.id] = socket;

    process.send(world_data);

    socket.emit('init', world);

    /*client.on('input', function(data){
        process.send(data);
    });*/

    /*socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
    });*/
});

setInterval(function() {
    io.volatile.emit('update', update);
}, tickrate);
