var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

app.configure(function () {
	app.use(express.static(__dirname + "/../client"));
});

app.get("*", function (request, response) {
	response.sendfile("index.html");
});

io.sockets.on("connection", function (socket) {
	console.log("Received connection");
	socket.emit("message", {
		message: "Hello!"
	});
});

app.listen(3000);