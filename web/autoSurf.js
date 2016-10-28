/*jslint indent: 2, node: true */
/*global require: false, process: false, download: false, processBatch: false */

// autoSurf.js
//
// Load a chain of operations in json format and execute the operations therein
// to fetch, parse and download data from the web.
//
var http = require('http'),
  https = require('https'),
  path = require('path'),
  fs = require('fs'),
  url = require('url'),
  htmlparser = require('htmlparser2'), // npm install htmlparser2 -g
  async = require('async'), //npm install async -g
  dbg = function () {
    "use strict";
    console.log.apply({}, arguments);
  },
  mkdirp = function (directory, callback) {
    "use strict";

    fs.mkdir(directory, function (err1) {
      if (err1) {
        if (err1.code === 'EEXIST') {
          callback(null);
        } else if (err1.code === 'ENOENT') {
          mkdirp(path.dirname(directory), function (err2) {
            if (err2) {
              callback(err2);
            } else {
              mkdirp(directory, callback);
            }
          });
        } else {
          callback(err1);
        }
      } else {
        callback(null);
      }
    });
  },
  download = function (uri, callback) {
    "use strict";

    var downloadStarted = function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, res);
        } else {
          if (res.statusCode >= 300 && res.statusCode < 400) {
            if (res.headers.location) {
              download(res.headers.location, callback);
              return;
            }
          }
          callback(new Error("Bad statusCode " + res.statusCode), null);
        }
      },
      client = http,
      req = {};

    if (url.parse(uri).protocol === "https:") {
      client = https;
    }

    req = client.get(uri, downloadStarted);
    req.on('error', function (err) {
      callback(err, null);
    });
  },
  downloadFile = function (uri, filename, callback) {
    "use strict";

    var saveFile = function (err, res) {
        var file = {};

        if (err) {
          callback(err, {'url': uri});
        } else {
          file = fs.createWriteStream(filename);

          res.on('data', function (chunk) {
            file.write(chunk, 'binary');
          });
          res.on('end', function () {
            file.end();
            callback(null, { 'url': uri, 'filename': filename });
          });
        }
      },
      directoryReady = function (err) {
        if (err && err.code !== 'EEXIST') {
          callback(err, {'url': uri});
        } else {
          download(uri, saveFile);
        }
      },
      directory = path.dirname(filename);
    mkdirp(directory, directoryReady);
  },
  getHTML = function (uri, callback) {
    "use strict";

    var processHTML = function (err, res) {
        var output = '';

        if (err) {
          callback(err, {'url': uri});
        } else {
          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            output += chunk;
          });

          res.on('end', function () {
            callback(null, { 'status': res.statusCode, 'text': output });
          });
        }
      };
    download(uri, processHTML);
  },
  parseHtml = function (sourceUrl, callback) {
    "use strict";

    var results = [];

    getHTML(sourceUrl, function (err, response) {
      var whenOpenTag = function (name, attribs) {
          if (name === 'a') {
            if (attribs.href) {
              results.push(url.resolve(sourceUrl, attribs.href));
            }
          } else if (name === 'img') {
            if (attribs.src) {
              results.push(url.resolve(sourceUrl, attribs.src));
            }
            if (attribs["data-src"]) {
              results.push(url.resolve(sourceUrl, attribs["data-src"]));
            }
          } else if (name === 'iframe') {
            if (attribs.src) {
              results.push(url.resolve(sourceUrl, attribs.src));
            }
          } else if (name === 'meta') {
            if (attribs.content) {
              results.push(url.resolve(sourceUrl, attribs.content));
            }
          }
        },
        parser = new htmlparser.Parser({
          onopentag: whenOpenTag,
        });

      if (err) {
        callback(err, { 'sourceUrl': sourceUrl });
      } else {
        parser.write(response.text);
        parser.end();
        callback(null, { 'sourceUrl': sourceUrl, 'urlsFound': results });
      }
    });
  },
  getOperationChain = function (filename, callback) {
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
  batchWork = function (batchMax, operation, worker, callback) {
    "use strict";

    var elements = Object.getOwnPropertyNames(operation.input),
      count = elements.length,
      batchSize = 0,
      fail = null,
      workCallback = function (err) {
        batchSize -= 1;
        if (err && !fail) {
          dbg("DBG: worker Failed ", err);
          fail = err;
        }
        if (batchSize < 1) {
          if (fail) {
            dbg("DBG: propagate failure ", fail);
            callback(fail, operation);
          } else if (elements.length < 1) {
            dbg("DBG: all ", count, " workers complete");
            callback(null, operation);
          } else {
            dbg("DBG: queueing more work");
            processBatch();
          }
        }
      },
      queueWork = function (element) {
        process.nextTick(function () {
          dbg("DBG: working ", element);
          worker(element, workCallback);
        });
      },
      processBatch = function () {
        var element = "";
        while (elements.length > 0) {
          element = elements.pop();
          if (element) {
            batchSize += 1;
            dbg("DBG: queueing ", element, "(", batchSize, " batchSize)");
            queueWork(element);

            if (batchSize >= batchMax) {
              dbg("DBG: yielding");
              return;
            }
          }
        }
      };

    process.nextTick(function () {
      if (count > 0) {
        dbg("DBG: batching ", count, " jobs");
        processBatch();
      } else {
        dbg("DBG: nothing to do");
        callback(null, operation);
      }
    });
    return count;
  },
  longestCommonSubstring = function (s1, s2) {
    "use strict";

    var LCS = [],
      longest = 0,
      i = 0,
      j = 0,
      result = "";

    for (i = 0; i < s1.length; i += 1) {
      LCS[i] = [];
      for (j = 0; j < s2.length; j += 1) {
        LCS[i][j] = 0;
        if (s1[i] === s2[j]) {
          LCS[i][j] = (i !== 0 && j !== 0) ? LCS[i - 1][j - 1] + 1 : 1;
          if (LCS[i][j] > longest) {
            longest = LCS[i][j];
            result = s1.substring(i - longest + 1, i + 1);
          }
        }
      }
    }
    return result;
  },
  //
  // Downloads all input urls. If pattern is specified,
  // then it is applied against the url so the capture
  // groups can be used with filename and directory. If
  // filename is specified, it saves to that filename
  // (you can use {1} notation to use capture groups
  // from the pattern). If filename is not specified,
  // the name of the file in the url is used. If
  // directory is specified, file is stored there,
  // otherwise in the current directory.
  //
  // The output contains any input urls that failed to
  // download.
  //
  //  {
  //    "operation": "download",
  //    "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //    "pattern": "^.*/([^/]+)/([^/]+)$"
  //      - optional
  //    "directory": "{1}"
  //      - optional
  //    "filename": "{2}"
  //      - optional
  //  }
  //
  operationDownload = function (operation, callback) {
    "use strict";

    var downloads = 0,
      downloadWorker = function (element, workCallback) {
        var re = new RegExp("^(.*)$"),
          matches = [],
          tags = {},
          filename = '',
          directory = path.resolve('.', '.');

        if (operation.pattern) {
          if (operation.pattern[0] !== '^' || operation.pattern[operation.pattern.length - 1] !== '$') {
            workCallback(new Error('ERROR: pattern must begin with ^ and end with $'));
            return;
          }
          re = new RegExp(operation.pattern);
        }

        matches = element.match(re);
        tags = operation.input[element];

        if (operation.filename) {
          filename = operation.filename.format(matches, tags);
        } else {
          filename = element.substr(element.lastIndexOf('/') + 1);
        }

        if (operation.directory) {
          directory = operation.directory.format(matches, tags);
        }

        filename = path.resolve(directory, filename);

        if (operation.debug) {
          console.log('directory: ' + directory);
          console.log('filename : ' + filename);
          operation.output[element] = operation.input[element];
          operation.output[element].directory = directory;
          operation.output[element].filename = filename;
          workCallback(null);
        } else {
          dbg("DBG: Downloading ", element);
          downloadFile(element, filename, function (err, result) {
            if (err) {
              operation.output[result.url] = operation.input[result.url];
              console.log('ERROR downloading: ' + result.url + '\n          message: ' + err.message);
            } else {
              console.log('Downloaded (' + downloads + ' remaining): ' + result.url);
            }
            downloads -= 1;
            workCallback(null);
          });
        }
      };

    downloads = batchWork(4, operation, downloadWorker, callback);
  },
  //
  // Downloads all the input urls and parses the HTML for
  // urls in <a>, <img>, <iframe> and <meta> tags and
  // adds them to output. If annotate is specified, appends
  // the annotation pattern and the input url to the
  // resulting url to disambiguate duplicates.
  //
  // The output contains urls found from downloading and
  // parsing the input urls.
  //
  //  {
  //    "operation": "parse",
  //    "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //    "annotate": "#####"
  //     - optional
  //  }
  //
  operationParse = function (operation, callback) {
    "use strict";

    var pages = 0,
      parseWorker = function (element, workCallback) {
        parseHtml(element, function (err, result) {
          var i, source = operation.input[result.sourceUrl] || {}, uri;

          if (err) {
            console.log('ERROR parsing: ' + result.sourceUrl + '\n      message: ' + err.message);
          } else {
            for (i = 0; i < result.urlsFound.length; i += 1) {
              uri = result.urlsFound[i];
              if (operation.annotate) {
                uri += operation.annotate + result.sourceUrl;
              }
              operation.output[uri] = Object.assign({}, source);
            }
            console.log('Parsed (' + pages + ' remaining): ' + result.sourceUrl);
          }

          pages -= 1;
          if (pages === 0) {
            if (operation.debug) {
              console.log(operation.output);
            }
          }
          workCallback(null);
        });
      };
    pages = batchWork(20, operation, parseWorker, callback);
  },
  //
  // Copies all input urls that match the include
  // pattern but do not match the exclude pattern to
  // output. If prune is specified, then prunes everything
  // after and including the specified annotation pattern.
  //
  // The output contains any pruned input urls that are
  // included but not excluded.
  //
  //  {
  //    "operation": "filter",
  //    "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //    "include": "^.*text1.*$",
  //     - optional
  //    "exclude": "^.*text2.*$",
  //     - optional
  //    "prune": "####",
  //     - optional
  //  }
  //
  operationFilter = function (operation, callback) {
    "use strict";

    var inputNames = Object.getOwnPropertyNames(operation.input),
      re = {},
      i = 0,
      j = 0,
      outputNames = [],
      name = "";

    if (operation.include) {
      if (operation.include[0] !== '^' || operation.include[operation.include.length - 1] !== '$') {
        console.log('ERROR: include must begin with ^ and end with $');
        return;
      }

      re = new RegExp(operation.include);

      outputNames = inputNames.filter(function (item) {
        return re.test(item);
      });
    } else {
      outputNames = inputNames;
    }

    if (operation.exclude) {
      if (operation.exclude[0] !== '^' || operation.exclude[operation.exclude.length - 1] !== '$') {
        console.log('ERROR: exclude must begin with ^ and end with $');
        return;
      }

      re = new RegExp(operation.exclude);

      outputNames = outputNames.filter(function (item) {
        return !re.test(item);
      });
    }
    for (i = 0; i < outputNames.length; i += 1) {
      name = outputNames[i];
      if (operation.prune) {
        j = name.indexOf(operation.prune);
        if (j >= 0) {
          name = name.substring(0, j);
        }
      }
      operation.output[name] = operation.input[outputNames[i]];
    }

    if (operation.debug) {
      console.log(operation.output);
    }

    process.nextTick(function () {
      callback(null, operation);
    });
  },
  //
  // Copies all input urls to output. Adds tags that
  // match the specified pattern.
  //
  // {
  //   "operation": "tag",
  //   "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //   "pattern": "^.*/([0-9]+)/([0-9]+)/([0-9]+)/.*$)",
  //      - optional
  //   "tags": {
  //     "day":"{1}",
  //     "month": "{2}",
  //     "year": "{3}"
  //   }
  //      - optional
  // },
  //
  operationTag = function (operation, callback) {
    "use strict";

    var inputNames = Object.getOwnPropertyNames(operation.input),
      updateTags = function (element) {

        var re,
          i = 0,
          matches = [],
          tags = operation.input[element] || {},
          tagNames = Object.getOwnPropertyNames(operation.tags);

        if (operation.pattern) {
          if (operation.pattern[0] !== '^' || operation.pattern[operation.pattern.length - 1] !== '$') {
            console.log('ERROR: pattern must begin with ^ and end with $');
            return;
          }

          re = new RegExp(operation.pattern);

          matches = element.match(re);
          for (i = 0; i < tagNames.length; i += 1) {
            tags[tagNames[i]] = operation.tags[tagNames[i]].format(matches, tags);
          }
          operation.output[element] = tags;
        }
      };
    operation.tags = operation.tags || {};
    operation.output = operation.input;
    inputNames.forEach(updateTags);

    if (operation.debug) {
      console.log(operation.output);
    }

    process.nextTick(function () {
      callback(null, operation);
    });
  },
  //
  // Generates urls for each pattern in patterns
  // replacing {0} with values from start increased by
  // increment until the value exceeds end.
  //
  //  {
  //    "operation": "generate",
  //    "input": [url, ...],
  //    "patterns": [url, ...],
  //    "start": 2
  //    "increment": 1
  //    "end" : 10
  //    "output": [url, ...] - for each url in patterns replaces {0} with values from start to end increased by increment unitl the value exceeds end
  //  }
  //
  operationGenerate = function (operation, callback) {
    "use strict";

    var patterns = operation.patterns || [],
      count = patterns.length,
      start = operation.start || 0,
      increment = operation.increment || 1,
      end = operation.end || 0,
      i = 0,
      value = 0,
      entry = "";

    operation.output = operation.input;

    for (i = 0; i < count; i += 1) {
      for (value = start; value <= end; value += increment) {
        entry = operation.patterns[i].format(value);
        operation.output[entry] = operation.output[entry] || {};
      }
    }

    process.nextTick(function () {
      callback(null, operation);
    });
  },
  //
  // Copies input to output. If inputFilename is specified,
  // reads JSON array of strings and appends to output. If
  // outputFilename is specified, writes output as JSON.
  //
  //  {
  //    "operation": "IO",
  //    "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //    "inputFilename": "{1}"
  //      - optional
  //    "outputFilename": "{1}"
  //      - optional
  //    "padding": "  "
  //      - optional, if provided formats json using
  //        specified padding, otherwise json will have
  //        minimal whitespace
  //  }
  //
  operationIO = function (operation, callback) {
    "use strict";

    var processWrite = function (err) {
        if (err) {
          console.log(err);
        } else {
          callback(null, operation);
        }
      },
      saveFile = function () {
        var filename = '',
          data = '';

        if (operation.outputFilename) {
          filename = path.resolve('.', operation.outputFilename);
          if (operation.padding) {
            data = JSON.stringify(operation.output, null, operation.padding);
          } else {
            data = JSON.stringify(operation.output);
          }
          fs.writeFile(filename, data, processWrite);
        } else {
          process.nextTick(function () {
            callback(null, operation);
          });
        }
      },
      processRead = function (err, data) {
        var loaded = {},
          names = [],
          i = 0;

        if (err && err.code !== 'ENOENT') {
          console.log(err);
        } else {
          if (!err) {
            loaded = JSON.parse(data);

            if (Array.isArray(loaded)) {
              names = loaded;
              loaded = {};
            } else if (typeof loaded === "object" && loaded !== null) {
              names = Object.getOwnPropertyNames(loaded);
            }

            for (i = 0; i < names.length; i += 1) {
              operation.output[names[i]] = loaded[names[i]] || {};
            }
          }
          saveFile();
        }
      },
      loadFile = function () {
        var filename = '';

        if (operation.inputFilename) {
          filename = path.resolve('.', operation.inputFilename);
          fs.readFile(filename, { 'encoding': "utf8" }, processRead);
        } else {
          saveFile();
        }
      };
    operation.output = operation.input;
    loadFile();
  },
  operations = [],
  doNextOperation = function (err, operation) {
    "use strict";

    var i,
      nextOperation = {},
      input = {};

    if (err) {
      console.log("ERROR: ", err.message, err);
    } else {
      nextOperation = operations.pop();

      if (operation) {
        input = operation.output;
      }

      if (nextOperation) {
        if (nextOperation.input) {
          if (Array.isArray(nextOperation.input) && nextOperation.input.length > 0) {
            for (i = 0; i < nextOperation.input.length; i += 1) {
              input[nextOperation.input[i]] = input[nextOperation.input[i]] || {};
            }
          } else if (typeof nextOperation.input !== "object" || nextOperation.input === null) {
            console.log('ERROR: input must be an array or object');
            return;
          }
        }

        nextOperation.input = input;
        nextOperation.output = nextOperation.output || {};
        nextOperation.operation = nextOperation.operation || '';
        nextOperation.debug = nextOperation.debug || false;

        switch (nextOperation.operation) {
        case 'download':
          operationDownload(nextOperation, doNextOperation);
          break;
        case 'parse':
          operationParse(nextOperation, doNextOperation);
          break;
        case 'filter':
          operationFilter(nextOperation, doNextOperation);
          break;
        case 'tag':
          operationTag(nextOperation, doNextOperation);
          break;
        case 'generate':
          operationGenerate(nextOperation, doNextOperation);
          break;
        case 'IO':
          operationIO(nextOperation, doNextOperation);
          break;
        default:
          process.nextTick(function () {
            nextOperation.output = nextOperation.input;
            console.log("Skipping ", nextOperation.operation);
            doNextOperation(null, nextOperation);
          });
          break;
        }
      } else {
        if (Object.getOwnPropertyNames(input).length > 0) {
          console.log(input);
        }
      }
    }
  },
  main = function (argc, argv) {
    "use strict";

    if (argc < 3) {
      console.log('usage: %s %s <filename>', argv[0], argv[1]);
    } else {
      getOperationChain(path.resolve('.', argv[2]), function (err, result) {
        if (err) {
          console.log(err);
        } else {
          operations = result.reverse();
          dbg("DBG: Loaded operations", operations);
          process.nextTick(function () {
            doNextOperation(null, null);
          });
        }
      });
    }
  },
  argv = process.argv,
  argc = argv.length;

if (!String.prototype.format) {
  String.prototype.format = function (matches, tags) {
    "use strict";

    return this.replace(/\{(\d+)\}/g, function (match, number) {
      return matches[number] || match;
    }).replace(/\{(\w+)\}/g, function (match, tag) {
      return tags[tag] || match;
    });
  };
  dbg("DBG: defined format");
}

main(argc, argv);
