'use strict';

angular.module('darkChess.auth')
    .controller('RegisterCtrl', registerController);

    registerController.$inject = [
        '$scope',
        '$location',
        'apiService',
    ];

    function registerController($scope, $location, apiService) {
        $scope.model = {
            username: '',
            email: '',
            password: '',
            password2: '',
        };

        $scope.error = null;

        $scope.submit = function() {
            apiService.auth.register($scope.model.username, $scope.model.email, $scope.model.password)
                .then(function() {
                    $location.path('home');
                }, function(error) {
                    $scope.error = error;
                });
        };
    }
