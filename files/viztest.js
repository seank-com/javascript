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
            ms = 0,
            smallest = Number.MAX_SAFE_INTEGER,
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
                        id = ip + " " + id;

                        ms = new Date(item.Timestamp).getTime();    
                        smallest = Math.min(smallest, ms);

                        result[id] = result[id] || { name: id, start: Number.MAX_SAFE_INTEGER, stop: Number.MIN_SAFE_INTEGER };
                        result[id].start = Math.min(result[id].start, ms);
                        result[id].stop = Math.max(result[id].stop, ms);
                    }

                    v = result;
                    result = [];
                    Object.keys(v).forEach((id) => {
                        item = v[id];
                        item.start -= smallest;
                        item.stop -= smallest;
                        if (item.start === item.stop) {
                            item.stop += 1;
                        }
                        result.push(item);
                    });

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