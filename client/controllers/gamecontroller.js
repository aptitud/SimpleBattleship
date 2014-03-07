var myApp = angular.module('BattleShipApp', []);

myApp.controller('GameController', ['$scope', function ($scope) {

    // States: notFiredAt ( ), missed (/), hit (x)
    function createCell() {
        return {
            shipId: null,
            state: 'notFiredAt'
        }
    };

    var board = new Array(10);
    for (var i = 0; i < 10; i++) {
        board[i] = new Array(10);
        for (var j = 0; j < 10; j++) {
            board[i][j] = createCell();
        }
    }
    $scope.board = board;

    // Just for test
    fireAt(4, 4);

    function fireAt(row, col) {
        $scope.board[row][col].state = 'hit';
    }
}]);