'use strict';

angular.module('darkChess.game')
    .directive('games', gamesDirective);

    gamesDirective.$inject = [
        '$routeParams',
        '$location',
        '$timeout',
        'gameService',
        'helpersService',
    ];

    function gamesDirective($routeParams, $location, $timeout, gameService, hs) {

        function linker(scope, elem, attrs) {

            scope.gameId = $routeParams.gameId;

            function onGame(gameId, data) {
                switch (data.type) {
                    case 'update':
                        updateGame(gameId, data.game);
                        break;
                    case 'start':
                        if (hs.isIn(scope.games.wait, gameId) && data.game) {
                            hs.remove(scope.games.wait, gameId);
                            hs.add(scope.games.actives, gameId);
                            scope.games.games[gameId] = data.game;
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
                var game = scope.games.games[gameId];
                if (!game.winner) {
                    game.result = 'draw';
                } else if (game.winner == game.color) {
                    game.result = 'you won';
                } else {
                    game.result = 'you lost';
                }
            }

            function updateGame(gameId, game) {
                scope.games.games[gameId] = game;
                if (game.ended_at) {
                    hs.remove(scope.games.actives, gameId);
                    hs.add(scope.games.ended, gameId, true);
                    setResult(gameId);
                } else {
                    hs.add(scope.games.actives, gameId);
                }
            }

            function updateAll() {
                scope.games = {
                    actives: [],
                    wait: [],
                    ended: [],
                    games: {},
                };

                gameService.getGames()
                    .then(function(games) {
                        $.each(games, function(index, game) {
                            if (!game || !game.game) {
                                return;
                            }
                            scope.games.games[game.id] = game.game;
                            if (game.game.ended_at) {
                                hs.add(scope.games.ended, game.id);
                                setResult(game.id);
                            } else if (game.game.started_at) {
                                hs.add(scope.games.actives, game.id);
                            } else {
                                hs.add(scope.games.wait, game.id);
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
                            hs.add(scope.games.wait, gameId);
                            scope.games.games[gameId] = null;
                            scope.$on(gameId, function(event, data) {
                                onGame(gameId, data);
                            });
                        }
                    });
            });

            scope.$on('logged_in', function() {
                gameService.getUserGames()
                    .then(function() {
                        updateAll();
                    });
            });
            scope.$on('logged_out', updateAll);

            scope.userTurn = function(game) {
                if (!game) {
                    return;
                }
                return game.color == game.next_turn;
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
