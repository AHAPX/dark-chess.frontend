'use strict';

angular.module('darkChess.game')
    .directive('waited', waitedDirective);

    waitedDirective.$inject = [
        '$routeParams',
        '$location',
        'apiService',
        'gameService',
    ];

    function waitedDirective($routeParams, $location, apiService, gameService) {

        function linker(scope, elem, attrs) {

            scope.waited_games = [];

            function addGame(game, end) {
                game.date_created = new Date(game.date_created);
                if (end) {
                    scope.waited_games.push(game);
                } else {
                    scope.waited_games.unshift(game);
                }
            }

            function acceptGame(game) {
                return gameService.accept(game.id)
                    .then(function(token) {
                        $location.path('game/' + token);
                    }, function(error) {
                        BootstrapDialog.show({
                            title: 'accept error',
                            message: error,
                            type: BootstrapDialog.TYPE_DANGER,
                            closable: true,
                            buttons: [{
                                label: 'OK',
                                hotkey: 13,
                                action: function(dialog) {
                                    dialog.close();
                                },
                            }],
                        });
                    });
            }

            scope.loadGames = function(init) {
                scope.load_blocked = true;
                return apiService.games.waited()
                    .then(function(data) {
                        if (init) {
                            scope.waited_games = [];
                        }
                        $.each(data.games, function(index, game) {
                            addGame(game);
                        });
                        scope.load_blocked = false;
                        return;
                    }, function(error) {
                        scope.load_blocked = false;
                    });
            };

            scope.askAccept = function(game) {
                BootstrapDialog.confirm({
                    title: 'ARMISTICE',
                    message: 'Are you sure you want to accept the game?',
                    type: BootstrapDialog.TYPE_WARNING,
                    btnCancelLabel: 'NO',
                    btnOKLabel: 'YES',
                    btnOKClass: 'btn-warning',
                    callback: function(result) {
                        if (result) {
                            acceptGame(game);
                        }
                    },
                });
            };

            scope.loadGames(true);
        }

        return {
            link: linker,
            templateUrl: 'app/game/waited.html',
            restrict: 'E',
            scope: false,
        };
    }
