'use strict';

angular
    .module('textaposer')
    .controller('textaposerExportCtrl', [
        '$scope', 
        'exportService',
        function (
            $scope,
            exportService
        ) {

            $scope.download = function () {
                $scope.hidden = true;
                exportService.download($scope.title, $scope.leftColumnTitle, $scope.rightColumnTitle, $scope.comment, $scope.filename);
            };

            $scope.filename = 'verglichene-texte-' + new Date().getTime() + '.tex';

            $scope.hide = function() {
                $scope.hidden = true;
            };

            $scope.hidden = true;

            $scope.open = function() {
                $scope.hidden = true;
                exportService.open($scope.title, $scope.leftColumnTitle, $scope.rightColumnTitle, $scope.comment);
            };

            $scope.print = function () {
                $scope.hide();
                // print has to be enclosed in a setTimout call
                // in order to allow the modal to be close before
                setTimeout(print);
            };

        }
    ]);
