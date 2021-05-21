/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// compareDirs.js
//
// Second swing at trying to reconcile online backups. 
// Takes the roots of two folders and diffs them.
//
var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    processDirectory = function (dir) {
        "use strict";

        var dirbase = path.parse(dir).base,
            files = fs.readdirSync(dir).sort();

        console.log("cd %s", dirbase);

        files.forEach(file => {
            var filepath = path.resolve(dir, file),
            filebase = path.parse(filepath).base,
            stat = {};
            try {
                stat = fs.statSync(filepath);
                if (stat.isDirectory()) {
                    processDirectory(filepath);
                } else if (stat.isFile()) {
                    console.log("ren %s %s-%s", filebase, dirbase, filebase);
                }
            } catch (err) {
                console.log("REM Path not found: %s", err.path);
            }
        });

        console.log("cd ..");
    },
    main = function (argc, argv) {
        "use strict";

        if (argc !== 3) {
            console.log('usage: %s %s dir', argv[0], argv[1]);
        } else {
            processDirectory(path.resolve('.', argv[2]));
        }
    };

main(argc, argv);
