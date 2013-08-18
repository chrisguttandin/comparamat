'use strict';

describe('Controller: textaposerExportCtrl', function () {

    var textaposerExportCtrl,
        scope;

    // load the controller's module
    beforeEach(module('textaposer'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        textaposerExportCtrl = $controller('textaposerExportCtrl', {
            $scope: scope
        });
    }));

    it('should have its expected default values', function () {
        expect(scope.hidden).toBe(true);
    });

});
