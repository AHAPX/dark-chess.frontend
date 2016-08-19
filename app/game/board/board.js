'use strict';

angular.module('darkChess.game')
    .service('boardService', boardService)
    .filter('letter', function() {
        return function(input) {
            return 'abcdefgh'[input - 1];
        };
    });

    boardService.$inject = [
        '$q',
        '$rootScope',
        'gameService',
    ];

    function boardService($q, $rootScope, gameService) {
        var self = this;
        var selected;
        var subscriber;

        self.figures = [];
        self.cells = {};

        function loadFigure(figure) {
            return figure;
        }

        function loadCell(pos, cell) {
            var figure = null;
            if (cell && Object.keys(cell).length > 0) {
                figure = loadFigure(cell);
                self.figures.push(cell);
            }
            self.cells[pos] = figure;
        }

        function loadGame(game) {
            self.game = game;
            self.figures = [];
            self.cells = {};
            $.each(game.board, loadCell);
        }

        function onGame(event, data) {
            switch (data.type) {
                case 'update':
                case 'start':
                case 'end':
                case 'win':
                case 'lose':
                case 'draw':
                    loadGame(data.game);
                    $rootScope.$broadcast(self.gameId + '/1', 'update');
                    break;
                case 'draw_request':
                    $rootScope.$broadcast(self.gameId + '/1', 'draw_request');
                    break;
            }
        }

        self.getGame = function(gameId, no_cache) {
            self.gameId = gameId;
            return gameService.getGame(gameId, no_cache)
                .then(function(game) {
                    if (!game) {
                        return $q.reject();
                    }
                    loadGame(game);
                    if (subscriber) {
                        subscriber();
                    }
                    subscriber = $rootScope.$on(gameId, onGame);
                    return game;
                });
        };

        self.getCell = function(addr) {
            if (!(addr in self.cells)) {
                return null;
            }
            return self.cells[addr] || {};
        };

        self.onCellClick = function(addr) {
            if (self.game.color != self.game.next_turn) {
                return;
            }
            var cell = self.cells[addr];
            if (selected) {
                if (!cell || cell.color != selected.figure.color) {
                    if (selected.figure.moves.indexOf(addr) > -1) {
                        $rootScope.$broadcast(selected.addr, { type: 'unselect' });
                        $.each(selected.figure.moves, function(index, move) {
                            $rootScope.$broadcast(move, { type: 'unmovable' });
                        });
                        gameService.doMove(self.gameId, selected.addr + '-' + addr);
                    }
                }
                else {
                    $rootScope.$broadcast(selected.addr, { type: 'unselect' });
                    $.each(selected.figure.moves, function(index, move) {
                        $rootScope.$broadcast(move, { type: 'unmovable' });
                    });
                }
            }
            if (cell) {
                if (selected && selected.addr == addr) {
                    return selected = null;
                }
                if (cell.color != self.game.next_turn) {
                    return;
                }
                selected = { addr: addr, figure: cell };
                $rootScope.$broadcast(addr, { type: 'select' });
                $.each(selected.figure.moves, function(index, move) {
                    $rootScope.$broadcast(move, { type: 'movable' });
                });
            }
        };

        self.reset = function() {
            selected = null;
        };
    }
