'use strict';

angular
    .module('darkChess.game', ['ngRoute'])
    .config([
        '$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/game', {
                    templateUrl: 'app/game/game.html',
                    controller: 'GameCtrl',
                });
        }
    ])
    .service('gameService', gameService);

    function gameService() {
    };
