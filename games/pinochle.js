/*jslint indent: 4, node: true, stupid: true */
/*global require: false */

/*
 * pinochle.js
 * 
 * Shuffles and deals a doubledeck pinochle hand 100,000 times,
 * counting the meld in each players hand and collecting
 * stats on the best meld seen.
 */
var argv = process.argv,
    argc = argv.length,
    /*
     * A double deck pinochle deck contains 80 cards
     * for of each face (ace, ten, king, queen, jack)
     * in each suit (spades, hearts, clubs, diamonds)
     */
    deck = [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
            40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
            50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
            60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
            70, 71, 72, 73, 74, 75, 76, 77, 78, 79 ],
    /*
     * Suit identifiers
     */
    spades = 0,
    hearts = 1,
    clubs = 2,
    diamonds = 3,
    /*
     * face identifiers
     */
    ace = 0,
    ten = 1,
    king = 2,
    queen = 3,
    jack = 4,
    /*
     * pseudo face identifiers and scoring matrix
     */
    pinochle = 5,
    marriage = 6,
    run = 7,
    /*
     * The points matrix takes the meldType (ace, ten, king, queen, jack, pinochle, marriage, run)
     * and the count (none, single, double, triple, quadruple) and returns the points.
     * Notice there are no points for any number of ten cards. Additionally, marriages are merely counted
     * twice in trump and since a run includes the double points for the marriage contained therein we
     * we subtract its value and count it seperately so a run = 11 + 4 from the marriage.
     */
    pointsTable = [
        [0, 10, 100, 1000, 10000],
        [0, 0, 0, 0, 0],
        [0, 8, 80, 800, 8000],
        [0, 6, 60, 600, 6000],
        [0, 4, 40, 400, 4000],
        [0, 4, 30,  90, 180],
        [0, 2, 4, 6, 8],
        [0, 11, 142, 1488, 14984],
    ],
    /*
     * Symbols used for console output
     */
    spadeSymbol = "\u2660",
    heartSymbol = "\u2665",
    diamondSymbol = "\u2666",
    clubSymbol = "\u2663",
    /*
     * Used by the Array.sort to sort card by order of id.
     */
    cardCompare = function (a, b) {
        "use strict";

        return a - b;
    },
    /*
     * Given a card id (0-79) returns the suit (spades, heartss, clubs, diamonds)
     */
    suitFromId = function (id) {
        "use strict";

        return Math.floor(id / 20);
    },
    /*
     * Given a card id (0-79) returns the face (ace, ten, king, queen, jack)
     */
    faceFromId = function (id) {
        "use strict";

        return Math.floor((id % 20) / 4);
    },
    /*
     * Given a suit (spades, heartss, clubs, diamonds) and face (ace, ten, king, queen, jack),
     * returns the first card id (0-79)
     */
    firstIdFromSuitFace = function (suit, face) {
        "use strict";

        return suit * 20 + face * 4;
    },
    /*
     * Returns the total number of card ids with the designated suit and face contained in the designated hand
     */
    countOf = function (hand, face, suit) {
        "use strict";

        var i,
            begin = firstIdFromSuitFace(suit, face),
            end = begin + 4,
            count = 0;
        for (i = begin; i < end; i += 1) {
            if (hand.indexOf(i) !== -1) {
                count += 1;
            }
        }

        return count;
    },
    /*
     * returns a matrix containing counts by suit (spades, hearts, clubs, diamonds) 
     * and face (ace, ten, kings, queen, jack) of the cards contained in hand 
     */
    countsFromHand = function (hand) {
        "use strict";

        var suit,
            face,
            counts = [ [], [], [], []];

        for (suit = spades; suit <= diamonds; suit += 1) {
            for (face = ace; face <= jack; face += 1) {
                counts[suit][face] = countOf(hand, face, suit);
            }
        }

        return counts;
    },
    /*
     * returns
     */
    meldFromHand = function (hand) {
        "use strict";

        var result = {},
            counts = countsFromHand(hand),
            face,
            suit,
            count,
            trump,
            points;

        result.basePoints = 0;
        result.trump = [
            { points: 0, show: [[], [], [], []], },
            { points: 0, show: [[], [], [], []], },
            { points: 0, show: [[], [], [], []], },
            { points: 0, show: [[], [], [], []], }
        ];

        for (face = ace; face <= jack; face += 1) {
            count = 4;
            for (suit = spades; suit <= diamonds; suit += 1) {
                // collect the count of rounds (one in each suit)
                count = Math.min(count, counts[suit][face]);

                // initialize show to 0
                for (trump = spades; trump <= diamonds; trump += 1) {
                    result.trump[trump].show[suit][face] = 0;
                }
            }

            points = pointsTable[face][count];
            result.basePoints += points;

            // if a round is worth points then add it to the show
            if (points > 0) {
                for (suit = spades; suit <= diamonds; suit += 1) {
                    for (trump = spades; trump <= diamonds; trump += 1) {
                        result.trump[trump].show[suit][face] = count;
                    }
                }
            }
        }

        count = Math.min(counts[spades][queen], counts[diamonds][jack]);
        result.basePoints += pointsTable[pinochle][count];

        // if there is a pinochle then add it to the show
        if (count > 0) {
            for (trump = spades; trump <= diamonds; trump += 1) {
                result.trump[trump].show[spades][queen] = Math.max(result.trump[trump].show[spades][queen], count);
                result.trump[trump].show[diamonds][jack] = Math.max(result.trump[trump].show[diamonds][jack], count);
            }
        }

        for (suit = spades; suit <= diamonds; suit += 1) {
            count = Math.min(counts[suit][king], counts[suit][queen]);
            points = pointsTable[marriage][count];
            result.basePoints += points;

            result.trump[suit].points += points;

            // if there is a marriage add it to the show
            if (count > 0) {

                for (trump = spades; trump <= diamonds; trump += 1) {
                    result.trump[trump].show[suit][king] = Math.max(result.trump[trump].show[suit][king], count);
                    result.trump[trump].show[suit][queen] = Math.max(result.trump[trump].show[suit][queen], count);
                }
            }

            count = 4;
            for (face = ace; face <= jack; face += 1) {
                count = Math.min(count, counts[suit][face]);
            }

            result.trump[suit].points += pointsTable[run][count];

            if (count > 0) {
                for (face = ace; face <= jack; face += 1) {
                    result.trump[suit].show[suit][face] = Math.max(result.trump[suit].show[suit][face], count);
                }
            }

        }

        for (suit = spades; suit <= diamonds; suit += 1) {
            result.trump[suit].points += result.basePoints;
        }

        return result;
    },
    /*
     * The modern version of the Fisher–Yates shuffle, designed for computer use, 
     * was introduced by Richard Durstenfeld in 1964 and popularized by Donald 
     * E. Knuth in The Art of Computer Programming as "Algorithm P"
     */
    shuffleDeck = function (deck) {
        "use strict";

        var count = deck.length - 1,
            i = 0,
            j = 0;

        for (i = count; i > 0; i -= 1) {
            j = Math.floor(Math.random() * i);
            deck.swap(i, j);
        }
    },
    symbolFromSuit = function (suit) {
        "use strict";

        var result = "";

        switch (suit) {
        case spades:
            result = spadeSymbol;
            break;
        case hearts:
            result = heartSymbol;
            break;
        case clubs:
            result = clubSymbol;
            break;
        case diamonds:
            result = diamondSymbol;
            break;
        }

        return result;
    },
    symbolFromFace = function (face) {
        "use strict";

        var result = "";

        switch (face) {
        case ace:
            result = "A";
            break;
        case ten:
            result = "T";
            break;
        case king:
            result = "K";
            break;
        case queen:
            result = "Q";
            break;
        case jack:
            result = "J";
            break;
        }

        return result;
    },
    cardFromId = function (id) {
        "use strict";

        var result = {};

        result.suit = symbolFromSuit(suitFromId(id));
        result.face = symbolFromFace(faceFromId(id));

        return result;
    },
    dumpHand = function (hand) {
        "use strict";

        var card,
            i,
            msg = "",
            count = hand.length;

        for (i = 0; i < count; i += 1) {
            card = cardFromId(hand[i]);
            msg += card.face + card.suit + " ";
        }

        console.log(msg);
    },
    dumpMeld = function (meld) {
        "use strict";

        var msg = "",
            trump,
            suit,
            face,
            count,
            i;

        for (trump = spades; trump <= diamonds; trump += 1) {
            msg += "- " + meld.trump[trump].points + " in " + symbolFromSuit(trump) + " --- ";

            for (suit = spades; suit <= diamonds; suit += 1) {
                for (face = ace; face <= jack; face += 1) {
                    count = meld.trump[trump].show[suit][face];
                    for (i = 0; i < count; i += 1) {
                        msg += symbolFromFace(face) + symbolFromSuit(suit) + " ";
                    }
                }
            }
            msg += "\r\n";
        }

        console.log(msg);
    },
    main = function (argc, argv) {
        "use strict";

        var now = new Date(Date.now()),
            //out = '',
            i,
            north,
            east,
            south,
            west,
            meld,
            best = 0,
            msg = '';

        if (argc !== 2) {
            console.log('usage: %s %s dir dir out', argv[0], argv[1]);
        } else {
            //out = path.resolve('.', argv[4]);
            msg = "# scan began {0}-{1}-{2} {3}:{4}".format(now.getMonth(), now.getDate(), now.getFullYear(), now.getHours(), now.getMinutes());

            //fs.writeFileSync(out, msg + '\r\n');
            console.log(msg);

            for (i = 0; i < 100000; i += 1) {
                shuffleDeck(deck);

                north = deck.slice(0, 20).sort(cardCompare);
                east = deck.slice(20, 40).sort(cardCompare);
                south = deck.slice(40, 60).sort(cardCompare);
                west = deck.slice(60, 80).sort(cardCompare);

                dumpHand(north);
                meld = meldFromHand(north);
                best = Math.max(best, meld.trump[spades].points, meld.trump[hearts].points, meld.trump[clubs].points, meld.trump[diamonds].points);
                dumpMeld(meld);

                dumpHand(east);
                meld = meldFromHand(east);
                best = Math.max(best, meld.trump[spades].points, meld.trump[hearts].points, meld.trump[clubs].points, meld.trump[diamonds].points);
                dumpMeld(meld);

                dumpHand(south);
                meld = meldFromHand(south);
                best = Math.max(best, meld.trump[spades].points, meld.trump[hearts].points, meld.trump[clubs].points, meld.trump[diamonds].points);
                dumpMeld(meld);

                dumpHand(west);
                meld = meldFromHand(west);
                best = Math.max(best, meld.trump[spades].points, meld.trump[hearts].points, meld.trump[clubs].points, meld.trump[diamonds].points);
                dumpMeld(meld);
            }

            console.log('\r\n Best meld found = ' + best + '\r\n');

            now =  new Date(Date.now());
            msg = "# scan end {0}-{1}-{2} {3}:{4}".format(now.getMonth(), now.getDate(), now.getFullYear(), now.getHours(), now.getMinutes());

            //fs.appendFileSync(out, msg + '\r\n');
            console.log(msg);
        }
    };

/* 
 * Add C# style Format function to String prototype 
 */
if (!String.prototype.format) {
    String.prototype.format = function () {
        "use strict";

        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function (match, number) {
            var result = args[number] || match;
            return result;
        });
    };
}

/*
 * Add swap function to Array prototype
 */
if (!Array.prototype.swap) {
    Array.prototype.swap = function (i, j) {
        "use strict";

        var t = this[i];
        this[i] = this[j];
        this[j] = t;
        return this;
    };
}

main(argc, argv);
