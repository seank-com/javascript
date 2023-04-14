
const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');

require('dotenv').config();

const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const tenantId = process.env.AZURE_TENANT_ID;
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

function post(options, requestBody) {
  options.method = 'POST';

  return new Promise((resolve, reject) => {
    const request = https.request(options, (res) => {
      var responseBody = '';
      res.on('data', (d) => {
        responseBody += d;
      });
      res.on('end', () => {
        var response = JSON.parse(responseBody);
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
        var response = JSON.parse(responseBody);
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

async function listLocations(bearerToken) {
  // https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list-locations?tabs=HTTP
  const listLocationsUri = `https://management.azure.com/subscriptions/${subscriptionId}/locations?api-version=2022-12-01`;

  var armRequest = url.parse(listLocationsUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

function summarizeLocations(locations) {
  var result = {};
  for (var i = 0; i < locations.value.length; i++) {
    var location = locations.value[i];

    var displayName = location.displayName;
    var regionType = location.metadata.regionType;

    var pairedRegions = 0
    if (location.metadata.hasOwnProperty('pairedRegion'))
      pairedRegions = location.metadata.pairedRegion.length; 

    var azCount = 0;
    if (location.hasOwnProperty('availabilityZoneMappings')) 
      azCount = location.availabilityZoneMappings.length;
    
    if (!result.hasOwnProperty(regionType))
      result[regionType] = [];    

    result[regionType].push(`${displayName} ${pairedRegions}+${azCount}`);
  }

  for (var regionType in result) {
    console.log(`  ${regionType} (${result[regionType].length})`);
    for (var i = 0; i < result[regionType].length; i++) {
      console.log(`    ${result[regionType][i]}`);
    }
  }
}

async function listFeatures(bearerToken) {
  // https://learn.microsoft.com/en-us/rest/api/resources/subscription-feature-registrations/list-all-by-subscription?tabs=HTTP
  const listFeaturesUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Features/subscriptionFeatureRegistrations?api-version=2021-07-01`;
  
  var armRequest = url.parse(listFeaturesUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;  
}

function summarizeFeatures(features) {
  var result = {};
  for (var i = 0; i < features.value.length; i++) {
    var feature = features.value[i];

    var name = feature.name;
    var state = feature.properties.state;

    if (!result.hasOwnProperty(state))
      result[state] = [];

    result[state].push(name);
  }

  for (var state in result) {
    console.log(`  ${state} (${result[state].length})`);
    for (var i = 0; i < result[state].length; i++) {
      console.log(`    ${result[state][i]}`);
    }
  }
}

async function listDeployments(bearerToken) {
  // https://learn.microsoft.com/en-us/rest/api/resources/deployments/list-at-subscription-scope
  const listDeploymentsUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Resources/deployments/?api-version=2021-04-01`;

  var armRequest = url.parse(listDeploymentsUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

function summarizeDeployments(deployments) {
  var result = {};
  for (var i = 0; i < deployments.value.length; i++) {
    var deployment = deployments.value[i];

    var name = deployment.name;
    var status = deployment.properties.provisioningState;
    var timestamp = deployment.properties.timestamp;

    if (!result.hasOwnProperty(status))
      result[status] = [];

    result[status].push(`  ${name} ${timestamp}`);
  }

  for (var status in result) {
    console.log(`  ${status} (${result[status].length})`);
    for (var i = 0; i < result[status].length; i++) {
      console.log(`    ${result[status][i]}`);
    }
  }
}

async function listTemplateSpecs(bearerToken) {
  //  https://learn.microsoft.com/en-us/rest/api/resources/template-specs/list-by-subscription?tabs=HTTP
  const listTemplateSpecsUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Resources/templateSpecs/?api-version=2021-05-01`;

  var armRequest = url.parse(listTemplateSpecsUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

function summarizeTemplateSpecs(templateSpecs) {
  var result = {};
  for (var i = 0; i < templateSpecs.length; i++) {
    var templateSpec = templateSpecs[i];

    var name = templateSpec.name;
    var versionCount = templateSpec.properties.versions.length;

    if (!result.hasOwnProperty(name))
      result[name] = 0;

    result[name] += versionCount;
  }

  for (var name in result) {
    console.log(`${name} (${result[name]})`);
  }
}

async function listProviders(bearerToken) {
  // https://learn.microsoft.com/en-us/rest/api/resources/providers/list?tabs=HTTP
  const listProvidersUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers?api-version=2021-04-01&%24expand=metadata`;
  
  var armRequest = url.parse(listProvidersUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;  
}

function summarizeProviders(providers) {
  var result = {};
  for (var i = 0; i < providers.length; i++) {
    var provider = providers[i];

    var namespace = provider.namespace;
    var registrationState = provider.registrationState;
    var resourceTypes = provider.resourceTypes.length;

    if (!result.hasOwnProperty(registrationState))
      result[registrationState] = [];    

    result[registrationState].push(`${namespace} ${resourceTypes}`);
  }

  for (var registrationState in result) {
    console.log(`${registrationState} (${result[registrationState].length})`);
    for (var i = 0; i < result[registrationState].length; i++) {
      console.log(`  ${result[registrationState][i]}`);
    }
  }
}

async function listProviderResourceTypes(bearerToken, resourceProviderNamespace) {
  // https://learn.microsoft.com/en-us/rest/api/resources/provider-resource-types/list?tabs=HTTP
  const listProviderResourceTypesUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/${resourceProviderNamespace}/resourceTypes?api-version=2021-04-01&%24expand=metadata`;

  var armRequest = url.parse(listProviderResourceTypesUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

async function listResources(bearerToken, resourceGroupName) {
  // https://learn.microsoft.com/en-us/rest/api/resources/resources/list-by-resource-group
  const listResourcesUri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/resources?api-version=2021-04-01`;

  var armRequest = url.parse(listResourcesUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

async function getProvider(bearerToken, providerNamespace) {
  // https://learn.microsoft.com/en-us/rest/api/resources/providers/get?tabs=HTTP
  const getProviderUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/${providerNamespace}?api-version=2021-04-01&%24expand=metadata`;

  var armRequest = url.parse(getProviderUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;  
}

async function main() {

  var bearerToken = await getBearerToken();

  console.log('Locations');
  var response = await listLocations(bearerToken);
  summarizeLocations(response);
  await save('locations.json', response);

  console.log('Features');
  response = await listFeatures(bearerToken);
  summarizeFeatures(response);
  await save('features.json', response);

  console.log('Deployments');
  response = await listDeployments(bearerToken);
  summarizeDeployments(response);
  await save('deployments.json', response);

  console.log('Template Specs');
  response = await listTemplateSpecs(bearerToken);
  summarizeTemplateSpecs(response);
  await save('templateSpecs.json', response);

  console.log('Providers');
  response = await listProviders(bearerToken);
  summarizeProviders(response);
  await save('providers.json', response);

  console.log('Provider Resource Types');
  response = await listProviderResourceTypes(bearerToken, 'Microsoft.Compute');
  await save('computeResourceTypes.json', response);

  response = await listProviderResourceTypes(bearerToken, 'Microsoft.Cache');
  await save('cacheResourceTypes.json', response);

  console.log('Provider');
  response = await getProvider(bearerToken, 'Microsoft.Compute');
  await save('computeProvider.json', response);

  console.log('Resources');
  response = await listResources(bearerToken, 'factory-ai-vision');
  await save('resources.json', response);
}

main();
