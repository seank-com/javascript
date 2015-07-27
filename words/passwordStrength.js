/*jslint indent: 4, node: true */
/*global require: false, process: false */

// passwordStrength.js
//
// Given a password, analyze the complexity
// and determine the strength.
//
var path = require('path'),
  fs = require('fs'),
  tables = [],
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
  logErrors = function (callback) {
    "use strict";

    return function (err, data) {
      if (err) {
        console.log('failed to read operation chain');
      } else {
        callback(data);
      }
    };
  },
  timeToGuess = function (guesses) {
    "use strict";

    var guessesPerSecond = Math.floor(Math.pow(94, 14) / 7),
    guessesPerMinute = guessesPerSecond * 60,
    guessesPerHour = guessesPerMinute * 60,
    guessesPerDay = guessesPerHour * 24,
    guessesPerYear = guessesPerDay * 365,
    guessesPerDecade = guessesPerYear * 10,
    guessesPerCentury = guessesPerDecade * 10,
    guessesPerMillenia = guessesPerCentury * 10;

    if (guesses > guessesPerMillenia) {
      return Math.floor(guesses / guessesPerMillenia) + " Millenia";
    }
    if (guesses > guessesPerCentury) {
      return Math.floor(guesses / guessesPerCentury) + " Centuries";
    }
    if (guesses > guessesPerDecade) {
      return Math.floor(guesses / guessesPerDecade) + " Decades";
    }
    if (guesses > guessesPerYear) {
      return Math.floor(guesses / guessesPerYear) + " Years";
    }
    if (guesses > guessesPerDay) {
      return Math.floor(guesses / guessesPerDay) + " Days";
    }
    if (guesses > guessesPerHour) {
      return Math.floor(guesses / guessesPerHour) + " Hours";
    }
    if (guesses > guessesPerMinute) {
      return Math.floor(guesses / guessesPerMinute) + " Minutes";
    }
    if (guesses > guessesPerSecond) {
      return Math.floor(guesses / guessesPerSecond) + " Seconds";
    }
    return "less than 1 Second";
  },
  permuteString = function (password) {
    "use strict";

    var result = password.toUpperCase();
    result = result.replace("1", "L");
    result = result.replace("3", "E");
    result = result.replace("4", "A");
    result = result.replace("5", "S");
    result = result.replace("7", "T");
    result = result.replace("0", "O");
    result = result.replace("@", "A");
    result = result.replace("$", "S");
    result = result.replace("!", "I");

    return result;
  },
  findLargestString = function (line, list, minLength, maxLength) {
    "use strict";

    var wordLength = 0,
    i = 0,
    word = '';

    for (wordLength = Math.max(maxLength, line.length); wordLength >= minLength; wordLength -= 1) {
      for (i = line.length - wordLength; i >= 0; i -= 1) {
        word = line.substr(i, wordLength);
        if (list.indexOf(word) !== -1) {
          return word;
        }
      }
    }
    return "";
  },
  breakPassword = function (password) {
    "use strict";

    var line = permuteString(password),
    i = 0,
    word = '',
    index = 0,
    result = [],
    temp = '';

    for (i = 0; i < tables.length; i += 1) {
      word = findLargestString(line, tables[i].list, tables[i].minLength, tables[i].maxLength);

      if (word.length !== 0) {
        index = line.indexOf(word);
        console.log("found " + word + " at " + index);
        if (index > 0) {
          temp = password.substr(0, index);
          console.log("Before " + temp)
          result = result.concat(breakPassword(temp));
        }
        temp = password.substr(index, word.length);
        console.log(temp);
        result = result.concat({ type: tables[i].name, value: temp});
        if (index + word.length < line.length) {
          temp = password.substr(index + word.length);
          console.log("After " + temp)
          result = result.concat(breakPassword(temp));
        }
        return result;
      }
    }

    return {
      type: "random",
      value: password
    };
  },
  analyze = function (password) {
    "use strict";

    var i = 0,
    j = 0,
    len = 0;

    for (i = 0; i < tables.length; i += 1) {
      tables[i].minLength = 100;
      tables[i].maxLength = 0;

      for (j = 0; j < tables[i].list.length; j += 1) {
        len = tables[i].list[j].length;
        tables[i].minLength = (tables[i].minLength > len) ? len : tables[i].minLength;
        tables[i].maxLength = (tables[i].maxLength < len) ? len : tables[i].maxLength;
      }

      console.log(tables[i].list.length + " " + tables[i].name + " from " + tables[i].minLength + " characters to " + tables[i].maxLength + " characters in length.");
    }

    console.log("Your password is " + password.length + " characters long");

    console.log(breakPassword(password));

// Once password is broken into pieces, compute complexity of each piece
//    for (i = 1; i < 21; i += 1) {
//      console.log("Passwords containing " + i + " characters can be brute force guessed in " +  timeToGuess(Math.pow(94, i)));
//    }
//
//    for (i = 1; i < 11; i += 1) {
//      console.log("Passphrases containing " + i + " words can be brute force guessed in " +  timeToGuess(Math.pow(tables[0].list.length, i)));
//    }
  },
  loadNames = function (password) {
    "use strict";

    loadJSON(path.resolve('.', 'names.json'), logErrors(function (result) {
      tables.push({
        name: "maleNames",
        list: result.maleNames
      });
      tables.push({
        name: "femaleNames",
        list: result.femaleNames
      });
      tables.push({
        name: "surnames",
        list: result.surnames
      });
      analyze(password);
    }));
  },
  loadWordlist = function (password) {
    "use strict";

    loadJSON(path.resolve('.', 'wordlist.json'), logErrors(function (result) {
      tables.push({
        name: "words",
        list: result
      });
      loadNames(password);
    }));
  },
  main = function (argc, argv) {
    "use strict";

    if (argc < 3) {
      console.log('usage: %s %s <password>', argv[0], argv[1]);
    } else {
      loadWordlist(argv[2]);
    }
  },
  argv = process.argv,
  argc = argv.length;

if (!String.prototype.format) {
  String.prototype.format = function () {
    "use strict";

    var args = arguments;

    // If we are passed an array then just use that.
    if (args.length === 1 && typeof args[0] === "object") {
      args = args[0] || [];
    }

    return this.replace(/\{(\d+)\}/g, function (match, number) {
      var result = args[number] || match;
      return result;
    });
  };
}

main(argc, argv);
