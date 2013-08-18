'use strict';

angular
    .module('textaposer')
    .factory('Rectangle', function () {

        function Rectangle(height, width, x, y, fill) {
            this.height = height;
            this.width = width;
            this.x = x;
            this.y = y;
            this.fill = fill;
        }

        return Rectangle;

    });
