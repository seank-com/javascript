/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

var path = require('path'),
  fs = require('fs'),
  crypto = require('crypto'),
  argv = process.argv,
  argc = argv.length,
  uuidgen = function () {
    'use strict';

    var i = 0,b = [];
    for (var x of crypto.randomBytes(16)) {
      b.push((0x100 + x).toString(16).substr(1));
      i += 1;
      if (i === 4 || i === 6 || i === 8 || i === 10)
        b.push('-');
    }
    return b.join('');
  },
  getVehicle = function() {
    'use strict';

    return {
      VehicleUuid: uuidgen(),
      VehicleId: uuidgen(),
      CleanupSettings: {
        ExpirationTime: "2069-04-19T09:40:35Z",
        DeletionTime: "2069-04-19T09:40:35Z"
      },
      Devices: [
        {
          DeviceVersionMetadata: {
            Default: {
                Major: 1,
                Minor: 0,
                Build: 0,
                Revision: 0,
            },
            DCMVersion: {
                Major: 2,
                Minor: 4,
                Build: 3,
                Revision: 7,
            }
          },
          DeviceName: "IVC",
          ConnectionInformation: {
            IoTDeviceId: uuidgen(),
            IoTDeviceKey: "ActccS3ohOwS+19E/1Z0VFwmb7+mX2zwj7YzYVWomJw="
          }
        },
        {
          DeviceVersionMetadata: {
            Default: {
                Major: 1,
                Minor: 0,
                Build: 0,
                Revision: 0,
            },
            DCMVersion: {
                Major: 2,
                Minor: 4,
                Build: 3,
                Revision: 7,
            }
          },
          DeviceName: "IVI",
          ConnectionInformation: {
            IoTDeviceId: uuidgen(),
            IoTDeviceKey: "LpPVS6AspYdxMtIj7jEB+YMqygkmVv3fQIhjvk5+C9c="
          }
        }
      ]
    };
  },
  main = function (argc, argv) {
    'use strict';

    var vehicles = [],
      i = 0,
      max = 0,
      output = "";

    if (argc < 3 || argc > 4) {
        console.log('usage: %s %s <filename> [vehicleCount=168000]', argv[0], argv[1]);
    } else {
        output = path.resolve('.', argv[2]);

        max = 168000;
        if (argc === 4) {
          max = parseInt(argv[3]);
          if (isNaN(max)) {
            max = 168000;
          }
        }

        for(i = 0; i < max; i += 1) {
          vehicles.push(getVehicle())
        }
    
        fs.writeFile(output, JSON.stringify(vehicles /*, null, 2*/), function (err) {
            if (err) {
                console.log(err);
            }
        });    
    }
  };

main(argc, argv);
