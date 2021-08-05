/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length;

// lookupIMDB.js
//
// Since IMDB doesn't have an API, scan a folder of files
// trimming extensions and parenthesis and produce output
// that can be written to a cmd file to open chrome pages
// for the search results.
//
function processDirectory(dir) {
    "use strict";

    var files = fs.readdirSync(dir).sort(),
        count  = files.length,
        file = '',
        map = [],
        i = 0,
        onMac = process.platform === 'darwin',
        spaces = / /g,
        stat;

    for (i = 0; i < count; i += 1) {
      file = files[i];

      stat = fs.statSync(path.resolve(dir, file));

      if (stat.isFile()) {
        file = file.split('.')[0].split('(')[0].trim();

        map[file] = true;
      }
    }

    files = [];

    for (file in map) {
      if (map.hasOwnProperty(file)) {
        files.push(file);
      }
    }

    files = files.sort();
    count = files.length;
    for (i = 0; i < count; i += 1) {
      if (!!files[i]) {
        if (onMac) {

          file = files[i].replace(spaces, '+');
//          console.log('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \"http://www.imdb.com/search/title?title=%s&title_type=feature\"', file);
          console.log('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \"http://www.imdb.com/search/title?title=%s\"', file);
          if (i % 10 === 0) {
            console.log('read -p "Press [Enter] key to continue..."');
          }
        } else {
          file = files[i].replace(/ /g, '%%20');
          console.log('\"c:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" \"https://www.imdb.com/find?q=%s&ref_=nv_sr_srsg_1\"', file);
          if (i % 10 === 0) {
            console.log("pause");
          }
        }
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
