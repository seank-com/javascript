/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// scanFolder.js
// 
// The first part of a three phase solution for understanding the
// state of an online backup. This is the third swing at trying to 
// reconcile online backups. Scans a folder hierachy noting file names 
// and sizes along the way.
//
var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    main = function (argc, argv) {
        "use strict";

        var input = "",
            output = "",
            table = {},
            item = {},
            r = 0,
            c = 0,
            k = "",
            v = null,
            ip = "",
            id = "",
            result = {};

        if (argc !== 4) {
            console.log('usage: %s %s <filename> <filename>', argv[0], argv[1]);
        } else {
            input = path.resolve('.', argv[2]);
            output = path.resolve('.', argv[3]);

            fs.readFile(input, { 'encoding': "utf8" }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    table = JSON.parse(data);
                    
                    for(r = 0; r < table["Rows"].length; r += 1) {
                        item = {};
                        for (c = 0; c < table["Columns"].length; c += 1) {
                            k = table["Columns"][c]["ColumnName"];
                            v = table["Rows"][r][c];
                            if (v !== null && v !== "") {
                                item[k] = v;
                            }
                        }

                        ip = item["Properties"]["IPAddressOrFQDN"] || item["Properties"]["MCVP_IPAddressOrFQDN"];
                        id = item["Properties"]["ProcessId"] || item["Properties"]["MCVP_ProcessId"];

                        result[ip] = result[ip] || {};
                        result[ip][id] = result[ip][id] || [];
                        result[ip][id].push(item);
                    }

                    for(ip in result) {
                        console.log(ip);
                        for (id in result[ip]) {
                            console.log(id);
                            result[ip][id].sort((a,b) => a.Timestamp.localeCompare(b.Timestamp))
                        }
                    }

                    fs.writeFile(output, JSON.stringify(result, null, 2), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });    
                }
            });
        }
    };

main(argc, argv);