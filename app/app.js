'use strict';

angular
    .module('darkChess', [
        'ngRoute',
        'ngStorage',
        'darkChess.auth',
        'darkChess.game',
    ])
    .config([
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
    ])
    .filter('isEmpty', function() {
        return function(object) {
            return angular.equals({}, object);
        }
    });
