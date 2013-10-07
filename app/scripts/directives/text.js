'use strict';

angular
    .module('textaposer')
    .directive('textaposerText', function () {

        return {

            controller: 'textaposerTextCtrl',

            link: function ($scope, element) {
                var content = element[0].getElementsByClassName('content')[0],
                    $content,
                    contentHeight,
                    scrollTopBeforePrinting;

                $content = angular.element(content);
    
                $scope.$watch('html', function(newValue, oldValue) {
                    $content.find('span').bind('click', function () {
                        $scope.focus(this.id);
                    });
                });

                element.children('.mask').bind('scroll', function () {
                    scrollTopBeforePrinting = this.scrollTop;
                });

                window.matchMedia('print').addListener(function(mql) {
                    if (!mql.matches) { // aka after printing
                        element[0].getElementsByClassName('mask')[0].scrollTop = scrollTopBeforePrinting;
                    }
                });

                //$scope.compare();

                contentHeight = content.getBoundingClientRect().height;
                $content.css({
                    'margin-bottom': contentHeight + 'px',
                    'margin-top': contentHeight + 'px'
                });
                element[0].getElementsByClassName('mask')[0].scrollTop = contentHeight;
                scrollTopBeforePrinting = contentHeight;
            },
            restrict: 'E',
            scope: {
                digest: '=',
                selection: '='
            },
            templateUrl: 'views/textaposer-text.html'
        };

    });
