/*jslint indent: 4, node: true, stupid: true */
/*global require: false, process: false */

// findSymbol.js
//
// Needed for some porting work figure out where symbol 
// was coming from given and list of directory paths.
//
var fs = require('fs'),
    path = require('path'),
    includes = {
        "$(PROJECT_PRIV_INC_PATH)":                                                "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\comms\\priv_sdk\\inc",
        "$(PROJECT_INC_PATH)":                                                     "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\comms\\inc",
        "$(BASEOS_INC_PATH)":                                                      "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\baseos\\inc",
        "$(_PHONEBASE_SDK_INC_PATH)":                                              "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\phonebase\\inc",
        "$(_CORESYS_PRIV_SDK_PATH)":                                               "S:\\EXP_FNDS\\public\\coresystem\\internal\\minwin\\priv_sdk\\inc",
        "$(UXPLAT_INC_PATH)":                                                      "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\uxplat\\inc",
        "$(INTERNAL_SDK_INC_PATH)":                                                "S:\\EXP_FNDS\\public\\coresystem\\internal\\sdk\\inc",
        "$(OBJ_PATH)\\..\\..\\idl\\$O":                                            "O:\\exp_fnds.obj.mc.x86fre\\src\\comms\\product\\services\\mediadata\\idl\\objfre\\i386",
        "$(OBJ_PATH)\\$O":                                                         "O:\\exp_fnds.obj.mc.x86fre\\src\\comms\\product\\services\\mediadata\\service\\lib\\objfre\\i386",
        "$(SQLCOMPACT_INC_PATH)":                                                  "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\sqlce\\inc",
        "$(_PROJECT_MK_PATH)\\product\\Utils\\recoveredb\\inc":                    "S:\\EXP_FNDS\\src\\comms\\product\\Utils\\recoveredb\\inc",
        "$(PUBLIC_ROOT)\\wpinternal\\appplat\\inc":                                "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\appplat\\inc",
        "$(REALWORLD_INC_PATH)":                                                   "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\realworld\\inc",
        "$(_PROJECT_MK_PATH)\\Product\\Utils\\RecurrenceEngine\\inc":              "S:\\EXP_FNDS\\src\\comms\\Product\\Utils\\RecurrenceEngine\\inc",
        "$(COM_INC_PATH)":                                                         "S:\\EXP_FNDS\\public\\coresystem\\internal\\com\\inc",
        "$(WPSHELL_INC_PATH)":                                                     "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\shell\\inc",
        "$(SHELL_INC_PATH)":                                                       "S:\\EXP_FNDS\\public\\coresystem\\internal\\shell\\inc",
        "$(NET_CELLCORE_INC_PATH)":                                                "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\net_cellcore\\inc",
        "$(BASE_INC_PATH)":                                                        "S:\\EXP_FNDS\\public\\coresystem\\internal\\base\\inc",
        "$(UXPLATFORM_AVCORE_INC_PATH)":                                           "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\uxplatform_avcore\\inc",
        "$(_PROJECT_MK_PATH)\\product\\ObjectModels\\MessagingDataModel\\src":     "S:\\EXP_FNDS\\src\\comms\\product\\ObjectModels\\MessagingDataModel\\src",
        "$(MEDIA_MEINFRA_INC_PATH)":                                               "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\media_meinfra\\inc",
        "$(MINCORE_PRIV_SDK_INC_PATH)":                                            "S:\\EXP_FNDS\\public\\coresystem\\internal\\mincore\\priv_sdk\\inc",
        "$(_PROJECT_MK_PATH)\\product\\Services\\MediaLibrary\\Lib":               "S:\\EXP_FNDS\\src\\comms\\product\\Services\\MediaLibrary\\Lib",
        "$(COM_INC_PATH)\\winrt":                                                  "S:\\EXP_FNDS\\public\\coresystem\\internal\\com\\inc\\winrt",
        "$(INTERNAL_SDK_INC_PATH)\\winrt":                                         "S:\\EXP_FNDS\\public\\coresystem\\internal\\sdk\\inc\\winrt",
        "$(WINRT_INC_PATH).1":                                                     "S:\\exp_fnds.public.mc.x86fre\\wpinternal\\WinPRT\\Inc",
        "$(WINRT_INC_PATH).2":                                                     "S:\\EXP_FNDS\\public\\coresystem\\internal\\sdk\\inc"
    },
    processFile = function (symbol, file, filename, target, result) {
        "use strict";

        var lines = fs.readFileSync(filename, { encoding: "utf8"}).split('\r\n'),
            count = lines.length,
            i = 0,
            hasTarget = false;

        for (i = 0; i < count; i += 1) {
            if (lines[i].toLowerCase().indexOf(target) > 0 && lines[i].toLowerCase().indexOf('#include') > 0) {
                result.includes[symbol] = result.includes[symbol] || {};
                result.includes[symbol][file] = result.includes[symbol][file] || {};
                result.includes[symbol][file]['(' + i + ')'] = lines[i];
                hasTarget = true;
            }
        }

        if (!hasTarget) {
            for (i = 0; i < count; i += 1) {
                if (lines[i].toLowerCase().indexOf(target) > 0) {
                    result.hits[symbol] = result.hits[symbol] || {};
                    result.hits[symbol][file] = result.hits[symbol][file] || {};
                    result.hits[symbol][file]['(' + i + ')'] = '-';
                    break;
                }
            }
        }

        return result;
    },
    processLocation = function (symbol, dir, target, result) {
        "use strict";

        var files = fs.readdirSync(dir),
            count = files.length,
            i = 0,
            file = '',
            filename = '',
            stat = {};

        for (i = 0; i < count; i += 1) {
            file = files[i];

            filename = path.resolve(dir, file);
            stat = fs.statSync(filename);

            if (stat.isFile()) {
                if (file.toLowerCase() === target) {
                    result.locations.push(symbol);
                }

                result = processFile(symbol, file, filename, target, result);
            }
        }

        return result;
    },
    processLocations = function (target) {
        "use strict";

        var symbol = '',
            dir = '',
            result = {
                locations: [],
                includes: {},
                hits: {}
            };

        for (symbol in includes) {
            if (includes.hasOwnProperty(symbol)) {
                console.error('Processing ' + includes[symbol]);

                dir = path.resolve('.', includes[symbol]);

                result = processLocation(symbol, dir, target, result);
            }
        }

        return result;
    },
    main = function (argc, argv) {
        "use strict";

        var target = '',
            symbol = '',
            file = '',
            line = '',
            out = '',
            lines = '',
            result;

        if (argc !== 3) {
            console.log('usage: %s %s symbol', argv[0], argv[1]);
        } else {
            target = argv[2].toLowerCase();

            result = processLocations(target);

            if (result.locations.length > 0) {
                out = '------------------------------------------------------------------------------\r\n';
                out += 'Found \'' + target + '\' in the following locations\r\n';
                out += '------------------------------------------------------------------------------\r\n';
                for (symbol in result.locations) {
                    if (result.locations.hasOwnProperty(symbol)) {
                        out += result.locations[symbol] + '\r\n';
                    }
                }
            }

            for (symbol in result.includes) {
                if (result.includes.hasOwnProperty(symbol)) {
                    lines += '------------------------------------------------------------------------------\r\n';
                    lines += 'Includes in files under ' + symbol + '\r\n';
                    lines += '------------------------------------------------------------------------------\r\n';

                    for (file in result.includes[symbol]) {
                        if (result.includes[symbol].hasOwnProperty(file)) {
                            for (line in result.includes[symbol][file]) {
                                if (result.includes[symbol][file].hasOwnProperty(line)) {
                                    lines += file + line + result.includes[symbol][file][line] + '\r\n';
                                }
                            }
                        }
                    }
                }
            }

            for (symbol in result.hits) {
                if (result.hits.hasOwnProperty(symbol)) {
                    lines += '------------------------------------------------------------------------------\r\n';
                    lines += 'Hits in files under ' + symbol + '\r\n';
                    lines += '------------------------------------------------------------------------------\r\n';
                    for (file in result.hits[symbol]) {
                        if (result.hits[symbol].hasOwnProperty(file)) {
                            for (line in result.hits[symbol][file]) {
                                if (result.hits[symbol][file].hasOwnProperty(line)) {
                                    lines += file + line + '\r\n';
                                }
                            }
                        }
                    }
                }
            }

            if (lines) {
                out += lines;
            }

            console.log(out);
        }
    },
    argv = process.argv,
    argc = argv.length;

main(argc, argv);
