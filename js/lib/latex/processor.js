var Processor = (function ($) {

    'use strict';

    var processor = Object.create({

            addLineBreak: function (line) {
                return line + '\n';
            },

            convertBrackets: function (text) {
                return text.replace(/\[/g, '$[$').replace(/\]/g, '$]$');
            },

            convertDots: function (text) {
                return text.replace(/\.\.\./g, '\\ldots');
            },

            convertHtmlDashes: function (text) {
                return text.replace(/&mdash;/g, '---')
                    .replace(/&ndash;/g, '--');
            },

            convertHtmlQuotes: function (text) {
                return text.replace(/&quot;/g, '\\textquotedbl{}');
            },

            convertHtmlEntities: function (text) {
                return text.replace(/&amp;/g, '\\&')
                    .replace(/&gt;/g, '>')
                    .replace(/&lt;/g, '<')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&sum;/g, '$\\sum$');
            },

            convertHtmlTags: function (text) {
                return text.replace(/<b[^>]*>(.*?)<\/b>/gi, '\\textbf{$1}')
                    .replace(/<i[^>]*>(.*?)<\/i>/gi, '\\textsl{$1}')
                    .replace(/<sup[^>]*>(.*?)<\/sup>/gi, '\\textsuperscript{$1}')
                    .replace(/<u[^>]*>(.*?)<\/u>/gi, '\\underline{$1}');
            },

            convertQuotes: function (text) {
                return text.replace(/"/g, '\\textquotedbl{}')
                    .replace(/„/g, '\\textsuperscript{"`}')
                    .replace(/“/g, '\\textsuperscript{"\'}');
            },

            convertUnderscores: function (text) {
                return text.replace(/_/g, '\\_');
            },

            convertWikiaSyntax: function (text) {
                return text.replace(/'''(.*?)'''/g, '\\textbf{$1}')
                    .replace(/''(.*?)''/g, '\\textsl{$1}');
            },

            escapeLaTexCharacters: function (text) {
                return text.replace(/-/g, '--')
                    .replace(/\$/g, '\\$')
                    .replace(/%/g, '\\%')
                    .replace(/\^/g, '\\textasciicircum');
            },

            process: function (text, functions) {
                var i,
                    length = functions.length;
                for (i = 0; i < length; i += 1) {
                    if ($.isArray(functions[i])) {
                        text = functions[i][0].apply(this, $.merge([text], functions[i].slice(1)));
                    } else {
                        text = functions[i](text);
                    }
                }
                return text;
            },

            // line break => " ", if there is line break at the very and it is ignored
            removeLineBreaks: function (text) {
                return text.replace(/\n/g, ' ')
                    .replace(/\n *$/m, ' ');
            },

            // "bla <h1>bla</h1> bla" => "bla bla bla"
            removeHtmlTags: function (text) {
                return text.replace(/<[^>]+>/g, '');
            },

            // "   " => " "
            removeMultipleWhiteSpaces: function (text) {
                return text.replace(/ +(?= )/g, '');
            },

            removeSpecialCharacters: function (text) {
                return text.replace(/→/g, '')
                    .replace(/∑/g, '$\\sum$')
                    .replace(//g, '') // da steht tatsächlich was zwischen den //
                    .replace(//g, '');
            },

            // "    <p>" => "<p>"
            // "</span>   <ul>" => "</span><ul>"
            // "</section>   " => "</section>"
            removeWhiteSpacesInbetweenTags: function (text) {
                return text.replace(/^ *(<\w[^>]*>)/m, '$1')
                    .replace(/(<\/\w>) *(<\w[^>]*>)/g, '$1$2')
                    .replace(/(<\/?\w>) *$/m, '$1');
            }
        });

    return Object.freeze(processor);

}(jQuery));