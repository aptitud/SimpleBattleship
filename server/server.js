var express = require("express");
var app = express.createServer();
var io = require("socket.io").listen(app);
var gameserver = require("./gameserver");

app.configure(function () {
    app.use(express.static(__dirname + "/../client"));
});

app.get("*", function (request, response) {
    response.sendfile("index.html");
});

var counter = 1;

io.sockets.on("connection", function (socket) {
    var connectionId = "SESSION-" + (counter++);

    console.log("Received connection, registering as " + connectionId);

    gameserver.registerPlayer({
        sendMessage: function(message) {
            socket.emit("message", message);
        },
        sessionId: connectionId,
        toString: function() { return "player{sessionId:\"" + connectionId + "\"}"}
    });
});

app.listen(80);