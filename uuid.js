
var crypto = require('crypto');

function uuidgen() {
    var i = 0,b = [];
    for (var x of crypto.randomBytes(16)) {
        b.push((0x100 + x).toString(16).substr(1));
        i += 1;
        if (i === 4 || i === 6 || i === 8 || i === 10)
            b.push('-');
    }
    return b.join('');
}

console.log(uuidgen());
