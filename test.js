/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

var argv = process.argv,
  argc = argv.length,

  main = function (argc, argv) {
    'use strict';

    var player = [
      { name: 'Virat' },
      { name: 'MESSI' },
      { name: 'CR7' }
    ];

    var quals = [
      { qualification: 'B.E' },
      { Salary: '$100' }
    ];

    var qual = quals.reduce(function (acc, val) {
      Object.getOwnPropertyNames(val).forEach(function (name) {
        acc[name] = val[name];
      });
      return acc;
    });

    var result = player.map(function (val) {
      Object.getOwnPropertyNames(qual).forEach(function (name) {
        val[name] = qual[name];
      });
      return val;
    });

    console.log(result);
  };

main(argc, argv);
