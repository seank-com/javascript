const https = require('https');
const hostname = 'mcvp-anomalydetection-trial';
const subscriptionKey = '';
const argv = process.argv;
const argc = argv.length;

function getInference(data, modelId) {
    return new Promise((resolve, reject) => {
        var resourcePath = `/anomalydetector/v1.1-preview.1/multivariate/models/${modelId}/last/detect`,
            options = {
                hostname: hostname,
                path: resourcePath,
                method: 'POST',
                headers: {
                }
            },
            json = JSON.stringify(data),
            result = '';
    
        options.headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;
        options.headers['Content-Type'] = 'application/json'
        options.headers['Content-Length'] = Buffer.byteLength(json);
    
        var req = https.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                result = result + chunk;
            });
            res.on('end', () => {
                resolve(result);
            });
        });
    
        req.on('error', (e) => {
            reject(e);
        });
    
        req.write(json);
        req.end()
    });
}

function getTest(data) {
    return new Promise((resolve, reject) => {
        var options = {
            hostname: 'reqres.in',
            path: '/api/users',
            method: 'POST',
            headers: {
            }
        },
        json = JSON.stringify(data),
        result = '';
    
        options.headers['Content-Type'] = 'application/json'
        options.headers['Content-Length'] = Buffer.byteLength(json);
    
        var req = https.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                result = result + chunk;
            });
            res.on('end', () => {
                resolve(result);
            });
        });
    
        req.on('error', (e) => {
            reject(e);
        });
    
        req.write(json);
        req.end()
    });
}

async function main(argc, argv) {
    "use strict";

    var result = await getTest({
        name: "morpheus",
        job: "leader"
    });

    console.log(JSON.stringify(JSON.parse(result), null, 2));
}

main(argc, argv).catch((error) => {
    "use strict";
    console.error(error);
});