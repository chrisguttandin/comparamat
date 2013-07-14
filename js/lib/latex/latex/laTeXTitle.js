/*global
   LaTeXContainer
 */
var LaTeXTitle = (function ($) {

    'use strict';

    return function (options) {

        options = $.extend({}, options);

        var values = {
                title: ''
            },
            laTeXTitle = Object.create(new LaTeXContainer(), {

                title: {
                    get: function () {
                        return values.title;
                    },
                    set: function (value) {
                        if (typeof value !== 'string') {
                            throw new TypeError('title must be a string');
                        }
                        values.title = value;
                    }
                }

            });

        laTeXTitle.toLaTeXBody = function () {
            var laTeX = '';

            laTeX += '\\title{' + laTeXTitle.title + '}\n';
            laTeX += '\\maketitle\n';

            return laTeX;
        };

        laTeXTitle.toLaTeXHeader = function () {
            return '';
        };

        if (typeof options.title !== 'undefined') {
            laTeXTitle.title = options.title;
        }

        return laTeXTitle;

    };

}(jQuery));
