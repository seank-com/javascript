/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    main = function (argc, argv) {
        "use strict";

        var input = "",
            i = 0,
            result = {};

        if (argc !== 3) {
            console.log('usage: %s %s <filename>', argv[0], argv[1]);
        } else {
            input = path.resolve('.', argv[2]);

            fs.readFile(input, { 'encoding': "utf8" }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    result = JSON.parse(data);
                    for (i = 0; i < result.length; i += 1) {
                      if (result[i].hasOwnProperty("ProvisioningStatus") && result[i]["ProvisioningStatus"] !== "Completed") {
                        console.log(JSON.stringify(result[i], null, 2));
                      }
                    }
                }
            });
        }
    };

main(argc, argv);