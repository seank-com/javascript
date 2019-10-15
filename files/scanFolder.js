/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// scanFolder.js
// 
// The first part of a three phase solution for understanding the
// state of an online backup. This is the third swing at trying to 
// reconcile online backups. Scans a folder hierachy noting file names 
// and sizes along the way.
//
var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    scanFolder = function (dir, callback) {
        "use strict";

        var folderInfo = {
                files: {},
                folders: {},
            },
            processCount = 0,
            processFile = function (element) {
                var pathname = path.resolve(dir, element);

                fs.stat(pathname, function (err, stats) {
                    if (err) {
                        console.log('failed to get stats');
                        callback(err, null);
                    } else {
                        if (stats.isDirectory()) {
                            scanFolder(pathname, function (err, result) {
                                if (err) {
                                    console.log('failed to get scanFolder');
                                    callback(err, null);
                                } else {
                                    folderInfo.folders[pathname] = result;

                                    processCount -= 1;
                                    if (processCount === 0) {
                                        callback(null, folderInfo);
                                    }
                                }
                            });
                        } else {
                            processCount -= 1;
                            folderInfo.files[pathname] = {};
                            folderInfo.files[pathname].size = stats.size;

                            if (processCount === 0) {
                                callback(null, folderInfo);
                            }
                        }
                    }
                });
            };

        console.log('Scanning ' + dir);

        fs.readdir(dir, function (err, files) {
            if (err) {
                console.log('failed to read directory');
                callback(err, null);
            } else {
                processCount = files.length;
                if (processCount === 0) {
                    callback(null, folderInfo);
                } else {
                    files.forEach(processFile);
                }
            }
        });
    },
    main = function (argc, argv) {
        "use strict";

        if (argc !== 4) {
            console.log('usage: %s %s <directory> <filename>', argv[0], argv[1]);
        } else {
            scanFolder(path.resolve('.', argv[2]), function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    JSON.stringify(result, null, "\r\n");
                    fs.writeFile(path.resolve('.', argv[3]), JSON.stringify(result, null, 2), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
    };

main(argc, argv);
