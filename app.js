//Variables to tweek

//var gravity = -1;

var fps = 64;
var tickrate = 20;


//Important code (NO TOUHCHY)
fps = 1000/fps;
tickrate = 1000/tickrate;


//Physics
var p2 = require('p2');

var world = new p2.World({
    gravity: [0, 0]
});

var boxShape = new p2.Box({ width: 1, height: 1 });
var boxBody = new p2.Body({
    mass: 1,
    position: [0,0],
    angularVelocity: 0.01,
    angle: 1
});
boxBody.addShape(boxShape);
world.addBody(boxBody);


setInterval(function() {
    world.bodies[0].angularVelocity = 0.01;
    world.step(fps);
}, fps);

//Express and WebSocket Server
var socketserver = require("child_process").fork("./server", [tickrate]);

setInterval(function() {
    var world_data = {
        bodies: []
    };

    for(i = 0; i < world.bodies.length; ++i) {
        world_data.bodies[i] = {};
        world_data.bodies[i].position = world.bodies[i].position;
        world_data.bodies[i].angle = world.bodies[i].angle;
        world_data.bodies[i].velocity = world.bodies[i].velocity;
        world_data.bodies[i].angularVelocity = world.bodies[i].angularVelocity;
    }
    socketserver.send(world_data);
}, tickrate);

/*socketserver.on('message', function(data){
    physics.addforce = data.joint;
});*/
