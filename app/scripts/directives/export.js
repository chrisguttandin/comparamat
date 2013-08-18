'use strict';

angular
    .module('textaposer')
    .directive('textaposerExport', function () {

        return {
            controller: 'textaposerExportCtrl',
            restrict: 'E',
            scope: {
                comment: '=',
                hidden: '=',
                leftColumnTitle: '=',
                rightColumnTitle: '=',
                title: '='
            },
            templateUrl: 'views/textaposer-export.html'
        };

    });
