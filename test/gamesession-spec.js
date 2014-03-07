describe("Game session", function() {

    var testSocket = {
        _eventHandlers: {
            "connect" : [],
            "message" : []
        },

        on: function(eventName, callback) {
            this._eventHandlers[eventName]= callback;
        }
    };

    it("should attach to socket when created", function() {
        var gameSession = new GameSession(testSocket);

        expect(testSocket._eventHandlers.length).toBe(1);
    })

});