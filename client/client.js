var socket = io.connect();

socket.on("connect", function () {});

socket.on("coonectionEstablished", function (color) {
	document.body.style.background = color;
});