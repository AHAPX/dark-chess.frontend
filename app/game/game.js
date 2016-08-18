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
                })
                .when('/game/invited/:gameId', {
                    templateUrl: 'app/game/invited.html',
                    controller: 'InvitedCtrl',
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
        'helpersService',
    ];

    function gameService($q, $localStorage, $rootScope, apiService, socketService, hs) {
        var self = this;

        var storage = $localStorage.$default({
            games: [],
            actives: [],
            ended: [],
            ended_cache: {},
        });

        self.types = null;
        self.games = {};

        function addTag(tag) {
            $rootScope.$broadcast('socketAddTag', tag);
        }

        function removeTag(tag) {
            $rootScope.$broadcast('socketRemoveTag', tag);
        }

        self.getTypes = function(no_cache) {
            if (self.types && !no_cache) {
                return $q.resolve(self.types);
            }
            return apiService.games.types()
                .then(function(data) {
                    return self.types = data.types;
                });
        };

        self.start = function(type, period, invite) {
            var method = invite ? apiService.games.invite : apiService.games.new;
            return method(type, period)
                .then(function(data) {
                    if (data.started_at) {
                        storage.actives.push(data.game);
                    } else {
                        storage.games.push(data.game);
                    }
                    $rootScope.$broadcast('new_game', data.game);
                    addTag(data.game);
                    return data;
                });
        };

        function toEnded(gameId, data) {
            hs.add(storage.ended, gameId, true);
            storage.ended_cache[gameId] = data;
            hs.remove(storage.games, gameId);
            hs.remove(storage.actives, gameId);
            if (storage.ended.length > 10) {
                delete storage.ended_cache[storage.ended.pop()];
            }
        }

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
                        toEnded(gameId, data);
                        return result;
                    }
                    if (data.started_at) {
                        hs.add(storage.actives, gameId);
                        hs.remove(storage.games, gameId);
                        self.games[gameId] = data;
                    }
                    addTag(gameId);
                    return result;
                }, function(error) {
                    if (error.indexOf('not found') > 0) {
                        hs.remove(storage.games, gameId);
                        hs.remove(storage.actives, gameId);
                        hs.remove(storage.ended, gameId);
                        return $q.reject();
                    }
                });
        }

        function loadEnded(gameId) {
            if (gameId in storage.ended_cache) {
                return $q.resolve({
                    id: gameId,
                    game: storage.ended_cache[gameId],
                });
            }
            return loadGame(gameId, true);
        }

        function broadcast(gameId, type, game) {
            $rootScope.$broadcast(gameId, {
                type: type,
                game: game,
            });
        }

        function endGame(gameId, type, data) {
            delete self.games[gameId];
            removeTag(gameId);
            toEnded(gameId, data);
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
            if (gameId in storage.ended_cache) {
                return $q.resolve(storage.ended_cache[gameId]);
            }
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
            $.each(storage.ended, function(index, gameId) {
                promises.push(loadEnded(gameId));
            });
            $q.all(promises)
                .then(function(data) {
                    defer.resolve(data);
                });
            return defer.promise;
        };

        self.getUserGames = function() {
            return apiService.games.games()
                .then(function(data) {
                    $.each(data.games.actives, function(index, gameId) {
                        hs.add(storage.actives, gameId);
                    });
                    $.each(data.games.ended, function(index, gameId) {
                        hs.add(storage.ended, gameId, true);
                    });
                    return;
                });
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

        $rootScope.$on('onSocket', function(_, event) {
            if (!event.tags || event.tags.length < 1) {
                return;
            }
            var gameId = event.tags[0];
            switch (event.signal) {
                case socketService.signals.start:
                    self.games[gameId] = event.message;
                    hs.add(storage.actives, gameId);
                    hs.remove(storage.games, gameId);
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

        self.invited = function(gameId) {
            return apiService.games.invited(gameId)
                .then(function(data) {
                    if (data.started_at) {
                        storage.actives.push(data.game);
                    } else {
                        storage.games.push(data.game);
                    }
                    $rootScope.$broadcast('new_game', data.game);
                    addTag(data.game);
                    return data;
                });
        };

        self.updateGames();
    };
