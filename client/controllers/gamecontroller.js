var myApp = angular.module('BattleShipApp', []);

myApp.controller('GameController', ['$scope', function ($scope) {

    function createCell() {

        function setState(state) {
            this.state = state;
        }

        return {
            shipId: null,
            state: ' ',
            setState: setState
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
            columns[row][col].setState('/');
        }

        return {
            columns: columns,
            fireAt: fireAt
        }

    }

    $scope.board = createBoard();

}]);