/*jslint indent: 2, node: true */
/*global require: false, process: false*/

// parseCSV.js
//
// Parse CSV files into an array of lines contains arrays of columns.
//
var encodeData = function (data) {
    "use strict";

    var inside = false,
      i = 0;

    data = data.replace(/\r\n/g, "\n").split("");
    for (i = 0; i < data.length; i += 1) {
      if (inside) {
        if (data[i] === '"') {
          if ((data.length > (i + 1)) && (data[i + 1] === '"')) {
            i += 1;
          } else {
            inside = false;
          }
          data[i] = "";
        }
      } else {
        if (data[i] === "\n") {
          data[i] = "[NEWLINE]";
        } else if (data[i] === ",") {
          data[i] = "[NEWCOLUMN]";
        } else if (data[i] === '"') {
          inside = true;
          data[i] = "";
        }
      }
    }
    return data.join("");
  },
  parseCSV = function (data) {
    "use strict";

    var csv = [];

    data = encodeData(data).split("[NEWLINE]");

    data.forEach(function (current) {
      current = current.split("[NEWCOLUMN]");
      csv.push(current);
    });

    return csv;
  };

module.exports = parseCSV;
