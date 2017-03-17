/*jslint indent: 2, node: true */
/*global require: false, process: false, download: false, processBatch: false */

// test.js
//
// Download blob file using ranges
//
var http = require('http'),
  https = require('https'),
  path = require('path'),
  fs = require('fs'),
  timers = require('timers'),
  url = require('url'),
  downloadChunk = function (uri, range, callback) {
    "use strict";

    var client = http,
      req = {},
      options = uri;

    if (typeof uri === 'string') {
      options = url.parse(uri);
    }
    if (options.protocol === "https:") {
      client = https;
    }

    options.headers = { 'Range': 'bytes=' + range };

    req = client.get(options, (res) => {
      var err = {};

      // Success codes 200-299
      if (res.statusCode >= 200 && res.statusCode < 300) {
        callback(null, res);
      } else {
        // Redirect codes 300-399
        if (res.statusCode >= 300 && res.statusCode < 400) {
          if (res.headers.location) {
            downloadChunk(url.resolve(uri, res.headers.location), callback);
            return;
          }
        }
        // All other errors
        err = new Error("Bad statusCode " + res.statusCode);
        err.res = res;
        callback(err, null);
      }
    });

    req.on('error', (err) => {
      err.req = req;
      callback(err, null);
    });
  },
  downloadFirmware = function (uri, callback) {

    var chunkSize = 4096,
      start = 0,
      end = 512,
      fileChunks = [],
      downloadNextChunk = function () {
        var chunks = [];

        downloadChunk(uri, "" + start + "-" + end, (err, res) => {
          if (err) {
            timers.setImmediate(callback, err, {'url': uri });
          } else {
            res.on('data', function (chunk) {
              chunks.push(chunk);
            });

            res.on('end', function () {
              var range = res.headers["content-range"],
                length = range.split("/")[1],
                buffer = Buffer.concat(chunks);

              length = parseInt(length);
              fileChunks.push(buffer);
              console.log("read " + end + " of " + length);

              if (length-1 === end) {
                buffer = Buffer.concat(fileChunks);
                timers.setImmediate(callback, null, {'url' : uri, 'contents': buffer});
                return;
              }
              start = end + 1;
              end += chunkSize;
              if (end > length-1) {
                end = length - 1;
              }
              timers.setImmediate(downloadNextChunk);
            });
          }
        });
      };
    timers.setImmediate(downloadNextChunk);
  },
  main = function (argc, argv) {
    downloadFirmware("https://playland.blob.core.windows.net/firmware/RC/latest.jpg?st=2017-03-17T18%3A00%3A00Z&se=2017-03-18T18%3A00%3A00Z&sp=rl&sv=2015-12-11&sr=b&sig=EQ22DYCxEcfuVR0gsqrfKFMvKGE4Utoj6LmTBkRBnEY%3D", (err, result) => {
      if (err) {
        console.error(err);
      } else {
        fs.writeFile("firmware.jpeg", result.contents, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Success");
          }
        })
      }
    })
  },
  argv = process.argv,
  argc = argv.length;

main(argc, argv);
