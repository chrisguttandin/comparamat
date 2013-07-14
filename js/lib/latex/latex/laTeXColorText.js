/*global
   LaTeXContainer,
   Processor
 */
var LaTeXColorText = (function ($, p) {

    'use strict';

    return function (options) {

        options = $.extend({}, options);

        var values = {
                color: [0, 0, 0],
                colorName: ''
            },
            laTeXColorText = Object.create(new LaTeXContainer(), {

                color: {
                    get: function () {
                        return values.color;
                    },
                    set: function (value) {
                        if (typeof value !== 'object') {
                            throw new TypeError('color must be an object');
                        }
                        values.color = value;
                    }
                },

                colorName: {
                    get: function () {
                        return values.colorName;
                    },
                    set: function (value) {
                        if (typeof value !== 'string') {
                            throw new TypeError('colorName must be a string');
                        }
                        values.colorName = value;
                    }
                }

            }),
            toLaTeXBody = laTeXColorText.toLaTeXBody,
            toLaTeXHeader = laTeXColorText.toLaTeXHeader;

        laTeXColorText.toLaTeXBody = function () {
            var laTeX = '';

            laTeX += '\\textcolor{' + laTeXColorText.colorName + '}{';
            laTeX += toLaTeXBody.apply(laTeXColorText);
            laTeX += '}';

            return laTeX;
        };

        laTeXColorText.toLaTeXHeader = function () {
            var laTeXHeader = '';

            laTeXHeader += p.addLineBreak('\\usepackage{color}');
            laTeXHeader += p.addLineBreak('\\definecolor{' + laTeXColorText.colorName + '}{RGB}{' + laTeXColorText.color.join() + '} ');
            laTeXHeader += toLaTeXHeader.apply(laTeXColorText);

            return laTeXHeader;
        };

        if (typeof options.color !== 'undefined') {
            laTeXColorText.color = options.color;
        }

        if (typeof options.colorName !== 'undefined') {
            laTeXColorText.colorName = options.colorName;
        }

        if (typeof options.child !== 'undefined') {
            laTeXColorText.addChild(options.child);
        }

        return Object.freeze(laTeXColorText);

    };

}(jQuery, Processor));