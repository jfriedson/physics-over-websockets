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


var io = require('socket.io')(server);
io.sockets.on('connection', function(socket) {
    process.send({ msg: 'init', socket: socket.id });
    socket.emit('init', world);

    socket.on('mdown', function(coord) {
        process.send({ msg: 'mdown', socket: socket.id, pos: coord });
    });

    socket.on('mmove', function(coord) {
        process.send({ msg: 'mmove', socket: socket.id, pos: coord });
    });

    socket.on('mup', function() {
        process.send({ msg: 'mup', socket: socket.id });
    });

    socket.on('disconnect', function() {
        process.send({ msg: 'disc', socket: socket.id });
    });
});

setInterval(function() {
    io.volatile.emit('update', update);
}, tickrate);
