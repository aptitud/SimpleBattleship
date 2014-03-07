var gameserver = require("gameserver.js");

var testChannel = function() {
    var messages = [];

    return {
        sendMessage: function(message) {
            messages.push(message);
        },

        getMessages: function() {
            return messages;
        }
    }
};

describe("gameserver", function() {

    it("should be possible to create a game between two clients", function() {
        var player1Channel = testChannel();
        var player2Channel = testChannel();

        var player1 = gameserver.registerPlayer({});
        var player2 = gameserver.registerPlayer({});

        expect(player1Channel.getMessages()).toBe([{}]);
        expect(player2Channel.getMessages()).toBe([{}]);

    });

});