//
// Author: Sean Kelly
// Copyright (c) 2016 by Sean Kelly. All right reserved.
// Licensed under the MIT license.
// See LiCENSE file in the project root for full license information.
//

//
// NDRandom is initialized with an array of x,y pairs discribing the shape
// of the distribution. As such the first and last pair must have a y of 0
//
function NDRandom(distribution) {
  'use strict';

  if (distribution.length < 3 || distribution[0].y !== 0 || distribution[distribution.length - 1].y !== 0) {
    this.err = new Error("Distribution information is malformed");
  } else {
    this.d = distribution;
    this.d[0].size = 0;
    this.size = 0;

    for(let i = 1; i < this.d.length; i += 1) {
      // accumulate the area of the current trapezoid
      this.size += (this.d[i].x - this.d[i-1].x) * ((this.d[i].y + this.d[i-1].y)/2);
      // save the area so far of all the trapezoids that have come before
      this.d[i].size = this.size;
    }

    for (let i = 0; i < this.d.length; i += 1) {
      // now calculate the distribution percentage of this
      // trapezoid as a percentage of the cumulative area
      // over the entire area
      this.d[i].dist = this.d[i].size / this.size;
    }
  }
};

NDRandom.prototype.getValue = function (udr) {
  'use strict';

  if (this.err) {
    return err;
  } else {
    for(let i = 1; i < this.d.length; i += 1) {
      // if the uniform distribution value is
      // less than the distribution value of
      // the current trapezoid then we have
      // found the trapezoid where our value
      // belongs
      if (udr <= this.d[i].dist) {
        let x1 = this.d[i - 1].x, // the x on the left side of the trapezoid
          y1 = this.d[i - 1].y, // the y on the left side of the trapezoid
          x2 = this.d[i].x, // the x on the right side of the trapezoid
          y2 = this.d[i].y, // the y on the right side of the trapezoid
          m = (y2 - y1)/(x2 - x1), // the slope of the top of the trapezoid
          s1 = this.d[i - 1].size, // the cumulative size to the left
          vp = (udr * this.size) - s1, // the target partial volume of the trapezoid
          a = m/2, // first coefficient of the quadratic equation
          b = y1-(x1 * m), // second coefficient of the quadratic equation
          c = ((x1 * x1 * m/2) - (x1 * y1) - vp), // contant value of the quadratic equation
          aos = (-1 * b) / (2 * a), // axis of symmetry
          distance = Math.sqrt((b * b) - (4 * a * c)) / (2 * a), // distance from aos
          xp = aos - distance; // the partial x we are solving for

        // one of these will be in the target range
        // the other will not
        if (xp < x1 || xp > x2) {
          xp = aos + distance;
        }
        return xp;
      }
    }
  }
};

function main(args) {
  'use strict';

  var ndrandom = new NDRandom([
    {x:0, y:0},
    {x:5, y:5},
    {x:10, y:0},
    {x:15, y:5},
    {x:20, y:0}
  ]);

  console.log("0.0 = " , ndrandom.getValue(0));
  console.log("0.1 = " , ndrandom.getValue(0.1));
  console.log("0.2 = " , ndrandom.getValue(0.2));
  console.log("0.3 = " , ndrandom.getValue(0.3));
  console.log("0.4 = " , ndrandom.getValue(0.4));
  console.log("0.5 = " , ndrandom.getValue(0.5));
  console.log("0.6 = " , ndrandom.getValue(0.6));
  console.log("0.7 = " , ndrandom.getValue(0.7));
  console.log("0.8 = " , ndrandom.getValue(0.8));
  console.log("0.9 = " , ndrandom.getValue(0.9));
  console.log("1 = " , ndrandom.getValue(1));
};

main(process.argv);
