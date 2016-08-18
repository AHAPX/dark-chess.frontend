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
        'socketService',
    ];

    function gameController($scope, $location, $timeout, $routeParams, gameService,
        boardService, socketService) {

        function loadGame(no_cache) {
            return boardService.getGame($scope.gameId, no_cache)
                .then(function(game) {
                    if ($scope.game && game && $scope.game.next_turn == game.next_turn) {
                        return game;
                    }
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
            if (!$scope.game) {
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

        $scope.getInvitedUrl = function() {
            if ($scope.game && $scope.game.invite) {
                return 'https://api.dark-chess.com/#/game/invited/' + $scope.game.invite;
            }
        };

        $scope.update = function() {
            loadGame(true)
                .then(function(game) {
                    $scope.$broadcast($scope.gameId, {
                        'type': 'update',
                        'game': game,
                    });
                });
            if (!$scope.isConnected) {
                $timeout($scope.update, 3000);
            }
        };

        function checkConnection() {
            $scope.isConnected = socketService.alive;
            if (socketService.alive == false) {
                $scope.update();
            }
        }

        $scope.$on('logged_out', function() { loadGame(true); });
        $scope.$on('socketAlive', checkConnection);

        if ($routeParams.gameId != '0') {
            $scope.gameId = $routeParams.gameId;
            loadGame()
                .then(function() {
                    checkConnection();
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
