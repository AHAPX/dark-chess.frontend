'use strict';

angular
    .module('darkChess.auth', ['ngRoute'])
    .config([
        '$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/auth/register', {
                    templateUrl: 'app/auth/register.html',
                    controller: 'RegisterCtrl',
                })
                .when('/auth/verify/:token', {
                    templateUrl: 'app/auth/verify.html',
                    controller: 'VerifyCtrl',
                })
                .when('/auth/reset', {
                    templateUrl: 'app/auth/reset.html',
                    controller: 'ResetCtrl',
                })
                .when('/auth/recover/:token', {
                    templateUrl: 'app/auth/recover.html',
                    controller: 'RecoverCtrl',
                });
        }
    ]);
