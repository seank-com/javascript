/*jslint indent: 4, node: true */
/*global require: false, process: false */

var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    htmlparser = require('htmlparser2'), // npm install htmlparser2 -g
    async = require('async'), //npm install async -g
    downloadFile = function (uri, filename, callback) {
        "use strict";

        var downloadError = function (err) {
                callback(err.message, {'url': uri});
            },
            downloadStart = function (res) {

                // Don't create the file until we get the response.
                var file = fs.createWriteStream(filename);

                res.on('data', function (chunk) {

                    file.write(chunk, 'binary');
                });
                res.on('end', function () {

                    file.end();
                    callback(null, { 'url': uri, 'filename': filename });
                });
            },
            directoryReady = function (err) {
                var req = {};

                if (err && err.code !== 'EEXIST') {
                    callback(err.code, {'url': uri});
                } else {
                    req = http.get(uri, downloadStart);
                    req.on('error', downloadError);
                }
            },
            directory = path.dirname(filename);

        fs.mkdir(directory, directoryReady);
    },
    getHTML = function (uri, callback) {
        "use strict";

        var req = http.get(uri, function (res) {

            var output = '';

            res.setEncoding('utf8');

            res.on('data', function (chunk) {

                output += chunk;
            });

            res.on('end', function () {

                callback(null, { 'status': res.statusCode, 'text': output });
            });
        });
        req.on('error', function (err) {
            callback(err.message, null);
        });
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
            } else if (response.status === 200) {
                parser.write(response.text);
                parser.end();
                callback(null, { 'sourceUrl': sourceUrl, 'urlsFound': results });
            } else {
                callback(response.status, { 'sourceUrl': sourceUrl });
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
    pruneDuplicates = function (list) {
        "use strict";

        var count = list.length,
            i = 0,
            map = {};

        for (i = 0; i < count; i += 1) {
            map[list[i]] = true;
        }

        list = [];
        for (i in map) {
            if (map.hasOwnProperty(i)) {
                list.push(i);
            }
        }

        return list.sort();
    },
    //  {
    //    "operation": "download",
    //    "input": [url, ...],
    //    "pattern": ".*\/([^\/]+)\/([^\/]+)"
    //    "filename": "{1}"
    //    "directory": "{0}"
    //    "output": [url, ...] - that failed to download
    //  }
    //
    operationDownload = function (operation, callback) {
        "use strict";

        var downloads = 0,
            processDownload = function (err, result) {

                if (err) {
                    operation.output.push(result.url);
                    console.log('ERROR downloading: ' + result.url + '\n          message: ' + err.message);
                } else {
                    console.log('Downloaded (' + downloads + ' remaining): ' + result.url);
                }

                downloads -= 1;

                if (downloads === 0) {
                    callback(operation);
                }
            },
            startDownload = function (element) {

                var re = {},
                    matches = [],
                    filename = '',
                    directory = path.resolve('.', '.');

                if (operation.pattern) {

                    if (operation.pattern[0] !== '^' || operation.pattern[operation.pattern.length - 1] !== '$') {
                        console.log('ERROR: pattern must begin with ^ and end with $');
                        return;
                    }

                    re = new RegExp(operation.pattern);
                    matches = element.match(re);

                    if (operation.filename) {
                        filename = operation.filename.format(matches);
                    }

                    if (operation.directory) {
                        directory = operation.directory.format(matches);
                    }
                }

                if (filename === '') {
                    filename = element.substr(element.lastIndexOf('/') + 1);
                }

                filename = path.resolve(directory, filename);

                if (operation.debug) {
                    console.log('directory: ' + directory);
                    console.log('filename : ' + filename);
                } else {
                    downloadFile(element, filename, processDownload);
                }
            };

        downloads = operation.input.length;
        operation.input.forEach(startDownload);
    },
    //  {
    //    "operation": "parse",
    //    "input": [url, ...],
    //    "output": [url, ...] - urls found from downloading and parsing the input urls
    //  }
    //
    operationParse = function (operation, callback) {
        "use strict";

        var pages = 0,
            processPage = function (err, result) {

                if (err) {
                    console.log('ERROR parsing: ' + result.sourceUrl + '\n      message: ' + err.message);
                } else {
                    operation.output = operation.output.concat(result.urlsFound);
                    console.log('Parsed (' + pages + ' remaining): ' + result.sourceUrl);
                }

                pages -= 1;

                if (pages === 0) {
                    if (operation.debug) {
                        console.log(pruneDuplicates(operation.output));
                    }

                    callback(operation);
                }
            },
            startFetch = function (element) {

                parseHtml(element, processPage);
            };

        pages = operation.input.length;
        operation.input.forEach(startFetch);
    },
    //  {
    //    "operation": "filter",
    //    "input": [url, ...],
    //    "include": "text1"
    //    "exclude": "text2"
    //    "output": [url, ...] - urls that contained text1 but not text2
    //  }
    //
    operationFilter = function (operation, callback) {
        "use strict";

        var re = {};

        if (operation.include) {
            if (operation.include[0] !== '^' || operation.include[operation.include.length - 1] !== '$') {
                console.log('ERROR: include must begin with ^ and end with $');
                return;
            }

            re = new RegExp(operation.include);

            operation.output = operation.input.filter(function (item) {
                return re.test(item);
            });
        } else {
            operation.output = operation.input;
        }

        if (operation.exclude) {
            if (operation.exclude[0] !== '^' || operation.exclude[operation.exclude.length - 1] !== '$') {
                console.log('ERROR: exclude must begin with ^ and end with $');
                return;
            }

            re = new RegExp(operation.exclude);

            operation.output = operation.output.filter(function (item) {
                return !re.test(item);
            });
        }

        if (operation.debug) {
            console.log(operation.output);
        }

        process.nextTick(function () {
            callback(operation);
        });
    },
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
            value = 0;

        operation.output = operation.input;

        for (i = 0; i < count; i += 1) {
            for (value = start; value <= end; value += increment) {
                operation.output.push(operation.patterns[i].format(value));
            }
        }

        if (operation.debug) {
            console.log(pruneDuplicates(operation.output));
        }

        process.nextTick(function () {
            callback(operation);
        });
    },
    operations = [],
    doNextOperation = function (operation) {
        "use strict";

        var nextOperation = operations.pop(),
            input = [];

        if (operation) {
            input = pruneDuplicates(operation.output);
        }

        if (nextOperation) {
            if (nextOperation.input && nextOperation.input.length > 0) {
                input = input.concat(nextOperation.input);
            }
            nextOperation.input = input;
            nextOperation.output = nextOperation.output || [];
            nextOperation.output = nextOperation.output || [];
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
            case 'generate':
                operationGenerate(nextOperation, doNextOperation);
                break;
            }
        } else {
            if (input.length > 0) {
                console.log(input);
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

                    process.nextTick(function () {
                        doNextOperation(null);
                    });
                }
            });
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
            args = args[0];
        }

        return this.replace(/\{(\d+)\}/g, function (match, number) {
            var result = args[number] || match;
            return result;
        });
    };
}

main(argc, argv);
