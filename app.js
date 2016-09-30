//Variables to tweek

var gravity = -10;

var fps = 64;
var tickrate = 20;


//Important code (NO TOUHCHY)
fps = 1000/fps;
tickrate = 1000/tickrate;


//Physics
var p2 = require('p2');

var world = new p2.World({
    gravity: [0, gravity]
});

var planeShape = new p2.Plane();
var planeBody = new p2.Body({ position:[0,-1] });
planeBody.addShape(planeShape);
world.addBody(planeBody);

var boxes = [];
for(i = 0; i < 5; ++i) {
    var boxShape = new p2.Box({ width: 1, height: 1 });
    boxes[i] = new p2.Body({
        mass: 1,
        position: [(i-2)*1.5, 1],
        angularVelocity: 0,
        angle: 0
    });
    boxes[i].addShape(boxShape);
    world.addBody(boxes[i]);
}

setInterval(function() {
    for(i in boxes) {
        boxes[i].angularVelocity = (i-2);
    }
    world.step(fps/1000);
}, fps);

//Express and WebSocket Server
var socketserver = require("child_process").fork("./server", [tickrate]);

setInterval(function() {
    var world_data = {
        gravity: gravity,
        boxes: []
    };

    for(i in boxes) {
        world_data.boxes[i] = {};
        world_data.boxes[i].position = boxes[i].position;
        world_data.boxes[i].angle = boxes[i].angle;
        world_data.boxes[i].velocity = boxes[i].velocity;
        world_data.boxes[i].angularVelocity = boxes[i].angularVelocity;
    }
    socketserver.send(world_data);
}, tickrate);

/*socketserver.on('message', function(data){
    physics.addforce = data.joint;
});*/
