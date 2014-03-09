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
            if (!board.isGameOver()) {
                board.gameOver(true);
                alert("Challenger gave up. You win!");
            }
        });

        gameSession.on("fire", function(column, row) {
            board.fireOn(createCoordinate(column, row),
                function(coordinate, ship) {
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
                },
                function(coordinate) {
                    gameSession.sendResult(column, row, Outcome.MISS);
                });

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

    function createCoordinate(x, y) {
        return {
            x:x,
            y:y,
            equals: function(coordinate) {
                return x == coordinate.x && y == coordinate.y;
            },
            distance: function(coordinate) {
                return Math.max(Math.abs(x - coordinate.x), Math.abs(y - coordinate.y));
            }
        }
    }
    function createShip(name, coordinates) {
        var hitCoordinates = []
        var hit = function(coordinate) {
            var isHit = coordinates.some(function(c) {
                return c.equals(coordinate)
            });
            if (isHit) {
                hitCoordinates.push(coordinate);
                return true;
            }
            return false;
        };

        var isSunk = function() {
            return hitCoordinates.length == coordinates.length;
        };

        var hasCoordinate = function(coordinate) {
            return coordinates.some(function(c) {
                return c.equals(coordinate);
            });
        }

        var hasCoordinateWithDistance = function(coordinate) {
            return coordinates.some(function(c) {
                // check distance <= 1
                return c.distance(coordinate) <= 1;
            });
        }

        return {
            name: name,
            coordinates: coordinates,
            hitCoordinates: hitCoordinates,
            hit: hit,
            isSunk: isSunk,
            hasCoordinate: hasCoordinate,
            hasCoordinateWithDistance: hasCoordinateWithDistance
        }
    }

    function createCell(coordinate) {

        function setState(state) {
            this.state = state;
        }

        var isMiss = function () {
            return this.state == '/';
        };

        var isHit = function () {
            return this.state === 'x';
        };

        var isSink = function () {
            return this.state === 'X';
        };

        var hasShipCached = undefined;
        var hasShip = function() {
            if (hasShipCached) {
                return hasShipCached;
            }
            hasShipCached = board.hasShip(coordinate);
            return hasShipCached;
        }

        return {
            coordinate:coordinate,
            state: ' ',
            setState: setState,
            isMiss: isMiss,
            isHit: isHit,
            isSink: isSink,
            hasShip: hasShip
        }

    }

    function createBoard() {

        var columns = new Array(10);
        var completed = false;
        var won = false;
        var ships = [];

        for (var i = 0; i < 10; i++) {
            columns[i] = new Array(10);
            for (var j = 0; j < 10; j++) {
                columns[i][j] = createCell(createCoordinate(j, i));
            }
        }

        function fireOn(coordinate, onHit, onMiss) {
            for(var i = 0; i < ships.length; i++) {
                if (ships[i].hit(coordinate)) {
                    onHit(coordinate, ships[i]);
                    return;
                }
            }
            onMiss(coordinate)
        }

        function hasShip(coordinate) {
            return ships.some(function(s) {
                return s.hasCoordinate(coordinate);
            })
        }

        function fireAt(col, row) {
            if (board.isGameOver()) {
                alert("Game is over. Get over it.");
                return;
            }

            if (!$scope.myTurn) {
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
                    } else if (outcome == Outcome.SINK || outcome == Outcome.WIN) {
                        cell.setState('X');
                    }
                });
            });

            board.setMyTurn(false);
        }

        function addShip(ship) {
            ships.push(ship);
        }

        var setMyTurn = function(myTurn) {
            if (!$scope.$$phase) {
                $scope.$apply(function() {
                    $scope.myTurn = myTurn;
                });
            } else {
                $scope.myTurn = myTurn;
            }
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

        setMyTurn(false);

        return {
            columns: columns,
            fireAt: fireAt,
            addShip: addShip,
            setMyTurn: setMyTurn,
            getShips: getShips,
            isAllShipsSunk: isAllShipsSunk,
            gameOver: gameOver,
            isGameOver: isGameOver,
            fireOn: fireOn,
            hasShip: hasShip
        }

    }

    var DIRECTION = {
        vertical:'V',
        horizontal:'H'
    };

    function createShipLayout(startCoordinate, size, direction) {
        var coordinates = [];
        for(var i = 0; i < size; i++) {
            var c = '';
            if (DIRECTION.vertical == direction) {
                c = createCoordinate(startCoordinate.x, startCoordinate.y + i);
            } else {
                c = createCoordinate(startCoordinate.x + i, startCoordinate.y);
            }
            coordinates.push(c);
        }
        return coordinates;
    }

    function randomShipLayout(size) {
        function rand(max) {
            return Math.floor(Math.random() * max);
        }
        var dir = Math.random() > 0.5 ? DIRECTION.horizontal : DIRECTION.vertical;
        var c = undefined;
        if (dir == DIRECTION.vertical) {
            var x = rand(10);
            var y = rand(10 - size);
            c = createCoordinate(x, y);
        } else {
            var x = rand(10 - size);
            var y = rand(10);
            c = createCoordinate(x, y);
        }
        return createShipLayout(c, size, dir);
    }

    function isConflicting(ship, ships) {
        // for all existing ships, check for each if ship is colliding
        return ships.some(function(existing) {
            return ship.coordinates.some(function(c) {
                return existing.hasCoordinateWithDistance(c);
            });
        });
    }

    function layoutShips(sizes) {
        // Max 500 ms to layout ships
        var timeout = new Date().getTime() + 500;
        var sizesToLayout = sizes.concat();
        var ships = [];
        while(sizesToLayout.length > 0) {
            var size = sizesToLayout.shift();
            // brtue force layout all sizes on the board anc
            // check for conflicts
            for (var i = 0; i < 1000; i++) {
                // check timeout
                if (new Date().getTime() > timeout) {
                    return [];
                }

                // create new layout for size and check conflict against all existing
                var ship = createShip("submarine", randomShipLayout(size));
                if (!isConflicting(ship, ships)) {
                    ships.push(ship);
                    // Are we donr?
                    if (sizesToLayout.length == 0) {
                        return ships;
                    }
                    size = sizesToLayout.shift();
                }
            }
            // ok, we didn't succeed within 1000 attempts, lets start all over again
            ships = []
            sizesToLayout = sizes.concat();
        }
        return ships;
    }

    var sizes = [5, 3, 3, 2, 1, 1];
    var ships = layoutShips(sizes);
    // In case we couldn't layout ships in a timely fashion
    if (ships.length != sizes.length) {
        windows.alert('Unable to layout ships!!');
        return;
    }
    ships.forEach(function(s) {
        board.addShip(s);
    });

    // Just for test
    // board.addShip(createShip("submarine", randomShipLayout(5)));
    //board.addShip(createShip("submarine", createShipLayout(createCoordinate(1,0), 3, DIRECTION.horizontal)));
    //board.addShip(createShip("submarine", createShipLayout(createCoordinate(3,2), 2, DIRECTION.horizontal)));
    //board.addShip(createShip("battleship", createShipLayout(createCoordinate(0,2), 5, DIRECTION.vertical)));

    $scope.myTurn = false;
    $scope.board = board;
}]);