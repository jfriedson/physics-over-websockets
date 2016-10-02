//Variables to tweek

var gravity = [0 , -10];

var fps = 64;
var tickrate = 20;


//Important code (NO TOUHCHY)
fps = 1000/fps;
tickrate = 1000/tickrate;


//Physics
var p2 = require('p2');

var world = new p2.World({
    gravity: gravity
});

world.sleepMode = p2.World.ISLAND_SLEEPING;

var room = new p2.Body();
for(var i = 0; i < 4; ++i) {
    var planeShape = new p2.Plane();
    var angle = (i * Math.PI)/2;
    room.addShape(planeShape, [6*Math.sin(angle), -4*Math.cos(angle)], angle);
}
world.addBody(room);

var boxes = [];
for(var i = 0; i < 5; ++i) {
    var boxShape = new p2.Box({ width: 1, height: 1 });
    boxes[i] = new p2.Body({
        mass: 1,
        position: [-(i-2)*1.5, 1],
        angularVelocity: 0,
        angle: 0
    });
    boxes[i].addShape(boxShape);
    world.addBody(boxes[i]);
}

setInterval(function() {
    for(var i in boxes) {
        boxes[i].angularVelocity = (i-2);
    }
    world.step(fps/1000);
}, fps);

//Express and WebSocket Server
var socketserver = require("child_process").fork("./server", [tickrate]);

setInterval(function() {
    var world_data = {
        gravity: gravity,
        sleepMode: world.sleepMode,
        room: [],
        boxes: []
    };

    for(var i in boxes) {
        world_data.boxes[i] = {};
        world_data.boxes[i].position = boxes[i].position;
        world_data.boxes[i].angle = boxes[i].angle;
        world_data.boxes[i].velocity = boxes[i].velocity;
        world_data.boxes[i].angularVelocity = boxes[i].angularVelocity;
    }

    for(var i in room.shapes) {
        world_data.room[i] = {};
        world_data.room[i].position = room.shapes[i].position;
        world_data.room[i].angle = room.shapes[i].angle;
    }
    
    socketserver.send(world_data);
}, tickrate);

socketserver.on('message', function(data){
    p2.addforce = data.joint;
});
