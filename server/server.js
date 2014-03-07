var express = require("express");
var app = express();
var http = require("http");
var server = http.createServer(app);
var io = require("socket.io").listen(server);
var gameserver = require("./gameserver");

app.configure(function () {
    app.use(express.static(__dirname + "/../client"));
});

app.get("*", function (request, response) {
    response.sendfile("index.html");
});

io.sockets.on("connection", function (socket) {
    console.log("Received connection, registering as " + socket.id);

    gameserver.registerPlayer({
        sendMessage: function (message) {
            socket.emit("message", message);
        },
        onMessage: function(callback) {
            socket.on("message", function(message) {
                callback(message);
            });
        },
        id: socket.id,
        toString: function () {
            return "player{sessionId:\"" + this.id + "\"}"
        }
    });

    socket.on("disconnect", function() {
        console.log("Received disconnect event for socket id: " + socket.id);
        gameserver.unregisterPlayer(socket.id);
    });
});

server.listen(8080);