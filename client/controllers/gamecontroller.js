var myApp = angular.module('BattleShipApp', []);

myApp.controller('GameController', ['$scope', function ($scope) {
    var row = new Array(10);
    for (var i = 0; i < 10; i++) {
        row[i] = new Array(10);
    }
    $scope.board = row;
}]);