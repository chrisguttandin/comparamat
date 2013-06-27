/*global
   LaTeXContainer,
   Processor
 */
var LaTeXParallel = (function ($, p) {

    'use strict';

    return function (options) {

        options = $.extend({}, options);

        var values = {
                leftColumn: '',
                requiredPackages: ['pdfcolparallel'],
                rightColumn: ''
            },
            laTexParallel = Object.create(new LaTeXContainer(), {

                children: {
                    get: function () {
                        return [this.leftColumn, this.rightColumn];
                    },
                    set: function (value) {
                        if (typeof value !== 'object') {
                            throw new TypeError('children must be an object');
                        }
                        this.leftColumn = value[0];
                        this.rightColumn = value[1];
                    }
                },

                leftColumn: {
                    get: function () {
                        return values.leftColumn;
                    },
                    set: function (value) {
                        if (typeof value !== 'string' && typeof value !== 'object') {
                            throw new TypeError('leftColumn must be a string or an object');
                        }
                        values.leftColumn = value;
                    }
                },

                rightColumn: {
                    get: function () {
                        return values.rightColumn;
                    },
                    set: function (value) {
                        if (typeof value !== 'string' && typeof value !== 'object') {
                            throw new TypeError('rightColumn must be a string or an object');
                        }
                        values.rightColumn = value;
                    }
                }

            }),
            toLaTeXHeader = laTexParallel.toLaTeXHeader;

        laTexParallel.toLaTeXBody = function () {
            var laTeX = '',
                leftColumn = this.leftColumn,
                rightColumn = this.rightColumn;

            laTeX += p.addLineBreak('\\begin{Parallel}{7cm}{7cm}');
            laTeX += '\\ParallelLText{';
            if (typeof leftColumn === 'string') {
                laTeX += leftColumn;
            } else {
                laTeX += leftColumn.toLaTeXBody();
            }
            laTeX += p.addLineBreak('}');
            laTeX += '\\ParallelRText{';
            if (typeof rightColumn === 'string') {
                laTeX += rightColumn;
            } else {
                laTeX += rightColumn.toLaTeXBody();
            }
            laTeX += p.addLineBreak('}');
            laTeX += p.addLineBreak('\\end{Parallel}');

            return laTeX;
        };

        laTexParallel.toLaTeXHeader = function () {
            var laTeXHeader = '';

            laTeXHeader += p.addLineBreak('\\usepackage{pdfcolparallel}');
            laTeXHeader += toLaTeXHeader.apply(this);

            return laTeXHeader;
        };

        if (typeof options.leftColumn !== 'undefined') {
            laTexParallel.leftColumn = options.leftColumn;
        }

        if (typeof options.rightColumn !== 'undefined') {
            laTexParallel.rightColumn = options.rightColumn;
        }

        return Object.freeze(laTexParallel);

    };

}(jQuery, Processor));