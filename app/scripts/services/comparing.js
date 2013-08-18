'use strict';

angular
    .module('textaposer')
    .factory('comparingService', ['Fragment', function ComparingService(Fragment) {

        return {
            compare: function (digests, length, callback) {
                setTimeout(function () {
                    var fragmarks = [],
                        fragments = [],
                        frags,
                        lastClassName = '',
                        lastColorIndex = 0;

                    frags = marcusb_fragcolors_modified(
                        $('<div>' + digests[0].getText() + '</div>'),
                        $('<div>' + digests[1].getText() + '</div>'),
                        length
                    );

                    $('<div>' + frags.original + '</div>').find('br, span').each(function () {
                        var classNames,
                            f,
                            i,
                            length;

                        if (this.nodeName.toLowerCase() === 'span') {
                            f = new Fragment($(this).html(), Fragment.NODE_NAME.SPAN);
                            if (this.className !== '') {
                                if (this.className !== lastClassName) {
                                    lastColorIndex += 1;
                                }
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
                                lastClassName = this.className;
                            }
                        } else {
                            f = new Fragment('', Fragment.NODE_NAME.BR);
                        }
                        fragments.push(f);
                    });
                    digests[0].fragments = fragments;

                    fragments = [];
                    $('<div>' + frags.plagiarism + '</div>').find('br, span').each(function () {
                        var equivalent,
                            f;

                        if (this.nodeName.toLowerCase() === 'span') {
                            f = new Fragment($(this).html(), Fragment.NODE_NAME.SPAN);
                            if (this.className !== '') {
                                equivalent = fragmarks[this.className];
                                equivalent.equivalent = f;
                                f.color = equivalent.color;
                                f.equivalent = equivalent;
                            }
                        } else {
                            f = new Fragment('', Fragment.NODE_NAME.BR);
                        }
                        fragments.push(f);
                    });
                    digests[1].fragments = fragments;

                    callback(digests);
                }, 1);
            }
        };

    }]);
