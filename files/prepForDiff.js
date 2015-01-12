/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// prepForDiff.js
//
// First swing at trying to reconcile online backups. 
// Takes the output.txt from dir /b /s >output.txt
// and removes the roots so windiff can be more helpful
//
var console = require('console'),
    path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length;

function processFile(file) {
    "use strict";

    var lines =  fs.readFileSync(file, { encoding: "utf8"}).split('\r\n').sort(),
        count = lines.length,
        i = 0;

    console.log(file);

    for (i = 0; i < count; i += 1) {
        if (lines[i] !== '') {
            lines[i] = lines[i].replace('I:\\', '');
            lines[i] = lines[i].replace('\\\\keeper\\', '');
        }
    }

    fs.writeFileSync(file + '.out', lines.join('\r\n'));
}

function processDirectory(dir) {
    "use strict";

    var files = fs.readdirSync(dir),
        count  = files.length,
        i = 0;

    for (i = 0; i < count; i += 1) {
        if (files[i].match(/[\w\W]*\.txt/i)) {
            processFile(path.resolve(dir, files[i]));
        }
    }
}

function main(argc, argv) {
    "use strict";

    if (argc !== 3) {
        console.log('usage: %s %s dir', argv[0], argv[1]);
    } else {
        processDirectory(path.resolve('.', argv[2]));
    }
}

main(argc, argv);

