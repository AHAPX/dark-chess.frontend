'use strict';

angular.module('darkChess.auth')
    .controller('GameCtrl', gameController);

    gameController.$inject = [
        '$scope',
        '$location',
        'apiService',
    ];

    function gameController($scope) {
    };
