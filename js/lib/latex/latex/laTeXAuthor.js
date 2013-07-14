/*global
   LaTeXContainer
 */
var LaTeXAuthor = (function () {

    'use strict';

    return function () {

        var laTeXAuthor = Object.create(new LaTeXContainer());

        laTeXAuthor.toLaTeXBody = function () {
            var laTeX = '';

            laTeX += '\\author{}\n';

            return laTeX;
        };

        laTeXAuthor.toLaTeXHeader = function () {
            return '';
        };

        return laTeXAuthor;

    };

}());