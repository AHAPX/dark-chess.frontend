'use strict';

angular.module('darkChess.auth')
    .controller('ResetCtrl', resetController);

    resetController.$inject = [
        '$scope',
        '$location',
        'apiService',
    ];

    function resetController($scope, $location, apiService) {
        $scope.model = {
            email: '',
        };

        $scope.error = null;

        $scope.submit = function() {
            apiService.auth.reset($scope.model.email)
                .then(function() {
                    $location.path('home');
                }, function(error) {
                    $scope.error = error;
                });
        };
    }
