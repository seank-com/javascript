/*jslint indent: 4, node: true */
/*global require: false, process: false, readFileSync: false */

// analyzeScans.js
// 
// The third part of a three phase solution for understanding the
// state of an online backup. This is the third swing at trying to 
// reconcile online backups. Analyzes the diff created by compareScans.js 
// to try and detect file moves.
//
var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    getCompare = function (filename, callback) {
        "use strict";

        var result = {};

        fs.readFile(filename, { 'encoding': "utf8" }, function (err, data) {
            if (err) {
                console.log('failed to read scan');
                callback(err, null);
            } else {
                result = JSON.parse(data);

                callback(null, result);
            }
        });
    },
    emitOnFail = function (callback) {
        "use strict";

        return function (err, result) {
            if (err) {
                console.log(err);
            } else if (callback) {
                callback(result);
            }
        };
    },
    processTree = function (input) {
        "use strict";

        var tree = {},
            item = null,
            size = 0,
            name = '',
            i = 0,
            singles = [],
            dupes = {};

        for (item in input) {
            if (input.hasOwnProperty(item)) {
                size = input[item].size;
                name = path.basename(item);

                if (!tree.hasOwnProperty(size)) {
                    tree[size] = {};
                }

                if (!tree[size].hasOwnProperty(name)) {
                    tree[size][name] = [];
                }
                tree[size][name].push(item);
            }
        }

        for (size in tree) {
            if (tree.hasOwnProperty(size)) {
                for (name in tree[size]) {
                    if (tree[size].hasOwnProperty(name)) {
                        if (tree[size][name].length > 1) {
                            if (!dupes.hasOwnProperty(size)) {
                                dupes[size] = {};
                            }

                            console.log('==== ' + name + '(' + size + ')');
                            for (i = 0; i < tree[size][name].length; i += 1) {
                                console.log('  ' + tree[size][name][i]);
                            }

                            dupes[size][name] = tree[size][name];
                        } else {
                            singles.push(tree[size][name][0]);
                        }
                    }
                }
            }
        }

        singles.sort();
        console.log('==== Unmatched Files');

        for (i = 0; i < singles.length; i += 1) {
            console.log('  ' + singles[i]);
        }

    },
    main = function (argc, argv) {
        "use strict";

        var compareResults = function (result) {
                process.nextTick(function () {
                    processTree(result);
                });
            };

        if (argc !== 3) {
            console.log('usage: %s %s <filename>', argv[0], argv[1]);
        } else {
            getCompare(path.resolve('.', argv[2]), emitOnFail(compareResults));
        }
    };

main(argc, argv);
