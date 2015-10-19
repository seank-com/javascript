/*jslint indent: 2, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// stripVTT.js
//
// Strips VTT files in preparation for creating transcripts.
//
var console = require('console'),
  path = require('path'),
  fs = require('fs'),
  argv = process.argv,
  argc = argv.length;

function processFile(file) {
  "use strict";

  var lines =  fs.readFileSync(file, { encoding: "utf8"}).replace('\r', '\n').split('\n'),
    count = lines.length,
    skipit = false,
    line = '',
    i = 0;

  console.log('\n' + path.basename(file) + '\n');

  for (i = 0; i < count; i += 1) {
    line = lines[i].trim();
    skipit = (line === '');
    skipit = skipit || (line.indexOf('WEBVTT') !== -1);
    skipit = skipit || (line.indexOf('-->') !== -1 && line.indexOf('line:') !== -1);
    if (!skipit) {
      console.log(line);
    }
  }
}

function processFiles(filelist) {
  "use strict";

  var files =  fs.readFileSync(filelist, { encoding: "utf8"}).replace('\r', '\n').split('\n'),
    count = files.length,
    i = 0;

  for (i = 0; i < count; i += 1) {
    if (files[i] !== '') {
      processFile(path.resolve('.', files[i]));
    }
  }
}

function main(argc, argv) {
  "use strict";

  if (argc !== 3) {
    console.log('usage: %s %s filelist', argv[0], argv[1]);
  } else {
    processFiles(path.resolve('.', argv[2]));
  }
}

main(argc, argv);
