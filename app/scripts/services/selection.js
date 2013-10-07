'use strict';

angular
    .module('textaposer')
    .factory('selectionService', function SelectionService() {

        // $(node).parents('.content').length > 0
        function hasContentAsParent(node) {
            node = node.parentNode;

            while (node) {
                if (node.className && node.className.match(/content/)) {
                    return true;
                }
                node = node.parentNode;
            }

            return false;
        }

        // $(node).prev().length
        function prevLength(node) {
            var length = 0;

            node = node.previousSibling;

            while (node) {
                if (node.nodeType === 1) {
                    length += 1;
                }
                node = node.previousSibling;
            }

            return length;
        }

        // $(node).prevAll().text()
        function textOfAllPrevious(node) {
            var text = '';
            
            node = node.previousSibling;

            while (node) {
                text += node.textContent;
                node = node.previousSibling;
            }

            return text;
        }

        return {

            detect: function () {
                var current,
                    range,
                    selection = window.getSelection(),
                    offset;

                // check if there is a range
                if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                    offset = range.startOffset;

                    current = range.startContainer;

                    // check if the range is inside .content
                    if (hasContentAsParent(range.startContainer)) {
                        while (!angular.element(current).hasClass('content')) {
                            offset += textOfAllPrevious(current).length;
                            current = current.parentNode;
                        }
                        return {
                            fragment: prevLength(current.parentNode.parentNode.parentNode),
                            offset: offset
                        };
                    }
                    // check if the range's startContainer is .content itself
                    if (angular.element(current).hasClass('content')) {
                        return {
                            fragment: prevLength(current.parentNode.parentNode.parentNode),
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
                var content,
                    i,
                    nodes,
                    nodesLength,
                    range,
                    remainingOffset = selection.offset,
                    startContainer,
                    textLength;

                if (selection.fragment > -1 && remainingOffset > -1) {
                    content = document.getElementsByTagName('x-textaposer-text')[selection.fragment].getElementsByClassName('content')[0];
                    nodes = content.childNodes;
                    nodesLength = nodes.length;

                    for (i = 0; i < nodesLength; i += 1) {
                        startContainer = nodes[i];
                        textLength = startContainer.textContent.length;

                        if (textLength < remainingOffset) {
                            remainingOffset -= textLength;
                        } else {
                            range = document.createRange();

                            while (startContainer.nodeType !== 3) {
                                startContainer = startContainer.childNodes[0];
                                if (startContainer.nodeName === 'BR') {
                                    startContainer = startContainer.parentNode;
                                    break;
                                }
                                length = startContainer.textContent.length;
                                while (length < remainingOffset) {
                                    remainingOffset -= length;
                                    startContainer = startContainer.nextSibling;
                                    length = startContainer.textContent.length;
                                }
                            }
                            selection = window.getSelection();
                            range.setStart(startContainer, remainingOffset);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            content.focus();
                            break;
                        }
                    }
                }
            }

        };

    });
