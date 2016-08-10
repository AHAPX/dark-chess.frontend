'use strict';

angular.module('darkChess.auth')
    .controller('RecoverCtrl', recoverController);

    recoverController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'api',
    ];

    function recoverController($scope, $location, $routeParams, api) {

        $scope.model = {
            password: '',
            password2: '',
        };

        $scope.block = true;
        $scope.not_found = false;
        $scope.error = null;

        api.auth.recoverable($routeParams.token)
            .then(function(data) {
                $scope.block = false;
            }, function() {
                $scope.not_found = true;
            });

        $scope.submit = function() {
            api.auth.recover($routeParams.token, $scope.model.password)
                .then(function() {
                    $location.path('home');
                }, function(error) {
                    $scope.error = error;
                });
        };
    };
