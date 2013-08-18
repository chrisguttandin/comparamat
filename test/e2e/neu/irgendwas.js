'use strict';

describe('nameme', function () {

    beforeEach(function() {
        browser().navigateTo('/');
    });

    it('should attach a list of awesomeThings to the scope', function () {
        expect(input('length').val()).toEqual('3');
        input('length').enter(5);
        //expect(binding('length')).toEqual(5);
        expect(input('length').val()).toEqual('5');
    });

});
