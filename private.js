/*jslint indent: 4, node: true, stupid: true, nomen: true */
/*global */

var argv = process.argv,
    argc = argv.length;

function Foo(x, y) {
    "use strict";

    var _x = x,
        _y = y;

    this.getX = function () {
        return _x;
    };

    this.setX = function (x) {
        _x = x;
    };

    this.getY = function () {
        return _y;
    };

    this.setY = function (y) {
        _y = y;
    };
}

function main(argc, argv) {
    "use strict";

    var foo1 = new Foo(0, 0),
        foo2 = new Foo(1, 1);

    if (argc !== 2) {
        console.log('usage: %s %s', argv[0], argv[1]);
    }

    if (foo1.getX() !== 0) {
        console.log("step1");
    }
    if (foo1.getY() !== 0) {
        console.log("step2");
    }
    if (foo2.getX() !== 1) {
        console.log("step3");
    }
    if (foo2.getY() !== 1) {
        console.log("step4");
    }

    foo1.setX(2);

    if (foo1.getX() !== 2) {
        console.log("step5");
    }
    if (foo1.getY() !== 0) {
        console.log("step6");
    }
    if (foo2.getX() !== 1) {
        console.log("step7");
    }
    if (foo2.getY() !== 1) {
        console.log("step8");
    }
}

main(argc, argv);

