var pendingPlayers = [];
var sessions = [];

exports.registerSession = function (player1, player2) {
    console.log("Registering game session between players " + player1 + " and " + player2);

    player1.sendMessage({type:"GameStarted", peer:player2.sessionId});
    player2.sendMessage({type:"GameStarted", peer:player1.sessionId});
};

exports.registerPlayer = function (client) {
    pendingPlayers.push(client);

    console.log("Registered client: " + client + ", " + pendingPlayers.length + " clients now available");

    while (pendingPlayers.length >= 2) {
        var matchedPlayers = pendingPlayers.splice(0, 2);

        this.registerSession(matchedPlayers[0], matchedPlayers[1]);
    }
};