'use strict';

angular
    .module('textaposer')
    .controller('textaposerMainCtrl', [
        '$scope',
        'comparingService',
        'Digest',
        'DigestList',
        'Fragment',
        'Rectangle',
        'selectionService',
        function (
            $scope,
            comparingService,
            Digest,
            DigestList,
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
                    var $afterDummy = $('<span id="textaposer-after-dummy"></span>').insertAfter(this),
                        $beforeDummy = $('<span id="textaposer-before-dummy"></span>'),
                        temp;

                    temp = this;
                    while ($(temp).prev().children('br').length > 0) {
                        temp = $(temp).prev()[0];
                    }
                    $beforeDummy.insertBefore(temp);

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
                    new Fragment(
                        'Kopiere die zu vergleichenden Texte in die Textfelder. Identische Passagen werden mit der selben Farbe hinterlegt. Durch einen Klick auf die farbigen Stellen wird die gefundene Übereinstimmung im gegenüberliegenden Feld angezeigt.',
                        Fragment.NODE_NAME.SPAN
                    )
                ], []),
                new Digest([
                    new Fragment(
                        'Das funktioniert schon ganz gut. Identische Passagen werden mit der selben Farbe hinterlegt.',
                        Fragment.NODE_NAME.SPAN
                    )
                ], [])
            ]);

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
