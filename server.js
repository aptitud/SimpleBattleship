var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	port = Number(process.env.PORT || 2013);

server.listen(port);

app.use("/", express.static(__dirname + '/client'));

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/client/index.html');
});

io.sockets.on('connection', function (socket) {
	socket.emit("coonectionEstablished", "green");
});