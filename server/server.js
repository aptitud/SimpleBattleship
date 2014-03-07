var express = require("express");
var app = express.createServer();
var io = require("socket.io").listen(app);

app.configure(function () {
    app.use(express.static(__dirname + "/../client"));
});

app.get("*", function (request, response) {
    response.sendfile("index.html");
});

io.sockets.on("connection", function (socket) {
    console.log("Received connection");
    socket.emit("foo", {message: "Hello!"});
});

app.listen(80);