'use strict';

angular
    .module('textaposer')
    .factory('DigestList', function () {

        function DigestList(digests) {
            this.digests = digests;
            this.date = new Date().getTime();
        }

        return DigestList;

    });
