/*jslint indent: 4, node: true, stupid: true, nomen: true */
/*global */

var argv = process.argv,
    argc = argv.length
    main = function (argc, argv)
    {
        "use strict";

        var map = [];

        map[1] = true;
        map[300] = true;
        map[5] = true;
        map[200] = true;
        map[4] = true;
        map[6] = true;

        console.log(Object.keys(map).length);
        console.log(Object.keys(map));

        console.log("map.hasOwnProperty(200) = " + map.hasOwnProperty(200));
        console.log("map.hasOwnProperty(400) = " + map.hasOwnProperty(400));
    }

main(argc, argv);

