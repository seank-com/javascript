/*jslint indent: 2, node: true */
/*global require: false, process: false */

// parseCSVBill.js
//
// Parse the billing detail from Azure so we know what to charge our customers.
//
var path = require('path'),
  fs = require('fs'),
  parseCSV = require('../common/parseCSV.js'),
  argv = process.argv,
  argc = argv.length,
  verbose = false,
  echo = function () {
    if (verbose) {
      console.log.apply(null, arguments);
    }
  },
  trimQuotes = function (column) {
    "use strict";

    if (column.length > 1) {
      if (column[0] === column[column.length - 1] && column[0] === '"') {
        return trimQuotes(column.slice(1, -1));
      }
    }
    return column;
  },
  formatDollars = function (number) {
    "use strict";

    return "$" + (Math.round(number * 100) / 100) + " USD";
  },
  parseBillLine = function (line, n) {
    "use strict";

    var item = {};

    this.state = this.state || 0;
    this.csv = this.csv || {};
    this.section = this.section || "";
    this.labels = this.labels || [];

    switch (this.state) {
    case 0: // Looking for next section
      if (line.length === 1 && line[0] !== "") {
        echo("Found section: ", line[0]);
        this.section = line[0];
        this.csv[this.section] = [];
        this.state = 1;
      }
      break;
    case 1: // record labels
      echo("Recording Label: ", line);
      this.labels = line;
      this.state = 2;
      break;
    case 2: // record item
      if (this.labels.length !== line.length) {
        if (line.length !== 1) {
          console.log("ERROR: (line %s) Bill is not formatted correctly [%s]", n, line);
          this.state = 3;
        } else {
          this.state = 0;
        }
      } else {
        item = {};
        this.labels.forEach(function (label, i) {
          item[label] = trimQuotes(line[i]);
        });
        echo("Recording item: ", item);
        this.csv[this.section].push(item);
      }
      break;
    case 3: // ERROR state
      break;
    default:
      break;
    }
  },
  parseBill = function (data) {
    "use strict";

    var context = {};

    data = parseCSV(data);
    data.forEach(parseBillLine, context);

    if (context.state !== 3) {
      return context.csv;
    }

    return null;
  },
  subTotalBill = function (bill) {
    "use strict";

    bill.Subtotals = {};
    bill.Totals = {};

    bill["Daily Usage"].forEach(function (current) {
      var ItemName = current["Meter Category"] + " - " + current["Meter Name"],
        ConsumedQuantity = Number(current["Consumed Quantity"]),
        InstanceId = current["Instance Id"];

      echo("Accumulating Subtotal: ", InstanceId, ItemName, ConsumedQuantity);
      bill.Subtotals[InstanceId] = bill.Subtotals[InstanceId] || {};
      bill.Subtotals[InstanceId][ItemName] = bill.Subtotals[InstanceId][ItemName] || 0;
      bill.Subtotals[InstanceId][ItemName] += ConsumedQuantity;

      echo("Accumulating Total: ", ItemName, ConsumedQuantity);
      bill.Totals[ItemName] = bill.Totals[ItemName] || {};
      bill.Totals[ItemName].AggregateTotal = bill.Totals[ItemName].AggregateTotal || 0;
      bill.Totals[ItemName].AggregateTotal += ConsumedQuantity;
    });
  },
  totalBill = function (bill) {
    "use strict";

    bill.Statement.forEach(function (current) {
      var ItemName = current["Meter Category"] + " - " + current["Meter Name"],
        ConsumedQuantity = Number(current["Consumed Quantity"]),
        Cost = Number(current.Value.slice(1, -4).replace(/\,/g, ""));

      echo("Recording Total: ", ItemName, ConsumedQuantity, Cost);

      bill.Totals[ItemName] = bill.Totals[ItemName] || {};
      bill.Totals[ItemName].Total = ConsumedQuantity;
      bill.Totals[ItemName].Cost = Cost;
    });
  },
  calculateReport = function (bill) {
    "use strict";

    var InstanceId = "",
      AggregateCost = 0,
      ItemName = "",
      ConsumedQuantity = 0,
      TotalQuantity = 0,
      TotalCost = 0,
      Cost = 0;

    for (InstanceId in bill.Subtotals) {
      if (bill.Subtotals.hasOwnProperty(InstanceId)) {
        console.log("------------------------------------------------------------");
        console.log("Charges for " + InstanceId);
        AggregateCost = 0;

        for (ItemName in bill.Subtotals[InstanceId]) {
          if (bill.Subtotals[InstanceId].hasOwnProperty(ItemName)) {
            ConsumedQuantity = bill.Subtotals[InstanceId][ItemName];
            TotalQuantity = bill.Totals[ItemName].AggregateTotal;
            TotalCost = bill.Totals[ItemName].Cost;
            Cost = TotalCost * (ConsumedQuantity / TotalQuantity);
            AggregateCost += Cost;

            console.log("    " + ItemName + " @ " + ConsumedQuantity + "/" + TotalQuantity + " = " + formatDollars(Cost) + " (of " + formatDollars(TotalCost) + ")");
          }
        }

        console.log("    Aggregated Cost = " + formatDollars(AggregateCost));
      }
    }
  },
  main = function (argc, argv) {
    "use strict";

    var bill = {};

    if (argc !== 3) {
      console.log('usage: %s %s <filename>', argv[0], argv[1]);
    } else {
      fs.readFile(path.resolve(".", argv[2]), { 'encoding': "utf8" }, function (err, data) {
        if (err) {
          console.log('ERROR: failed to read file');
        } else {
          bill = parseBill(data);
          if (bill && bill.hasOwnProperty("Statement") && bill.hasOwnProperty("Daily Usage")) {
            subTotalBill(bill);
            totalBill(bill);
            calculateReport(bill);
          }
        }
      });
    }
  };

main(argc, argv);
