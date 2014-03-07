var myApp = angular.module('BattleShipApp', []);

myApp.controller('GameController', ['$scope', function ($scope) {

    function createShip(name, size) {

        return {
            name: name,
            hp: size
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
        for (var i = 0; i < 10; i++) {
            columns[i] = new Array(10);
            for (var j = 0; j < 10; j++) {
                columns[i][j] = createCell();
            }
        }

        function fireAt(col, row) {
            var cell = columns[row][col];
            if (cell.hasShip()) {
                cell.setState('x');
                return;
            }

            cell.setState('/');

        }

        function addShip(col, row, ship) {
            columns[row][col].addShip(ship);
        }

        return {
            columns: columns,
            fireAt: fireAt,
            addShip: addShip
        }

    }

    var board = createBoard();

    // Just for test
    board.addShip(1, 2, createShip("submarine", 2));

    $scope.board = board;
}]);