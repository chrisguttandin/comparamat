'use strict';

angular
    .module('textaposer')
    .factory('selectionService', function SelectionService() {

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

                    $current = $(range.startContainer);

                    // check if the range is inside .content
                    if ($current.parents('div.content').length > 0) {
                        while (!$current.hasClass('content')) {
                            offset += $current.prevAll().text().length;
                            $current = $current.parent();
                        }
                        return {
                            fragment: $current.parents('li').prev().length,
                            offset: offset
                        };
                    }
                    // check if the range's startContainer is .content itself
                    if ($current.hasClass('content')) {
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

                if (selection.fragment > -1 && remainingOffset > -1) {
                    $('x-textaposer-text:eq(' + selection.fragment + ') .content').contents().each(function () {
                        var length = $(this).text().length,
                            range,
                            startContainer;

                        if (length < remainingOffset) {
                            remainingOffset -= length;
                        } else {
                            range = document.createRange();
                            startContainer = this;

                            while (startContainer.nodeType !== 3) {
                                startContainer = $(startContainer).contents()[0];
                                if (startContainer.nodeName === 'BR') {
                                    startContainer = $(startContainer).parent()[0];
                                    return;
                                }
                                length = $(startContainer).text().length;
                                while (length < remainingOffset) {
                                    remainingOffset -= length;
                                    startContainer = $(startContainer).next()[0];
                                    length = $(startContainer).text().length;
                                }
                            }
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
