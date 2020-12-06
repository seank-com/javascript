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
    main = function (argc, argv) {
        "use strict";

        var input = "",
            output = "",
            result = {};

        if (argc !== 4) {
            console.log('usage: %s %s <filename> <filename>', argv[0], argv[1]);
        } else {
            input = path.resolve('.', argv[2]);
            output = path.resolve('.', argv[3]);

            fs.readFile(input, { 'encoding': "utf8" }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    result = JSON.parse(data);
                    fs.writeFile(output, JSON.stringify(result, null, 2), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });    
                }
            });
        }
    };

main(argc, argv);