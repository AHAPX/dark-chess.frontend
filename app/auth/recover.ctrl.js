'use strict';

angular.module('darkChess.auth')
    .controller('RecoverCtrl', recoverController);

    recoverController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'apiService',
    ];

    function recoverController($scope, $location, $routeParams, apiService) {

        $scope.model = {
            password: '',
            password2: '',
        };

        $scope.block = true;
        $scope.not_found = false;
        $scope.error = null;

        apiService.auth.recoverable($routeParams.token)
            .then(function(data) {
                $scope.block = false;
            }, function() {
                $scope.not_found = true;
            });

        $scope.submit = function() {
            apiService.auth.recover($routeParams.token, $scope.model.password)
                .then(function() {
                    $location.path('home');
                }, function(error) {
                    $scope.error = error;
                });
        };
    };
