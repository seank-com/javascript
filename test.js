/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

// var argv = process.argv,
//   argc = argv.length,

//   main = function (argc, argv) {
//     'use strict';

//     var player = [
//       { name: 'Virat' },
//       { name: 'MESSI' },
//       { name: 'CR7' }
//     ];

//     var quals = [
//       { qualification: 'B.E' },
//       { Salary: '$100' }
//     ];

//     var qual = quals.reduce(function (acc, val) {
//       Object.getOwnPropertyNames(val).forEach(function (name) {
//         acc[name] = val[name];
//       });
//       return acc;
//     });
//     console.log(qual);

//     var result = player.map(function (val) {
//       Object.getOwnPropertyNames(qual).forEach(function (name) {
//         val[name] = qual[name];
//       });
//       return val;
//     });

//     console.log(result);
//     // Expect:
//     // [ 
//     //   { name: 'Virat', qualification: 'B.E', Salary: '$100' },
//     //   { name: 'MESSI', qualification: 'B.E', Salary: '$100' },
//     //   { name: 'CR7', qualification: 'B.E', Salary: '$100' } 
//     // ]
//   };

// main(argc, argv);
function main(val) {
  var digits = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    s = '',
    t=0;
  do {
    t = ((val - 1) % 26);
    s = digits[t] + s;
    val = Math.floor((val - t)/26); 
  } while (val > 0);

  console.log(s);
}

for (i = 1; i < 200; i+= 1) {
  main(i);
}
