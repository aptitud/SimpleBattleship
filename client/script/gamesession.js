function GameSession(socket) {
    this._socket = socket;

    this._events = {
        "connect": [],
        "disconnect": [],
        "fire": [],
        "message": [],
        "started" : [],
        "disconnected" : [],
        "result" : []
    };

    this._attachToSocket();
    this._routeMessages();
}

var Outcome = {
    SINK: "sink",
    HIT: "hit",
    MISS: "miss",
    WIN: "win"
};

GameSession.prototype.sendResult = function(column, row, outcome) {
    this.sendMessage({type:"result", column:column, row:row, outcome:outcome});
};

GameSession.prototype.on = function (eventName, callback) {
    var events = this._events[eventName];

    if (!events) {
        throw new Error("Invalid event name: " + eventName);
    }

    events.push(callback);
};

GameSession.prototype.sendMessage = function(message) {
    this._socket.emit('message', message);
};

GameSession.prototype.fire = function(column, row) {
    this.sendMessage({type:"fire", column:column, row:row});
};

GameSession.prototype._attachToSocket = function () {
    var thisRef = this;

    this._socket.on("connect", function () {
        thisRef._dispatchEvent("connect", []);
    });

    this._socket.on("message", function (message) {
        thisRef._dispatchEvent("message", [message]);
    });
};

GameSession.prototype._dispatchEvent = function (name, args) {
    var eventHandlers = this._events[name];

    eventHandlers.each(function(eventHandler) {
        eventHandler.apply(eventHandler, args);
    });
};

GameSession.prototype._routeMessages = function() {
    var thisRef = this;

    this.on("message", function(message) {
        console.log("Received message: " + JSON.stringify(message));
        if (message.type == "fire") {
            thisRef._dispatchEvent("fire", [message.column, message.row]);
        } else if (message.type == "started") {
            thisRef._dispatchEvent("started", [message.peer]);
        } else if (message.type == "disconnect") {
            thisRef._dispatchEvent("disconnected", []);
        } else if (message.type == "result") {
            thisRef._dispatchEvent("result", [message.column, message.row, message.outcome]);
        }
    });
};