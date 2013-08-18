'use strict';

describe('Controller: textaposerMainCtrl', function () {

    var textaposerMainCtrl,
        scope;

    // load the controller's module
    beforeEach(module('textaposer'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        textaposerMainCtrl = $controller('textaposerMainCtrl', {
            $scope: scope
        });
    }));

    it('should have its expected default values', function () {
        expect(scope.length).toBe(3);
    });

    it('should change the value of exportHidden when showing export modal window', function () {
        scope.showExport();
        expect(scope.exportHidden).toBe(false);
    });

    it('should change the value of imprintHidden when showing imprint modal window', function () {
        scope.showImprint();
        expect(scope.imprintHidden).toBe(false);
    });

});
