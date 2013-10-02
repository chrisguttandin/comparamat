'use strict';

angular
    .module('textaposer')
    .factory('comparingService', ['Digest', 'Line', 'Fragment', function ComparingService(Digest, Line, Fragment) {

        var comparingService = Object.create(null);

        comparingService._addLinesToDigest = function(digest, lines, beginNewLine, color, index) {
            var fragment,
                i,
                line,
                length;

            length = lines.length;

            for (i = 0; i < length; i += 1) {

                line = lines[i];

                if (line === '' && i === 0) {
                    continue;
                }

                if (line === '' && i === length - 1) {
                    beginNewLine = true;
                    continue;
                }

                if (line === '') {
                    fragment = new Fragment(
                        '',
                        Fragment.NODE_NAME.BR
                    );
                } else {
                    fragment = new Fragment(
                        line,
                        Fragment.NODE_NAME.SPAN
                    );
                    fragment.color = color;
                    fragment.index = index;
                }

                if (beginNewLine || i > 0) {
                    digest.appendLineWithFragment(fragment);
                    beginNewLine = false;
                } else {                    
                    digest.appendFragment(fragment);
                }
            }

            return beginNewLine;
        };

        comparingService._colorizeSimilarities = function (similarities, numberOfColors) {
            var colorizedSimilarities = [],
                i,
                lastColorIndex,
                length,
                similarity;

            lastColorIndex = 1;
            length = similarities.length;

            for (i = 0; i < length; i += 1) {
                similarity = similarities[i];

                similarity.push(lastColorIndex);
                colorizedSimilarities.push(similarity);

                lastColorIndex += 1;
                if (lastColorIndex > numberOfColors) {
                    lastColorIndex = 1;
                }
            }

            return colorizedSimilarities;
        };

        comparingService.compareDigests = function (digests, length, callback) {
            var beginNewLine,
                colorizedSimilarities,
                currentIndex,
                currentSimilarities,
                currentSimilarity,
                currentSimilarityIndex,
                digest,
                digestsLength,
                i,
                indexedSimilarities,
                maps = [],
                result,
                sentence = [],
                similarities,
                similaritiesLength,
                sortedSimilarities,
                splittedSimilarities,
                text,
                tokens = [],
                words;

            digestsLength = digests.length;

            for (i = 0; i < digestsLength; i += 1) {
                digest = digests[i];
                words = digest.getWords();
                result = comparingService._tokenize(words);

                sentence.push(words);
                maps.push(result.map);
                tokens.push(result.tokens);
            }

            similarities = comparingService._compareTokenSets(tokens, length);
            colorizedSimilarities = comparingService._colorizeSimilarities(similarities, 6);
            indexedSimilarities = comparingService._indexSimilarities(colorizedSimilarities);

            similaritiesLength = indexedSimilarities.length;

            if (similaritiesLength > 0) {
                splittedSimilarities = comparingService._splitSimilarities(indexedSimilarities);
                currentSimilarityIndex = 0;
                while (splittedSimilarities.length > 0) {
                    beginNewLine = true;
                    currentIndex = 0;
                    currentSimilarities = splittedSimilarities.shift();
                    sortedSimilarities = comparingService._sortSplittedSimilarities(currentSimilarities);
                    digest = digests[currentSimilarityIndex];
                    words = sentence.shift();

                    sortedSimilarities = comparingService._translateSimilarities(
                        sortedSimilarities,
                        maps.shift()
                    );

                    digest.clear();

                    while (sortedSimilarities.length > 0) {
                        currentSimilarity = sortedSimilarities.shift();
                        if (currentIndex < currentSimilarity[0]) {
                            beginNewLine = comparingService._addLinesToDigest(
                                digest,
                                words.slice(currentIndex, currentSimilarity[0]).join('').split(/\n/),
                                beginNewLine,
                                0,
                                null
                            );
                        }
                        currentIndex = currentSimilarity[0] + currentSimilarity[1];
                        beginNewLine = comparingService._addLinesToDigest(
                            digest,
                            words.slice(currentSimilarity[0], currentIndex).join('').split(/\n/),
                            beginNewLine,
                            currentSimilarity[2],
                            currentSimilarity[3]
                        );
                    }

                    if (currentIndex < words.length) {
                        comparingService._addLinesToDigest(
                            digest,
                            words.slice(currentIndex).join('').split(/\n/),
                            beginNewLine,
                            0,
                            null
                        );
                    }

                    currentSimilarityIndex += 1;
                }
            }

            callback(digests);
        };

        comparingService._compareTokenSets = function (documents, min_run_length) {
            var no_self_similarities = true,

            /* documents is an array of token lists.  Each token list is an array of tokens.
               tokens are strings that must not contain the special "\x01" character.

               The return is a list of matches in the form:
               
               [ doc_1, start_1, doc_2, start_token_2, length ]

               where doc_X are indices into the documents array, and start_X
               are indices into the respective token list of the documents.
            */
                final_match_list = [],
            
            /* For each min_length token run in each document, we store [ doc,
               start ].  */
                match_table = { },

                docs = documents.length,
                documents_len = [],

            // vars to ne used in loop
                doc_idx,
                doc,
                tokens,
                doc_len,
                min_token_idx,
                token_idx,
                match,
                match_loc,
                match_tag,
                best_match,
                matches,
                nr_matches,
                idx,
                match_peer,
                peer_doc_idx,
                peer_doc,
                peer_token_idx,
                peer_len,
                our_token_idx,
                len;

            for (doc_idx = 0; doc_idx < docs; doc_idx++) {
                doc = documents[doc_idx];
                tokens = doc.length - min_run_length + 1;
                doc_len = doc.length;

                /* Record the length of each document.  */
                documents_len[doc_idx] = doc_len;

                if (tokens <= 0) {
                    /* Document is not long enough to have any matches.  */
                    continue;
                }

                /* We don't report another match until we have skipped over
                    all the tokens in the last match.  */
                min_token_idx = 0;

                for (token_idx = 0; token_idx < tokens; token_idx++) {
                    match = doc.slice(token_idx, token_idx + min_run_length);
                    match_loc = [ doc_idx, token_idx ];
                    match_tag = match.join('\x01');

                    if (match_tag in match_table) {
                        if (token_idx >= min_token_idx) {

                            /* If there are matches, find the best and record it.  */
                            best_match = [ doc_idx, token_idx, null, 0, 0 ];
                            matches = match_table[match_tag];
                            nr_matches = matches.length;

                            for (idx = 0; idx < nr_matches; idx++) {
                                match_peer = matches[idx];
                                peer_doc_idx = match_peer[0];
                                peer_doc = documents[peer_doc_idx];
                                peer_token_idx = match_peer[1] + min_run_length;
                                peer_len = documents_len[peer_doc_idx];
                                our_token_idx = token_idx + min_run_length;

                                if (no_self_similarities && peer_doc_idx === doc_idx) {
                                /* Self similarity, skip for now.  FIXME:
                                   Make this an option.  Note: If we allow
                                   self-similarities, there can be
                                   overlapping matches like in: "a b c d a
                                   b c d a b c d" which has matches "[1: a
                                   b c d [2: a b c d :1] a b c d :2],
                                   which is a coloring problem.  */
                                    continue;
                                }

                                while (peer_token_idx < peer_len &&
                                        our_token_idx < doc_len &&
                                        peer_doc[peer_token_idx] === doc[our_token_idx]) {
                        
                                    peer_token_idx++;
                                    our_token_idx++;
                                }
                                len = our_token_idx - token_idx;

                                if (len > best_match[4]) {
                                    /* We found a better match.  */
                                    best_match[2] = match_peer[0];
                                    best_match[3] = match_peer[1];
                                    best_match[4] = len;
                                }
                            }

                            /* Any good match found?  Record it. */
                            if (best_match[2] !== null) {
                                final_match_list.push(best_match);
                                min_token_idx = token_idx + best_match[4];
                            }
                        }

                        /* In any case, we keep this location as a possible future
                            match.  */
                        match_table[match_tag].push(match_loc);
                    } else {
                        match_table[match_tag] = [ match_loc ];
                    }
                }
            }
            return final_match_list;
        };

        comparingService._indexSimilarities = function (similarities) {
            var i,
                indexedSimilarities,
                length,
                similarity;

            indexedSimilarities = [];
            length = similarities.length;

            for (i = 0; i < length; i += 1) {
                var similarity = similarities[i];

                similarity.push(i);

                indexedSimilarities.push(similarity);
            }

            return indexedSimilarities;
        };

        comparingService._sortSplittedSimilarities = function (splittedSimilarities) {
            var sortedSimilarities = [];

            if (splittedSimilarities) {
                return splittedSimilarities.sort(function (a, b) {
                    return a[0] - b[0];
                });
            }

            return sortedSimilarities;
        };

        comparingService._splitSimilarities = function (similarities) {
            var i,
                length,
                similarity,
                similarityColor,
                similarityIndex,
                similarityLength,
                similaritiesIndex,
                similarityOffset,
                splittedSimilarities = [];

            length = similarities.length;

            for (i = 0; i < length; i += 1) {
                // clone the array to not cause side effects
                similarity = similarities[i].slice();
                similarityIndex = similarity.pop();
                similarityColor = similarity.pop();
                similarityLength = similarity.pop();

                while (similarity.length > 0) {
                    similarityOffset = similarity.pop();
                    similaritiesIndex = similarity.pop();
                    if (typeof splittedSimilarities[similaritiesIndex] === 'undefined') {
                        splittedSimilarities[similaritiesIndex] = [];
                    }
                    splittedSimilarities[similaritiesIndex].push([similarityOffset, similarityLength, similarityColor, similarityIndex]);
                }    
            }

            return splittedSimilarities;
        };

        comparingService._tokenize = function (words) {
            var i,
                length,
                map = [],
                tokens = [],
                word;

            length = words.length;

            for (i = 0; i < length; i += 1) {
                word = words[i]
                    .replace(/ß/g, 'ss')
                    .replace(/[^a-zA-Z0-9\u0410-\u044F]/g, '')
                    .toLowerCase();

                if (!(word.match(/^[\s]*$/g))) {
                    map.push([tokens.length, i]);
                    tokens.push(word);
                }
            }

            return {
                map: map,
                tokens: tokens
            };
        };

        comparingService._translateSimilarities = function (similarities, map) {
            var i,
                length,
                similarity,
                translatedSimilarities = [];

            length = similarities.length;

            for (i = 0; i < length; i += 1) {
                similarity = similarities[i];

                translatedSimilarities.push([
                    map[similarity[0]][1],
                    map[similarity[0] + similarity[1] - 1][1] - map[similarity[0]][1] + 1,
                    similarity[2],
                    similarity[3]
                ]);
            }

            return translatedSimilarities;
        };

        return {

            _colorizeSimilarities: comparingService._colorizeSimilarities,

            compareDigests: function(digests, length, callback) {
                setTimeout(function () {
                    comparingService.compareDigests(digests, length, callback);
                }, 100);
            },

            _compareTokenSets: comparingService._compareTokenSets,

            _sortSplittedSimilarities: comparingService._sortSplittedSimilarities,

            _splitSimilarities: comparingService._splitSimilarities,

            _tokenize: comparingService._tokenize,

            _translateSimilarities: comparingService._translateSimilarities

        };

    }]);
