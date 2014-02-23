/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

var fs = require('fs'),
    path = require('path'),
    htmlparser = require('htmlparser2'), // npm install htmlparser2 -g
    parseHtml = function (text, out) {
        "use strict";

        var parsingState = 0,
            folderCount = 0,
            fileCount = 0,
            currentFolder = '',
            currentFile = '',
            whenOpenTag = function (name, attribs) {
                if (parsingState === 0 && name === 'div' && attribs['class'] === 'playButton') {
                    parsingState = 1;
                }
                if (parsingState === 1 && name === 'span') {
                    parsingState = 2;
                }
                if (parsingState === 0 && name === 'tr' && attribs['class'] === 'tocClips') {
                    parsingState = 3;
                }
                if (parsingState === 3 && name === 'a') {
                    parsingState = 4;
                }
            },
            whenCloseTag = function (name) {
                if (parsingState === 2 && name === 'span') {
                    parsingState = 1;
                }
                if (parsingState === 1 && name === 'div') {
                    parsingState = 0;
                }
                if (parsingState === 3 && name === 'tr') {
                    parsingState = 0;
                }
                if (parsingState === 4 && name === 'a') {
                    parsingState = 3;
                }
            },
            whenText = function (text) {
                var num = '',
                    txt = '';

                if (parsingState === 2) {
                    folderCount += 1;

                    if (folderCount < 10) {
                        num = '0' + folderCount;
                    } else {
                        num = num + folderCount;
                    }

                    currentFolder = num + ' - ' + text.replace(/:/g, " -");
                    txt = 'md \"' + currentFolder + '\"\r\n';
                    fs.appendFileSync(out, txt);
                }
                if (parsingState === 4) {
                    fileCount += 1;

                    if (fileCount < 10) {
                        num = '0' + fileCount;
                    } else {
                        num = num + fileCount;
                    }

                    currentFile = num + ' - ' + text.replace(/:/g, " -") + '.mp4';
                    txt = 'ren \"lesson ('  + fileCount + ').mp4\" \"' + currentFile + '\"\r\n';
                    txt += 'move \"' + currentFile + '\" \"' + currentFolder + '\"\r\n';
                    fs.appendFileSync(out, txt);
                }
            },
            parser = new htmlparser.Parser({
                onopentag: whenOpenTag,
                ontext: whenText,
                onclosetag: whenCloseTag
            });
        parser.write(text);
        parser.end();
    },
    main = function (argc, argv) {
        "use strict";

        var dir = '',
            indexFile = '',
            cmdFile = '',
            html = '';

        if (argc !== 3) {
            console.log('usage: %s %s dir', argv[0], argv[1]);
        } else {
            dir = path.resolve('.', argv[2]);
            indexFile = path.resolve(dir, 'index.htm');
            cmdFile = path.resolve(dir, 'doit.cmd');
            html = fs.readFileSync(indexFile, { encoding: "utf8"});

            fs.writeFileSync(cmdFile, 'REM This file generated with makeDoit.js\r\n');
            parseHtml(html, cmdFile);
        }
    },
    argv = process.argv,
    argc = argv.length;

main(argc, argv);
