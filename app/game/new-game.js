'use strict';

angular.module('darkChess.game')
    .directive('newGame', newGameDirective);

    newGameDirective.$inject = [
        '$location',
        'gameService',
    ];

    function newGameDirective($location, gameService) {

        function linker(scope, elem, attrs) {

            function loadTypes() {
                gameService.getTypes()
                    .then(function(types) {
                        scope.types = types;
                        scope.model = {
                            type: types[0].name,
                            period: types[0].periods[0].name,
                        };
                    });
            }

            scope.model = {
                type: null,
                period: null,
            };

            scope.selected_periods = {};
            scope.block = false;

            scope.setType = function(type) {
                scope.model.type = type.name;
                if (type.periods.length === 0) {
                    scope.model.period = null;
                } else {
                    if (scope.selected_periods[type.name]) {
                        scope.setPeriod(scope.selected_periods[type.name]);
                    } else {
                        scope.setPeriod(type.periods[1]);
                    }
                }
            };

            scope.setPeriod = function(period) {
                scope.model.period = period.name;
                scope.selected_periods[scope.model.type] = period;
            };

            scope.startGame = function(invite) {
                scope.block = true;
                gameService.start(scope.model.type, scope.model.period, invite)
                    .then(function(data) {
                        scope.block = false;
                        $location.path('game/' + data.game);
                    });
            };

            loadTypes();
        }

        return {
            link: linker,
            templateUrl: 'app/game/new-game.html',
            restrict: 'E',
            scope: false,
        };
    }
