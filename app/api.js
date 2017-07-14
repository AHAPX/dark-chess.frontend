'use strict';

angular.module('darkChess')
    .service('apiService', ApiService);

    ApiService.$inject = [
        '$http',
        '$q',
        'Settings',
    ];

    function ApiService($http, $q, Settings) {

        function HTTP(method, url, data, config) {
            return method(Settings.base_url + url, data, config)
                .then(function(resp) {
                    return resp.data;
                }, function(resp) {
                    return $q.reject(resp.data);
                });
        }

        function GET(url, data, config) {
            return HTTP($http.get, url, data, config);
        }

        function POST(url, data, config) {
            return HTTP($http.post, url, data, config);
        }

        function PUT(url, data, config) {
            return HTTP($http.put, url, data, config);
        }

        function DELETE(url, data, config) {
            return HTTP($http.delete, url, data, config);
        }

        this.auth = {
            register: function(username, email, password) {
                return POST('/v2/auth/register/', {
                    username: username,
                    email: email,
                    password: password,
                });
            },
            get_verification: function() {
                return GET('/v2/auth/verification/');
            },
            verify: function(token) {
                return GET('/v2/auth/verification/' + token + '/');
            },
            reset: function(email) {
                return POST('/v2/auth/reset/', { email: email });
            },
            recoverable: function(token) {
                return GET('/v2/auth/recover/' + token + '/');
            },
            recover: function(token, password) {
                return POST('/v2/auth/recover/' + token + '/', { password: password });
            },
            login: function(username, password) {
                return POST('/v2/auth/login/', {
                    username: username,
                    password: password,
                });
            },
            logout: function() {
                return GET('/v2/auth/logout/');
            },
            authorized: function() {
                return GET('/v2/auth/login/')
                    .then(null, function(error) { return false; });
            },
        };

        this.games = {
            types: function() {
                return GET('/v2/game/types/');
            },
            new: function(type, limit) {
                return POST('/v2/game/new/', { type: type, limit: limit });
            },
            waited: function() {
                return GET('/v2/game/new/');
            },
            accept: function(game_id) {
                return POST('/v2/game/new/' + game_id + '/', {});
            },
            invite: function(type, limit) {
                return POST('/v2/game/invite/', { type: type, limit: limit });
            },
            invited: function(token) {
                return GET('/v2/game/invite/' + token + '/');
            },
            games: function() {
                return GET('/v2/game/games/');
            },
            game: function(token) {
                var url = '/v2/game/' + token;
                return {
                    info: function() {
                        return GET(url + '/info/');
                    },
                    moves: function() {
                        return GET(url + '/moves/');
                    },
                    move: function(move) {
                        return POST(url + '/moves/', { move: move });
                    },
                    draw: function() {
                        return POST(url + '/draw/');
                    },
                    drawRefuse: function() {
                        return DELETE(url + '/draw/');
                    },
                    resign: function() {
                        return POST(url + '/resign/');
                    },
                };
            },
        };

        this.chat = {
            messages: function(offset) {
                var url = '/v2/chat/messages/';
                if (offset) {
                    url += '?offset=' + offset;
                }
                return GET(url);
            },
            add: function(text) {
                return POST('/v2/chat/messages/', { text: text });
            },
        };
    }
