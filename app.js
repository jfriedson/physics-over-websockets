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
world.islandSplit = false;

var room = new p2.Body();
for(var i = 0; i < 4; ++i) {
    var planeShape = new p2.Plane();
    var angle = (i * Math.PI)/2;
    room.addShape(planeShape, [16*Math.sin(angle), -9*Math.cos(angle)], angle);
}
world.addBody(room);

var bodies = [];
for(var i = 0; i < 5; ++i) {
    var boxShape = new p2.Box({ width: 4, height: 2 });
    bodies[i] = new p2.Body({
        mass: 1,
        position: [0, 0],
        angularVelocity: 0,
        angle: 0
    });
    bodies[i].addShape(boxShape);
    bodies[i].shape = p2.Shape.BOX;
    world.addBody(bodies[i]);
}
for(var i = 5; i < 10; ++i) {
    var cirShape = new p2.Circle({ radius: 1 });
    bodies[i] = new p2.Body({
        mass: 1,
        position: [0, 0],
        angularVelocity: 0,
        angle: 0
    });
    bodies[i].addShape(cirShape);
    bodies[i].shape = p2.Shape.CIRCLE;
    world.addBody(bodies[i]);
}

setInterval(function() {
    for(i in bodies)
        if(i != 2)
            bodies[i].angularVelocity = (i%5-2);

    world.step(fps/1000);
}, fps);

//Express and WebSocket Server
var socketserver = require("child_process").fork("./server", [tickrate]);

var last_step = {};

setInterval(function() {
    var world_data = {
        room: [],
        bodies: []
    };

    if(world.gravity != last_step.gravity) {
        world_data.gravity = world.gravity;
    }

    if(world.sleepMode != last_step.sleepMode) {
        world_data.sleepMode = world.sleepMode;
    }

    for(var i in bodies) {
        if(bodies[i].sleepState != p2.Body.SLEEPING) {
            world_data.bodies[i] = {};
            world_data.bodies[i].position = bodies[i].position;
            world_data.bodies[i].angle = bodies[i].angle;
            world_data.bodies[i].velocity = bodies[i].velocity;
            world_data.bodies[i].angularVelocity = bodies[i].angularVelocity;
            world_data.bodies[i].shape = bodies[i].shape;
        }
    }

    for(var i in room.shapes) {
        if(room.sleepState != p2.Body.SLEEPING) {
            world_data.room[i] = {};
            world_data.room[i].position = room.shapes[i].position;
            world_data.room[i].angle = room.shapes[i].angle;
        }
    }
    
    socketserver.send(world_data);

    last_step = world_data;
}, tickrate);

var mice = {};
var constraints = {};

socketserver.on('message', function(data){
    if(data.msg == 'init') {
        mice[data.socket] = new p2.Body();
        world.addBody(mice[data.socket]);
    }

    if(data.msg == 'pdown') {
        world.removeConstraint(constraints[data.socket]);
        delete constraints[data.socket];
        
        mice[data.socket].position = data.pos;

        var hitBodies = world.hitTest(data.pos, bodies);

        if(hitBodies.length) {
            constraints[data.socket] = new p2.RevoluteConstraint(mice[data.socket], hitBodies[0], {
                worldPivot: mice[data.socket].position,
                collideConnected: false
            });
            world.addConstraint(constraints[data.socket]);
        }
    }

    if(data.msg == 'pmove') {
        mice[data.socket].position = data.pos;
    }

    if(data.msg == 'pup') {
        world.removeConstraint(constraints[data.socket]);
        delete constraints[data.socket];
    }

    if(data.msg == 'disc') {
        world.removeConstraint(constraints[data.socket]);
        delete constraints[data.socket];
        world.removeBody(mice[data.socket]);
        delete mice[data.socket];
    }
});
