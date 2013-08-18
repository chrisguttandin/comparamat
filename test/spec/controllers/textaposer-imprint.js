'use strict';

describe('Controller: textaposerImprintCtrl', function () {

    var textaposerImprintCtrl,
        scope;

    // load the controller's module
    beforeEach(module('textaposer'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        textaposerImprintCtrl = $controller('textaposerImprintCtrl', {
            $scope: scope
        });
    }));

    it('should have its expected default values', function () {
        expect(scope.hidden).toBe(true);
    });

});
