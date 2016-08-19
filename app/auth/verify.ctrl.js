'use strict';

angular.module('darkChess.auth')
    .controller('VerifyCtrl', verifyController);

    verifyController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'api',
    ];

    function verifyController($scope, $location, $routeParams, api) {

        $scope.model = {
            password: '',
            password2: '',
        };

        $scope.not_found = false;

        api.auth.verify($routeParams.token)
            .then(function(data) {
                $location.path('home');
            }, function() {
                $scope.not_found = true;
            });
    }
