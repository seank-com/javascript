/*jslint indent: 4, node: true, stupid: true*/
/*global require: false, process: false, readFileSync: false, touchPath: true */
var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length;

function enumPaths(pathname, num) {
    "use strict";

    var files = fs.readdirSync(pathname).sort(),
        count  = files.length,
        i = 0,
        file = '';

    for (i = 0; i < count; i += 1) {
        file = path.resolve(pathname, files[i]);

        touchPath(file, num);
    }
}

function touchPath(pathname, num) {
    "use strict";

    var sec = num * 24 * 60 * 60,
        stat = {};

    try {
        stat = fs.statSync(pathname);
        fs.utimesSync(pathname, (stat.atime / 1000) - sec, (stat.mtime / 1000) - sec);

        if (stat.isDirectory()) {
            enumPaths(pathname, num);
        }
    } catch (err) {
        console.log(err);
    }
}

function main(argc, argv) {
    "use strict";

    if (argc !== 4) {
        console.log('usage: %s %s dir num', argv[0], argv[1]);
    } else {
        touchPath(argv[2], argv[3]);
    }
}

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
