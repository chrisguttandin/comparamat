'use strict';

angular
    .module('textaposer')
    .directive('textaposerFile', function() {

        return {
            controller: 'textaposerFileCtrl',
            link: function($scope, element) {
                element.bind('change', function (event) {
                    var file = event.target.files[0];

                    if (file) {
                        $scope.read(file);
                    }
                });
            },
            restrict: 'A'
        };

    });
