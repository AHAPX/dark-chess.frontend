'use strict';

angular.module('darkChess.game')
    .directive('timeLeft', timeDirective)
    .filter('timer', timerFilter);

    timeDirective.$inject = [
        '$timeout',
    ];

    function timeDirective($timeout) {

        function linker(scope, elem, attrs) {
            scope.$watch('ngModel', function(value) {
                scope.value = Math.round(value);
            });

            function tick() {
                if (scope.tickable) {
                    scope.value--;
                    if (scope.value > 0) {
                        $timeout(tick, 1000);
                    }
                }
            }

            scope.$watch('tickable', tick);
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

    function timerFilter() {
        function twoNulls(value) {
            if (value.toString().length < 2) {
                return '0' + value;
            }
            return value;
        }

        return function(time) {
            if (time <= 0) {
                return '00:00:00';
            }
            var days = Math.floor((time %= 31536000) / 86400);
            if (days) {
                return days + ' day' + (days > 1 ? 's' : '');
            }
            var rest = time;
            var hours = Math.floor((time % 86400) / 3600) || 0;
            rest = rest - hours * 3600;
            var minutes = Math.floor((rest % 3600) / 60) || 0;
            rest = rest - minutes * 60;
            var seconds = rest % 60 || 0;
            return twoNulls(hours) + ':' + twoNulls(minutes) + ':' + twoNulls(seconds);
        };
    }
