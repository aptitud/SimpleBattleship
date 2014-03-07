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
                var ship = cell.getShip();

                ship.hit();

                if (ship.isSunk()) {
                    if (board.isAllShipsSunk()) {
                        gameSession.sendResult(column, row, Outcome.WIN);
                        board.gameOver(false);
                    } else {
                        gameSession.sendResult(column, row, Outcome.SINK);
                    }
                } else {
                    gameSession.sendResult(column, row, Outcome.HIT);
                }
            } else {
                gameSession.sendResult(column, row, Outcome.MISS);
            }

            board.setMyTurn(true);
        });

        gameSession.on("result", function(column, row, outcome) {
            if (outcome == Outcome.WIN) {
                board.gameOver(true);
            }
        });

        return gameSession;
    }

    var gameSession = createGameSession();

    function createShip(name, size) {
        var hit = function() {
            --size;
        };

        var isSunk = function() {
            return size <= 0;
        };

        return {
            name: name,
            size: size,
            hit: hit,
            isSunk: isSunk
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

        var getShip = function () {
            return this.ship;
        };

        return {
            state: ' ',
            setState: setState,
            addShip: addShip,
            hasShip: hasShip,
            getShip: getShip
        }

    }

    function createBoard() {

        var columns = new Array(10);
        var myTurn = false;
        var completed = false;
        var won = false;
        var ships = [];

        for (var i = 0; i < 10; i++) {
            columns[i] = new Array(10);
            for (var j = 0; j < 10; j++) {
                columns[i][j] = createCell();
            }
        }

        function fireAt(col, row) {
            if (board.isGameOver()) {
                alert("Game is over. Get over it.");
                return;
            }

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
                    } else if (outcome == Outcome.SINK || outcome == Outcome.WIN) {
                        cell.setState('X');
                    }
                });
            });

            board.setMyTurn(false);
        }

        function addShip(col, row, ship) {
            ships.push(ship);

            for (var i = 0; i < ship.size; i++) {
                var cell = columns[row][col + i];
                cell.addShip(ship);
            }
        }

        var setMyTurn = function(b) {
            myTurn = b;
        };

        var getShips = function() {
            return ships;
        };

        var isAllShipsSunk = function() {
            for (var i = 0; i < ships.length; i++) {
                if (!ships[i].isSunk()) {
                    return false;
                }
            }

            return true;
        };

        var gameOver = function(w) {
            completed = true;
            won = w;

            if (won) {
                document.body.style.background = "green";
            } else {
                document.body.style.background = "red";
            }
        };

        var isGameOver = function() {
            return completed;
        };

        return {
            columns: columns,
            fireAt: fireAt,
            addShip: addShip,
            setMyTurn: setMyTurn,
            getShips: getShips,
            isAllShipsSunk: isAllShipsSunk,
            gameOver: gameOver,
            isGameOver: isGameOver
        }

    }


    // Just for test
    board.addShip(1, 2, createShip("submarine", 3));
    board.addShip(4, 4, createShip("submarine", 2));

    $scope.board = board;
}]);