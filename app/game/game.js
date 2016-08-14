'use strict';

angular
    .module('darkChess.game', ['ngRoute'])
    .config([
        '$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/game/:gameId', {
                    templateUrl: 'app/game/game.html',
                    controller: 'GameCtrl',
                });
        }
    ])
    .service('gameService', gameService);

    gameService.$inject = [
        '$q',
        '$localStorage',
        '$rootScope',
        'apiService',
        'socketService',
    ];

    function gameService($q, $localStorage, $rootScope, apiService, socketService) {
        var self = this;

        var storage = $localStorage.$default({
            games: [],
            actives: [],
            ended: [],
        });

        function remove(array, item) {
            var index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        }

        function add(array, item) {
            if (array.indexOf(item) < 0) {
                array.push(item);
            }
        }

        self.types = null;
        self.games = {};
        self.socket = socketService.create();

        self.getTypes = function(no_cache) {
            if (self.types && !no_cache) {
                return $q.resolve(self.types);
            }
            return apiService.games.types()
                .then(function(data) {
                    return self.types = data.types;
                });
        };

        self.start = function(type, period) {
            return apiService.games.new(type, period)
                .then(function(data) {
                    if (data.started_at) {
                        storage.actives.push(data.game);
                    } else {
                        storage.games.push(data.game);
                    }
                    $rootScope.$broadcast('new_game', data.game);
                    self.socket.addTag(data.game);
                    return data;
                });
        };

        function loadGame(gameId, full) {
            return apiService.games.game(gameId).info()
                .then(function(data) {
                    var result = data;
                    if (full) {
                        result = {
                            id: gameId,
                            game: data,
                        };
                    }
                    if (data.ended_at) {
                        add(storage.ended, gameId);
                        remove(storage.games, gameId);
                        remove(storage.actives, gameId);
                        return result;
                    }
                    if (data.started_at) {
                        add(storage.actives, gameId);
                        remove(storage.games, gameId);
                        self.games[gameId] = data;
                    }
                    self.socket.addTag(gameId);
                    return result;
                }, function(error) {
                    if (error.indexOf('not found')) {
                        remove(storage.games, gameId);
                        remove(storage.actives, gameId);
                        remove(storage.ended, gameId);
                        return $q.reject();
                    }
                });
        }

        function broadcast(gameId, type, game) {
            $rootScope.$broadcast(gameId, {
                type: type,
                game: game,
            });
        }

        function endGame(gameId, type, data) {
            delete self.games[gameId];
            self.socket.removeTag(gameId);
            broadcast(gameId, type, data);
        }

        function showAlert(title, message) {
            BootstrapDialog.show({
                title: title,
                message: message,
                type: BootstrapDialog.TYPE_DANGER,
                closable: true,
                buttons: [{
                    label: 'OK',
                    hotkey: 13,
                    action: function(dialog) {
                        dialog.close();
                    },
                }],
            });
        }

        self.updateGames = function() {
            $.each(storage.games, function(index, gameId) {
                loadGame(gameId);
            });
        };

        self.getGame = function(gameId, no_cache) {
            if (self.games[gameId] && !no_cache) {
                return $q.resolve(self.games[gameId]);
            }
            return loadGame(gameId);
        };

        self.getGames = function() {
            var defer = $q.defer();
            var promises = [];
            $.each(storage.actives, function(index, gameId) {
                promises.push(loadGame(gameId, true));
            });
            $.each(storage.games, function(index, gameId) {
                promises.push(loadGame(gameId, true));
            });
            $q.all(promises)
                .then(function(data) {
                    defer.resolve(data);
                });
            return defer.promise;
        };

        self.getEnded = function(skip) {
            var defer = $q.defer();
            var promises = [];
            var count = 5;
            $.each(storage.ended.slice(skip, skip + count), function(index, gameId) {
                promises.push(loadGame(gameId, true));
            });
            $q.all(promises)
                .then(function(data) {
                    defer.resolve(data);
                });
            return defer.promise;
        };

        self.doMove = function(gameId, move) {
            apiService.games.game(gameId).move(move)
                .then(function(data) {
                    self.games[gameId] = data;
                    broadcast(gameId, 'update', data);
                }, function(error) {
                    showAlert('move error', error);
                });
        };

        self.socket.onEvent(function(event) {
            if (!event.tags || event.tags.length < 1) {
                return;
            }
            var gameId = event.tags[0];
            switch (event.signal) {
                case socketService.signals.start:
                    self.games[gameId] = event.message;
                    broadcast(gameId, 'start', event.message);
                    break;
                case socketService.signals.move:
                    self.games[gameId] = event.message;
                    broadcast(gameId, 'update', event.message);
                    break;
                case socketService.signals.end:
                    endGame(gameId, 'end', event.message);
                    break;
                case socketService.signals.win:
                    endGame(gameId, 'win', event.message);
                    break;
                case socketService.signals.lose:
                    endGame(gameId, 'lose', event.message);
                    break;
                case socketService.signals.draw:
                    endGame(gameId, 'draw', event.message);
                    break;
                case socketService.signals.draw_request:
                    broadcast(gameId, 'draw_request', event.message);
                    break;
            }
        });

        self.resign = function(gameId) {
            return apiService.games.game(gameId).resign()
                .then(function(data) {
                    endGame(gameId, 'lose', data);
                    return;
                }, function(error) {
                    showAlert('resign error', error);
                });
        };

        self.draw = function(gameId) {
            return apiService.games.game(gameId).draw()
                .then(function() {
                    return;
                }, function(error) {
                    showAlert('draw error', error);
                });
        };

        self.updateGames();
    };
