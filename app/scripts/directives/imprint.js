'use strict';

angular
    .module('textaposer')
    .directive('textaposerImprint', function () {

        return {
            controller: 'textaposerImprintCtrl',
            restrict: 'E',
            scope: {
                hidden: '='
            },
            templateUrl: 'views/textaposer-imprint.html'
        };

    });
