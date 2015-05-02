/*jslint indent: 4, node: true */
/*global require: false, process: false */

// findAllWords.js
//
// Given a word search puzzle in json format, create all 
// combinations of horizontal, vertical and diagonal words 
// and check them against a list of known English words 
// reporting any found.
//
var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    wordlist = {},
    loadJSON = function (filename, callback) {
        "use strict";

        var result = {};

        fs.readFile(filename, { 'encoding': "utf8" }, function (err, data) {
            if (err) {
                console.log('failed to read operation chain');
                callback(err, null);
            } else {
                result = JSON.parse(data);

                callback(null, result);
            }
        });
    },
    findWords = function (line) {
        "use strict";

        var wordLength = 0,
            index = 0,
            word = '';

        for (wordLength = 4; wordLength <= line.length; wordLength += 1) {
            for (index = 0; index < line.length - wordLength + 1; index += 1) {
                word = line.substr(index, wordLength);
                if (wordlist.indexOf(word) !== -1) {
                    console.log(word);
                }
            }
        }
    },
    permuteBoard = function (board) {
        "use strict";

        var i = 0,
            line = '',
            mapColumn = function (index) {
                return function (row) {
                    return row[index];
                };
            },
            mapDiagonalDownLeft = function (index) {
                return function (row) {
                    var result = "";
                    if (index >= 0) {
                        result = row[index];
                        index -= 1;
                    }
                    return result;
                };
            },
            mapDiagonalDownRight = function (index) {
                return function (row) {

                    var result = "";
                    if (index < row.length) {
                        result = row[index];
                        index += 1;
                    }
                    return result;
                };
            };

        console.log('----------ROWS');
        for (i = 0; i < board.maxY; i += 1) {
            line = board.matrix[i].join("");
            findWords(line);
        }
        console.log('----------COLUMNS');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.map(mapColumn(i)).join("");
            findWords(line);
        }
        console.log('----------DIAGONALS DOWN LEFT');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.map(mapDiagonalDownLeft(i)).join("");
            findWords(line);
        }
        console.log('----------DIAGONALS DOWN RIGHT');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.map(mapDiagonalDownRight(i)).join("");
            findWords(line);
        }
        console.log('----------DIAGONALS UP LEFT');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.reverse().map(mapDiagonalDownLeft(i)).join("");
            findWords(line);
        }
        console.log('----------DIAGONALS UP RIGHT');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.reverse().map(mapDiagonalDownRight(i)).join("");
            findWords(line);
        }
        console.log('----------ROWS REVERSED');
        for (i = 0; i < board.maxY; i += 1) {
            line = board.matrix[i].reverse().join("");
            findWords(line);
        }
        console.log('----------COLUMNS REVERSED');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.map(mapColumn(i)).reverse().join("");
            findWords(line);
        }
        console.log('----------DIAGONALS DOWN LEFT REVERSED');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.map(mapDiagonalDownLeft(i)).reverse().join("");
            findWords(line);
        }
        console.log('----------DIAGONALS DOWN RIGHT REVERSED');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.map(mapDiagonalDownRight(i)).reverse().join("");
            findWords(line);
        }
        console.log('----------DIAGONALS UP LEFT REVERSED');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.reverse().map(mapDiagonalDownLeft(i)).reverse().join("");
            findWords(line);
        }
        console.log('----------DIAGONALS UP RIGHT REVERSED');
        for (i = 0; i < board.maxX; i += 1) {
            line = board.matrix.reverse().map(mapDiagonalDownRight(i)).reverse().join("");
            findWords(line);
        }
    },
    getBoard = function (rows) {
        "use strict";

        var result = { 'matrix' : []},
            Y = 0,
            maxX = 0;

        result.maxY = rows.length;

        for (Y = 0; Y < result.maxY; Y += 1) {
            if (maxX !== 0 && rows[Y].length !== maxX) {
                return "row " + Y + "is " + rows[Y].length +
                    " characters. All the other rows are " + maxX + " characters.";
            }
            maxX = rows[Y].length;
            result.maxX = maxX;
            result.matrix[Y] = rows[Y].toUpperCase().split("");
        }

        return result;
    },
    validateBoard = function (rows) {
        "use strict";

        var board = getBoard(rows);

        if (typeof board !== "object") {
            console.log(board);
        } else {
            loadJSON(path.resolve('.', 'wordlist.json'), function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    wordlist = result;
                    permuteBoard(board);
                }
            });
        }
    },
    main = function (argc, argv) {
        "use strict";

        if (argc < 3) {
            console.log('usage: %s %s <board>', argv[0], argv[1]);
        } else {
            loadJSON(path.resolve('.', argv[2]), function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    validateBoard(result);
                }
            });
        }
    },
    argv = process.argv,
    argc = argv.length;

if (!String.prototype.format) {
    String.prototype.format = function () {
        "use strict";

        var args = arguments;

        // If we are passed an array then just use that.
        if (args.length === 1 && typeof args[0] === "object") {
            args = args[0] || [];
        }

        return this.replace(/\{(\d+)\}/g, function (match, number) {
            var result = args[number] || match;
            return result;
        });
    };
}

main(argc, argv);
