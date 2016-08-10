'use strict';

// Declare app level module which depends on views, and components
angular.module('darkChess', [
    'ngRoute',
    'darkChess.auth',
]).
config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'app/auth/register.html',
                controller: 'RegisterCtrl',
            })
            .otherwise({
                redirectTo: '/home',
            });
    }
]);
