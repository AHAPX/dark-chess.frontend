'use strict';

angular.module('darkChess.auth')
    .controller('VerifyCtrl', verifyController);

    verifyController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'apiService',
    ];

    function verifyController($scope, $location, $routeParams, apiService) {

        $scope.model = {
            password: '',
            password2: '',
        };

        $scope.not_found = false;

        apiService.auth.verify($routeParams.token)
            .then(function(data) {
                $location.path('home');
            }, function() {
                $scope.not_found = true;
            });
    }
