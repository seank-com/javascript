/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    argc = argv.length,
    compareDirectories = function (dir1, dir2, out) {
        "use strict";

        var files1 = fs.readdirSync(dir1).sort(),
            files2 = fs.readdirSync(dir2).sort(),
            count1  = files1.length,
            count2  = files2.length,
            i1 = 0,
            i2 = 0,
            file1 = '',
            file2 = '',
            stat1 = {},
            stat2 = {},
            msg = '';

        console.log('#  %s(%d)', dir1, count1);
        console.log('#  %s(%d)', dir2, count2);

        while (i1 < count1 && i2 < count2) {

            file1 = path.resolve(dir1, files1[i1]);

            file2 = path.resolve(dir2, files2[i2]);

            if (files1[i1] < files2[i2]) {
                fs.appendFileSync(out, file1 + '\r\n');
                console.log(file1);
                i1 += 1;
            } else if (files1[i1] > files2[i2]) {
                fs.appendFileSync(out, file2 + '\r\n');
                console.log(file2);
                i2 += 1;
            } else {

                try {
                    stat1 = fs.statSync(file1);
                    stat2 = fs.statSync(file2);
                    if (stat1.isDirectory() && stat2.isDirectory()) {
                        compareDirectories(file1, file2, out);
                        console.log("# %s", file1);
                    } else if (stat1.isFile() && stat2.isFile() && stat1.size !== stat2.size) {
                        msg = "# {0} and {1} are not the same size".format(file1, file2);
                        fs.appendFileSync(out, msg + '\r\n');
                        console.log(msg);
                    }
                } catch (err) {
                    msg = '# Path not found: {0}'.format(err.path);
                    fs.appendFileSync(out, msg + '\r\n');
                    console.log(msg);
                }

                i1 += 1;
                i2 += 1;

                console.log('#    %d = %d', i1, i2);
            }
        }
    },
    main = function (argc, argv) {
        "use strict";

        var now = new Date(Date.now()),
            out = '',
            msg = '';

        if (argc !== 5) {
            console.log('usage: %s %s dir dir out', argv[0], argv[1]);
        } else {
            out = path.resolve('.', argv[4]);
            msg = "# scan began {0}-{1}-{2} {3}:{4}".format(now.getMonth(), now.getDate(), now.getFullYear(), now.getHours(), now.getMinutes());

            fs.writeFileSync(out, msg + '\r\n');
            console.log(msg);

            compareDirectories(argv[2], argv[3], out);

            now =  new Date(Date.now());
            msg = "# scan end {0}-{1}-{2} {3}:{4}".format(now.getMonth(), now.getDate(), now.getFullYear(), now.getHours(), now.getMinutes());

            fs.appendFileSync(out, msg + '\r\n');
            console.log(msg);
        }
    };

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
