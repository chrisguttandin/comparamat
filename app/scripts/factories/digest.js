'use strict';

angular
    .module('textaposer')
    .factory('Digest', ['Line', function (Line) {

        function Digest(lines, rectangles) {
            this.lines = lines;
            this.rectangles = rectangles;
        }

        Digest.prototype.getAbsoluteOffset = function (id, offset) {
            var i,
                length = this.lines.length,
                totalOffset = 0;

            for (i = 0; i < length; i += 1) {
                if (this.lines[i].id === id) {
                    return totalOffset + offset;
                }
                totalOffset += this.lines[i].text.length;
            }

            return -1;
        };

        Digest.prototype.getFragment = function (id) {
            var i,
                length = this.lines.length;

            for (i = 0; i < length; i += 1) {
                if (this.lines[i].id === id) {
                    return this.lines[i];
                }
            }
        };

        Digest.prototype.getText = function() {
            var i,
                length = this.lines.length,
                texts = [];

            for (i = 0; i < length; i += 1) {
                texts.push(this.lines[i].getText().replace(/\n[\s]*$/, ''));
            }

            return texts.join('\n');
        };

        Digest.prototype.getWords = function() {
            var text = this.getText(),
                words;

            words = text.match(/[^\s\-]+|[\s\-]+/g);

            return words || [];
        };

        Digest.prototype.appendFragment = function (fragment) {
            this.lines[this.lines.length - 1].fragments.push(fragment);
        };

        Digest.prototype.appendLineWithFragment = function (fragment) {
            this.lines.push(new Line([fragment]));
        };

        Digest.prototype.clear = function () {
            this.lines = [];
        };

        return Digest;

    }]);
