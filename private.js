/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

var argv = process.argv,
  argc = argv.length;

function Foo(x, y) {
  "use strict";

  // Private
  var _x = x,
    _y = y,
    _getX = function () {
      return _x;
    },
    _setX = function (x) {
      _x = x;
    },
    _getY = function () {
      return _y;
    },
    _setY = function (y) {
      _y = y;
    };

  if (!(this instanceof Foo)) {
    return new Foo(x, y);
  }

  // Privledged
  this.getX = _getX;
  this.setX = _setX;
  this.getY = _getY;
  this.setY = _setY;
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
  console.log("test complete");
}

main(argc, argv);
