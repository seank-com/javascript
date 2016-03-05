/*jslint indent: 4, node: true, stupid: true, nomen: true */
/*global */

var argv = process.argv,
  argc = argv.length,
  testLicense = function (licenses) {
    var license = (licenses || [])[0];
    if (license) {
      console.log(license);
    } else {
      console.log("no license");
    }
  },
  main = function (argc, argv) {

    var license = [];
    testLicense();
    testLicense(license);
    license.push("Yay!");
    testLicense(license);
  };

main(argc, argv);
