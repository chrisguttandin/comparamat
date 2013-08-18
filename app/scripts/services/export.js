'use strict';

angular
    .module('textaposer')
    .factory('exportService', function ExportService() {

        function buildContainer($element) {
            var container = latex.container();

            $element.each(function () {
                if (this.className.match(/colored/)) {
                    var color = $(this).css('background-color'),
                        name,
                        result,
                        values;

                    if (/^rgb\([0-9]+, [0-9]+, [0-9]+\)/.test(color)) {
                        result = /^rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/.exec(color);
                        values = result.slice(1);
                    } else if (/^rgba\([0-9]+, [0-9]+, [0-9]+, [0-9]+\)/.test(color)) {
                        result = /^rgba\(([0-9]+), ([0-9]+), ([0-9]+), ([0-9]+)\)/.exec(color);
                        values = result.slice(1, -1);
                    } else {
                        return; // unknown color
                    }

                    name = this.className.match(/color\-[a-z]+/)[0].replace(/\-[a-z]/, function (match) {
                        return match[1].toUpperCase();
                    });

                    container.addChild(latex.textcolor($.trim($(this).text()), {
                        color: {
                            name: name,
                            values: values
                        }
                    }));
                } else {
                    container.addChild($.trim($(this).text()));
                }
            });
            return container;
        }

        function buildDocument(title, leftColumnTitle, rightColumnTitle, comment) {
            var l = latex();

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
            l.addChild(latex.parallel([
                buildContainer($('x-textaposer-text:eq(0) .content span')),
                buildContainer($('x-textaposer-text:eq(1) .content span'))
            ]));
            l.addChild(latex.paragraph(comment));

            return l.toLaTeX();
        }

        return {
            download: function (title, leftColumnTitle, rightColumnTitle, comment, filename) {
                var dataURI,
                    doc = buildDocument(title, leftColumnTitle, rightColumnTitle, comment),
                    $form;

                dataURI = 'data:application/latex;base64,' + Base64.encode(doc);

                $form = $('<form method="post" action="https://download-data-uri.appspot.com/"></form>');
                $form.append('<input type="hidden" name="filename" value="' + filename + '">');
                $form.append('<input type="hidden" name="data" value="' + dataURI + '">');
                $('body').append($form);
                $form.submit().remove();
            },
            open: function (title, leftColumnTitle, rightColumnTitle, comment) {
                var doc = buildDocument(title, leftColumnTitle, rightColumnTitle, comment),
                    $form;

                $form = $('<form action="https://www.writelatex.com/docs" method="post" target="_blank">');
                $form.append('<textarea name="snip">' + doc + '</textarea>');
                $form.append('<input checked name="splash" type="checkbox" value="none">');
                $('body').append($form);
                $form.submit().remove();
            }
        };
    });