/*
Design a parking lot using object-oriented principles

Goals:
- Your solution should be in Java - if you would like to use another language, please let the interviewer know.
- Boilerplate is provided. Feel free to change the code as you see fit

Assumptions:
- The parking lot can hold motorcycles, cars and vans
- The parking lot has motorcycle spots, car spots and large spots
- A motorcycle can park in any spot
- A car can park in a single compact spot, or a regular spot
- A van can park, but it will take up 3 regular spots
- These are just a few assumptions. Feel free to ask your interviewer about more assumptions as needed

Here are a few methods that you should be able to run:
- Tell us how many spots are remaining
- Tell us how many total spots are in the parking lot
- Tell us when the parking lot is full
- Tell us when the parking lot is empty
- Tell us when certain spots are full e.g. when all motorcycle spots are taken
- Tell us how many spots vans are taking up

Hey candidate! Welcome to your interview. I'll start off by giving you a Solution class. To run the code at any time, please hit the run button located in the top left corner.
*/

function createLot(map) {
  var _lot = {
      spaces: [],
      capacity: { m:0, c:0, r:0, l:0 },
      occupancy: { m:0, c:0, r:0, l:0 },
      availability: { m:0, c:0, r:0, l:0 }
    },
    forfor = (coll, func) => {
      var r, s;

      for (r = 0 ; r < coll.length; r += 1)
        for (s = 0; s < coll[r].length; s += 1)
          func(coll[r][s], r, s);
    },
    updateStatus = () => {
      _lot.capacity = { m:0, c:0, r:0, l:0 };
      _lot.occupancy = { m:0, c:0, r:0, l:0 };
      _lot.availability = { m:0, c:0, r:0, l:0 };

      forfor(_lot.spaces, (space, r,s) => {
        if (space.occupied == false) {
          _lot.availability[space.type] += 1;
        } else if (space.vehicle != '2' && space.vehicle != '3') {
          _lot.occupancy[space.vehicle] += 1;
        }
        _lot.capacity[space.type] += 1;
      });

      _lot.availability.m += _lot.availability.c + _lot.availability.r + _lot.availability.l;
      _lot.availability.c += _lot.availability.r + _lot.availability.l;
      _lot.availability.r += _lot.availability.l;
      
      // vans are dicy

      _lot.capacity.total = _lot.capacity.m + _lot.capacity.c + _lot.capacity.r + _lot.capacity.l;
      _lot.occupancy.total = _lot.occupancy.m + _lot.occupancy.c + _lot.occupancy.r + _lot.occupancy.l;
      _lot.availability.total = _lot.availability.m + _lot.availability.c + _lot.availability.r + _lot.availability.l;
    },
    initLot = (map) => {
      _lot.spaces = [];

      forfor(map, (spaceType, r, s) => {
        if (s == 0) {
          _lot.spaces[r] = [];
        }
        _lot.spaces[r][s] = {
          type: spaceType,
          vehicle: ' ',
          occupied: false
        };      
      });
    },
    canPark = (v, r, s) => {
      if (_lot.spaces[r][s].occupied == false) {
        switch(v) {
          case 'm':
            return true;
          case 'c':
            return (_lot.spaces[r][s].type != 'm');
          case 'r':
            return (_lot.spaces[r][s].type == 'r' || _lot.spaces[r][s].type == 'l');
          case 'l':
            if (_lot.spaces[r][s].type == 'l') {
              return true;
            } else if (_lot.spaces[r][s].type == 'r' && s+2 < _lot.spaces[r].length &&
                      _lot.spaces[r][s+1].type == 'r' && _lot.spaces[r][s+1].occupied == false &&
                      _lot.spaces[r][s+2].type == 'r' && _lot.spaces[r][s+2].occupied == false) {
              return true;
            }
        }
      }
      return false;
    },
    getBestSpot = (v) => {
      var candidates = {
        m: null,
        c: null,
        r: null,
        l: null,
        la: null
      }
      forfor(_lot.spaces, (space, r, s) => {
        if (space.occupied == false) {
          if (candidates[space.type] == null) {
            candidates[space.type] = {
              row: r,
              space: s
            };
          }
          if (space.type == 'r' && candidates.la == null && canPark('l', r, s)) {
            candidates.la  = {
              row: r,
              space: s
            };
          }
        }
      });    
      return candidates;  
    },
    optimalPark = (v) => {
      var r = -1, s = -1, candidates = {};
      if (v == 'm' || v == 'c' || v == 'r' || v == 'l') {
        candidates = getBestSpot(v);
        switch(v) {
          case 'm':
            if (candidates.m != null) {
              r = candidates.m.row;
              s = candidates.m.space;
              break;
            }
          case 'c':
            if (candidates.c != null) {
              r = candidates.c.row;
              s = candidates.c.space;
              break;
            }
          case 'r':
            if (candidates.r != null) {
              r = candidates.r.row;
              s = candidates.r.space;
              break;
            }
          case 'l':
            if (candidates.l != null) {
              r = candidates.l.row;
              s = candidates.l.space;
              break;
            }
            if (v == 'l' && candidates.la != null) {
              r = candidates.la.row;
              s = candidates.la.space;
              _lot.spaces[r][s].occupied = true;
              _lot.spaces[r][s+1].occupied = true;
              _lot.spaces[r][s+2].occupied = true;
              _lot.spaces[r][s].vehicle = 'l';
              _lot.spaces[r][s+1].vehicle = '2';
              _lot.spaces[r][s+2].vehicle = '3';
              return `Parked vehicle (${v}) in row ${r} slot ${s} type ${_lot.spaces[r][s].type}`;
            }
        }
        if (r != -1 || s != -1) {
          _lot.spaces[r][s].occupied = true;
          _lot.spaces[r][s].vehicle = v;
          return `Parked vehicle (${v}) in row ${r} slot ${s} type ${_lot.spaces[r][s].type}`;
        }
        return "ERROR; No available spots remaining";
      } else {
        return "ERROR: Invalid Vehicle Type";
      }
    },
    park = (v) => {
      var i,j;

      if (v == 'm' || v == 'c' || v == 'r' || v == 'l') {
        for(r = 0; r < _lot.spaces.length; r += 1) {
          for (s = 0; s < _lot.spaces[r].length; s += 1) {
            if (canPark(v, r, s)) {
              if (v == 'l' && _lot.spaces[r][s].type == 'r') {
                _lot.spaces[r][s].occupied = true;
                _lot.spaces[r][s+1].occupied = true;
                _lot.spaces[r][s+2].occupied = true;
                _lot.spaces[r][s].vehicle = 'l';
                _lot.spaces[r][s+1].vehicle = '2';
                _lot.spaces[r][s+2].vehicle = '3';
                return `Parked vehicle (${v}) in row ${r} slot ${s} type ${_lot.spaces[r][s].type}`;
              } else {
                _lot.spaces[r][s].occupied = true;
                _lot.spaces[r][s].vehicle = v;
                return `Parked vehicle (${v}) in row ${r} slot ${s} type ${_lot.spaces[r][s].type}`;
              }
            }
          }
        }
        return "ERROR; No available spots remaining";
      } else {
        return "ERROR: Invalid Vehicle Type";
      }
    },
    leave = (r, s) => {
      if (r < _lot.spaces.length && s < _lot.spaces[r].length) {
        if (_lot.spaces[r][s].occupied) {
          if (_lot.spaces[r][s].vehicle == '2' || _lot.spaces[r][s].vehicle == '3') {
            return "ERROR: Invalid Large Vehicle Location";
          }
          
          if (_lot.spaces[r][s].vehicle == 'l' && _lot.spaces[r][s].type == 'r') {
            _lot.spaces[r][s].occupied = false;
            _lot.spaces[r][s].vehicle = ' ';
            _lot.spaces[r][s+1].occupied = false;
            _lot.spaces[r][s+1].vehicle = ' ';
            _lot.spaces[r][s+2].occupied = false;
            _lot.spaces[r][s+2].vehicle = ' ';
            return "freed up three spaces";
          } else {
            _lot.spaces[r][s].occupied = false;
            _lot.spaces[r][s].vehicle = ' ';
            return "freed up one space";
          }
        } else {
          return "ERROR: Location empty";
        }
      } else {
        return "ERROR: Invalid parking location";
      }
    },
    empty = () => {
      forfor(_lot.spaces, (space, r,s) => {
        space.occupied = false;
        space.vehicle = ' ';
      });
    },
    status = () => {
      var row, r, s, totalCapacity, totalOccupancy;
      updateStatus();
      
      totalCapacity = _lot.capacity.m + _lot.capacity.c + _lot.capacity.r + _lot.capacity.l;
      totalOccupancy = _lot.occupancy.m + _lot.occupancy.c + _lot.occupancy.r + _lot.occupancy.l;

      console.log(`Capacity(${totalCapacity}): {m:${_lot.capacity.m} c:${_lot.capacity.c} r:${_lot.capacity.r} l:${_lot.capacity.l}} `);
      console.log(`Occupancy(${totalOccupancy}): {m:${_lot.occupancy.m} c:${_lot.occupancy.c} r:${_lot.occupancy.r} l:${_lot.occupancy.l}} `);
      console.log(`Availability: {m:${_lot.availability.m} c:${_lot.availability.c} r:${_lot.availability.r} l:${_lot.availability.l}} `);

      if (_lot.availability.total == 0)
      {
        console.log(`Utilization efficiency: ${(_lot.occupancy.total * 100.0)/_lot.capacity.total}`);
      }

      for(r = 0; r < _lot.spaces.length; r += 1) {
        row = "|";
        for (s = 0; s < _lot.spaces[r].length; s += 1) {
          row += _lot.spaces[r][s].vehicle + "|";
        }
        console.log(row);
      }
    };

  initLot(map);

  return {
    park: park,
    optimalPark: optimalPark,
    leave: leave,
    empty: empty,
    status: status
  }
}

var lot = createLot([
  ["m","m","c","c","c","c","c","c","r","r","r","r","r","r","r","r","r","r","l","l","l","l","l","r","r","r","r","r","r","r","r","r","r","c","c","c","c","c","c","m","m"],
  ["m","m","c","c","c","c","c","c","r","r","r","r","r","r","r","r","r","r","l","l","l","l","l","r","r","r","r","r","r","r","r","r","r","c","c","c","c","c","c","m","m"],
  ["m","m","c","c","c","c","c","c","r","r","r","r","r","r","r","r","r","r","l","l","l","l","l","r","r","r","r","r","r","r","r","r","r","c","c","c","c","c","c","m","m"],
  ["m","m","c","c","c","c","c","c","r","r","r","r","r","r","r","r","r","r","l","l","l","l","l","r","r","r","r","r","r","r","r","r","r","c","c","c","c","c","c","m","m"],
]);

lot.status();

for(var i = 0; i < 50; i += 1) {
  lot.park('m');
  lot.park('c');
  lot.park('r');
  lot.park('l');
}

lot.status();
lot.empty();

for(var i = 0; i < 50; i += 1) {
  lot.optimalPark('m');
  lot.optimalPark('c');
  lot.optimalPark('r');
  lot.optimalPark('l');
}

lot.status();
