var tickrate = process.argv[2];
var world;

process.on('message', function(data) {
    world = data;
});

var express = require('express')();
var server = require('http').Server(express).listen(process.env.PORT || 28888);


express.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


//var SOCKET_LIST = {};

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket) {
    //SOCKET_LIST[socket.id] = socket;

    socket.emit('init', world);

    /*client.on('input', function(data){
        process.send(data);
    });*/

    /*socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
    });*/
});

setInterval(function() {
    io.volatile.emit('world', world);
}, tickrate);
