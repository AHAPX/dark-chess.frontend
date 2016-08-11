'use strict';

// Declare app level module which depends on views, and components
angular.module('darkChess', [
    'ngRoute',
    'darkChess.auth',
    'darkChess.game',
]).
config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'app/home.html',
                controller: 'HomeCtrl',
            })
            .otherwise({
                redirectTo: '/home',
            });
    }
]);
