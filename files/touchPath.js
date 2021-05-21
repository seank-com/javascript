/* jshint esversion: 8, undef: true, unused: true, strict: true, eqeqeq: true, curly: true, bitwise: true */
/* globals require, process, console */

// touchPath.js
//
// Adusts the filetime of a heirarchy of files. Useful for photos taken from a camera where the date was not 
// set correctly. 
//
var path = require('path'),
    fs = require('fs'),
    utimes = require('utimes').utimes,
    argv = process.argv,
    argc = argv.length;

async function enumPaths(pathname, days) {
    "use strict";

    console.log("%s", pathname);
    var files = fs.readdirSync(pathname).sort(),
        count  = files.length,
        i = 0,
        file = '';

    for (i = 0; i < count; i += 1) {
        file = path.resolve(pathname, files[i]);

        await touchPath(file, days);
    }
}

async function touchPath(pathname, days) {
    "use strict";

    var ms = days * 24 * 60 * 60 * 1000,
        target = Date.now() - ms,
        bug = Date.now() - target,
        org= 0,
        stat = {};

    try {
        stat = fs.statSync(pathname);
        if (stat.atime > target || fs.stat.mtime > target) {
            org = Math.max(Math.max(stat.atime, stat.mtime) - ms, target-ms);

            await utimes(pathname, {
                btime: org,
                atime: org,
                mtime: org
            });
            console.log("fixing time on %s", pathname);
        } else if (stat.atime < bug || stat.mtime < bug) {
            org = Math.max((Math.min(stat.atime, stat.mtime) + target) - ms, target - ms);

            await utimes(pathname, {
                btime: org,
                atime: org,
                mtime: org
            });
            console.log("re-fixing time on %s", pathname);
        }

        if (stat.isDirectory()) {
            await enumPaths(pathname, days);
        }
    } catch (err) {
        console.log(err);
    }
}

async function main(argc, argv) {
    "use strict";

    if (argc !== 4) {
        console.log('usage: %s %s dir days', argv[0], argv[1]);
    } else {
        await touchPath(argv[2], argv[3]);
    }
}

main(argc, argv).catch((error) => {
    "use strict";
    console.error(error);
});