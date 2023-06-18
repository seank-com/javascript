const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');

require('dotenv').config();

const clientId = process.env.MSFT_CLIENT_ID;
const clientSecret = process.env.MSFT_CLIENT_SECRET;
const tenantId = process.env.MSFT_TENANT_ID;
const subscriptionId = process.env.MSFT_SUBSCRIPTION_ID;

function post(options, requestBody) {
  options.method = 'POST';

  return new Promise((resolve, reject) => {
    const request = https.request(options, (res) => {
      var responseBody = '';
      res.on('data', (d) => {
        responseBody += d;
      });
      res.on('end', () => {
        var response = responseBody ? JSON.parse(responseBody) : '(empty)';
        resolve(response);
      });
      res.on('error', (e) => {
        reject(e);
      });
    });
    request.write(requestBody);
    request.end();
  });
}

function get(options) {
  options.method = 'GET';

  return new Promise((resolve, reject) => {
    const request = https.request(options, (res) => {
      var responseBody = '';
      res.on('data', (d) => {
        responseBody += d;
      });
      res.on('end', () => {
        var response = responseBody ? JSON.parse(responseBody) : '(empty)';
        resolve(response);
      });
      res.on('error', (e) => {
        reject(e);
      });
    });
    request.end();
  });
}

function save(filename, jsonContent) {
  return new Promise((resolve, reject) => {
    var content = JSON.stringify(jsonContent, null, 2);
    var pathname = path.resolve('.', filename);

    fs.writeFile(pathname, content, (err) => {
      if (err) { 
        reject(e);
      } else {
        resolve();
      }
    });
  });
}

async function getBearerToken() {
  const authBody = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&resource=https://management.azure.com/`;
  const authUri = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;

  var authRequest = url.parse(authUri);
  authRequest.headers = { 
    'Content-Type': 'application/x-www-form-urlencoded' 
  };

  var authData = await post(authRequest, authBody);
  var bearerToken = authData.token_type + " " + authData.access_token;
  return bearerToken;
}

async function queryARG(bearerToken, query) {
  const azureResourceGraphUri = 'https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01';

  var argRequest = url.parse(azureResourceGraphUri);
  argRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var body = {
    query: query
  };

  const requestBody = JSON.stringify(body);

  var response = await post(argRequest, requestBody);

  return response;
}

async function main() {

  var bearerToken = await getBearerToken();

//  var response = await queryARG(bearerToken, "Resources | distinct type");
  var response = await queryARG(bearerToken, "Resources | take 10");

  console.log(JSON.stringify(response, null, 2));
}

main();