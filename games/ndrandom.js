//
// Author: Sean Kelly
// Copyright (c) 2016 by Sean Kelly. All right reserved.
// Licensed under the MIT license.
// See LiCENSE file in the project root for full license information.
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
      this.size += (this.d[i].x - this.d[i-1].x) * ((this.d[i].y + this.d[i-1].y)/2);
      this.d[i].size = this.size;
    }

    for (let i = 0; i < this.d.length; i += 1) {
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
      if (udr <= this.d[i].dist) {
        let x1 = this.d[i - 1].x,
          y1 = this.d[i - 1].y,
          y2 = this.d[i].y,
          x2 = this.d[i].x,
          m = (y2 - y1)/(x2 - x1),
          s1 = this.d[i - 1].size,
          s2 = this.d[i].size,
          d1 = this.d[i - 1].dist,
          d2 = this.d[i].dist,
          vp = (udr * this.size) - s1,
          a = m/2,
          b = y1-(x1 * m),
          c = ((x1 * x1 * m/2) - (x1 * y1) - vp),
          aos = (-1 * b) / (2 * a),
          distance = Math.sqrt((b * b) - (4 * a * c)) / (2 * a),
          xp = aos - distance;
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
