'use strict';

angular.module('darkChess.auth')
    .directive('login', loginDirective);

    loginDirective.$inject = [
        '$rootScope',
        'api',
    ];

    function loginDirective($rootScope, api) {

        function linker(scope, elem, attrs) {
            scope.logged = false;
            scope.block = true;

            function loggedIn(user) {
                $rootScope.user = user;
                scope.logged = true;
                scope.block = false;
            }

            function loggedOut() {
                $rootScope.user = null;
                scope.logged = false;
            };

            api.auth.authorized()
                .then(function(user) {
                    if (user) {
                        loggedIn(user);
                    } else {
                        scope.block = false;
                    }
                }, function() {
                    scope.block = false;
                });

            scope.model = {
                username: '',
                password: '',
            };

            scope.login = function() {
                api.auth.login(scope.model.username, scope.model.password)
                    .then(function() {
                        loggedIn({ username: scope.model.username });
                    }, function(error) {
                        alert(error);
                    });
            };

            scope.logout = function() {
                api.auth.logout()
                    .then(function() {
                        loggedOut();
                    });
            };
        };

        return {
            link: linker,
            templateUrl: 'app/auth/login.html',
            restrict: 'E',
            scope: false,
        };
    };
