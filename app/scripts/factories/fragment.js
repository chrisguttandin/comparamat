'use strict';

angular
    .module('textaposer')
    .factory('Fragment', function () {

        function Fragment(text, nodeName) {
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
            this.nodeName = nodeName;
            this.text = text;
        }

        Fragment.NODE_NAME = {
            BR: 'br',
            SPAN: 'span'
        };

        return Fragment;

    });
