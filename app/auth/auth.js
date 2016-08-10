'use strict';

angular
    .module('darkChess.auth', ['ngRoute'])
    .config([
        '$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/register', {
                    templateUrl: 'app/auth/register.html',
                    controller: 'RegisterCtrl',
                })
                .when('/verify/:token', {
                    templateUrl: 'app/auth/verify.html',
                    controller: 'VerifyCtrl',
                })
                .when('/reset', {
                    templateUrl: 'app/auth/reset.html',
                    controller: 'ResetCtrl',
                })
                .when('/recover/:token', {
                    templateUrl: 'app/auth/recover.html',
                    controller: 'RecoverCtrl',
                });
        }
    ])
