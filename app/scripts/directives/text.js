'use strict';

angular
    .module('textaposer')
    .directive('textaposerText', function () {

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

                    var content,
                        maxAttempts = 10,
                        modifiedContent = false;

                    console.log('input');

                    while ($scope.digest.fragments.length > 1) {
                        $scope.digest.fragments.pop();
                    }

                    content = $content.html();

                    if (content.match(/<div[^<]*>/)) { // Chrome often uses <div><br></div> constructs to add line breaks
                        content = content
                            .replace(/<div[^<]*>/g, '<br id="selection-marker" class="textaposer"/>')
                            .replace(/<\/div>/g, '')
                            .replace(/<br[\s\/]*>/g, '');
                        modifiedContent = true;
                    } else if (content.match(/<br[\s\/]*>/)) { // Firefox simple <br> tags to add line breaks
                        content = content
                            .replace(/<br[\s\/]*><br/g, '<br id="selection-marker" class="textaposer"/><br')
                            .replace(/<br[\s\/]*>/g, '<br id="selection-marker" class="textaposer"/>');
                        modifiedContent = true;
                    }

                    // make sure there is always a <br> at the end
                    if (!content.match(/<br[^>]*>$/)) {
                        content += '<br class="textaposer"/>';
                        if (!modifiedContent) { // insert the br directly if the content gets not modified
                            $content.append('<br class="textaposer"/>');
                        }
                    }

                    if (modifiedContent) {
                        // add a single whitespace in between <br> tags, otherwise there is no chance to set the selection
                        content = content
                            .replace(/(<br[^>]*>)(<br[^>]*>)/g, '$1 $2')
                            .replace(/(<br[^>]*>)(<br[^>]*>)/g, '$1 $2');

                        $content.html(content);

                        setTimeout(function setSelection() {
                            var range,
                                selection,
                                $selectionMarker = $('#selection-marker'),
                                startContainer;

                            if ($selectionMarker.length > 0) {
                                range = document.createRange();
                                selection = window.getSelection();
                                startContainer = $selectionMarker.removeAttr('id')[0].nextSibling;
                                if (startContainer) {
                                    range.setStart(startContainer, 0);
                                } else {
                                    startContainer = $selectionMarker.removeAttr('id')[0].previousSibling;
                                    if (!startContainer) {
                                        return;
                                    }
                                    range.setStart(startContainer, startContainer.length);
                                }
                                range.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            } else {
                                maxAttempts -= 1;
                                if (maxAttempts > 0) {
                                    setTimeout(setSelection, 10);
                                }
                            }
                        }, 10);
                    }

                    $scope.digest.fragments[0].text = content
                        /*.replace(/&nbsp;/g, ' ')
                        .replace(/<br\sclass="textaposer"[\s\/]*>/g, '\n')*/
                        .replace(/<[^b]{1}[^>]*>/g, '');

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
                                .replace(/>([\n\r\s]*?)$/g, '>')
                                // remove angular attributes
                                .replace(/data-ng-([a-z\-]+)="([^"]*)"/g, '')
                                .replace(/\n/g, '<br class="textaposer"/>');

                            $scope.select();

                            $content.find('span').bind('click', function () {
                                $scope.focus(this.id);
                            });
                        }
                    }.bind(null, counter), 1);
                });

                element.children('.mask').bind('scroll', function () {
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
