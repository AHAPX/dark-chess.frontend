'use strict';

angular.module('darkChess.game')
    .directive('gameBoard', boardDirective);

    boardDirective.$inject = [
        '$rootScope',
        '$timeout',
        'boardService',
    ];

    function boardDirective($rootScope, $timeout, boardService) {

        function linker(scope, elem, attrs) {

            var coors = [1, 2, 3, 4, 5, 6, 7, 8];
            var subscriber;

            function updateUser() {
                scope.user = $rootScope.user;
            }

            scope.$on('logged_in', updateUser);
            scope.$on('logged_out', updateUser);

            scope.$watch('game', function(game) {
                if (game && game.color == 'white') {
                    scope.coorsX = coors;
                    scope.coorsY = coors.slice().reverse();
                } else {
                    scope.coorsX = coors.slice().reverse();
                    scope.coorsY = coors;
                }
            });

            scope.yourTurn = function() {
                if (!scope.game) {
                    return false;
                }
                return scope.game.color == scope.game.next_turn;
            };

            boardService.reset();
            updateUser();
        }

        return {
            link: linker,
            templateUrl: 'app/game/board/game-board.html',
            restrict: 'E',
            scope: {
                gameId: '=',
                game: '=',
            },
        };
    }
