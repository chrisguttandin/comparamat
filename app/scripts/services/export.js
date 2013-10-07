'use strict';

angular
    .module('textaposer')
    .factory('exportService', function ExportService() {

        function trim(text) {
            return text.replace(/^(\s)*/, '').replace(/(\s)*$/, '');
        }

        function buildContainer(spans) {
            var color,
                container = latex.container(),
                i,
                length,
                name,
                result,
                span,
                values;

            length = spans.length;

            for (i = 0; i < length; i += 1) {
                span = spans[i];

                if (span.className.match(/colored/)) {
                    color = window.getComputedStyle(span).backgroundColor;

                    if (/^rgb\([0-9]+, [0-9]+, [0-9]+\)/.test(color)) {
                        result = /^rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/.exec(color);
                        values = result.slice(1);
                    } else if (/^rgba\([0-9]+, [0-9]+, [0-9]+, [0-9]+\)/.test(color)) {
                        result = /^rgba\(([0-9]+), ([0-9]+), ([0-9]+), ([0-9]+)\)/.exec(color);
                        values = result.slice(1, -1);
                    } else {
                        return; // unknown color
                    }

                    name = span.className.match(/color\-[a-z]+/)[0].replace(/\-[a-z]/, function (match) {
                        return match[1].toUpperCase();
                    });

                    container.addChild(latex.textcolor(trim(span.textContent), {
                        color: {
                            name: name,
                            values: values
                        }
                    }));
                } else {
                    container.addChild(trim(span.textContent));
                }
            }

            return container;
        }

        function buildDocument(title, leftColumnTitle, rightColumnTitle, comment) {
            var l = latex(),
                texts;

            l.utf8 = true;

            l.style = 'scrartcl';

            l.addOption('paper', 'a4');
            l.addOption('final');
            l.addOption('fontsize', '11pt');

            l.addChild(latex.author(''));
            l.addChild(latex.title(title));
            l.addChild(latex.parallel([
                leftColumnTitle,
                rightColumnTitle
            ]));

            texts = document.getElementsByTagName('x-textaposer-text');

            l.addChild(latex.parallel([
                buildContainer(texts[0].getElementsByClassName('content')[0].getElementsByTagName('span')),
                buildContainer(texts[1].getElementsByClassName('content')[0].getElementsByTagName('span'))
            ]));
            l.addChild(latex.paragraph(comment));

            return l.toLaTeX();
        }

        return {
            download: function (title, leftColumnTitle, rightColumnTitle, comment, filename) {
                var dataURI,
                    doc = buildDocument(title, leftColumnTitle, rightColumnTitle, comment);

                dataURI = 'data:application/latex;base64,' + window.btoa(doc);

                document.body.insertAdjacentHTML('beforeend', '<form action="https://download-data-uri.appspot.com/" method="post" name="download">' +
                    '<input type="hidden" name="filename" value="' + filename + '">' +
                    '<input type="hidden" name="data" value="' + dataURI + '">' +
                    '</form>');

                document.forms['download'].submit();
                document.body.removeChild(document.forms['download']);
            },
            open: function (title, leftColumnTitle, rightColumnTitle, comment) {
                var doc = buildDocument(title, leftColumnTitle, rightColumnTitle, comment);

                document.body.insertAdjacentHTML('beforeend', '<form action="https://www.writelatex.com/docs" method="post" name="open" target="_blank">' +
                    '<textarea name="snip">' + doc + '</textarea>' +
                    '<input checked name="splash" type="checkbox" value="none">' +
                    '</form>');

                document.forms['open'].submit();
                document.body.removeChild(document.forms['open']);
            }
        };
    });