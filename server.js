var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = Number(process.env.PORT || 2013),
    gameserver = require("./server/gameserver.js");

server.listen(port);

app.use("/", express.static(__dirname + '/client'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client/index.html');
});

io.sockets.on("connection", function (socket) {
    console.log("Received connection, registering as " + socket.id);

    gameserver.registerPlayer({
        sendMessage: function (message) {
            socket.emit("message", message);
        },
        onMessage: function (callback) {
            socket.on("message", function (message) {
                callback(message);
            });
        },
        id: socket.id,
        toString: function () {
            return "player{sessionId:\"" + this.id + "\"}"
        }
    });

    socket.on("disconnect", function () {
        console.log("Received disconnect event for socket id: " + socket.id);
        gameserver.unregisterPlayer(socket.id);
    });
});