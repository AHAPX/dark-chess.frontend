'use strict';

angular.module('darkChess.auth')
    .directive('accountNavbar', accountDirective);

    accountDirective.$inject = [
        '$rootScope',
        'apiService',
    ];

    function accountDirective($rootScope, apiService) {

        function linker(scope, elem, attrs) {
            scope.logged = false;
            scope.block = true;

            function init() {
                scope.model = {
                    username: '',
                    password: '',
                };
            }

            function loggedIn(user) {
                $rootScope.user = user;
                scope.logged = true;
                scope.block = false;
                $rootScope.$broadcast('logged_in');
            }

            function loggedOut() {
                $rootScope.user = null;
                scope.logged = false;
                $rootScope.$broadcast('logged_out');
            };

            scope.login = function() {
                apiService.auth.login(scope.model.username, scope.model.password)
                    .then(function() {
                        loggedIn({ username: scope.model.username });
                    }, function(error) {
                        BootstrapDialog.show({
                            title: 'login error',
                            message: error,
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
                    });
            };

            scope.logout = function() {
                apiService.auth.logout()
                    .then(function() {
                        loggedOut();
                        init();
                    });
            };

            apiService.auth.authorized()
                .then(function(user) {
                    if (user) {
                        loggedIn(user);
                    } else {
                        scope.block = false;
                    }
                }, function() {
                    scope.block = false;
                });

            init();
        };

        return {
            link: linker,
            templateUrl: 'app/auth/account-navbar.html',
            restrict: 'E',
            scope: false,
        };
    };
