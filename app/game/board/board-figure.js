'use strict';

angular.module('darkChess.game')
    .directive('boardFigure', figureDirective);

    figureDirective.$inject = [
        'boardService',
    ];

    function figureDirective(boardService) {

        function linker(scope, elem, attrs) {

            function update() {
                scope.imageSrc = '/static/images/figures/' + scope.color + '/' + scope.kind + '.png';
            }

            scope.$watch('color', update);
            scope.$watch('kind', update);
        }

        return {
            link: linker,
            templateUrl: 'app/game/board/board-figure.html',
            restrict: 'E',
            scope: {
                color: '=',
                kind: '=',
            },
        };
    }
