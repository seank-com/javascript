/*jslint indent: 4, node: true */
/*global require: false, process: false, readFileSync: false */

var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    getScan = function (filename, callback) {
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
    getDirname = function (tree) {
        "use strict";

        var item = null;

        for (item in tree.files) {
            if (tree.files.hasOwnProperty(item)) {
                return path.dirname(item);
            }
        }

        for (item in tree.folders) {
            if (tree.folders.hasOwnProperty(item)) {
                return path.dirname(item);
            }
        }

        return null;
    },
    compareFiles = function (files1, files2, dir1, dir2) {
        "use strict";

        var item1 = null,
            item2 = null,
            diff = {};

        for (item1 in files1) {
            if (files1.hasOwnProperty(item1)) {
                item2 = path.resolve(dir2, path.basename(item1));
                if (files2.hasOwnProperty(item2)) {
                    if (files1[item1].size !== files2[item2].size) {
                        diff[item1] = {};
                        diff[item1].size = files1[item1].size;
                        diff[item2] = {};
                        diff[item2].size = files2[item2].size;
                    }
                } else {
                    diff[item1] = {};
                    diff[item1].size = files1[item1].size;
                }
            }
        }

        for (item2 in files2) {
            if (files2.hasOwnProperty(item2)) {
                item1 = path.resolve(dir1, path.basename(item2));
                if (!files1.hasOwnProperty(item1)) {
                    diff[item2] = {};
                    diff[item2].size = files2[item2].size;
                }
            }
        }

        return diff;
    },
    mergeDiff = function (diff1, diff2) {
        "use strict";

        var item = null;

        for (item in diff2) {
            if (diff2.hasOwnProperty(item)) {
                diff1[item] = {};
                diff1[item].size = diff2[item].size;
            }
        }

        return diff1;
    },
    dumpFiles = function (tree) {
        "use strict";

        var item = null,
            diff = {};

        for (item in tree.files) {
            if (tree.files.hasOwnProperty(item)) {
                diff[item] = {};
                diff[item].size = tree.files[item].size;
            }
        }

        for (item in tree.folders) {
            if (tree.folders.hasOwnProperty(item)) {
                diff = mergeDiff(diff, dumpFiles(tree.folders[item]));
            }
        }

        return diff;
    },
    compareFolders = function (folders1, folders2, dir1, dir2, callback) {
        "use strict";

        var item1 = null,
            item2 = null,
            diff = {};

        for (item1 in folders1) {
            if (folders1.hasOwnProperty(item1)) {
                item2 = path.resolve(dir2, path.basename(item1));
                if (folders2.hasOwnProperty(item2)) {
                    diff = mergeDiff(diff, callback(folders1[item1], folders2[item2]));
                } else {
                    diff = mergeDiff(diff, dumpFiles(folders1[item1]));
                }
            }
        }
        for (item2 in folders2) {
            if (folders2.hasOwnProperty(item2)) {
                item1 = path.resolve(dir1, path.basename(item2));
                if (!folders1.hasOwnProperty(item1)) {
                    diff = mergeDiff(diff, dumpFiles(folders2[item2]));
                }
            }
        }

        return diff;
    },
    compareTrees = function (tree1, tree2) {
        "use strict";

        var dir1 = getDirname(tree1),
            dir2 = getDirname(tree2),
            diff = {};

        if (!dir1) {
            return dumpFiles(tree2);
        }

        if (!dir2) {
            return dumpFiles(tree1);
        }

        diff = compareFiles(tree1.files, tree2.files, dir1, dir2);
        diff = mergeDiff(compareFolders(tree1.folders, tree2.folders, dir1, dir2, compareTrees));

        return diff;
    },
    main = function (argc, argv) {
        "use strict";

        var tree1 = null,
            tree2 = null,
            continueWhenDone = function () {
                var diff = [];

                if (tree1 && tree2) {
                    process.nextTick(function () {
                        diff = compareTrees(tree1, tree2);
                        fs.writeFile(path.resolve('.', argv[4]), JSON.stringify(diff), emitOnFail(null));
                    });
                }
            },
            processTree1 = function (result) {
                tree1 = result;
                continueWhenDone();
            },
            processTree2 = function (result) {
                tree2 = result;
                continueWhenDone();
            };

        if (argc !== 5) {
            console.log('usage: %s %s <filename> <filename> <output>', argv[0], argv[1]);
        } else {
            getScan(path.resolve('.', argv[2]), emitOnFail(processTree1));
            getScan(path.resolve('.', argv[3]), emitOnFail(processTree2));
        }
    };

main(argc, argv);
