'use strict';

describe('textaposer', function () {

    beforeEach(function() {
        browser().navigateTo('/');
    });

    it('should change the length binding', function () {
        expect(input('length').val()).toEqual('3');
        input('length').enter(5);
        //expect(binding('length')).toEqual(5);
        expect(input('length').val()).toEqual('5');
    });

});
