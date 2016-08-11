'use strict';

angular.module('darkChess')
    .service('apiService', apiService);

    apiService.$inject = [
        '$http',
        '$q',
    ];

    function apiService($http, $q) {

        function HTTP(method, url, data, config) {
            return method(url, data, config)
                .then(function(resp) {
                    if (resp.data) {
                        if (resp.data.rc) {
                            return resp.data;
                        } else {
                            return $q.reject(resp.data.error);
                        }
                    }
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
                return POST('/v1/auth/register', {
                    username: username,
                    email: email,
                    password: password,
                });
            },
            get_verification: function() {
                return GET('/v1/auth/verification');
            },
            verify: function(token) {
                return GET('/v1/auth/verification/' + token);
            },
            reset: function(email) {
                return POST('/v1/auth/reset', { email: email });
            },
            recoverable: function(token) {
                return GET('/v1/auth/recover/' + token);
            },
            recover: function(token, password) {
                return POST('/v1/auth/recover/' + token, { password: password });
            },
            login: function(username, password) {
                return POST('/v1/auth/login', {
                    username: username,
                    password: password,
                });
            },
            logout: function() {
                return GET('/v1/auth/logout');
            },
            authorized: function() {
                return GET('/v1/auth/authorized')
                    .then(null, function(error) { return false; });
            },
        };

        this.games = {
            types: function() {
                return GET('/v1/game/types');
            },
            new: function(type, limit) {
                return POST('/v1/game/new', { type: type, limit: limit });
            },
            invite: function(type, limit) {
                return POST('/v1/game/invite', { type: type, limit: limit });
            },
            invited: function(token) {
                return GET('/v1/game/invite/' + token);
            },
            active: function() {
                return GET('/v1/game/active');
            },
            game: function(token) {
                var url = '/v1/game/' + token;
                return {
                    info: function() {
                        return GET(url + '/info');
                    },
                    moves: function() {
                        return GET(url + '/moves');
                    },
                    doMove: function(move) {
                        return POST(url + '/move', { move: move });
                    },
                    draw: function() {
                        return GET(url + '/draw/accept');
                    },
                    drawRefuse: function() {
                        return GET(url + '/draw/refuse');
                    },
                    resign: function() {
                        return GET(url + '/resign');
                    },
                };
            },
        };
    };
