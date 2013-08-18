'use strict';

angular
    .module('textaposer')
    .controller('textaposerTextCtrl', function ($scope, $element, selectionService) {

        $scope.clickFileInput = function () {
            $element.find('input[type=file]').click();
        };

        $scope.focus = function(id) {
            var $equivalent,
                fragment,
                $fragment = $element.find('span[id="' + id + '"]'),
                $mask;

            if ($fragment.hasClass('colored')) {
                fragment = $scope.digest.getFragment(id);
                $equivalent = $element.parent().siblings().find('span[id="' + fragment.equivalent.id + '"]');
                $mask = $element.parent().siblings().find('div.mask');

                $mask.scrollTop($mask.scrollTop() - ($fragment.position().top - $equivalent.position().top));
            }
        };

        $scope.miniMapIsVisible = true;

        $scope.select = function() {
            selectionService.select($scope.selection);
        };

        $scope.toggleMiniMap = function () {
            $scope.miniMapIsVisible = !$scope.miniMapIsVisible;
        };

    });
