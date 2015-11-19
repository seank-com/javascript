/*jslint indent: 2, node: true */
/*global require: false, process: false */

// passwordStrength.js
//
// Given a password, analyze the complexity
// and determine the strength.
//
var path = require('path'),
  fs = require('fs'),
  tables = [],
  verbose = true,
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
  emit = function () {
    "use strict";

    if (verbose) {
      console.log.apply(this, arguments);
    }
  },
  extendTime = function (time, value, plural, singular) {
    "use strict";

    if (time.length > 0) {
      time += " ";
    }
    if (value > 1) {
      time += value + " " + plural;
    } else {
      time += value + " " + singular;
    }
    return time;
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
      guessesPerMillenia = guessesPerCentury * 10,
      time = "",
      value;

    if (guesses > guessesPerMillenia) {
      value = Math.floor(guesses / guessesPerMillenia);
      guesses -= value * guessesPerMillenia;
      time = extendTime(time, value, "millenia", "millenia");
    }
    if (guesses > guessesPerCentury) {
      value = Math.floor(guesses / guessesPerCentury);
      guesses -= value * guessesPerCentury;
      time = extendTime(time, value, "centuries", "century");
    }
    if (guesses > guessesPerDecade) {
      value = Math.floor(guesses / guessesPerDecade);
      guesses -= value * guessesPerDecade;
      time = extendTime(time, value, "decades", "decade");
    }
    if (guesses > guessesPerYear) {
      value = Math.floor(guesses / guessesPerYear);
      guesses -= value * guessesPerYear;
      time = extendTime(time, value, "years", "year");
    }
    if (guesses > guessesPerDay) {
      value = Math.floor(guesses / guessesPerDay);
      guesses -= value * guessesPerDay;
      time = extendTime(time, value, "days", "day");
    }
    if (guesses > guessesPerHour) {
      value = Math.floor(guesses / guessesPerHour);
      guesses -= value * guessesPerHour;
      time = extendTime(time, value, "hours", "hour");
    }
    if (guesses > guessesPerMinute) {
      value = Math.floor(guesses / guessesPerMinute);
      guesses -= value * guessesPerMinute;
      time = extendTime(time, value, "minutes", "minute");
    }
    if (guesses > guessesPerSecond) {
      value = Math.floor(guesses / guessesPerSecond);
      guesses -= value * guessesPerSecond;
      time = extendTime(time, value, "seconds", "second");
    }
    if (time.length !== 0) {
      return time;
    }
    return "less than 1 Second";
  },
  permuteString = function (password) {
    "use strict";

    var result = password.toUpperCase();
    result = result.replace(/1/g, "L");
    result = result.replace(/3/g, "E");
    result = result.replace(/4/g, "A");
    result = result.replace(/5/g, "S");
    result = result.replace(/7/g, "T");
    result = result.replace(/0/g, "O");
    result = result.replace(/@/g, "A");
    result = result.replace(/\$/g, "S");
    result = result.replace(/!/g, "I");

    return result;
  },
  hackerTable = {
    "A": 4, // Aa@4
    "B": 2, // Bb
    "C": 2, // Cc
    "D": 2, // Dd
    "E": 3, // Ee3
    "F": 2, // Ff
    "G": 2, // Gg
    "H": 2, // Hh
    "I": 3, // Ii!
    "J": 2, // Jj
    "K": 2, // Kk
    "L": 3, // Ll1
    "M": 2, // Mm
    "N": 2, // Nn
    "O": 3, // Oo0
    "P": 2, // Pp
    "Q": 2, // Qq
    "R": 2, // Rr
    "S": 4, // Ss5$
    "T": 3, // Tt7
    "U": 2, // Uu
    "V": 2, // Vv
    "W": 2, // Ww
    "X": 2, // Xx
    "Y": 2, // Yy
    "Z": 2 // Zz
  },
  hackerPermutations = function (word) {
    "use strict";

    var perms = 1,
      index = 0,
      letter = '',
      value = 0,
      letters = [];

    letters = word.split('');
    for (index = 0; index < letters.length; index += 1) {
      letter = letters[index];
      value = hackerTable[letter];
      if (value) {
        perms *= value;
      } else {
        console.log(letter + " not found");
      }
    }
    return perms;
  },
  hasUpper = function (password) {
    "use strict";

    return (/[A-Z]/.test(password));
  },
  hasLower = function (password) {
    "use strict";

    return (/[a-z]/.test(password));
  },
  hasNumber = function (password) {
    "use strict";

    return (/[0-9]/.test(password));
  },
  hasSymbol = function (password) {
    "use strict";

    return (/[!-\/:-@\[-`{-~]/.test(password));
  },
  getComplexity = function (password) {
    "use strict";

    var complexity = 0;

    if (hasUpper(password)) {
      complexity += 26;
    }
    if (hasLower(password)) {
      complexity += 26;
    }
    if (hasNumber(password)) {
      complexity += 10;
    }
    if (hasSymbol(password)) {
      complexity += 32;
    }
    return complexity;
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
        emit("found " + word + " at " + index);
        if (index > 0) {
          temp = password.substr(0, index);
          emit("Before " + temp);
          result = result.concat(breakPassword(temp));
        }
        temp = password.substr(index, word.length);
        emit(temp);
        result = result.concat({ index: i, type: tables[i].name, value: temp});
        if (index + word.length < line.length) {
          temp = password.substr(index + word.length);
          emit("After " + temp);
          result = result.concat(breakPassword(temp));
        }
        return result;
      }
    }

    return {
      index: -1,
      type: "random",
      value: password
    };
  },
  analyze = function (password) {
    "use strict";

    var i = 0,
      j = 0,
      bits = [],
      guesses = 0,
      complexity = 1,
      len = 0;

    for (i = 0; i < tables.length; i += 1) {
      tables[i].minLength = 100;
      tables[i].maxLength = 0;
      tables[i].perms = 0;

      for (j = 0; j < tables[i].list.length; j += 1) {
        len = tables[i].list[j].length;
        tables[i].perms += hackerPermutations(tables[i].list[j]);
        tables[i].minLength = (tables[i].minLength > len) ? len : tables[i].minLength;
        tables[i].maxLength = (tables[i].maxLength < len) ? len : tables[i].maxLength;
      }

      emit("--- " + tables[i].name + " table ---");
      emit("  " + tables[i].list.length + " unique entries");
      emit("  shortest value is " + tables[i].minLength + " characters");
      emit("  longest value is " + tables[i].maxLength + " characters");
      emit("  there are " + tables[i].perms + " hacker permutations");
    }

    emit("password is " + password.length + " characters long");
    emit("password has a complexity of " + getComplexity(password));

    complexity = getComplexity(password);
    guesses = Math.pow(complexity, password.length);
    console.log("A brute force attack can break this in " + timeToGuess(guesses));

    bits = breakPassword(password);
    emit(bits);

    guesses = 1;
    for (i = 0; i < bits.length; i += 1) {
      complexity = getComplexity(bits[i].value);
      if (bits[i].index !== -1) {
        if (complexity > 26) {
          complexity = tables[bits[i].index].perms;
        } else {
          complexity = tables[bits[i].index].list.length;
        }
      } else {
        complexity = Math.pow(complexity, bits[i].value.length);
      }
      guesses *= complexity;
    }

    console.log("A targeted attack could break this in " + timeToGuess(guesses));
  },
  loadNames = function (password) {
    "use strict";

    loadJSON(path.resolve('.', 'uniqueNames.json'), logErrors(function (result) {
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

    loadJSON(path.resolve('.', 'uniqueWords.json'), logErrors(function (result) {
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

main(argc, argv);
