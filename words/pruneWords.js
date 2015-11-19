/*jslint indent: 2, node: true */
/*global require: false, process: false */

// pruneWords.js
//
//
//
var path = require('path'),
  fs = require('fs'),
  url = require('url'),
  names = {},
  words = [],
  loadJSON = function (filename, callback) {
    "use strict";

    var result = {};

    fs.readFile(filename, { 'encoding': "utf8" }, function (err, data) {
      if (err) {
        console.log('failed to read operation chain');
        callback(err, null);
      } else {
        result = JSON.parse(data);

        callback(null, result);
      }
    });
  },
  emitOnFail = function (callback) {
    "use strict";

    return function (err, result) {
      if (err) {
        console.log(err);
      } else if (callback) {
        callback(result);
      }
    };
  },
  pruneWord = function (list, word) {
    "use strict";

    var found = list.indexOf(word);
    if (found !== -1 && list[found] === word) {
      console.log('removing ' + list.splice(found, 1));
    }
  },
  pruneWords = function () {
    "use strict";

    var index = 0, word = '';

    console.log('iterating maleNames');
    for (index = 0; index < names.maleNames.length; index += 1) {
      names.maleNames[index] = names.maleNames[index].toUpperCase();
      if (names.maleNames[index].length < 3) {
        console.log('removing ' + names.maleNames.splice(index, 1));
      }
    }
    console.log('iterating femaleNames');
    for (index = 0; index < names.femaleNames.length; index += 1) {
      names.femaleNames[index] = names.femaleNames[index].toUpperCase();
      if (names.femaleNames[index].length < 3) {
        console.log('removing ' + names.femaleNames.splice(index, 1));
      }
    }
    console.log('iterating surnames');
    for (index = 0; index < names.surnames.length; index += 1) {
      names.surnames[index] = names.surnames[index].toUpperCase();
      if (names.surnames[index].length < 3) {
        console.log('removing ' + names.surnames.splice(index, 1));
      }
    }
    console.log('iterating words');
    for (index = 0; index < words.length; index += 1) {
      words[index] = words[index].toUpperCase();
      if (words[index].length < 3) {
        console.log('removing ' + words.splice(index, 1));
      }
    }
    console.log('iterating maleNames');
    for (index = 0; index < names.maleNames.length; index += 1) {
      word = names.maleNames[index];
      pruneWord(words, word);
      pruneWord(names.femaleNames, word);
      pruneWord(names.surnames, word);
    }
    console.log('iterating femaleNames');
    for (index = 0; index < names.femaleNames.length; index += 1) {
      word = names.femaleNames[index];
      pruneWord(words, word);
      pruneWord(names.surnames, word);
    }

    console.log('iterating surnames');
    for (index = 0; index < names.surnames.length; index += 1) {
      word = names.surnames[index];
      pruneWord(words, word);
    }
  },
  main = function (argc, argv) {
    "use strict";

    if (argc < 2) {
      console.log('usage: %s %s', argv[0], argv[1]);
    } else {
      loadJSON(path.resolve('.', 'names.json'), function (err, result) {
        if (err) {
          console.log(err);
        } else {
          names.maleNames = result.maleNames;
          names.femaleNames = result.femaleNames;
          names.surnames = result.surnames;
          loadJSON(path.resolve('.', 'wordlist.json'), function (err, result) {
            if (err) {
              console.log(err);
            } else {
              words = result;
              pruneWords();
              fs.writeFile(path.resolve('.', 'uniqueNames.json'), JSON.stringify(names).replace(/,/g, ",\n"), emitOnFail(null));
              fs.writeFile(path.resolve('.', 'uniqueWords.json'), JSON.stringify(words).replace(/,/g, ",\n"), emitOnFail(null));
            }
          });
        }
      });
    }
  },
  argv = process.argv,
  argc = argv.length;

main(argc, argv);
