'use strict';

angular.module('darkChess.auth')
    .controller('GameCtrl', gameController);

    gameController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'gameService',
    ];

    function gameController($scope, $location, $routeParams, gameService) {
        $scope.game = null;
        $scope.figures = [];
        $scope.cells = {};

        if ($routeParams.gameId != '0') {
            gameService.getGame($routeParams.gameId)
                .then(function(game) {
                    $scope.game = game;
                    $scope.gameId = $routeParams.gameId;
                });
        }
    };
