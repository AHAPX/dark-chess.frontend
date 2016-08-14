'use strict';

angular.module('darkChess.auth')
    .controller('GameCtrl', gameController);

    gameController.$inject = [
        '$scope',
        '$location',
        '$timeout',
        '$routeParams',
        'gameService',
        'boardService',
    ];

    function gameController($scope, $location, $timeout, $routeParams, gameService, boardService) {

        function loadGame() {
            return boardService.getGame($scope.gameId)
                .then(function(game) {
                    $scope.game = game;
                    if (game.ended_at) {
                        if (!game.winner) {
                            $scope.end_reason = 'draw';
                        } else if (game.winner == game.color) {
                            $scope.end_reason = 'won';
                        } else {
                            $scope.end_reason = 'lost';
                        }
                    }
                    resetCells();
                    $timeout(function() {}, 100);
                    return game;
                }, function(error) {
                    $location.path('/game/0');
                });
        }

        function resetCells() {
            $.each(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], function(index, x) {
                $.each([1, 2, 3, 4, 5, 6, 7, 8], function(index, y) {
                    $scope.$broadcast(x + y, { type: 'reset' });
                });
            })
        }

        $scope.yourTurn = function() {
            if (!scope.game) {
                return false;
            }
            return $scope.game.color == $scope.game.next_turn;
        };

        $scope.draw = function() {
            BootstrapDialog.confirm({
                title: 'ARMISTICE',
                message: 'Are you sure you want a draw?',
                type: BootstrapDialog.TYPE_WARNING,
                btnCancelLabel: 'NO',
                btnOKLabel: 'YES',
                btnOKClass: 'btn-warning',
                callback: function(result) {
                    if (result) {
                        gameService.draw($scope.gameId);
                    }
                },
            });
        };

        $scope.resign = function() {
            BootstrapDialog.confirm({
                title: 'SURRENDER',
                message: 'Are you sure you want to resign?',
                type: BootstrapDialog.TYPE_DANGER,
                btnCancelLabel: 'NO',
                btnOKLabel: 'YES',
                btnOKClass: 'btn-danger',
                callback: function(result) {
                    if (result) {
                        gameService.resign($scope.gameId);
                    }
                },
            });
        };

        if ($routeParams.gameId != '0') {
            $scope.gameId = $routeParams.gameId;
            loadGame()
                .then(function() {
                    $scope.$on($scope.gameId + '/1', function(event, signal) {
                        switch (signal) {
                            case 'update':
                                loadGame();
                                break;
                        }
                    });
                });
        }
    };
