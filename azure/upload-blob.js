/*jslint indent: 2, node: true */
/*global require: false, process: false, download: false, processBatch: false */

// upload-blob.js
//
// upload blob file
//
var crypto = require('crypto'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  fs = require('fs'),
  timers = require('timers'),
  url = require('url'),
  uploadBlob = function (uri, data, callback) {
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

    options.method = "PUT";
    options.headers = { 
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": "image/jpeg",
      "Content-Length": Buffer.byteLength(data)
    };
    
    req = client.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        callback(null, res);
      } else {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          if (res.headers.location) {
            uploadBlob(url.resolve(uri, res.headers.location), data, callback);
            return;
          }
        }
        // All other errors
        err = new Error("Bad statusCode " + res.statusCode);
        err.res = res;
        callback(err, null);
      }
    });
    
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });
    
    // Write data to request body
    req.write(data);
    req.end();
  },
  main = function (argc, argv) {

    var secret = "You wouldn't believe me if I told you.",
      filepath;

    if (argc !== 3) {
        console.log('usage: %s %s <filename>', argv[0], argv[1]);
    } else {
      filepath = path.resolve('.', argv[2]);
      fs.readFile(filepath, (err, data) => {
        if (err) throw err;

        var hash = crypto.createHmac('sha256', secret)
          .update(data)
          .digest('hex'),
          uri = "https://playland.blob.core.windows.net/firmware/RC/{0}.jpg?st=2017-03-17T18%3A00%3A00Z&se=2017-03-18T18%3A00%3A00Z&sp=rl&sv=2015-12-11&sr=b&sig=EQ22DYCxEcfuVR0gsqrfKFMvKGE4Utoj6LmTBkRBnEY%3D".format(hash);
        
          uploadBlob(uri, data, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Success");
          }
        });
      });
    }
  },
  argv = process.argv,
  argc = argv.length;

if (!String.prototype.format) {
  String.prototype.format = function () {
      "use strict";

      var args = arguments;
      return this.replace(/\{(\d+)\}/g, function (match, number) {
          var result = args[number] || match;
          return result;
      });
  };
}

main(argc, argv);
