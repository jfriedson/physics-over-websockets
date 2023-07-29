# Networked-Physics
The physics simulation runs on both the server and client for a smooth experience. User interaction with the canvas is sent to the server over a websocket to let it be the master of the simulation - this prevents cheating in online games.

![Demo screenshot](demo.jpg?raw=true)

### How to Use
Start app.js in nodejs.\
Access app through browser (either localhost or domain/server ip)

## Dependencies
P2.js - Physics\
Socket.io - Websockets for networking\
Express - Hosts app for client
