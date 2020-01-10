const crypto = require('crypto');
const https = require('https');
const access_name = 'name';
const access_key = 'secret';
const hostname = 'api.endpoint.com';

function getRobots() {

    var options = {
        hostname: hostname,
        path: '/api/base/robots',
        method: 'GET',
        headers: {
        }
    },
    dt = new Date(Date.now()).toUTCString(),
    hmac = crypto.createHmac('sha1', access_key),
    string_to_sign = options.method + ' ' + options.path + '\\n' + dt;

    hmac.update(string_to_sign, 'utf8');

    options.headers['Date'] = dt;
    options.headers['Authorization'] = 'SEGWAY ' + access_name + ':' + hmac.digest('base64')

    var req = https.request(options, (res) => {
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

function getRobot(robotId) {

    var options = {
        hostname: hostname,
        path: '/api/base/robot/' + robotId + '/status',
        method: 'GET',
        headers: {
        }
    },
    dt = new Date(Date.now()).toUTCString(),
    hmac = crypto.createHmac('sha1', access_key),
    string_to_sign = options.method + ' ' + options.path + '\\n' + dt;

    hmac.update(string_to_sign, 'utf8');

    options.headers['Date'] = dt;
    options.headers['Authorization'] = 'SEGWAY ' + access_name + ':' + hmac.digest('base64')

    var req = https.request(options, (res) => {
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

getRobot('EVT6-2-8');