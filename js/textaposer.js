/*global
    angular,
    Base64,
    FileReader,
    latex,
    marcusb_fragcolors_modified,
    $
*/

(function () {

    'use strict';

    var textaposer = angular.module('textaposer', []);

    textaposer.factory('Digest', function () {
        function Digest(fragments, rectangles) {
            this.fragments = fragments;
            this.rectangles = rectangles;
        }

        Digest.prototype.getAbsoluteOffset = function (id, offset) {
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

        Digest.prototype.getFragment = function (id) {
            var i,
                length = this.fragments.length;

            for (i = 0; i < length; i += 1) {
                if (this.fragments[i].id === id) {
                    return this.fragments[i];
                }
            }
        };

        Digest.prototype.getText = function() {
            var i,
                length = this.fragments.length,
                texts = [];

            for (i = 0; i < length; i += 1) {
                texts.push(this.fragments[i].text);
            }

            return texts.join('');
        };

        return Digest;
    });

    textaposer.factory('DigestList', function () {
        function DigestList(digests) {
            this.digests = digests;
            this.date = new Date().getTime();
        }

        return DigestList;
    });

    textaposer.factory('Fragment', function () {
        function Fragment(text) {
            this.color = 0;
            this.id = (function () {
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    charactersLength = characters.length,
                    choosenCharacters = [],
                    i;

                for (i = 0; i < 10; i += 1) {
                    choosenCharacters.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
                }

                return choosenCharacters.join('');
            }());
            this.text = text;
        }

        return Fragment;
    });

    textaposer.factory('Rectangle', function () {
        function Rectangle(height, width, x, y, fill) {
            this.height = height;
            this.width = width;
            this.x = x;
            this.y = y;
            this.fill = fill;
        }

        return Rectangle;
    });

    /**
     * Comparing Service
     */

    textaposer.factory('comparingService', function (Fragment) {
        return {
            compare: function (digests, length, callback) {
                setTimeout(function () {
                    var fragmarks = [],
                        fragments = [],
                        frags,
                        lastColorIndex = 0;

                    frags = marcusb_fragcolors_modified(
                        $('<div>' + digests[0].getText() + '</div>'),
                        $('<div>' + digests[1].getText() + '</div>'),
                        length
                    );

                    $('<div>' + frags.original + '</div>').find('span').each(function () {
                        var classNames,
                            f = new Fragment($(this).text()),
                            i,
                            length;

                        if (this.className !== '') {
                            lastColorIndex += 1;
                            f.color = lastColorIndex;
                            if (lastColorIndex > 5) {
                                lastColorIndex = 0;
                            }
                            if (this.className.match(/ /)) { // eg. 'fragmarkx fragmarky'
                                classNames = this.className.split(' ');
                                length = classNames.length;

                                for (i = 0; i < length; i += 1) {
                                    fragmarks[classNames[i]] = f;
                                }
                            } else {
                                fragmarks[this.className] = f;
                            }
                        }
                        fragments.push(f);
                    });
                    digests[0].fragments = fragments;

                    fragments = [];
                    $('<div>' + frags.plagiarism + '</div>').find('span').each(function () {
                        var equivalent,
                            f = new Fragment($(this).text());

                        if (this.className !== '') {
                            equivalent = fragmarks[this.className];
                            equivalent.equivalent = f;
                            f.color = equivalent.color;
                            f.equivalent = equivalent;
                        }
                        fragments.push(f);
                    });
                    digests[1].fragments = fragments;

                    callback(digests);
                }, 1);
            }
        };
    });

    /**
     * Export Service
     */

    textaposer.factory('exportService', function () {
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

    /**
     * Selection Service
     */

    textaposer.factory('selectionService', function () {
        return {
            detect: function () {
                var $current,
                    range,
                    selection = window.getSelection(),
                    offset;

                // check if there is a range
                if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                    offset = range.startOffset;

                    // check if the range is inside .content
                    if ($(range.startContainer).hasClass('content')
                            || $(range.startContainer).parents('div.content').length > 0) {

                        $current = $(range.startContainer);

                        while (!$current.hasClass('content')) {
                            offset += $current.prevAll().text().length;
                            $current = $current.parent();
                        }
                        return {
                            fragment: $current.parents('li').prev().length,
                            offset: offset
                        };
                    }
                }
                return {
                    fragment: -1,
                    offset: -1
                };
            },

            select: function(selection) {
                var remainingOffset = selection.offset;

                if (selection.fragment > 1 && remainingOffset > -1) {
                    $('x-textaposer-text:eq(' + selection.fragment + ') .content').contents().each(function () {
                        var length = $(this).text().length,
                            range,
                            startContainer,
                            selection;

                        if (length < remainingOffset) {
                            remainingOffset -= length;
                        } else {
                            range = document.createRange();
                            // @todo so lange nach unten wandern, bis eine textNode erreicht ist und die länge passt
                            startContainer = (this.nodeType === 3) ? this : $(this).contents()[0];
                            selection = window.getSelection();
                            range.setStart(startContainer, remainingOffset);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            return false; // to break the each() loop
                        }
                    });
                }
            }
        };
    });

    /**
     * <x-textaposer-export/>
     */

    textaposer.controller('textaposerExportCtrl', function ($scope) {
        $scope.cancel = function() {
            $scope.exportHidden = true;
        };

        $scope.print = function () {
            $scope.exportHidden = true;
            window.print();
        };
    });

    textaposer.directive('textaposerExport', function () {
        return {
            controller: 'textaposerExportCtrl',
            restrict: 'E',
            templateUrl: 'views/textaposer-export.html'
        };
    });

    /**
     * <x-textaposer-imprint/>
     */

    textaposer.controller('textaposerImprintCtrl', function ($scope) {
        $scope.hide = function() {
            $scope.imprintHidden = true;
        };
    });

    textaposer.directive('textaposerImprint', function () {
        return {
            controller: 'textaposerImprintCtrl',
            restrict: 'E',
            templateUrl: 'views/textaposer-imprint.html'
        };
    });

    /**
     * <x-textaposer-main/>
     */

    textaposer.controller('textaposerMainCtrl', function (
        $scope,
        Digest,
        DigestList,
        Fragment,
        Rectangle,
        comparingService,
        exportService,
        selectionService
    ) {
        function normalize(value, min, max) {
            value = Math.round(value * 10000) / 100;
            if (value < min) {
                return min;
            }
            if (value > max) {
                return max;
            }
            return value;
        }
        function updateMiniMap($content, digest) {
            var height = $content.height(),
                rectangles = [],
                topHeight = $content.parent().height(),
                topScrollTop = $content.parent().scrollTop(),
                width = $content.width();

            digest.rectangles = rectangles;

            $content.find('span.colored').each(function () {
                var color = $(this).css('background-color'),
                    currentTop,
                    $dummy = $('<span></span>'),
                    lineHeight,
                    nextPosition,
                    ownPosition;

                ownPosition = $dummy.insertBefore(this).position();
                ownPosition.top -= topHeight - topScrollTop;
                lineHeight = $dummy.height();
                if (lineHeight <= 1) {
                    lineHeight = 1;
                }
                $dummy.remove();
                nextPosition = $dummy.insertAfter(this).position();
                nextPosition.top -= topHeight - topScrollTop;
                $dummy.remove();

                if (ownPosition.top === nextPosition.top) {
                    rectangles.push(new Rectangle(
                        normalize(lineHeight / height, 1, 100), // height
                        normalize((nextPosition.left - ownPosition.left) / width, 0, 100), // width
                        normalize(ownPosition.left / width, 0, 100), // x
                        normalize(ownPosition.top / height, 0, 99), // y
                        color
                    ));
                    return;
                }
                rectangles.push(new Rectangle(
                    normalize(lineHeight / height, 1, 100), // height
                    100 - normalize(ownPosition.left / width, 0, 100), // width
                    normalize(ownPosition.left / width, 0, 100), // x
                    normalize(ownPosition.top / height, 0, 99), // y
                    color
                ));

                currentTop = ownPosition.top + lineHeight;

                while (currentTop < nextPosition.top) {
                    rectangles.push(new Rectangle(
                        normalize(lineHeight / height, 1, 100), // height
                        100, // width
                        0, // x
                        normalize(currentTop / height, 0, 99), // y
                        color
                    ));

                    currentTop += lineHeight;
                }

                rectangles.push(new Rectangle(
                    normalize(lineHeight / height, 1, 100), // height
                    normalize(nextPosition.left / width, 0, 100), // width
                    0, // x
                    normalize(nextPosition.top / height, 0, 99), // y
                    color
                ));
            });

            $scope.$apply(function () {
                digest.rectangles = rectangles;
            });
        }

        function updateMiniMaps() {
            updateMiniMap($('.content:eq(0)'), $scope.digestList.digests[0]);
            updateMiniMap($('.content:eq(1)'), $scope.digestList.digests[1]);
        }

        function check() {
            if (!$scope.$$phase) {
                $scope.$apply(function () {
                    $scope.comparing = false;
                });
                setTimeout(function () {
                    updateMiniMaps();
                }, 100);
            } else {
                setTimeout(check, 1000);
            }
        }

        $scope.comment = '';

        $scope.compare = function () {
            if (!$scope.comparing) {
                $scope.comparing = true;
                $scope.selection = selectionService.detect();

                comparingService.compare($scope.digestList.digests, $scope.length, function(digests) {
                    if ($scope.$$phase) {
                        $scope.digestList.digests = digests;
                        setTimeout(check, 1000);
                    } else {
                        $scope.$apply(function () {
                            $scope.digestList.digests = digests;
                            setTimeout(check, 1000);
                        });
                    }
                });
            }
        };

        $scope.comparing = false;

        $scope.digestList = new DigestList([
            new Digest([
                new Fragment('Kopiere die zu vergleichenden Texte in die Textfelder. Identische Passagen werden mit der selben Farbe hinterlegt. Durch einen Klick auf die farbigen Stellen wird die gefundene Übereinstimmung im gegenüberliegenden Feld angezeigt.')
            ], []),
            new Digest([
                new Fragment('Das funktioniert schon ganz gut. Identische Passagen werden mit der selben Farbe hinterlegt.')
            ], [])
        ]);

        $scope.download = function () {
            $scope.exportHidden = true;
            exportService.download($scope.title, $scope.leftColumnTitle, $scope.rightColumnTitle, $scope.comment, $scope.filename);
        };

        $scope.export = function () {
            $scope.exportHidden = false;
        };

        // shows or hides the export dialog
        $scope.exportHidden = true;

        $scope.filename = 'verglichene-texte-' + new Date().getTime() + '.tex';

        // shows or hides the imprint popup
        $scope.imprintHidden = true;

        // start with a default of 3 words to be the same
        $scope.length = 3;

        $scope.leftColumnTitle = '';

        $scope.open = function () {
            $scope.exportHidden = true;
            exportService.open($scope.title, $scope.leftColumnTitle, $scope.rightColumnTitle, $scope.comment);
        };

        $scope.rightColumnTitle = '';

        // start with an empty selection
        $scope.selection = {
            fragment: -1,
            offset: -1
        };

        $scope.showImprint = function () {
            $scope.imprintHidden = false;
        };

        $scope.title = '';
    });

    textaposer.directive('textaposerMain', function () {

        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            $('body').addClass('firefox');
        }

        return {
            controller: 'textaposerMainCtrl',
            restrict: 'E',
            templateUrl: 'views/textaposer-main.html'
        };
    });

    /**
     * <x-textaposer-file/>
     */

    textaposer.controller('textaposerFileCtrl', function ($scope, Fragment) {
        $scope.path = '';

        $scope.read = function (file) {
            var reader = new FileReader();

            if (file.type === 'text/plain') {
                reader.onload = function(event) {
                    $scope.$apply(function () {
                        $scope.digest.fragments = [new Fragment(event.target.result)];
                    });
                    //$scope.compare();
                };
                reader.readAsText(file);
                $scope.path = file.name;
            } else {
                alert('Dateien vom Typ "' + (file.type || 'unbekannt') + '" können leider nicht gelesen werden.\nBitte verwende einfache Textdateien vom Typ "text/plain".\n\nDanke.');
            }
        };
    });

    textaposer.directive('textaposerFile', function() {
        return {
            controller: 'textaposerFileCtrl',
            link: function($scope, element) {
                element.bind('change', function (event) {
                    var file = event.target.files[0];

                    if (file) {
                        $scope.read(file);
                    }
                });
            },
            restrict: 'A'
        };
    });

    /**
     * <x-textaposer-text/>
     */

    textaposer.controller('textaposerTextCtrl', function ($scope, $element, selectionService) {
        $scope.clickFileInput = function () {
            $element.find('input[type=file]').click();
        };

        $scope.focus = function(id) {
            var $equivalent,
                fragment,
                $fragment = $element.find('span[id="' + id + '"]'),
                $mask;

            if ($fragment.hasClass('colored')) {
                fragment = $scope.digest.getFragment(id);
                $equivalent = $element.parent().siblings().find('span[id="' + fragment.equivalent.id + '"]');
                $mask = $element.parent().siblings().find('div.mask');

                $mask.scrollTop($mask.scrollTop() - ($fragment.position().top - $equivalent.position().top));
            }
        };

        $scope.miniMapIsVisible = true;

        $scope.select = function() {
            selectionService.select($scope.selection);
        };

        $scope.toggleMiniMap = function () {
            $scope.miniMapIsVisible = !$scope.miniMapIsVisible;
        };
    });

    textaposer.directive('textaposerText', function () {
        return {
            controller: 'textaposerTextCtrl',
            link: function ($scope, element) {
                var $content = element.find('.content'),
                    contentHeight,
                    counter = 0,
                    $fakeContent = element.find('.fake-content'),
                    scrollTopBeforePrinting;
//                    selectedDigest,
//                    totalOffset;

                $content.bind('input', function () {
                    console.log('input');

                    while ($scope.digest.fragments.length > 1) {
                        $scope.digest.fragments.pop();
                    }

                    $scope.digest.fragments[0].text = $content.text();

                    //$scope.compare();
                });

                $fakeContent.bind('DOMSubtreeModified', function () {
                    counter += 1;
                    setTimeout(function (innerCounter) { // angular needs some time to render the template
                        if (counter === innerCounter) {
                            console.log('DOMSubtreeModified');

                            $content[0].innerHTML = $fakeContent
                                .html()
                                .replace(/<!--(.*?)-->/g, '')
                                .replace(/<x-textaposer-fragment(.*?)>/g, '')
                                .replace(/<\/x-textaposer-fragment>/g, '')

                                // removing whitespace is necesarry to keep track of the current selection
                                // remove trailing whitespace
                                .replace(/^([\n\r\s]*?)</g, '<')
                                // remove whitespace in between tags
                                .replace(/>([\n\r\s]*?)<([^\/]{1})/g, '><$2')
                                // remove whitespace at the end
                                .replace(/>([\n\r\s]*?)$/g, '>');
                                // @todo replace all the other angular attributes

                            $scope.select();

                            $content.find('span').bind('click', function () {
                                $scope.focus(this.id);
                            });
                        }
                    }.bind(null, counter), 1);
                });

                element.children().first().bind('scroll', function () {
                    scrollTopBeforePrinting = $(this).scrollTop();
                });

                window.matchMedia('print').addListener(function(mql) {
                    if (!mql.matches) { // aka after printing
                        element.children().first().scrollTop(scrollTopBeforePrinting);
                    }
                });

                $scope.compare();

                contentHeight = $content.height();
                $content.css({
                    'margin-bottom': contentHeight + 'px',
                    'margin-top': contentHeight + 'px'
                });
                element.children('.mask').scrollTop(contentHeight);
                scrollTopBeforePrinting = contentHeight;
            },
            restrict: 'E',
            templateUrl: 'views/textaposer-text.html'
        };
    });

}());
