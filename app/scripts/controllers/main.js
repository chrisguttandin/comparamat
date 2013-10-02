'use strict';

angular
    .module('textaposer')
    .controller('textaposerMainCtrl', [
        '$scope',
        '$compile',
        '$rootScope',
        'comparingService',
        'Digest',
        'DigestList',
        'Line',
        'Fragment',
        'Rectangle',
        'selectionService',
        function (
            $scope,
            $compile,
            $rootScope,
            comparingService,
            Digest,
            DigestList,
            Line,
            Fragment,
            Rectangle,
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

            function createRectangles($content, color, lineHeight, startPosition, endPosition) {
                var currentTop,
                    height = $content.height(),
                    rectangles = [],
                    width = $content.width();

                if (startPosition.top === endPosition.top) {
                    rectangles.push(new Rectangle(
                        normalize(lineHeight / height, 1, 100), // height
                        normalize((endPosition.left - startPosition.left) / width, 0, 100), // width
                        normalize(endPosition.left / width, 0, 100), // x
                        normalize(endPosition.top / height, 0, 99), // y
                        color
                    ));
                    return;
                }

                rectangles.push(new Rectangle(
                    normalize(lineHeight / height, 1, 100), // height
                    100 - normalize(startPosition.left / width, 0, 100), // width
                    normalize(startPosition.left / width, 0, 100), // x
                    normalize(startPosition.top / height, 0, 99), // y
                    color
                ));

                currentTop = startPosition.top + lineHeight;

                while (currentTop < endPosition.top) {
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
                    normalize(endPosition.left / width, 0, 100), // width
                    0, // x
                    normalize(endPosition.top / height, 0, 99), // y
                    color
                ));

                return rectangles;
            }

            function updateMiniMap($content, digest) {
                var length,
                    rectangles = [],
                    topHeight = $content.parent().height(),
                    topScrollTop = $content.parent().scrollTop();

                digest.rectangles = rectangles;

                length = $content.find('span.colored').length;

                $content.find('span.colored').each(function (index) {
                    var $afterDummy = $('<i id="textaposer-after-dummy"></i>').insertAfter(this),
                        $beforeDummy = $('<i id="textaposer-before-dummy"></i>'),
                        temp;

                    temp = this;
                    while ($(temp).prev().children('br').length > 0) {
                        temp = $(temp).prev()[0];
                    }
                    $beforeDummy.insertBefore(temp);
//console.log($(this).position());
//console.log($beforeDummy.position());

                    setTimeout(function (isLast) {
                        var color = $(this).css('background-color'),
                            lineHeight,
                            nextPosition,
                            ownPosition;

                        ownPosition = $beforeDummy.position();
                        ownPosition.top -= topHeight - topScrollTop;
                        lineHeight = $beforeDummy.height();
                        if (lineHeight <= 1) { // should not happen anymore
                            lineHeight = 1;
                        }
                        $beforeDummy.remove();

                        nextPosition = $afterDummy.position();
                        nextPosition.top -= topHeight - topScrollTop;
                        $afterDummy.remove();

                        rectangles = rectangles.concat(createRectangles($content, color, lineHeight, ownPosition, nextPosition));

                        if (isLast) {
                            $scope.$apply(function () {
                                digest.rectangles = rectangles;
                            });
                        }

                    }.bind(this, index === (length - 1)));
                });
            }

            function updateMiniMaps() {
                //updateMiniMap($('.content:eq(0)'), $scope.digestList.digests[0]);
                //updateMiniMap($('.content:eq(1)'), $scope.digestList.digests[1]);
            }

            $scope.comment = '';

            $scope.compare = function () {
                if (!$scope.comparing) {
                    $scope.comparing = true;

                    var uglyDigests = [];
                    $('.content').each(function (index) {
                        var lines = [];

                        $(this).find('div').each(function () {
                            lines.push(                            
                                new Line([
                                    new Fragment(
                                        $(this).text(),
                                        Fragment.NODE_NAME.SPAN
                                    )
                                ])
                            );
                        });

                        uglyDigests[index] = new Digest(lines);
                    });
                    comparingService.compareDigests(uglyDigests, $scope.length, function(digests) {
                        var element,
                            i,
                            length,
                            scope;

                        length = digests.length;

                        for (i = 0; i < length; i += 1) {
                            element = angular.element('<div class="fake-content"><div data-ng-repeat="line in digest.lines"><x-textaposer-fragment data-ng-repeat="fragment in line.fragments" data-ng-switch="fragment.nodeName"><span id="{{fragment.index}}" data-ng-class="{\'color-one\': fragment.color == 1, \'color-two\': fragment.color == 2, \'color-three\': fragment.color == 3, \'color-four\': fragment.color == 4, \'color-five\': fragment.color == 5, \'color-six\': fragment.color == 6, \'colored\': fragment.color > 0}" data-ng-switch-when="span">{{fragment.text}}</span><br data-ng-switch-when="br"/></x-textaposer-fragment></div></div>');
                            scope = $rootScope.$new();

                            scope.digest = digests[i];
                            $compile(element)(scope);
                            scope.$digest();

                            scope.digest.html = element.html().replace(/<!--(.*?)-->/g, '')
                                .replace(/<x-textaposer-fragment(.*?)>/g, '')
                                .replace(/<\/x-textaposer-fragment>/g, '')

                                // removing whitespace is necesarry to keep track of the current selection
                                // remove trailing whitespace
                                .replace(/^([\n\r\s]*?)</g, '<')
                                // remove whitespace in between tags
                                .replace(/>([\n\r\s]*?)<([^\/]{1})/g, '><$2')
                                // remove whitespace at the end
                                .replace(/>([\n\r\s]*?)$/g, '>')
                                // remove angular attributes
                                .replace(/data-ng-([a-z\-]+)="([^"]*)"/g, '')
                                // remove ng-binding class attribute
                                .replace(/ng-binding/g, '')
                                // remove ng-scope class attribute
                                .replace(/ng-scope/g, '')
                                // remove empty class attribute
                                .replace(/class="[\s]*"/g, '')
                                // remove duplicate white spaces
                                .replace(/[ ]+/g, ' ')
                                // remove space in front of a closing angle bracket
                                .replace(/ >/g, '>');
                        }

                        $scope.selection = selectionService.detect();

                        if ($scope.$$phase) {
                            $scope.digestList.digests = digests;
                            $scope.comparing = false;
                            setTimeout(function () {
                                selectionService.select($scope.selection);
                            });
                        } else {
                            $scope.$apply(function () {
                                $scope.digestList.digests = digests;
                                $scope.comparing = false;
                                setTimeout(function () {
                                    selectionService.select($scope.selection);
                                });
                            });
                        }
                    });
                }
            };

            $scope.comparing = false;

            $scope.digestList = new DigestList([
                new Digest([], []),
                new Digest([], [])
            ]);
            $scope.digestList.digests[0].html = '<div>Kopiere die zu vergleichenden Texte in die Textfelder. Identische Passagen werden mit der selben Farbe hinterlegt. Durch einen Klick auf die farbigen Stellen wird die gefundene Übereinstimmung im gegenüberliegenden Feld angezeigt.</div><div>Zeile 2</div><div>Zeile 3</div>';
            $scope.digestList.digests[1].html = '<div>Das funktioniert schon ganz gut. Identische Passagen werden mit der selben Farbe hinterlegt.</div>';

            // start with a default of 3 words to be the same
            $scope.length = 3;

            $scope.leftColumnTitle = '';

            $scope.rightColumnTitle = '';

            $scope.selection = {
                fragment: -1,
                offset: -1
            };

            $scope.showExport = function() {
                $scope.exportHidden = false;
            };

            $scope.showImprint = function() {
                $scope.imprintHidden = false;
            };

            $scope.title = '';

        }
    ]);
