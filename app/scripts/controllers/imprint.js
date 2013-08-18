'use strict';

angular
    .module('textaposer')
    .controller('textaposerImprintCtrl', ['$scope', function ($scope) {

        $scope.hide = function() {
            $scope.hidden = true;
        };

        $scope.hidden = true;

    }]);
