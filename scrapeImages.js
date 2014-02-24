/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    htmlparser = require('htmlparser2'), // npm install htmlparser2 -g
    tryQuiet = function (doit) {
        "use strict";

        try {
            doit();
        } catch (ignore) {
        }
    },
    downloadFile = function (url, filename) {
        "use strict";

        var file = fs.createWriteStream(filename);

        http.get(url, function (res) {
            res.pipe(file);
        });
    },
    getHMTL = function (url, onResult) {
        "use strict";

        http.get(url, function (res) {
            var output = '';

            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                output += chunk;
            });

            res.on('end', function () {
                onResult(res.statusCode, output);
            });
        });
    },
    parseHtml = function (sourceUrl, destDir, html) {
        "use strict";

        var currentThread = '',
            currentFile = '',
            currentUrl = '',
            inButton = false,
            whenOpenTag = function (name, attribs) {
                if (name === 'div' && attribs.class === 'thread') {
                    currentThread = attribs.id;

                    console.log('processing thread ' + currentThread);

                    currentThread = path.resolve(destDir, currentThread);
                    tryQuiet(function () {
                        fs.mkdirSync(currentThread);
                    });

                }

                if (name === 'a' && attribs.class === 'fileThumb') {
                    currentUrl = attribs.href;
                    currentFile = currentUrl.substr(currentUrl.lastIndexOf('/') + 1);

                    console.log('downloading ' + currentFile);

                    currentFile = path.resolve(currentThread, currentFile);
                    currentUrl = url.resolve(sourceUrl, attribs.href);

                    downloadFile(currentUrl, currentFile);
                }

                if (name === 'a' && attribs.class === 'button') {
                    currentUrl = attribs.href;
                    currentUrl = url.resolve(sourceUrl, attribs.href);
                    inButton = true;
                }
            },
            whenCloseTag = function (name) {
                if (name === 'a') {
                    inButton = false;
                }
            },
            whenText = function (text) {
                if (inButton === true && text === 'View Thread') {
                    getHMTL(currentUrl, function (status, html) {
                        if (status == 200) {
                            parseHtml(currentUrl, destDir, html);
                        }
                    });
                }
            },
            parser = new htmlparser.Parser({
                onopentag: whenOpenTag,
                ontext: whenText,
                onclosetag: whenCloseTag
            });
        parser.write(html);
        parser.end();
    },
    main = function (argc, argv) {
        "use strict";

        var dir = '',
            uri = '';

        if (argc !== 4) {
            console.log('usage: %s %s url dir', argv[0], argv[1]);
        } else {
            uri = argv[2];
            dir = path.resolve('.', argv[3]);

            tryQuiet(function () {
                fs.mkdirSync(dir);
            });

            getHMTL(uri, function (status, html) {
                if (status == 200) {
                    parseHtml(uri, dir, html);
                }
            });
        }
    },
    argv = process.argv,
    argc = argv.length;

main(argc, argv);
