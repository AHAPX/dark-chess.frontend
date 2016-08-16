'use strict';

angular
    .module('darkChess', [
        'ngRoute',
        'ngStorage',
        'ngClipboard',
        'darkChess.auth',
        'darkChess.game',
    ])
    .config([
        '$locationProvider',
        '$routeProvider',
        'ngClipProvider',
        function($locationProvider, $routeProvider, ngClipProvider) {
            $routeProvider
                .when('/home', {
                    templateUrl: 'app/home.html',
                    controller: 'HomeCtrl',
                })
                .otherwise({
                    redirectTo: '/home',
                });
            ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');
        }
    ])
    .filter('isEmpty', function() {
        return function(object) {
            return angular.equals({}, object);
        }
    });
