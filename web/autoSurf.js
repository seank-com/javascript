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
  //
  // dbg
  //
  // Helper function that wraps console.log to make it easier to turn off
  // debugging output.
  //
  dbg = function () {
    "use strict";
//    console.log.apply({}, arguments);
  },
  //
  // download
  //
  // Helper function that wraps a get request and returns the response 
  // respecting redirects and using https if needed
  //
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
  //
  // downloadFile
  //
  // Helper function that wraps the download function and saves the response to the 
  // specified filename. If the filename specifies a directory does not exist, 
  // it will be created.
  //
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
    fs.mkdir(directory, { recursive: true }, directoryReady);
  },
  //
  // getHTML
  //
  // Helper function that wraps the download function to get an HTML page and 
  // return it as a utf8 encoded string.
  //
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
  //
  // parseHtml
  //
  // Helper function that wraps the getHTML function and parses the HTML 
  // using the htmlparser2 module looking for urls in the page. Retruns an 
  // object containing the source url and a list of object decribing the urls 
  // found in the page. The response has the following form:
  //
  // {
  //   "sourceUrl": "<url of page parsed>",
  //   "urlsFound": [
  //     {
  //       "src": "<url of page parsed>",
  //       "type": "a.href" | "img.src" | "img.data-src" | "iframe.src" | "meta.content",
  //       "url": "<url found>"
  //     },
  //     ...
  //   ]
  // }
  //
  parseHtml = function (sourceUrl, callback) {
    "use strict";

    var results = [];

    getHTML(sourceUrl, function (err, response) {
      var whenOpenTag = function (name, attribs) {
          var result = {
            src: sourceUrl
          };

          if (name === 'a') {
            if (attribs.href) {
              result.type = 'a.href';
              result.url = url.resolve(sourceUrl, attribs.href);
              results.push(result);
            }
          } else if (name === 'img') {
            if (attribs.src) {
              result.type = 'img.src';
              result.url = url.resolve(sourceUrl, attribs.src);
              results.push(result);
            }
            if (attribs['data-src']) {
              result.type = 'img.data-src';
              result.url = url.resolve(sourceUrl, attribs['data-src']);
              results.push(result);
            }
          } else if (name === 'iframe') {
            if (attribs.src) {
              result.type = 'iframe.src';
              result.url = url.resolve(sourceUrl, attribs.src);
              results.push(result);
            }
          } else if (name === 'meta') {
            if (attribs.content) {
              result.type = 'meta.content';
              result.url = url.resolve(sourceUrl, attribs.content);
              results.push(result);
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
  //
  // getOperationChain
  //
  // Helper function that reads the specified file, trims whitespace and comments, 
  // and parses the remaining text as JSON. The JSON is expected to be an array
  // of objects that describe the operations to be performed.
  //
  // The operations have the following form:
  //
  // {
  //   "operation": "download" | "parse" | "filter" | "tag" | "generate" | "IO",
  //   ...
  // }
  //
  // See the documentation for the individual operations below 
  // (operationDownload, operationParse, operationFilter, operationTag, 
  // operationGenerate, operationIO) for the additional properties that are 
  // included in each object.
  //
  getOperationChain = function (filename, callback) {
    "use strict";

    var result = {}, json = '';

    fs.readFile(filename, { 'encoding': "utf8" }, function (err, data) {
      if (err) {
        console.log('failed to read operation chain');
        callback(err, null);
      } else {
        data.split('\n').forEach(function (line) {
          var lineData = line.trim();
          if (lineData.length > 0 && // skip blank lines
            (lineData.charAt(0) !== '#' || // skip comment lines starting with #
            lineData.substring(0, 2) !== '//')) { // skip comment lines starting with //
            json += `${lineData}\n`;
          }
        });
        result = JSON.parse(json);
        callback(null, result);
      }
    });
  },
  //
  // batchWork
  //
  // Helper functions for pseudo multi-threading. Node.js is single threaded 
  // but using asynchronous function that do work in other threads and 
  // callback into Node's single thread when they complete or error out.
  // batchWork uses this fact to 'queue' upto batchMax jobs asynchronously. 
  // Once those jobs complete, if there are no errors, it 'queues' another 
  // batchMax number of jobs until it runs all jobs. This way if you have a 
  // list of 1000 items you don't queue 1000 asynchronous downloads at once.
  //
  // batchWork defines 3 functions: workCallback, queueWork and processBatch.
  // Then it gets the elements of the operation that need to be processed, 
  // initialize batchSize, uses process.nextTick to call processBatch and 
  // returns immediately.
  // 
  // processBatch checks to see if there are any elements left to process. If 
  // so, it dequeues upto matchMax elements and calls queueWork on each of 
  // them before returning.
  //
  // queueWork calls the worker function with the element and the 
  // workCallback as the callback when worker completes.
  //
  // workCallback decrements batchSize and if there is an error, it sets the
  // fail variable to the error. If batchSize is less than 1, it checks to
  // see if there was a failure. If so, it calls the callback with the error.
  // If not, it checks to see if there are any elements left to process. If
  // not, it calls the callback with the operation. If so, it calls
  // processBatch.
  //
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
        dbg("DBG: nothing left to do");
        callback(null, operation);
      }
    });
    return count;
  },
  //
  // longestCommonSubstring
  //
  // Helper function that finds the longest common substring between two 
  // strings. It is not used in the code but is included here for giggles.
  //
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
  // Downloads all incoming urls. Incoming urls are composed of urls from the 
  // output of the previous operation merged with urls from the input property 
  // of this operation. If pattern is specified, then it is applied against 
  // the url so the capture groups can be used with filename and directory. If 
  // filename is specified, it saves to that filename (you can use {1} 
  // notation to use capture groups from the pattern). If filename is not 
  // specified, the name of the file in the url is used. If directory is 
  // specified, file is stored there, otherwise in the current directory.
  //
  // The output contains any input urls that failed to download.
  //
  //  {
  //    "operation": "download",
  //    "input": ["url", ...],
  //      - optional, if provided, it is appended to output of previous 
  //        operation.
  //    "pattern": "^.*/([^/]+)/([^/]+)$"
  //      - optional, if provided, it is used to extract data from the input 
  //        urls using capture groups.
  //    "directory": "{1}"
  //      - optional, if provided, it is used to format the directory to save 
  //        the file in. If not provided, files are saved in the current 
  //        directory. Note: you can use {1} notation to use capture groups 
  //        from the pattern.
  //    "filename": "{2}"
  //      - optional, if provided, it is used to format the filename to save 
  //        the file in. If not provided, the filename in the url is used. 
  //        Note: you can use {1} notation to use capture groups from the 
  //        pattern.
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
  // Downloads all incoming urls and parses the HTML for urls in <a>, <img>, 
  // <iframe>, and <meta> tags and passes them on as output. Incoming urls are 
  // composed of urls from the output of the previous operation merged with 
  // urls from the input property of this operation. If annotate is specified, 
  // appends the annotation pattern and the input url to the resulting url to 
  // disambiguate duplicates. The resulting output will have 'src', 'type', 
  // and 'url' tags (see parseHtml above for more details).
  //
  // The output contains urls found from downloading and parsing the input 
  // urls.
  //
  //  {
  //    "operation": "parse",
  //    "input": ["url", ...],
  //      - optional, if provided, it is appended to output of previous 
  //        operation.
  //    "annotate": "#####"
  //      - optional, if provided, appends the annotation pattern and the 
  //        input url to the resulting url to disambiguate duplicates
  //  }
  //
  operationParse = function (operation, callback) {
    "use strict";

    var pages = 0,
      parseWorker = function (element, workCallback) {
        parseHtml(element, function (err, result) {
          var i, source = operation.input[result.sourceUrl] || {}, target, uri;

          if (err) {
            console.log('ERROR parsing: ' + result.sourceUrl + '\n      message: ' + err.message);
          } else {
            for (i = 0; i < result.urlsFound.length; i += 1) {
              target = result.urlsFound[i];
              uri = target.url;
              if (operation.annotate) {
                uri += operation.annotate + result.sourceUrl;
              }
              operation.output[uri] = Object.assign(target, source);
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
    pages = batchWork(4, operation, parseWorker, callback);
  },
  //
  // Copies all incomnig urls that match the include pattern but do not match 
  // the exclude pattern to output. Incoming urls are composed of urls from 
  // the output of the previous operation merged with urls from the input 
  // property of this operation. If prune is specified, then prunes everything 
  // after and including the specified annotation pattern. If matchingTags is 
  // specified, filters out any urls that either do not have the specified 
  // tags (see tag operation below) or whose tag value do not match the 
  // specified tag values.
  //
  // The output contains the resulting list of incoming urls after filtering 
  // as described above.
  //
  //  {
  //    "operation": "filter",
  //    "input": ["url", ...],
  //      - optional, if provided, it is appended to output of previous 
  //        operation.
  //    "include": "^.*text1.*$",
  //      - optional, if provided, only urls that match the pattern are
  //        included.
  //    "exclude": "^.*text2.*$",
  //      - optional, if provided, urls that match the pattern are excluded.
  //    "prune": "####",
  //      - optional, if provided, prunes everything after and including the
  //      specified annotation pattern.
  //    "matchingTags": {
  //        "tag1": "text1"
  //    }
  //      - optional, if provided, filters out any urls that either do not
  //      have the specified tags (see tag operation below) or whose tag value 
  //      do not match the specified tag values.
  //  }
  //
  operationFilter = function (operation, callback) {
    "use strict";

    var inputNames = Object.getOwnPropertyNames(operation.input),
      re = {},
      i = 0,
      j = 0,
      outputNames = [],
      name = "",
      tags = {},
      tagNames = [],
      filter = false;

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
      if (operation.matchingTags) {
        tags = operation.input[outputNames[i]];
        tagNames = Object.getOwnPropertyNames(operation.matchingTags);
        filter = false;
        for (j = 0; j < tagNames.length; j += 1) {
          if (tags[tagNames[j]] !== operation.matchingTags[tagNames[j]]) {
            filter = true;
          }
        }
        if (!filter) {
          operation.output[name] = operation.input[outputNames[i]];
        }
      } else {
        operation.output[name] = operation.input[outputNames[i]];
      }
    }

    if (operation.debug) {
      console.log(operation.output);
    }

    process.nextTick(function () {
      callback(null, operation);
    });
  },
  //
  // Copies all incoming urls to output. Incoming urls are composed of urls 
  // from the output of the previous operation merged with urls from the input 
  // property of this operation. If pattern is specified, then it is applied 
  // against the url so the capture groups can be used. Adds tags with 
  // specified values using capture groups from the pattern, if specified.
  //
  // The output contains the resulting list of incoming urls after tagging.
  //
  // {
  //   "operation": "tag",
  //   "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //   "pattern": "^.*/([0-9]+)/([0-9]+)/([0-9]+)/.*$)",
  //      - optional, if provided, it is used to extract data from the input
  //      urls using capture groups.
  //   "tags": {
  //     "day":"{1}",
  //     "month": "{2}",
  //     "year": "{3}"
  //   }
  //     - optional, if provided, adds tags with specified values using capture
  //     groups from the pattern.
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
          tagNames = Object.getOwnPropertyNames(operation.tags),
          pattern = operation.pattern || '^\\.*$';

        if (pattern[0] !== '^' || pattern[pattern.length - 1] !== '$') {
          console.log('ERROR: pattern must begin with ^ and end with $');
          return;
        }

        re = new RegExp(pattern);

        matches = element.match(re);
        for (i = 0; i < tagNames.length; i += 1) {
          tags[tagNames[i]] = operation.tags[tagNames[i]].format(matches, tags);
        }
        operation.output[element] = tags;
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
  // Copies all incoming urls to output. Incoming urls are composed of urls 
  // from the output of the previous operation merged with urls from the input 
  // property of this operation. Generates additional urls for each pattern in 
  // patterns replacing {0} with values from start increased by increment 
  // until the value exceeds end.
  //
  // The output contains the resulting list of incoming urls after generating
  // additional urls.
  //
  //  {
  //    "operation": "generate",
  //    "input": [url, ...],
  //      - optional, if provided it is appended to output of previous 
  //     operation.
  //    "patterns": [url, ...],
  //      - optional, if provided, it is used to generate additional urls.
  //    "start": 2
  //      - optional, if provided, it is used as the starting value for
  //      generating additional urls.
  //    "increment": 1
  //      - optional, if provided, it is used as the increment for
  //      generating additional urls.
  //    "end" : 10
  //      - optional, if provided, it is used as the ending value for
  //      generating additional urls.
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
        entry = operation.patterns[i].format([value],{});
        operation.output[entry] = operation.output[entry] || {};
      }
    }

    process.nextTick(function () {
      callback(null, operation);
    });
  },
  //
  // Copies input to output. If inputFilename is specified,
  // either reads JSON array of strings and appends to output, or 
  // reads JSON object and merges with output. If outputFilename is specified, 
  // writes output as JSON using padding if specified to format output.
  //
  //  {
  //    "operation": "IO",
  //    "input": [url, ...],
  //      - optional, if provided it is appended to output of previous operation
  //    "inputFilename": "{1}"
  //      - optional, if provided, reads and appends as described above
  //    "outputFilename": "{1}"
  //      - optional, if provided, writes output as described above
  //    "padding": "  "
  //      - optional, if provided formats json using specified padding, 
  //      otherwise json will have minimal whitespace
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
  //
  // doNextOperation
  //
  // dequeues next operation and calls it with the output
  // of the previous operation. If the operation has an
  // input property, it is merged with the output of the
  // previous operation.
  //
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
        if (Object.getOwnPropertyNames(operation.output).length > 0) {
          console.log(operation.output);
        }
      }
    }
  },
  //
  // main
  //
  // Main entry point. Loads operations from file and
  // calls doNextOperation to process them.
  //
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

//
// Add format to String prototype
//
// format replaces {0}, {1}, ... with the corresponding
// element in the matches array. It also replaces {tag}
// with the corresponding element in the tags object.
//
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

// call main
main(argc, argv);
