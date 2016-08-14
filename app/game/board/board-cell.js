'use strict';

angular.module('darkChess.game')
    .directive('boardCell', cellDirective);

    cellDirective.$inject = [
        '$filter',
        '$timeout',
        'boardService',
    ];

    function cellDirective($filter, $timeout, boardService) {

        function linker(scope, elem, attrs) {

            function update() {
                scope.selected = false;
                scope.movable = false;
                scope.cell = boardService.getCell(scope.addr);
                scope.hidden = scope.cell == null;
                scope.colorClass = 'board-cell-' + scope.color;
                if (scope.hidden) {
                    scope.colorClass += '-hidden';
                }
            }

            scope.$watch('addr', function(addr) {
                if (addr) {
                    scope.$on(addr, function (event, data) {
                        switch (data.type) {
                            case 'select':
                                scope.selected = true;
                                break;
                            case 'unselect':
                                scope.selected = false;
                                break;
                            case 'movable':
                                scope.movable = true;
                                break;
                            case 'unmovable':
                                scope.movable = false;
                                break;
                            case 'reset':
                                update();
                                $timeout(function() {}, 100);
                                break;
                        }
                    });
                }
            });

            if (scope.x && scope.y) {
                scope.addr = $filter('letter')(scope.x) + scope.y;
                scope.color = (scope.x + scope.y) % 2 ? 'white' : 'black';
                update();
            }

            scope.click = function() {
                boardService.onCellClick(scope.addr);
            };
        }

        return {
            link: linker,
            templateUrl: 'app/game/board/board-cell.html',
            restrict: 'E',
            scope: {
                x: '=',
                y: '=',
            },
        };
    }
