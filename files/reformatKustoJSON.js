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
            result = {},
            out = "";

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

                    out = "# Query:\n\n";
                    for(ip in result) {
                        console.log(ip);
                        out += "\n# IP = " + ip;
                        for (id in result[ip]) {
                            console.log(id);
                            out += "\n## pid = " + id + "\nfile.cs:";
                            result[ip][id].sort((a,b) => a.Timestamp.localeCompare(b.Timestamp));
                            for (k in result[ip][id]) {
                                v = JSON.stringify(result[ip][id][k], null, 2).split('\n');
                                for (r in v) {
                                    out += "\n    1  " + v[r];
                                }
                                out += "\n\n";
                            }
                        }
                    }

                    fs.writeFile(output, out, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });    
                }
            });
        }
    };

main(argc, argv);