'use strict';

angular.module('darkChess')
    .service('api', apiService);

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
    };
