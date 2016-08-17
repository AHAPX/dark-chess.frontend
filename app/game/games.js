'use strict';

angular.module('darkChess.game')
    .directive('games', gamesDirective);

    gamesDirective.$inject = [
        '$routeParams',
        '$location',
        '$timeout',
        'gameService',
    ];

    function gamesDirective($routeParams, $location, $timeout, gameService) {

        function linker(scope, elem, attrs) {

            scope.gameId = $routeParams.gameId;

            var ended_skip = 0;

            function onGame(gameId, data) {
                switch (data.type) {
                    case 'update':
                        updateGame(gameId, data.game);
                        break;
                    case 'start':
                        if (gameId in scope.games.wait && data.game) {
                            scope.games.actives[gameId] = data.game;
                            delete scope.games.wait[gameId];
                        }
                        break;
                    case 'end':
                    case 'win':
                    case 'lose':
                    case 'draw':
                        updateGame(gameId, data.game);
                        break;
                }
                $timeout(function() {}, 100);
            }

            function setResult(gameId) {
                var game = scope.games.ended[gameId];
                if (!game.winner) {
                    game.result = 'draw';
                } else if (game.winner == game.color) {
                    game.result = 'you won';
                } else {
                    game.result = 'you lost';
                }
            }

            function updateGame(gameId, game) {
                if (game.ended_at) {
                    if (gameId in scope.games.actives) {
                        delete scope.games.actives[gameId];
                    }
                    if (!(gameId in scope.games.ended)) {
                        scope.games.ended[gameId] = game;
                        setResult(gameId);
                    }
                } else {
                    scope.games.actives[gameId] = game;
                }
            }

            function updateAll() {
                scope.games = {
                    actives: {},
                    wait: {},
                    ended: {},
                };

                gameService.getGames()
                    .then(function(games) {
                        $.each(games, function(index, game) {
                            if (!game || !game.game) {
                                return;
                            }
                            if (game.game.started_at) {
                                scope.games.actives[game.id] = game.game;
                            } else {
                                scope.games.wait[game.id] = game.game;
                            }
                            scope.$on(game.id, function(event, data) {
                                onGame(game.id, data);
                            });
                        });
                    });
            }

            scope.$on('new_game', function(event, gameId) {
                gameService.getGame(gameId)
                    .then(function(game) {
                        if (game.started_at) {
                            updateGame(gameId, game);
                        } else {
                            scope.games.wait[gameId] = null;
                            scope.$on(gameId, function(event, data) {
                                onGame(gameId, data);
                            });
                        }
                    });
            });

            scope.$on('logged_in', updateAll);
            scope.$on('logged_out', updateAll);

            scope.yourTurn = function(game) {
                return game.color == game.next_turn;
            };

            scope.loadEnded = function() {
                scope.ended_block = true;
                gameService.getEnded(ended_skip)
                    .then(function(games) {
                        $.each(games, function(index, game) {
                            if (!game || !game.game) {
                                return;
                            }
                            scope.games.ended[game.id] = game.game;
                            setResult(game.id);
                        });
                        ended_skip += games.length;
                        scope.ended_block = false;
                    });
            };

            updateAll();
        }

        return {
            link: linker,
            templateUrl: 'app/game/games.html',
            restrict: 'E',
            scope: false,
        };
    }

