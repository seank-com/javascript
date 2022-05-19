/* jshint esversion: 8, undef: true, unused: true, strict: true, eqeqeq: true, curly: true, bitwise: true */
/* globals require, process, console */

const fs = require('fs');
const path = require('path');
const argv = process.argv;
const argc = argv.length;

async function main(argc, argv) {
  "use strict";

  const input1 = path.resolve('.', 'books.txt');
  const input2 = path.resolve('.', 'books2.txt');

  const books = await fs.promises.readFile(input1, { 'encoding': "utf8" });
  const terms = await (await fs.promises.readFile(input2, { 'encoding': "utf8" })).split('\n');
  for (let i = 0; i < terms.length; i += 1) {
    if (terms[i].length !== 0) {
      const term = "\\" + terms[i].trim();
      if (books.indexOf(term) < 0) {
        console.log(terms[i]);
      }
    }
  }
};

main(argc, argv).catch((error) => {
  "use strict";

  console.error(error);
});