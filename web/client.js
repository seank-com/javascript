const crypto = require('crypto');
const http = require('http');

function getUsers() {

    var options = {
        hostname: 'localhost',
        port: 3000,
        path: '/user',
        method: 'GET',
        headers: {
        }
    },
    dt = new Date(Date.now()).toUTCString(),
    access_name = "test_name",
    access_key = "test_key",
    hmac = crypto.createHmac("sha1", access_key),
    string_to_sign = options.method + " " + options.path + "\\n" + dt;

    hmac.update(string_to_sign, "utf8");

    options.headers["Date"] = dt;
    options.headers["Authorization"] = "SEGWAY " + access_name + ":" + hmac.digest('base64')

    var req = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
  
    req.end();
}

getUsers();