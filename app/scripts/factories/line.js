'use strict';

angular
    .module('textaposer')
    .factory('Line', function () {

        function Line(fragments) {
            this.fragments = fragments;
        }

        Line.prototype.getAbsoluteOffset = function (id, offset) {
            var i,
                length = this.fragments.length,
                totalOffset = 0;

            for (i = 0; i < length; i += 1) {
                if (this.fragments[i].id === id) {
                    return totalOffset + offset;
                }
                totalOffset += this.fragments[i].text.length;
            }

            return -1;
        };

        Line.prototype.getFragment = function (id) {
            var i,
                length = this.fragments.length;

            for (i = 0; i < length; i += 1) {
                if (this.fragments[i].id === id) {
                    return this.fragments[i];
                }
            }
        };

        Line.prototype.getText = function() {
            var i,
                length = this.fragments.length,
                texts = [];

            for (i = 0; i < length; i += 1) {
                texts.push(this.fragments[i].text);
            }

            return texts.join('');
        };

        return Line;

    });
