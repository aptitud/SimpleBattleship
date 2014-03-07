var pendingPlayers = [];
var sessions = [];

exports.registerSession = function (player1, player2) {
    console.log("Registering game session between players " + player1 + " and " + player2);

    sessions.push({
        player1: player1,
        player2: player2,
        close: function() {
            this.player1.sendMessage({type:"disconnect"});
            this.player2.sendMessage({type:"disconnect"});
        }
    });

    player1.sendMessage({type:"started", peer:{id:player2.id}});
    player2.sendMessage({type:"started", peer:{id:player1.id}});
};

exports.registerPlayer = function (client) {
    pendingPlayers.push(client);

    console.log("Registered client: " + client + ", " + pendingPlayers.length + " clients now available");

    while (pendingPlayers.length >= 2) {
        var matchedPlayers = pendingPlayers.splice(0, 2);

        this.registerSession(matchedPlayers[0], matchedPlayers[1]);
    }
};

exports.unregisterPlayer = function(id) {
    for (var i = 0; i < pendingPlayers.length; i++) {
        if (pendingPlayers.id == id) {
            console.log("Unregistering pending player: " + id);
            pendingPlayers.splice(i--, 1);
        }
    }

    for (var i = 0; i < sessions.length; i++) {
        var session = sessions[i];

        if (session.player1.id == id || session.player2.id == id) {
            session.close();
            sessions.splice(i--, 1);
        }
    }
};