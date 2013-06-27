/*global
   Processor
 */
var LaTeXContainer = (function ($, p) {

    'use strict';

    return function (childOrChildren) {

        var i,
            length,
            values = {
                children: []
            },
            laTeXContainer = Object.create({}, {

                children: {
                    get: function () {
                        return values.children;
                    },
                    set: function (value) {
                        if (typeof value !== 'object') {
                            throw new TypeError('children must be a object');
                        }
                        values.children = value;
                    }
                }

            });

        laTeXContainer.addChild = function (child) {
            if (typeof child !== 'string'
                    && (typeof child.toLaTeXBody !== 'function' && typeof child.toLaTeXHeader !== 'function')) {
                throw new TypeError('child must be either a string or a object supporting the toLaTeXBody() and toLaTeXHeader() functions');
            }
            this.children.push(child);
        };

        laTeXContainer.parse = function (parsersArray) {
            var child,
                children = this.children,
                childrenLength = children.length,
                i,
                j,
                parserArray,
                parsersArrayLength = parsersArray.length;

            for (i = 0; i < childrenLength; i += 1) {
                child = children[i];
                for (j = 0; j < parsersArrayLength; j += 1) {
                    parserArray = parsersArray[j];
                    if (typeof child === 'string') {
                        child = parserArray[0].parse(child, parserArray[1]);
                    } else {
                        child.parse([parserArray]);
                    }
                }
                children[i] = child;
            }
            this.children = children;
        };

        laTeXContainer.process = function (processorArray) {
            var child,
                children = this.children,
                childrenLength = children.length,
                i,
                j,
                processor,
                processorArrayLength = processorArray.length;

            for (i = 0; i < childrenLength; i += 1) {
                child = children[i];
                for (j = 0; j < processorArrayLength; j += 1) {
                    processor = processorArray[j];
                    if (typeof child === 'string') {
                        child = processor.call(null, child);
                    } else {
                        child.process([processor]);
                    }
                }
                children[i] = child;
            }
            this.children = children;
        };

        laTeXContainer.toLaTeXBody = function () {
            var child,
                children = this.children,
                i,
                laTeX = '',
                length = children.length;

            for (i = 0; i  < length; i += 1) {
                child = children[i];
                if (typeof child === 'string') {
                    laTeX += child;
                } else {
                    laTeX += child.toLaTeXBody();
                }
            }

            return laTeX;
        };

        laTeXContainer.toLaTeXHeader = function () {
            var child,
                children = this.children,
                i,
                laTeXHeader = '',
                length = children.length;

            for (i = 0; i  < length; i += 1) {
                child = children[i];
                if (typeof child !== 'string') {
                    laTeXHeader += child.toLaTeXHeader();
                }
            }

            return laTeXHeader;
        };

        if (typeof childOrChildren !== 'undefined') {
            if ($.isArray(childOrChildren)) {
                length = childOrChildren.length;
                for (i = 0; i < length; i += 1) {
                    laTeXContainer.addChild(childOrChildren[i]);
                }
            } else {
                laTeXContainer.addChild(childOrChildren);
            }
        }

        // no Object.freeze() to allow method overwriting
        return Object.seal(laTeXContainer);

    };

}(jQuery, Processor));