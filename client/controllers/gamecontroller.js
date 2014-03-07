var myApp = angular.module('BattleShipApp', []);

myApp.controller('GameController', ['$scope', function ($scope) {

    var cell = { hit: '0'  };

    var row = new Array(10);
    for (var i = 0; i < 10; i++) {
        row[i] = new Array(10);
        for (var j = 0; j < 10; j++) {
            row[i][j] = cell;
        }
    }
    $scope.board = row;
}]);