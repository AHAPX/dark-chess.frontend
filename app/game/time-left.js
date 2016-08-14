'use strict';

angular.module('darkChess.game')
    .directive('timeLeft', timeDirective)
    .filter('readableTime', function() {
        return function(time) {
            function numberEnding (number) {
                return (number > 1) ? 's' : '';
            }

            var years = Math.floor(time / 31536000);
            if (years) {
                return years + ' year' + numberEnding(years);
            }
            var days = Math.floor((time %= 31536000) / 86400);
            if (days) {
                return days + ' day' + numberEnding(days);
            }
            var hours = Math.floor((time %= 86400) / 3600);
            if (hours) {
                return hours + ' hour' + numberEnding(hours);
            }
            var minutes = Math.floor((time %= 3600) / 60);
            if (minutes) {
                return minutes + ' minute' + numberEnding(minutes);
            }
            var seconds = time % 60;
            if (seconds) {
                return seconds + ' second' + numberEnding(seconds);
            }
            return 'just now';
        };
    });

    timeDirective.$inject = [
        '$timeout',
    ];

    function timeDirective($timeout) {

        function linker(scope, elem, attrs) {
            scope.$watch('ngModel', function(value) {
                scope.value = Math.round(value);
                if (scope.tickable) {
                    $timeout(tick, 1000);
                }
            });

            function tick() {
                scope.value--;
                $timeout(tick, 1000);
            }
        }

        return {
            link: linker,
            templateUrl: 'app/game/time-left.html',
            restrict: 'E',
            scope: {
                ngModel: '=',
                tickable: '=',
            },
        };
    }
