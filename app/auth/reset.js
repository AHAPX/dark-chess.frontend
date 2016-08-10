'use strict';

angular.module('darkChess.auth')
    .controller('ResetCtrl', resetController);

    resetController.$inject = [
        '$scope',
        '$location',
        'api',
    ];

    function resetController($scope, $location, api) {
        $scope.model = {
            email: '',
        };

        $scope.error = null;

        $scope.submit = function() {
            api.auth.reset($scope.model.email)
                .then(function() {
                    $location.path('home');
                }, function(error) {
                    $scope.error = error;
                });
        };
    };
