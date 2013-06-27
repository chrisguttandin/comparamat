/*global
    LaTeXContainer,
    Processor
 */
var LaTeXDocument = (function ($, p) {

    'use strict';

    return function (options) {

        options = $.extend({}, options);

        var serializeDocumentClassOptions = function (options) {
                var i,
                    serializedOptions = [];
                for (i = 0; i < options.length; i += 1) {
                    if (typeof options[i] === 'string') {
                        serializedOptions.push(options[i]);
                    } else {
                        serializedOptions.push(options[i].option + '=' + options[i].value);
                    }
                }
                return serializedOptions.join();
            },
            values = {
                documentClass: 'article',
                documentClassOptions: [],
                children: [],
                sources: []
            },
            laTexDocument = Object.create(new LaTeXContainer(), {

                documentClass: {
                    get: function () {
                        return values.documentClass;
                    },
                    set: function (value) {
                        if (typeof value !== 'string') {
                            throw 'documentClass must be a string';
                        }
                        values.documentClass = value;
                    }
                },

                utf8: {
                    get: function () {
                        return values.utf8;
                    },
                    set: function (value) {
                        if (typeof value !== 'boolean') {
                            throw 'utf8 must be a boolean';
                        }
                        values.utf8 = value;
                    }
                },

                sources: {
                    get: function () {
                        return values.sources;
                    }
                }

            });

        laTexDocument.addDocumentClassOption = function (option, value) {
            if (arguments.length === 1) {
                values.documentClassOptions.push(option);
            } else {
                values.documentClassOptions.push({
                    option: option,
                    value: value
                });
            }
        };

        laTexDocument.addSource = function (source) {
            values.sources.push(source);
        };

        laTexDocument.toLaTeX = function () {
            return this.toLaTeXHeader() + this.toLaTeXBody();
        };

        laTexDocument.toLaTeXBody = function () {
            var child,
                children = this.children,
                i,
                laTeXBody = '',
                length = children.length;

            laTeXBody += p.addLineBreak('\\begin{document}');
            for (i = 0; i  < length; i += 1) {
                child = children[i];
                if (typeof child === 'string') {
                    laTeXBody += child;
                } else {
                    laTeXBody += child.toLaTeXBody();
                }
            }
            if (this.sources.length > 0) {
                laTeXBody += p.addLineBreak('\\bibliographystyle{amsplain}');
                laTeXBody += p.addLineBreak('\\bibliography{bibliography}');
            }
            laTeXBody += p.addLineBreak('\\listoffigures');
            laTeXBody += p.addLineBreak('\\listoftables');
            laTeXBody += p.addLineBreak('\\end{document}');

            return laTeXBody;
        };

        laTexDocument.toLaTeXHeader = function () {
            var child,
                children = this.children,
                childrenLength = children.length,
                i,
                laTeXHeader = p.addLineBreak('\\documentclass[' + serializeDocumentClassOptions(values.documentClassOptions) + ']{' + this.documentClass + '}'),
                source,
                sources = this.sources,
                sourcesLength = sources.length;

            laTeXHeader += p.addLineBreak('\\usepackage{t1enc}'); // TODO package is used by double quotes
            laTeXHeader += p.addLineBreak('\\usepackage{supertabular}'); // TODO package is used by tables
            laTeXHeader += p.addLineBreak('\\usepackage[ngerman]{babel}');

            if (this.utf8) {
                laTeXHeader += p.addLineBreak('\\usepackage[utf8]{inputenc}');

                //\usepackage{textcomp}
            }

            for (i = 0; i  < childrenLength; i += 1) {
                child = children[i];
                if (typeof child !== 'string') {
                    laTeXHeader += child.toLaTeXHeader();
                }
            }

            // TODO wegen der Bilder ist das hier jetzt immer drin
            laTeXHeader += p.addLineBreak('\\usepackage{filecontents}');
            if (sourcesLength > 0) {
                laTeXHeader += p.addLineBreak('\\usepackage{filecontents}');
                laTeXHeader += p.addLineBreak('\\begin{filecontents}{bibliography.bib}');
                for (i = 0; i < sourcesLength; i += 1) {
                    source = sources[i];
                    laTeXHeader += p.addLineBreak('@article{' + source.name.replace(/\s/g, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss') + ',');
                    laTeXHeader += p.addLineBreak('\tauthor = {' + source.author + '},');
                    laTeXHeader += p.addLineBreak('\tlocation = {' + source.location + '},');
                    laTeXHeader += p.addLineBreak('\tpublisher = {' + source.publisher + '},');
                    laTeXHeader += p.addLineBreak('\ttitle = {' + source.title + '},');
                    laTeXHeader += p.addLineBreak('\tyear = {' + source.year + '}');
                    laTeXHeader += p.addLineBreak('}');
                }
                laTeXHeader += p.addLineBreak('\\end{filecontents}');
            }

            return laTeXHeader;
        };

        return Object.freeze(laTexDocument);

    };

}(jQuery, Processor));