'use strict';

describe('Service: comparingService', function () {

    var comparingService,
        Digest,
        Fragment,
        Line;

    // load the service's module
    beforeEach(module('textaposer'));

    // instantiate comparingService, Digest, Line and Fragment
    beforeEach(inject(function (_comparingService_, _Digest_, _Fragment_, _Line_) {
        comparingService = _comparingService_;
        Digest = _Digest_;
        Fragment = _Fragment_;
        Line = _Line_;
    }));

    it('should be there :-)', function () {
        expect(comparingService).toBeDefined();
    });

    describe('Method: compareDigests()', function () {

        it('should compare nothing', function () {
            var digests = [
                    new Digest([
                        new Line([
                            new Fragment(
                                'Eins zwei drei vier.',
                                Fragment.NODE_NAME.SPAN
                            )
                        ])
                    ]),
                    new Digest([
                        new Line([
                            new Fragment(
                                'Eins zwei drei vier.',
                                Fragment.NODE_NAME.SPAN
                            )
                        ])
                    ])
                ];

            comparingService.compareDigests(digests, 3, function(digests) {

                expect(digests.length).toBe(2);

                expect(digests[0].lines.length).toBe(1);
                expect(digests[0].lines[0].fragments.length).toBe(1);
                expect(digests[0].lines[0].fragments[0].text).toBe('Eins zwei drei vier.');

                expect(digests[1].lines.length).toBe(1);
                expect(digests[1].lines[0].fragments.length).toBe(1);
                expect(digests[1].lines[0].fragments[0].text).toBe('Eins zwei drei vier.');

            });
        });

    });

    describe('Method: _compareTokenSets()', function () {

        it('should compare nothing', function () {
            expect(comparingService._compareTokenSets([], 3)).toEqual([]);
        });

        it('should compare two simple token sets', function () {
            expect(comparingService._compareTokenSets([
                ['one', 'two', 'three'],
                ['one', 'two', 'three']
            ], 3)).toEqual([
                [1, 0, 0, 0, 3]
            ]);
        });

        it('should compare a more complex token sets', function () {
            expect(comparingService._compareTokenSets([
                ['one', 'two', 'three', 'four', 'five'],
                ['three', 'four', 'five', 'six']
            ], 3)).toEqual([
                [1, 0, 0, 2, 3]
            ]);
        });

    });

    describe('Method: _sortSplittedSimilarities()', function () {

        it('should sort nothing', function () {
            expect(comparingService._sortSplittedSimilarities([])).toEqual([]);
        });
        
        it('should sort an array of arrays', function () {
            expect(comparingService._sortSplittedSimilarities([
                [50, 2, 1], [1, 0, 2], [3, 4, 3], [6, 2, 4]
            ])).toEqual([
                [1, 0, 2], [3, 4, 3], [6, 2, 4], [50, 2, 1]
            ]);
        });

    });

    describe('Method: _splitSimilarities()', function () {

        it('should split nothing', function () {
            expect(comparingService._splitSimilarities([])).toEqual([]);
        });

        it('should split similarities and leave the parameter unmodified', function () {
            var similarities = [[1, 0, 0, 2, 3, 1, 0], [1, 5, 0, 4, 3, 2, 1]];

            expect(comparingService._splitSimilarities(similarities)).toEqual([
                [
                    [2, 3, 1, 0],
                    [4, 3, 2, 1]
                ],
                [
                    [0, 3, 1, 0],
                    [5, 3, 2, 1]
                ]
            ]);
            expect(similarities).toEqual([[1, 0, 0, 2, 3, 1, 0], [1, 5, 0, 4, 3, 2, 1]]);
        });

    });

    describe('Method: _tokenize()', function () {

        it('should tokenize', function () {
            expect(comparingService._tokenize(['oNE', 'twO', 'THRee', 'fOUr', 'FIve'])).toEqual({
                map: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
                tokens: ['one', 'two', 'three', 'four', 'five']
            });
        });

        it('should tokenize .', function () {
            expect(comparingService._tokenize(['oNE', 'twO', ' ', 'THRee', 'fOUr', '\n', 'FIve'])).toEqual({
                map: [[0, 0], [1, 1], [2, 3], [3, 4], [4, 6]],
                tokens: ['one', 'two', 'three', 'four', 'five']
            });
        });

        it('should tokenize ..', function () {
            expect(comparingService._tokenize(['Raßen', 'Straßen'])).toEqual({
                map: [[0, 0], [1, 1]],
                tokens: ['rassen', 'strassen']
            });
        });

    });

    describe('Method: _translateSimilarities()', function () {

        it('should translate', function () {
            expect(comparingService._translateSimilarities(
                [[2, 3, 1, 0], [4, 3, 2, 1]],
                [[0, 0], [1, 1], [2, 3], [3, 4], [4, 6], [5, 7], [6, 8], [7, 9], [8, 10], [9, 11]]
            )).toEqual(
                [[3, 4, 1, 0], [6, 3, 2, 1]]
            );
        });

    });

});
