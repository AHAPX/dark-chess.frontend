'use strict';

angular.module('darkChess')
    .service('helpersService', helpersService);

    function helpersService() {

        this.isIn = function(array, item) {
            return array.indexOf(item) > 0;
        };

        this.remove = function(array, item) {
            var index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        };

        this.add = function (array, item, begin) {
            if (array.indexOf(item) < 0) {
                if (begin) {
                    array.unshift(item);
                } else {
                    array.push(item);
                }
            }
        };
    }
