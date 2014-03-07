var myApp = angular.module('BattleShipApp', []);

myApp.controller('GameController', ['$scope', function ($scope) {
    var board = createBoard();

    function createGameSession() {
        var socket = io.connect();
        var gameSession = new GameSession(socket);

        gameSession.on("turn", function() {
            board.setMyTurn(true);
        });

        gameSession.on("started", function (peer) {
            console.log("Game session started");
        });

        gameSession.on("disconnected", function () {
            alert("Challenger gave up. You win!");
        });

        gameSession.on("fire", function(column, row) {
            var cell = board.columns[row][column];

            if (cell.hasShip()) {
                gameSession.sendResult(column, row, Outcome.HIT);
            } else {
                gameSession.sendResult(column, row, Outcome.MISS);
            }

            board.setMyTurn(true);
        });

        gameSession.on("result", function(column, row, outcome) {
            /* Handle */
        });

        return gameSession;
    }

    var gameSession = createGameSession();

    function createShip(name, size) {

        return {
            name: name,
            size: size
        }

    }

    function createCell() {

        var ship = null;

        function setState(state) {
            this.state = state;
        }

        function addShip(ship) {
            this.ship = ship;
        }

        function hasShip() {
            return this.ship != null;
        }

        return {
            state: ' ',
            setState: setState,
            addShip: addShip,
            hasShip: hasShip
        }

    }

    function createBoard() {

        var columns = new Array(10);
        var myTurn = false;

        for (var i = 0; i < 10; i++) {
            columns[i] = new Array(10);
            for (var j = 0; j < 10; j++) {
                columns[i][j] = createCell();
            }
        }

        function fireAt(col, row) {
            if (!myTurn) {
                alert("It's not your turn dude!");
                return;
            }

            var cell = columns[row][col];

            cell.setState('?');

            gameSession.fire(col, row, function(column, row, outcome) {
                $scope.$apply(function() {
                    if (outcome == Outcome.HIT) {
                        cell.setState('x');
                    } else if (outcome == Outcome.MISS) {
                        cell.setState('/');
                    }
                });
            });

            board.setMyTurn(false);
        }

        function addShip(col, row, ship) {
            for (var i = 0; i < ship.size; i++) {
                var cell = columns[row][col + i];
                cell.addShip(ship);
            }
        }

        var setMyTurn = function(b) {
            myTurn = b;
        };

        return {
            columns: columns,
            fireAt: fireAt,
            addShip: addShip,
            setMyTurn: setMyTurn
        }

    }


    // Just for test
    board.addShip(1, 2, createShip("submarine", 3));
    board.addShip(4, 4, createShip("submarine", 2));

    $scope.board = board;
}]);