
const { error } = require('console');
const { ADDRGETNETWORKPARAMS } = require('dns');
const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');

require('dotenv').config();

const clientId = process.env.MSFT_CLIENT_ID;
const clientSecret = process.env.MSFT_CLIENT_SECRET;
const tenantId = process.env.MSFT_TENANT_ID;
const subscriptionId = process.env.MSFT_SUBSCRIPTION_ID;

// https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-services-resource-providers#match-resource-provider-to-service
const serviceLookup = {
  "MICROSOFT.AAD":                          "Azure Active Directory Domain Services",
  "MICROSOFT.ADDONS":                       "core",
  "MICROSOFT.APP":                          "Azure Container Apps",
  "MICROSOFT.ADHYBRIDHEALTHSERVICE":        "Azure Active Directory",
  "MICROSOFT.ADVISOR":                      "Azure Advisor",
  "MICROSOFT.ALERTSMANAGEMENT":             "Azure Monitor",
  "MICROSOFT.ANALYSISSERVICES":             "Azure Analysis Services",
  "MICROSOFT.APIMANAGEMENT":                "API Management",
  "MICROSOFT.APPCONFIGURATION":             "Azure App Configuration",
  "MICROSOFT.APPPLATFORM":                  "Azure Spring Apps",
  "MICROSOFT.ATTESTATION":                  "Azure Attestation Service",
  "MICROSOFT.AUTHORIZATION":                "Azure Resource Manager",
  "MICROSOFT.AUTOMATION":                   "Automation",
  "MICROSOFT.AUTONOMOUSSYSTEMS":            "Autonomous Systems",
  "MICROSOFT.AVS":                          "Azure VMware Solution",
  "MICROSOFT.AZUREACTIVEDIRECTORY":         "Azure Active Directory B2C",
  "MICROSOFT.AZUREARCDATA":                 "Azure Arc-enabled data services",
  "MICROSOFT.AZUREDATA":                    "SQL Server registry",
  "MICROSOFT.AZURESTACK":                   "core",
  "MICROSOFT.AZURESTACKHCI":                "Azure Stack HCI",
  "MICROSOFT.BATCH":                        "Batch",
  "MICROSOFT.BILLING":                      "Cost Management and Billing",
  "MICROSOFT.BINGMAPS":                     "Bing Maps",
  "MICROSOFT.BLOCKCHAIN":                   "Azure Blockchain Service",
  "MICROSOFT.BLOCKCHAINTOKENS":             "Azure Blockchain Tokens",
  "MICROSOFT.BLUEPRINT":                    "Azure Blueprints",
  "MICROSOFT.BOTSERVICE":                   "Azure Bot Service",
  "MICROSOFT.CACHE":                        "Azure Cache for Redis",
  "MICROSOFT.CAPACITY":                     "core",
  "MICROSOFT.CDN":                          "Content Delivery Network",
  "MICROSOFT.CERTIFICATEREGISTRATION":      "App Service Certificates",
  "MICROSOFT.CHANGEANALYSIS":               "Azure Monitor",
  "MICROSOFT.CLASSICCOMPUTE":               "Classic deployment model virtual machine",
  "MICROSOFT.CLASSICINFRASTRUCTUREMIGRATE": "Classic deployment model migration",
  "MICROSOFT.CLASSICNETWORK":               "Classic deployment model virtual network",
  "MICROSOFT.CLASSICSTORAGE":               "Classic deployment model storage",
  "MICROSOFT.CLASSICSUBSCRIPTION":          "Classic deployment model",
  "MICROSOFT.COGNITIVESERVICES":            "Cognitive Services",
  "MICROSOFT.COMMERCE":                     "core",
  "MICROSOFT.COMPUTE": {           
    "VIRTUALMACHINES": "Virtual Machines (Unsure)",
    "AVAILABILITYSETS": "Virtual Machine Scale Sets (Unsure)"
  },
  "MICROSOFT.CONSUMPTION":                  "Cost Management",
  "MICROSOFT.CONTAINERINSTANCE":            "Container Instances",
  "MICROSOFT.CONTAINERREGISTRY":            "Container Registry",
  "MICROSOFT.CONTAINERSERVICE":             "Azure Kubernetes Service (AKS)",
  "MICROSOFT.COSTMANAGEMENT":               "Cost Management",
  "MICROSOFT.COSTMANAGEMENTEXPORTS":        "Cost Management",
  "MICROSOFT.CUSTOMERLOCKBOX":              "Customer Lockbox for Microsoft Azure",
  "MICROSOFT.CUSTOMPROVIDERS":              "Azure Custom Providers",
  "MICROSOFT.DATABOX":                      "Azure Data Box",
  "MICROSOFT.DATABOXEDGE":                  "Azure Stack Edge",
  "MICROSOFT.DATABRICKS":                   "Azure Databricks",
  "MICROSOFT.DATACATALOG":                  "Data Catalog",
  "MICROSOFT.DATAFACTORY":                  "Data Factory",
  "MICROSOFT.DATALAKEANALYTICS":            "Data Lake Analytics",
  "MICROSOFT.DATALAKESTORE":                "Azure Data Lake Storage Gen2",
  "MICROSOFT.DATAMIGRATION":                "Azure Database Migration Service",
  "MICROSOFT.DATAPROTECTION":               "Data Protection",
  "MICROSOFT.DATASHARE":                    "Azure Data Share",
  "MICROSOFT.DBFORMARIADB":                 "Azure Database for MariaDB",
  "MICROSOFT.DBFORMYSQL":                   "Azure Database for MySQL",
  "MICROSOFT.DBFORPOSTGRESQL":              "Azure Database for PostgreSQL",
  "MICROSOFT.DESKTOPVIRTUALIZATION":        "Azure Virtual Desktop",
  "MICROSOFT.DEVICES": {
    "IOTHUBS":              "Azure IoT Hub",
    "PROVISIONINGSERVICES": "Azure IoT Hub Device Provisioning Service"
  },
  "MICROSOFT.DEVICEUPDATE":                 "Device Update for IoT Hub",
  "MICROSOFT.DEVOPS":                       "Azure DevOps",
  "MICROSOFT.DEVSPACES":                    "Azure Dev Spaces",
  "MICROSOFT.DEVTESTLAB":                   "Azure Lab Services",
  "MICROSOFT.DIGITALTWINS":                 "Azure Digital Twins",
  "MICROSOFT.DOCUMENTDB":                   "Azure Cosmos DB",
  "MICROSOFT.DOMAINREGISTRATION":           "App Service",
  "MICROSOFT.DYNAMICSLCS":                  "Lifecycle Services",
  "MICROSOFT.ENTERPRISEKNOWLEDGEGRAPH":     "Enterprise Knowledge Graph",
  "MICROSOFT.EVENTGRID":                    "Event Grid",
  "MICROSOFT.EVENTHUB":                     "Event Hubs",
  "MICROSOFT.FEATURES":                     "Azure Resource Manager",
  "MICROSOFT.GUESTCONFIGURATION":           "Azure Policy",
  "MICROSOFT.HANAONAZURE":                  "SAP HANA on Azure Large Instances",
  "MICROSOFT.HARDWARESECURITYMODULES":      "Azure Dedicated HSM",
  "MICROSOFT.HDINSIGHT":                    "HDInsight",
  "MICROSOFT.HEALTHCAREAPIS":               "Azure API for FHIR",
  "MICROSOFT.HYBRIDCOMPUTE":                "Azure Arc-enabled servers",
  "MICROSOFT.HYBRIDDATA":                   "StorSimple",
  "MICROSOFT.HYBRIDNETWORK":                "Network Function Manager",
  "MICROSOFT.IMPORTEXPORT":                 "Azure Import/Export",
  "MICROSOFT.INSIGHTS":                     "Azure Monitor",
  "MICROSOFT.IOTCENTRAL":                   "Azure IoT Central",
  "MICROSOFT.IOTSPACES":                    "Azure Digital Twins",
  "MICROSOFT.INTUNE":                       "Azure Monitor",
  "MICROSOFT.KEYVAULT":                     "Key Vault",
  "MICROSOFT.KUBERNETES":                   "Azure Arc-enabled Kubernetes",
  "MICROSOFT.KUBERNETESCONFIGURATION":      "Azure Arc-enabled Kubernetes",
  "MICROSOFT.KUSTO":                        "Azure Data Explorer",
  "MICROSOFT.LABSERVICES":                  "Azure Lab Services",
  "MICROSOFT.LOGIC":                        "Logic Apps",
  "MICROSOFT.MACHINELEARNING":              "Machine Learning Studio",
  "MICROSOFT.MACHINELEARNINGSERVICES":      "Azure Machine Learning",
  "MICROSOFT.MAINTENANCE":                  "Azure Maintenance",
  "MICROSOFT.MANAGEDIDENTITY":              "Managed identities for Azure resources",
  "MICROSOFT.MANAGEDNETWORK":               "Virtual networks managed by PaaS services",
  "MICROSOFT.MANAGEDSERVICES":              "Azure Lighthouse",
  "MICROSOFT.MANAGEMENT":                   "Management Groups",
  "MICROSOFT.MAPS":                         "Azure Maps",
  "MICROSOFT.MARKETPLACE":                  "core",
  "MICROSOFT.MARKETPLACEAPPS":              "core",
  "MICROSOFT.MARKETPLACEORDERING":          "core",
  "MICROSOFT.MEDIA":                        "Media Services",
  "MICROSOFT.MICROSERVICES4SPRING":         "Azure Spring Apps",
  "MICROSOFT.MIGRATE":                      "Azure Migrate",
  "MICROSOFT.MIXEDREALITY":                 "Azure Spatial Anchors",
  "MICROSOFT.MOBILENETWORK":                "Azure Private 5G Core",
  "MICROSOFT.NETAPP":                       "Azure NetApp Files",
  "MICROSOFT.NETWORK": {
    "APPLICATIONGATEWAYS":    "Application Gateway (Unsure)",
    "BASTIONHOSTS":           "Azure Bastion (Unsure)",
    "DDOSPROTECTIONPLANS":    "Azure DDoS Protection (Unsure)",
    "DNSRESOLVERS":           "Azure DNS (Unsure)",
    "EXPRESSROUTEGATEWAYS":   "Azure ExpressRoute (Unsure)",
    "AZUREFIREWALLS":         "Azure Firewall (Unsure)",
    "FRONTDOORS":             "Azure Front Door Service (Unsure)",
    "PRIVATEENDPOINTS":       "Azure Private Link (Unsure)",
    "VIRTUALROUTERS":         "Azure Route Server (Unsure)",
    "LOADBALANCERS":          "Load Balancer (Unsure)",
    "NETWORKWATCHERS":        "Network Watcher (Unsure)",
    "TRAFFICMANAGERPROFILES": "Traffic Manager (Unsure)",
    "VIRTUALNETWORKS":        "Virtual Network (Unsure)",
    "NATGATEWAYS":            "Virtual Network NAT (Unsure)",
    "VIRTUALWANS":            "Virtual WAN (Unsure)",
    "VPNGATEWAYS":            "VPN Gateway (Unsure)"
  },
  "MICROSOFT.NOTEBOOKS":                    "Azure Notebooks",
  "MICROSOFT.NOTIFICATIONHUBS":             "Notification Hubs",
  "MICROSOFT.OBJECTSTORE":                  "Object Store",
  "MICROSOFT.OFFAZURE":                     "Azure Migrate",
  "MICROSOFT.OPERATIONALINSIGHTS":          "Azure Monitor",
  "MICROSOFT.OPERATIONSMANAGEMENT":         "Azure Monitor",
  "MICROSOFT.PEERING":                      "Azure Peering Service",
  "MICROSOFT.POLICYINSIGHTS":               "Azure Policy",
  "MICROSOFT.PORTAL":                       "Azure portal",
  "MICROSOFT.POWERBI":                      "Power BI",
  "MICROSOFT.POWERBIDEDICATED":             "Power BI Embedded",
  "MICROSOFT.POWERPLATFORM":                "Power Platform",
  "MICROSOFT.PROJECTBABYLON":               "Azure Data Catalog",
  "MICROSOFT.QUANTUM":                      "Azure Quantum",
  "MICROSOFT.RECOVERYSERVICES":             "Azure Site Recovery",
  "MICROSOFT.REDHATOPENSHIFT":              "Azure Red Hat OpenShift",
  "MICROSOFT.RELAY":                        "Azure Relay",
  "MICROSOFT.RESOURCEGRAPH":                "Azure Resource Graph",
  "MICROSOFT.RESOURCEHEALTH":               "Azure Service Health",
  "MICROSOFT.RESOURCES":                    "Azure Resource Manager",
  "MICROSOFT.SAAS":                         "core",
  "MICROSOFT.SCHEDULER":                    "Scheduler",
  "MICROSOFT.SEARCH":                       "Azure Cognitive Search",
  "MICROSOFT.SECURITY":                     "Security Center",
  "MICROSOFT.SECURITYINSIGHTS":             "Microsoft Sentinel",
  "MICROSOFT.SERIALCONSOLE":                "Azure Serial Console for Windows",
  "MICROSOFT.SERVICEBUS":                   "Service Bus",
  "MICROSOFT.SERVICEFABRIC":                "Service Fabric",
  "MICROSOFT.SERVICES":                     "core",
  "MICROSOFT.SIGNALRSERVICE":               "Azure SignalR Service",
  "MICROSOFT.SOFTWAREPLAN":                 "License",
  "MICROSOFT.SOLUTIONS":                    "Azure Managed Applications",
  "MICROSOFT.SQL": {
    "SERVERS":          "Azure SQL Database (Unsure)",
    "MANAGEDINSTANCES": "Azure SQL Managed Instance (Unsure)",
    "VIRTUALCLUSTERS":  "Azure Synapse Analytics (Unsure)"
  },
  "MICROSOFT.SQLVIRTUALMACHINE":            "SQL Server on Azure Virtual Machines",
  "MICROSOFT.STORAGE":                      "Storage",
  "MICROSOFT.STORAGECACHE":                 "Azure HPC Cache",
  "MICROSOFT.STORAGESYNC":                  "Storage",
  "MICROSOFT.STORSIMPLE":                   "StorSimple",
  "MICROSOFT.STREAMANALYTICS":              "Azure Stream Analytics",
  "MICROSOFT.SUBSCRIPTION":                 "core",
  "MICROSOFT.SUPPORT":                      "core",
  "MICROSOFT.SYNAPSE":                      "Azure Synapse Analytics",
  "MICROSOFT.TIMESERIESINSIGHTS":           "Azure Time Series Insights",
  "MICROSOFT.TOKEN":                        "Token",
  "MICROSOFT.VIRTUALMACHINEIMAGES":         "Azure Image Builder",
  "MICROSOFT.VISUALSTUDIO":                 "Azure DevOps",
  "MICROSOFT.VMWARE":                       "Azure VMware Solution",
  "MICROSOFT.VMWARECLOUDSIMPLE":            "Azure VMware Solution by CloudSimple",
  "MICROSOFT.VSONLINE":                     "Azure DevOps",
  "MICROSOFT.WEB": {
    "SITES":         "App Service (Unsure)",
    "CONTAINERAPPS": "Azure Functions (Unsure)"
  },
  "MICROSOFT.WINDOWSDEFENDERATP":           "Microsoft Defender Advanced Threat Protection",
  "MICROSOFT.WINDOWSESU":                   "Extended Security Updates",
  "MICROSOFT.WINDOWSIOT":                   "Windows 10 IoT Core Services",
  "MICROSOFT.WORKLOADMONITOR":              "Azure Monitor",
};

const manifestLookup = {
  "MICROSOFT.ANALYSISSERVICES": true,
  "MICROSOFT.APIMANAGEMENT": true,
  "MICROSOFT.APPPLATFORM": true,
  "MICROSOFT.AVS": true,
  "MICROSOFT.BAKERYUNMANAGED": true,
  "MICROSOFT.BING": true,
  "MICROSOFT.BLOCKCHAIN": true,
  "MICROSOFT.BOTSERVICE": true,
  "MICROSOFT.COGNITIVESERVICES": true,
  "MICROSOFT.COMPUTE": true,
  "MICROSOFT.DATAMIGRATION": true,
  "MICROSOFT.DATAPLATFORM": true,
  "MICROSOFT.DEVCENTER": true,
  "MICROSOFT.DEVICEUPDATE": true,
  "MICROSOFT.ELASTICSAN": true,
  "MICROSOFT.FABRIC": true,
  "MICROSOFT.FIDALGO": true,
  "MICROSOFT.HPCWORKBENCH": true,
  "MICROSOFT.KUSTO": true,
  "MICROSOFT.LABSERVICES": true,
  "MICROSOFT.MACHINELEARNING": true,
  "MICROSOFT.MACHINELEARNINGSERVICES": true,
  "MICROSOFT.MIXEDREALITY": true,
  "MICROSOFT.MODSIMWORKBENCH": true,
  "MICROSOFT.OPENAI": true,
  "MICROSOFT.OPERATORVOICEMAIL": true,
  "MICROSOFT.POWERBIDEDICATED": true,
  "MICROSOFT.STORAGE": true,
  "MICROSOFT.STORAGECACHE": true,
  "MICROSOFT.SWIFTLET": true,
  "MICROSOFT.SYNAPSE": true,
  "MICROSOFT.TESTBASE": true,
  "MICROSOFT.VMWAREONAZURE": true,
  "MICROSOFT.VMWAREVIRTUSTREAM": true,
  "MICROSOFT.VOICESERVICES": true,
  "MICROSOFT.WORKLOADS": true
};

const telemetryLookup = {
  "MICROSOFT.ANALYSISSERVICES": true,
  "MICROSOFT.APIMANAGEMENT": true,
  "MICROSOFT.APPPLATFORM": true,
  "MICROSOFT.AVS": true,
  "MICROSOFT.BING": true,
  "MICROSOFT.BOTSERVICE": true,
  "MICROSOFT.COGNITIVESERVICES": true,
  "MICROSOFT.COMPUTE": true,
  "MICROSOFT.DATAMIGRATION": true,
  "MICROSOFT.DEVCENTER": true,
  "MICROSOFT.DEVICEUPDATE": true,
  "MICROSOFT.ELASTICSAN": true,
  "MICROSOFT.FABRIC": true,
  "MICROSOFT.HPCWORKBENCH": true,
  "MICROSOFT.KUSTO": true,
  "MICROSOFT.LABSERVICES": true,
  "MICROSOFT.MACHINELEARNING": true,
  "MICROSOFT.MACHINELEARNINGSERVICES": true,
  "MICROSOFT.MODSIMWORKBENCH": true,
  "MICROSOFT.POWERBIDEDICATED": true,
  "MICROSOFT.STORAGE": true,
  "MICROSOFT.STORAGECACHE": true,
  "MICROSOFT.SYNAPSE": true,
  "MICROSOFT.TESTBASE": true,
  "MICROSOFT.WORKLOADS": true
};

function getService(namespace, type) {
  const key = namespace.toUpperCase();

  if (serviceLookup.hasOwnProperty(key)) {
    if (typeof serviceLookup[key] === 'string') {
      return serviceLookup[key];
    }

    if (type === undefined) {
      return "Requires Type";
    }
    const key2 = type.toUpperCase();
    if (serviceLookup[key].hasOwnProperty(key2)) {
      return serviceLookup[key][key2];
    }

    return "Unclear";
  }
  return "Unknown";
}

function getLatestVersion(apiVersions) {
  apiVersions.sort();

  var list = [].concat(apiVersions);

  var result;
  while (list.length > 0) {
    const version = list.pop();
  
    if (version.length > 10) continue;

    result = version;
    break;
  }

  if (!result) {
    result = apiVersions.pop();
  }

  return result;
}

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
      var responseBody;
      res.on('data', (d) => {
        responseBody = responseBody || '';
        responseBody += d;
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const error = new Error(`Unexpected status code(${res.statusCode}): ${res.statusMessage}`);
          reject(error);
        } else {
          if (responseBody) {
            const response = JSON.parse(responseBody);
            resolve(response);
          } else {
            const error = new Error(`responseBody is empty`);
            reject(error);
          }
        }
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

    fs.mkdirSync(path.dirname(pathname), { recursive: true });

    fs.writeFile(pathname, content, (err) => {
      if (err) { 
        reject(err);
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
  for (var i = 0; i < providers.value.length; i++) {
    const provider = providers.value[i];

    const namespace = provider.namespace;
    const registrationState = provider.registrationState;
    const resourceTypes = provider.resourceTypes;
    const service = getService(namespace);

    save(`data/${namespace}.provider.json`, provider);

    if (service !== "Unknown" || namespace.toUpperCase().startsWith("MICROSOFT.")) {
      const entry = {
        namespace: namespace,
        service: service,
        operationTypes: [],
        resourceTypes: []
      };

      for (var j = 0; j < resourceTypes.length; j++) {
        const rt = resourceTypes[j];

        const rtEntry = {
          resourceType: rt.resourceType,
        };

      if (rt.resourceType.toUpperCase() === "OPERATIONS") {
        rtEntry['apiVersion'] = rt.defaultApiVersion || getLatestVersion(rt.apiVersions);
        entry.operationTypes.push(rtEntry);
      } else if (rt.capabilities.indexOf("SupportsTags") >= 0 || rt.capabilities.indexOf("SupportsLocation") >= 0) {
          const locations = rt.locations || [];
          const zoneMappings = rt.zoneMappings || [];

          rtEntry.locations = locations.length;
          rtEntry.zoneMappings = zoneMappings.length;
          rtEntry.zoneMappingsWith0AZs = 0;
          rtEntry.zoneMappingsWith1AZs = 0;
          rtEntry.zoneMappingsWith2AZs = 0;
          rtEntry.zoneMappingsWith3AZs = 0;

          for (var k = 0; k < zoneMappings.length; k++) {
            const zoneMapping = zoneMappings[k];
            switch (zoneMapping.zones.length) {
              case 0: rtEntry.zoneMappingsWith0AZs++; break;
              case 1: rtEntry.zoneMappingsWith1AZs++; break;
              case 2: rtEntry.zoneMappingsWith2AZs++; break;
              case 3: rtEntry.zoneMappingsWith3AZs++; break;
            }
          }

          entry.resourceTypes.push(rtEntry);
        }
      }

      if (!result.hasOwnProperty(registrationState))
        result[registrationState] = [];    

      result[registrationState].push(entry);
    } else {
      console.error(`Unknown service: ${namespace}`);
    }
  }

  return result;
}

async function listOperations(bearerToken, resourceProvider, apiVersion) {
  // https://learn.microsoft.com/en-us/rest/api/appservice/provider/list-operations?tabs=HTTP
  const listOperations = `https://management.azure.com/providers/${resourceProvider}/operations?api-version=${apiVersion}`;

  var armRequest = url.parse(listOperations);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  try {
    const response = await get(armRequest);

    if (response.error) {
      const failure = `${resourceProvider} operations failed`;
      console.error(failure);
      console.error(response.error);
      response = {
        value: [],
        errorMsg: failure,
        error: response.error
      };
    }
  
    return response;
  } catch (e) {
    const failure = `${resourceProvider} operations threw an exception`;
    console.error(failure);
    console.error(e);
    return {
      value: [],
      errorMsg: failure,
      error: e
    };
  }
}

function summarizeOperations(operations) {
  const summary = {
    writeOperations: [],
    skuOperations: [],
    issues: []
  };

  var lowerCase = false,
    mixedCase = false,
    upperCase = false,
    noValue = false,
    getProperty = function (lower, upper, defaultValue) {
      if (lower) {
        lowerCase = true;
        mixedCase = upperCase;
        return lower;
      } else if (upper) {
        upperCase = true;
        mixedCase = lowerCase;
        return upper;
      } else {
        return defaultValue;
      }
    },
    getValue = function (operations) {
      if (Array.isArray(operations)) {
        noValue = true;
        return operations;
      }
      return getProperty(operations.value, operations.Value, []);
    },
    value = getValue(operations);

  if (value.length === 0) {
  
    if (operations.errorMsg)
      summary.issues.push(operations.errorMsg);
  
  } else {

    for (var i = 0; i < value.length; i++) {
      var op = value[i];

      var name = getProperty(op.name, op.Name, "Unknown");
      var isDataAction = op.isDataAction || false;
      var display = getProperty(op.display, op.Display, {});
      var resource = getProperty(display.resource, display.Resource, "Unknown");
      var operation = getProperty(display.operation, display.Operation, "Unknown");

      if (name.endsWith("/write")) {
        summary.writeOperations.push({
          name: name,
          resource: resource,
          operation: operation
        });

      } else if (name.toUpperCase().includes("SKU") && name.endsWith("/read")) {
        summary.skuOperations.push({
          name: name,
          resource: resource,
          operation: operation
        });
      }
    }

    if (noValue) summary.issues.push("missing value property");
    if (mixedCase) {
      summary.issues.push("property names have inconsistent casing");
    } else if (upperCase) {
      summary.issues.push("property names begin with uppercase");
    }
  }

  return summary;
}  

async function listSkus(bearerToken) {
  // https://learn.microsoft.com/en-us/rest/api/compute/resource-skus/list?tabs=HTTP
  const listSkusUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/${resourceProvider}/skus?api-version=${apiVersion}`;

  var armRequest = url.parse(listSkusUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

function reportIssues(result) {

  const moreThanOneOperationType = [];
  const noOperationTypes = [];
  const operationsIssues = [];

  for (var registrationState in result) {
    for (var i = 0; i < result[registrationState].length; i++) {
      const rp = result[registrationState][i];

      if (rp.operations) {
        if (rp.operations.issues.length > 0) {
          operationsIssues.push(`    ${rp.service}(${rp.namespace}) has issues with operations API`);
          rp.operations.issues.forEach(element => {
            operationsIssues.push(`      ${element}`);
          });
        }
      }

      if (rp.operationTypes.length > 1) {
        const issue = `${rp.service}(${rp.namespace}) has more than one operations API`;
        moreThanOneOperationType.push(`    ${issue}`);
        rp.operationTypes.forEach(element => {
          moreThanOneOperationType.push(`  ${element.resourceType}`);  
        });
        
        if (rp.operations) {
          rp.operations.issues.push(issue);
        }
      } else if (rp.operationTypes.length < 1) {
        const issue = `${rp.service}(${rp.namespace}) has no operations API`;
        noOperationTypes.push(`  ${issue}`);

        if (rp.operations) {
          rp.operations.issues.push(issue);
        }
      }
    }
  }

  if (noOperationTypes.length > 0 || moreThanOneOperationType.length > 0 || operationsIssues.length > 0) {
    const operations = [...noOperationTypes, ...moreThanOneOperationType, ...operationsIssues];
    console.log('Operation Issues:');
    noOperationTypes.forEach(element => {
      console.log(element);
    });
  }
}

function createSpreadsheet(filename, result) {
  const spreadsheet = [
    `Resource Provider\tService/Offering\tDeployable Resource Type\tRegistered\t`+
    `Manifest\tTelemetry\tOperations\tLocations\tZone Mappings\t`+
    `Zone Mapping (0 AZs)\tZone Mapping (1 AZs)\tZone Mapping (2 AZs)\tZone Mapping (3 AZs)\t`+
    `Issues`];

  for (var registrationState in result) {
    for (var i = 0; i < result[registrationState].length; i++) {
      const rp = result[registrationState][i];

      var hasSkuOperations = (rp.operationTypes.length === 1 && rp.operations.skuOperations.length > 0) ? true : false;
      const key = rp.namespace.toUpperCase();
      var hasManifest = (manifestLookup.hasOwnProperty(key)) ? true : false;
      var hasTelemetry = (telemetryLookup.hasOwnProperty(key)) ? true : false;

      for (var j = 0; j < rp.resourceTypes.length; j++) {
        const rt = rp.resourceTypes[j];

        const Offering = getService(rp.namespace, rt.resourceType);
        const Issues = (rp.operations) ? rp.operations.issues.join(';') : '';

        spreadsheet.push(
          `${rp.namespace}\t${Offering}\t${rt.resourceType}\t${registrationState}\t`+
          `${hasManifest}\t${hasTelemetry}\t${hasSkuOperations}\t${rt.locations}\t${rt.zoneMappings}\t`+
          `${rt.zoneMappingsWith0AZs}\t${rt.zoneMappingsWith1AZs}\t${rt.zoneMappingsWith2AZs}\t${rt.zoneMappingsWith3AZs}\t`+
          `${Issues}`);
      }
    }
  }

  return new Promise((resolve, reject) => {
    const content = spreadsheet.join('\n');
    const pathname = path.resolve('.', filename);

    fs.mkdirSync(path.dirname(pathname), { recursive: true });

    fs.writeFile(pathname, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  const bearerToken = await getBearerToken();

  const providers = await listProviders(bearerToken);
  await save('data/providers.json', providers);

  var result = summarizeProviders(providers);

  for (var registrationState in result) {
    for (var i = 0; i < result[registrationState].length; i++) {
      const rp = result[registrationState][i];

      console.error(`${rp.namespace}`);

      if (rp.operationTypes.length === 1) {
        const operations = await listOperations(bearerToken, rp.namespace, rp.operationTypes[0].apiVersion);
        await save(`data/${rp.namespace}.operations.json`, operations);

        const operationsSummary = summarizeOperations(operations);
        rp.operations = operationsSummary;
      }
    }
  }

  reportIssues(result);

  // must be done after reportIssues because it adds issues to the operations summary
  await createSpreadsheet('data/PostureReport.txt', result);
 
  await save('data/PostureReport.json', result);
}

main();
