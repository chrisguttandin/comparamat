'use strict';

angular
    .module('textaposer')
    .controller('textaposerTextCtrl', function ($scope, $element, selectionService) {

        $scope.clickFileInput = function () {
            $element.contents().parent()[0].getElementsByTagName('input')[0].click();
        };

        function getSiblings(node) {
            var child,
                children,
                i,
                length,
                siblings;

            children = node.parentNode.childNodes;
            length = children.length;
            siblings = [];

            for (i = 0; i < length; i += 1) {
                child = children[i];

                if (child.nodeType === 1 && child !== node) {
                    siblings.push(child);
                }
            }

            return siblings;
        }

        $scope.focus = function(id) {
            var equivalent,
                fragment,
                $fragment,
                i,
                length,
                mask,
                siblings;

            fragment = $element.contents().parent()[0].getElementsByClassName('similarity-' + id)[0];
            $fragment = angular.element(fragment)

            if ($fragment.hasClass('colored')) {
                siblings = getSiblings($element.contents().parent().parent()[0]);
                length = siblings.length;

                for (i = 0; i < length; i += 1) {
                    equivalent = siblings[i].getElementsByClassName('similarity-' + id)[0];
                    mask = siblings[i].getElementsByClassName('mask')[0];

                    mask.scrollTop = mask.scrollTop - (fragment.getBoundingClientRect().top - equivalent.getBoundingClientRect().top);
                }
            }
        };

        $scope.miniMapIsVisible = false; //true;

        $scope.select = function() {
            selectionService.select($scope.selection);
        };

        $scope.toggleMiniMap = function () {
            $scope.miniMapIsVisible = !$scope.miniMapIsVisible;
        };

    });
