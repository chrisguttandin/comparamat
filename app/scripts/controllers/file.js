'use strict';

angular
    .module('textaposer')
    .controller('textaposerFileCtrl', function ($scope, Fragment) {

        $scope.path = '';

        $scope.read = function (file) {
            var reader = new FileReader();

            if (file.type === 'text/plain') {
                reader.onload = function(event) {
                    $scope.$apply(function () {
                        $scope.digest.fragments = [new Fragment(event.target.result, Fragment.NODE_NAME.SPAN)];
                    });
                    //$scope.compare();
                };
                reader.readAsText(file);
                $scope.path = file.name;
            } else {
                alert('Dateien vom Typ "' + (file.type || 'unbekannt') + '" können leider nicht gelesen werden.\nBitte verwende einfache Textdateien vom Typ "text/plain".\n\nDanke.');
            }
        };

    });
