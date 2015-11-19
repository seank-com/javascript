/*jslint indent: 2, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// stripSQL.js
//
// Strips SQL files in preparation for creating CSVs.
//
var console = require('console'),
  path = require('path'),
  fs = require('fs'),
  argv = process.argv,
  argc = argv.length;

function processFile(file) {
  "use strict";

  var re = /\r\n/g,
  re2 = /\)\,\(/g,
  re3 = /\)\;/g,
  re4 = /VALUES \(/g,
  re5 = /\'/g,
  re6 = /\\\"/g,
  re7 = /\`/g,
  re8 = /NULL/g,
  re9 = /\"\cA\"/g,
  reA = /\"\\0\"/g,
  lines = fs.readFileSync(file, { encoding: "utf8"})
    .replace(re, '\n')
    .replace(re2, '\n')
    .replace(re3, '\n')
    .replace(re4, '\n')
    .replace(re5, '"')
    .replace(re6, "'")
    .replace(re7, '"')
    .replace(re8, '"NULL"')
    .replace(re9, '"true"')
    .replace(reA, '"false"');
  console.log(lines);
}

function main(argc, argv) {
  "use strict";

  if (argc !== 3) {
    console.log('usage: %s %s file', argv[0], argv[1]);
  } else {
    processFile(path.resolve('.', argv[2]));
  }
}

main(argc, argv);
