'use strict';

angular
    .module('textaposer')
    .directive('textaposerMain', function () {

        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            $('body').addClass('firefox');
        }

        return {
            controller: 'textaposerMainCtrl',
            restrict: 'E',
            templateUrl: 'views/textaposer-main.html'
        };

    });
