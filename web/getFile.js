/*jslint indent: 2, node: true, nomen: true */

// getFile.js
//
// Use sockets to send a GET request, display the 
// header on the screen and write the body to a file.
//

// basic functionality - 5 minutes
// parse url - 30 minutes
// dns lookup - 10 minutes

var dns = require("dns"),
  net = require("net"),
  http = require("http"),
  fs = require("fs"),
  parseUrl = function (text) {
    "use strict";

    var result = {
        url: text,
        protocol: 'http',
        host: '',
        port: 80,
        resourcePath: '/',
        resource: '',
        query: '',
        fragment: ''
      },
      index = 0;

    result.host = result.url;

    // Protocol 
    // http://en.wikipedia.org/wiki/Uniform_resource_locator
    // ----
    index = result.url.indexOf('://');
    if (index > -1) {
      // host does not include :// at the beginning
      result.host = result.url.slice(index + 3);
      result.protocol = result.url.slice(0, index).toLowerCase();
    }

    // Host
    // http://en.wikipedia.org/wiki/Uniform_resource_locator
    //        ----------------
    index = result.host.indexOf('/');
    if (index > -1) {
      result.resourcePath = result.host.slice(index);
      result.host = result.host.slice(0, index);
    }

    // Port
    // http://en.wikipedia.org:80/wiki/Uniform_resource_locator
    //                         --
    index = result.host.indexOf(':');
    if (index > -1) {
      result.port = result.host.slice(index + 1) || 80;
      result.host = result.host.slice(0, index);
    }

    // Fragment
    // http://en.wikipedia.org/wiki/Uniform_resource_locator#cite_ref-1
    //                                                      -----------
    // a Fragment must come at the end even after query and
    // is not sent to the server. It if for the browser only
    //
    index = result.resourcePath.indexOf('#');
    if (index > -1) {
      result.fragment = result.resourcePath.slice(index);
      result.resourcePath = result.resourcePath.slice(0, index);
    }

    index = result.resourcePath.indexOf('?');
    if (index > -1) {
      result.query = result.resourcePath.slice(index);
      result.resourcePath = result.resourcePath.slice(0, index);
    }

    result.resource = result.resourcePath;

    index = result.resource.lastIndexOf('/');
    if (index > -1) {
      result.resource = result.resource.slice(index + 1);
    }

    if (result.resource === '') {
      result.resource = 'index.htm';
    }

    return result;
  },
  assert = require('assert'),
  testParseUrl = function () {
    "use strict";

    var test = function (url, expected) {
      var actual = parseUrl(url);
      assert.deepEqual(actual, expected, url + " " + JSON.stringify(actual));
    };

    test("www.google.com", {
      url: "www.google.com",
      protocol: "http",
      host: "www.google.com",
      port: 80,
      resourcePath: "/",
      resource: "index.htm",
      query: "",
      fragment: ""
    });

    test("http://www.google.com", {
      url: "http://www.google.com",
      protocol: "http",
      host: "www.google.com",
      port: 80,
      resourcePath: "/",
      resource: "index.htm",
      query: "",
      fragment: ""
    });

    test("http://www.google.com/", {
      url: "http://www.google.com/",
      protocol: "http",
      host: "www.google.com",
      port: 80,
      resourcePath: "/",
      resource: "index.htm",
      query: "",
      fragment: ""
    });

    test("https://www.google.com/", {
      url: "https://www.google.com/",
      protocol: "https",
      host: "www.google.com",
      port: 80,
      resourcePath: "/",
      resource: "index.htm",
      query: "",
      fragment: ""
    });

    test("gopher://www.google.com", {
      url: "gopher://www.google.com",
      protocol: "gopher",
      host: "www.google.com",
      port: 80,
      resourcePath: "/",
      resource: "index.htm",
      query: "",
      fragment: ""
    });

    test("http://www.google.com/search/page.html?a=123", {
      url: "http://www.google.com/search/page.html?a=123",
      protocol: "http",
      host: "www.google.com",
      port: 80,
      resourcePath: "/search/page.html",
      resource: "page.html",
      query: "?a=123",
      fragment: ""
    });

    test("http://www.google.com/search#bob", {
      url: "http://www.google.com/search#bob",
      protocol: "http",
      host: "www.google.com",
      port: 80,
      resourcePath: "/search",
      resource: "search",
      query: "",
      fragment: "#bob"
    });

    console.log("Parse tests complete");

  },
  getRequest = function (url, callback) {
    "use strict";

    var result = {
        header: ''
      },
      client = new net.Socket().
        on('connect', function () {
          var header = "GET " + url.resourcePath + url.query + " HTTP/1.1\r\n" +
            "Host: " + url.host + "\r\n" +
            "Accept-Charset: utf-8\r\n" +
            "\r\n";

          client.write(header);
          client.end();
        }).
        on('data', function (buffer) {
          var str = '',
            split = [];

          if (result.content) {
            result.content = Buffer.concat([result.content, buffer], result.content.length + buffer.length);
          } else {
            str = buffer.toString('utf8');
            if (str.match(/\r\n\r\n/)) {
              split = str.split(/\r\n\r\n/);
              result.header += split.shift();
              str = split.join('\r\n\r\n');
              result.content = new Buffer(str, 'utf8');
            } else {
              result.header += str;
            }
          }
        }).
        on('error', function (err) {
          callback(err, null);
        }).
        on('close', function (had_error) {
          if (!had_error) {
            callback(null, result);
          }
        });

    dns.resolve4(url.host, function (err, addresses) {
      if (err) {
        if (err.errno === 'ENOTFOUND') {
          err.msg = 'server address not found';
        } else {
          err.msg = 'resolve4 returned ' + err.code;
        }
        callback(err, null);
      } else {
        url.hostIp = addresses[0];
        client.connect({'port': url.port, 'host': url.hostIp});
      }
    });
  },
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
      req = http.get(uri, downloadStart);

    req.on('error', downloadError);
  },
  main = function (argc, argv) {
    "use strict";

    if (argc < 3) {
      console.log('usage: %s %s <url>', argv[0], argv[1]);
      return;
    }

    if (argv[2] === 'test') {
      testParseUrl();
      return;
    }

    var url = parseUrl(argv[2]);

    if (url.protocol !== 'http') {
      console.log('unsupported protocol');
      return;
    }

    getRequest(url, function (err, result) {
      var wstream = {};

      if (err) {
        console.log('ERROR: ' + err.msg);
      } else {
        console.log(result.header);
        if (result.content.length) {
          wstream = fs.createWriteStream(url.resource);
          wstream.write(result.content);
          wstream.end();

          downloadFile(url.url, url.resource + '.org', function (err) {
            if (err) {
              console.log("failed to download original");
            }
          });
        }
      }
    });
  },
  argv = process.argv,
  argc = argv.length;

main(argc, argv);
