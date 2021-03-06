'use strict';

angular.module('darkChess')
    .service('helpersService', HelpersService);

    function HelpersService() {

        this.isIn = function(array, item) {
            return array.indexOf(item) > -1;
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
