'use strict';

angular.module('darkChess.auth')
    .controller('InvitedCtrl', invitedController);

    invitedController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'gameService',
    ];

    function invitedController($scope, $location, $routeParams, gameService) {
        gameService.invited($routeParams.gameId)
            .then(function(data) {
                $location.path('game/' + data.game);
            }, function(error) {
                $scope.error = error;
            });
    }
