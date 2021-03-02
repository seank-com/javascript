/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    main = function (argc, argv) {
        "use strict";

        var input = "",
            output = "",
            i = 0,
            result = [],
            errors = [];

        if (argc !== 4) {
            console.log('usage: %s %s <input filename> <output filename>', argv[0], argv[1]);
        } else {
            input = path.resolve('.', argv[2]);
            output = path.resolve('.', argv[3]);

            fs.readFile(input, { 'encoding': "utf8" }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    result = JSON.parse(data);
                    for (i = 0; i < result.length; i += 1) {
                      if (result[i].hasOwnProperty("ProvisioningStatus") && result[i]["ProvisioningStatus"] !== "Completed") {
                        errors.push(result[i]);
                      }
                    }

                    fs.writeFile(output, JSON.stringify(errors/*, null, 2*/), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });    
                }
            });
        }
    };

main(argc, argv);