/*jslint indent: 2, node: true */
/*global require: false, process: false */

var path = require('path'),
  fs = require('fs'),
  url = require('url'),
  names = {},
  words = [],
  loadJSON = function (filename, callback) {
    "use strict";

    var result = {};

    fs.readFile(filename, { 'encoding': "utf8" }, function (err, data) {
      if (err) {
        console.log('failed to read operation chain');
        callback(err, null);
      } else {
        result = JSON.parse(data);

        callback(null, result);
      }
    });
  },
  main = function (argc, argv) {
    "use strict";

    if (argc < 2) {
      console.log('usage: %s %s', argv[0], argv[1]);
    } else {
      loadJSON(path.resolve('.', 'skus.json'), function (err, result) {
        if (err) {
          console.log(err);
        } else {

          var regions = {};
          for (var i = 0; i < result.length; i++) {

            var rgn = regions[result[i].region] || {skus: [], total:0};
            rgn.skus.push({ sku:result[i].sku, count:result[i].count });
            rgn.total += result[i].count;
            regions[result[i].region] = rgn;
          }

          var p25n = 0, p25delta=0, p25mean=0, p25delta2=0, p25M2=0;
          var p50n = 0, p50delta=0, p50mean=0, p50delta2=0, p50M2=0;
          var p75n = 0, p75delta=0, p75mean=0, p75delta2=0, p75M2=0;
          var p90n = 0, p90delta=0, p90mean=0, p90delta2=0, p90M2=0;

          for (var region in regions) {
            var rgn = regions[region];
            rgn.skus = rgn.skus.sort(function(a, b) {
              return b.count - a.count;
            });

            var threshold = 0;
            var p25 = 1;
            var p50 = 1;
            var p75 = 1;
            var p90 = 1;

            for (var i = 0; i < rgn.skus.length; i++) {
              var sku = rgn.skus[i];
              sku.popularity = (sku.count * 100) / rgn.total;
              threshold += sku.popularity;
              if (threshold < 25) p25+=1;
              if (threshold < 50) p50+=1;
              if (threshold < 75) p75+=1;
              if (threshold < 90) p90+=1;
            }

            console.log('Region: ' + region + ' has P25: ' + p25 + ' P50: ' + p50 + ' P75: ' + p75 + ' P90: ' + p90);

            p25n+=1; p25delta=p25-p25mean; p25mean+=p25delta/p25n; p25delta2=p25-p25mean; p25M2+=p25delta*p25delta2;
            p50n+=1; p50delta=p50-p50mean; p50mean+=p50delta/p50n; p50delta2=p50-p50mean; p50M2+=p50delta*p50delta2;
            p75n+=1; p75delta=p75-p75mean; p75mean+=p75delta/p75n; p75delta2=p75-p75mean; p75M2+=p75delta*p75delta2;
            p90n+=1; p90delta=p90-p90mean; p90mean+=p90delta/p90n; p90delta2=p90-p90mean; p90M2+=p90delta*p90delta2;
          }

          console.log('P25: ' + p25mean + ' +/- ' + Math.sqrt(p25M2/(p25n-1)));
          console.log('P50: ' + p50mean + ' +/- ' + Math.sqrt(p50M2/(p50n-1)));
          console.log('P75: ' + p75mean + ' +/- ' + Math.sqrt(p75M2/(p75n-1)));
          console.log('P90: ' + p90mean + ' +/- ' + Math.sqrt(p90M2/(p90n-1)));
        }
      });
    }
  },
  argv = process.argv,
  argc = argv.length;

main(argc, argv);
