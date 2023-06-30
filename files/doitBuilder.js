/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false, readFileSync: false */

// doitBuilder.js
//
// I need to recurse through a directory and build a list of files
// then emit a doit batch file that will rename and move them
//

const pfs = require('fs').promises;
const path = require('path');

async function processDirectory(root, dir) {
    const files = await pfs.readdir(root);

    var renamed = false;
    for (const file of files) {
        const filepath = path.resolve(root, file);

        try {
            const stats = await pfs.stat(filepath);

            if (stats.isDirectory()) {
                console.log(`cd "${filepath}"`);
                await processDirectory(filepath, file);
            } else {
                if (dir) {
                    if (file === 'Thumbs.db') {
                        console.log(`del "${file}"`);
                    } else {
                        if (!file.startsWith(`${dir} - `)) {
                            console.log(`ren "${file}" "${dir} - ${file}"`);
                        }
                    }
                    renamed = true;
                }
            }
        } catch (err) {
            console.error(`REM Path not found: ${err.path}`);
        }
    }

    if (renamed) {
        console.log(`move *.* ..`);
        console.log(`cd ..`);
        console.log(`rd "${root}"`);
    }
}

async function main(argc, argv) {

    if (argc !== 3) {
        console.log(`usage: ${argv[0]} ${argv[1]} <dir>`);
    } else {
        const dir = path.resolve('.', argv[2]);
        await processDirectory(dir, 0);
    }
}

var argv = process.argv,
    argc = argv.length;

main(argc, argv);
