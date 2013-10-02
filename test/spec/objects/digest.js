'use strict';

describe('Object: digest', function () {

    var Digest,
        Fragment,
        Line;

    // load the service's module
    beforeEach(module('textaposer'));

    // instantiate Digest, Line and Fragment
    beforeEach(inject(function (_Digest_, _Fragment_, _Line_) {
        Digest = _Digest_;
        Fragment = _Fragment_;
        Line = _Line_;
    }));

    it('should return an empty string and an empty array of words', function () {
        var digest = new Digest([], []);

        expect(digest.getText()).toBe('');
        expect(digest.getWords()).toEqual([]);
    });

    it('should return the text and an array of words', function () {
        var digest = new Digest([
                new Line([
                    new Fragment(
                        'Eins zwei drei vier.',
                        Fragment.NODE_NAME.SPAN
                    )
                ])
            ]);

        expect(digest.getText()).toBe('Eins zwei drei vier.');
        expect(digest.getWords()).toEqual(['Eins', ' ', 'zwei', ' ', 'drei', ' ', 'vier.']);
    });

});