/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// printTree.js
//
// There used to be a command line program that would print 
// a directory tree to the console. Here is my try at writing
// it in node real quick.
//
var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    getLines = function (count) {
        "use strict";

        var i = 0,
            result = '';

        for (i = 0; i< count; i += 1) {
            result += '| ';
        }
        return result;
    },
    printDirectories = function (dir, depth) {
        "use strict";

        var files = fs.readdirSync(dir).sort(),
            count  = files.length,
            i = 0,
            file = '',
            stat = {},
            msg = '';

        for (i = 0; i < count; i += 1) {
            file = path.resolve(dir, files[i]);

            try {
                stat = fs.statSync(file);
                if (stat.isDirectory()) {
                    msg = getLines(depth) + '+-' + path.basename(file);
                    console.log(msg);

                    printDirectories(file, depth + 1);
                } // else if (stat.isFile()) {
//              }
            } catch (err) {
                msg = '# Path not found: {0}'.format(err.path);
                console.log(msg);
            }
        }
    },
    main = function (argc, argv) {
        "use strict";

        var dir = '',
            msg = '';

        if (argc !== 3) {
            console.log('usage: %s %s dir', argv[0], argv[1]);
        } else {
            dir = path.resolve('.', argv[2]);
            msg = path.basename(dir);

            console.log(msg);

            printDirectories(dir, 0);
        }
    };

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

main(argc, argv);
