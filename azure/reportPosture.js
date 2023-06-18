
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
  "Microsoft.AAD":                          "Azure Active Directory Domain Services",
  "Microsoft.Addons":                       "core",
  "Microsoft.App":                          "Azure Container Apps",
  "Microsoft.ADHybridHealthService":        "Azure Active Directory",
  "Microsoft.Advisor":                      "Azure Advisor",
  "Microsoft.AlertsManagement":             "Azure Monitor",
  "Microsoft.AnalysisServices":             "Azure Analysis Services",
  "Microsoft.ApiManagement":                "API Management",
  "Microsoft.AppConfiguration":             "Azure App Configuration",
  "Microsoft.AppPlatform":                  "Azure Spring Apps",
  "Microsoft.Attestation":                  "Azure Attestation Service",
  "Microsoft.Authorization":                "Azure Resource Manager",
  "Microsoft.Automation":                   "Automation",
  "Microsoft.AutonomousSystems":            "Autonomous Systems",
  "Microsoft.AVS":                          "Azure VMware Solution",
  "Microsoft.AzureActiveDirectory":         "Azure Active Directory B2C",
  "Microsoft.AzureArcData":                 "Azure Arc-enabled data services",
  "Microsoft.AzureData":                    "SQL Server registry",
  "Microsoft.AzureStack":                   "core",
  "Microsoft.AzureStackHCI":                "Azure Stack HCI",
  "Microsoft.Batch":                        "Batch",
  "Microsoft.Billing":                      "Cost Management and Billing",
  "Microsoft.BingMaps":                     "Bing Maps",
  "Microsoft.Blockchain":                   "Azure Blockchain Service",
  "Microsoft.BlockchainTokens":             "Azure Blockchain Tokens",
  "Microsoft.Blueprint":                    "Azure Blueprints",
  "Microsoft.BotService":                   "Azure Bot Service",
  "Microsoft.Cache":                        "Azure Cache for Redis",
  "Microsoft.Capacity":                     "core",
  "Microsoft.Cdn":                          "Content Delivery Network",
  "Microsoft.CertificateRegistration":      "App Service Certificates",
  "Microsoft.ChangeAnalysis":               "Azure Monitor",
  "Microsoft.ClassicCompute":               "Classic deployment model virtual machine",
  "Microsoft.ClassicInfrastructureMigrate": "Classic deployment model migration",
  "Microsoft.ClassicNetwork":               "Classic deployment model virtual network",
  "Microsoft.ClassicStorage":               "Classic deployment model storage",
  "Microsoft.ClassicSubscription":          "Classic deployment model",
  "Microsoft.CognitiveServices":            "Cognitive Services",
  "Microsoft.Commerce":                     "core",
  "Microsoft.Compute": {           
    "foo1": "Virtual Machines",
    "foo2": "Virtual Machine Scale Sets"
  },
  "Microsoft.Consumption":                  "Cost Management",
  "Microsoft.ContainerInstance":            "Container Instances",
  "Microsoft.ContainerRegistry":            "Container Registry",
  "Microsoft.ContainerService":             "Azure Kubernetes Service (AKS)",
  "Microsoft.CostManagement":               "Cost Management",
  "Microsoft.CostManagementExports":        "Cost Management",
  "Microsoft.CustomerLockbox":              "Customer Lockbox for Microsoft Azure",
  "Microsoft.CustomProviders":              "Azure Custom Providers",
  "Microsoft.DataBox":                      "Azure Data Box",
  "Microsoft.DataBoxEdge":                  "Azure Stack Edge",
  "Microsoft.Databricks":                   "Azure Databricks",
  "Microsoft.DataCatalog":                  "Data Catalog",
  "Microsoft.DataFactory":                  "Data Factory",
  "Microsoft.DataLakeAnalytics":            "Data Lake Analytics",
  "Microsoft.DataLakeStore":                "Azure Data Lake Storage Gen2",
  "Microsoft.DataMigration":                "Azure Database Migration Service",
  "Microsoft.DataProtection":               "Data Protection",
  "Microsoft.DataShare":                    "Azure Data Share",
  "Microsoft.DBforMariaDB":                 "Azure Database for MariaDB",
  "Microsoft.DBforMySQL":                   "Azure Database for MySQL",
  "Microsoft.DBforPostgreSQL":              "Azure Database for PostgreSQL",
  "Microsoft.DesktopVirtualization":        "Azure Virtual Desktop",
  "Microsoft.Devices": {
    "foo1": "Azure IoT Hub",
    "foo2": "Azure IoT Hub Device Provisioning Service"
  },
  "Microsoft.DeviceUpdate":                 "Device Update for IoT Hub",
  "Microsoft.DevOps":                       "Azure DevOps",
  "Microsoft.DevSpaces":                    "Azure Dev Spaces",
  "Microsoft.DevTestLab":                   "Azure Lab Services",
  "Microsoft.DigitalTwins":                 "Azure Digital Twins",
  "Microsoft.DocumentDB":                   "Azure Cosmos DB",
  "Microsoft.DomainRegistration":           "App Service",
  "Microsoft.DynamicsLcs":                  "Lifecycle Services",
  "Microsoft.EnterpriseKnowledgeGraph":     "Enterprise Knowledge Graph",
  "Microsoft.EventGrid":                    "Event Grid",
  "Microsoft.EventHub":                     "Event Hubs",
  "Microsoft.Features":                     "Azure Resource Manager",
  "Microsoft.GuestConfiguration":           "Azure Policy",
  "Microsoft.HanaOnAzure":                  "SAP HANA on Azure Large Instances",
  "Microsoft.HardwareSecurityModules":      "Azure Dedicated HSM",
  "Microsoft.HDInsight":                    "HDInsight",
  "Microsoft.HealthcareApis":                "(Azure API for FHIR)	Azure API for FHIR",
  "Microsoft.HealthcareApis":                "(Healthcare APIs)	Healthcare APIs",
  "Microsoft.HybridCompute":                "Azure Arc-enabled servers",
  "Microsoft.HybridData":                   "StorSimple",
  "Microsoft.HybridNetwork":                "Network Function Manager",
  "Microsoft.ImportExport":                 "Azure Import/Export",
  "Microsoft.Insights":                     "Azure Monitor",
  "Microsoft.IoTCentral":                   "Azure IoT Central",
  "Microsoft.IoTSpaces":                    "Azure Digital Twins",
  "Microsoft.Intune":                       "Azure Monitor",
  "Microsoft.KeyVault":                     "Key Vault",
  "Microsoft.Kubernetes":                   "Azure Arc-enabled Kubernetes",
  "Microsoft.KubernetesConfiguration":      "Azure Arc-enabled Kubernetes",
  "Microsoft.Kusto":                        "Azure Data Explorer",
  "Microsoft.LabServices":                  "Azure Lab Services",
  "Microsoft.Logic":                        "Logic Apps",
  "Microsoft.MachineLearning":              "Machine Learning Studio",
  "Microsoft.MachineLearningServices":      "Azure Machine Learning",
  "Microsoft.Maintenance":                  "Azure Maintenance",
  "Microsoft.ManagedIdentity":              "Managed identities for Azure resources",
  "Microsoft.ManagedNetwork":               "Virtual networks managed by PaaS services",
  "Microsoft.ManagedServices":              "Azure Lighthouse",
  "Microsoft.Management":                   "Management Groups",
  "Microsoft.Maps":                         "Azure Maps",
  "Microsoft.Marketplace":                  "core",
  "Microsoft.MarketplaceApps":              "core",
  "Microsoft.MarketplaceOrdering":          "core",
  "Microsoft.Media":                        "Media Services",
  "Microsoft.Microservices4Spring":         "Azure Spring Apps",
  "Microsoft.Migrate":                      "Azure Migrate",
  "Microsoft.MixedReality":                 "Azure Spatial Anchors",
  "Microsoft.MobileNetwork":                "Azure Private 5G Core",
  "Microsoft.NetApp":                       "Azure NetApp Files",
  "Microsoft.Network": {
    "foo01": "Application Gateway",
    "foo02": "Azure Bastion",
    "foo03": "Azure DDoS Protection",
    "foo04": "Azure DNS",
    "foo05": "Azure ExpressRoute",
    "foo06": "Azure Firewall",
    "foo07": "Azure Front Door Service",
    "foo08": "Azure Private Link",
    "foo09": "Azure Route Server",
    "foo10": "Load Balancer",
    "foo11": "Network Watcher",
    "foo12": "Traffic Manager",
    "foo13": "Virtual Network",
    "foo14": "Virtual Network NAT",
    "foo15": "Virtual WAN",
    "foo16": "VPN Gateway"
  },
  "Microsoft.Notebooks":                    "Azure Notebooks",
  "Microsoft.NotificationHubs":             "Notification Hubs",
  "Microsoft.ObjectStore":                  "Object Store",
  "Microsoft.OffAzure":                     "Azure Migrate",
  "Microsoft.OperationalInsights":          "Azure Monitor",
  "Microsoft.OperationsManagement":         "Azure Monitor",
  "Microsoft.Peering":                      "Azure Peering Service",
  "Microsoft.PolicyInsights":               "Azure Policy",
  "Microsoft.Portal":                       "Azure portal",
  "Microsoft.PowerBI":                      "Power BI",
  "Microsoft.PowerBIDedicated":             "Power BI Embedded",
  "Microsoft.PowerPlatform":                "Power Platform",
  "Microsoft.ProjectBabylon":               "Azure Data Catalog",
  "Microsoft.Quantum":                      "Azure Quantum",
  "Microsoft.RecoveryServices":             "Azure Site Recovery",
  "Microsoft.RedHatOpenShift":              "Azure Red Hat OpenShift",
  "Microsoft.Relay":                        "Azure Relay",
  "Microsoft.ResourceGraph":                "Azure Resource Graph",
  "Microsoft.ResourceHealth":               "Azure Service Health",
  "Microsoft.Resources":                    "Azure Resource Manager",
  "Microsoft.SaaS":                         "core",
  "Microsoft.Scheduler":                    "Scheduler",
  "Microsoft.Search":                       "Azure Cognitive Search",
  "Microsoft.Security":                     "Security Center",
  "Microsoft.SecurityInsights":             "Microsoft Sentinel",
  "Microsoft.SerialConsole":                "Azure Serial Console for Windows",
  "Microsoft.ServiceBus":                   "Service Bus",
  "Microsoft.ServiceFabric":                "Service Fabric",
  "Microsoft.Services":                     "core",
  "Microsoft.SignalRService":               "Azure SignalR Service",
  "Microsoft.SoftwarePlan":                 "License",
  "Microsoft.Solutions":                    "Azure Managed Applications",
  "Microsoft.Sql": {
    "foo1": "Azure SQL Database",
    "foo2": "Azure SQL Managed Instance",
    "foo3": "Azure Synapse Analytics"
  },
  "Microsoft.SqlVirtualMachine":            "SQL Server on Azure Virtual Machines",
  "Microsoft.Storage":                      "Storage",
  "Microsoft.StorageCache":                 "Azure HPC Cache",
  "Microsoft.StorageSync":                  "Storage",
  "Microsoft.StorSimple":                   "StorSimple",
  "Microsoft.StreamAnalytics":              "Azure Stream Analytics",
  "Microsoft.Subscription":                 "core",
  "microsoft.support":                      "core",
  "Microsoft.Synapse":                      "Azure Synapse Analytics",
  "Microsoft.TimeSeriesInsights":           "Azure Time Series Insights",
  "Microsoft.Token":                        "Token",
  "Microsoft.VirtualMachineImages":         "Azure Image Builder",
  "microsoft.visualstudio":                 "Azure DevOps",
  "Microsoft.VMware":                       "Azure VMware Solution",
  "Microsoft.VMwareCloudSimple":            "Azure VMware Solution by CloudSimple",
  "Microsoft.VSOnline":                     "Azure DevOps",
  "Microsoft.Web": {
    "foo1": "App Service",
    "foo2": "Azure Functions"
  },
  "Microsoft.WindowsDefenderATP":           "Microsoft Defender Advanced Threat Protection",
  "Microsoft.WindowsESU":                   "Extended Security Updates",
  "Microsoft.WindowsIoT":                   "Windows 10 IoT Core Services",
  "Microsoft.WorkloadMonitor":              "Azure Monitor",
};

function getService(namespace, type) {

  if (serviceLookup.hasOwnProperty(namespace)) {
    if (typeof serviceLookup[namespace] === 'string') {
      return serviceLookup[namespace];
    }

    if (type === undefined) {
      return "Requires Type";
    }

    if (serviceLookup[namespace].hasOwnProperty(type)) {
      return serviceLookup[namespace][type];
    }
  }
  return "Unknown";
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
    var provider = providers.value[i];

    var namespace = provider.namespace;
    var registrationState = provider.registrationState;
    var resourceTypes = provider.resourceTypes;
    var service = getService(namespace);

    if (service !== "Unknown") {
      var entry = {
        namespace: namespace,
        service: service,
        resourceTypes: []
      };

      for (var j = 0; j < resourceTypes.length; j++) {
        var resourceType = resourceTypes[j];
        if (resourceType.capabilities !== 'None')
          entry.resourceTypes.push(resourceType);
      }

      if (!result.hasOwnProperty(registrationState))
        result[registrationState] = [];    

      result[registrationState].push(entry);
    }
  }

  for (var registrationState in result) {
    console.log(`${registrationState} (${result[registrationState].length})`);
    for (var i = 0; i < result[registrationState].length; i++) {
      var rps = result[registrationState][i];
      console.log(`  ${rps.service} (${rps.namespace})`);
      for (var j = 0; j < rps.resourceTypes.length; j++) {
        var type = rps.resourceTypes[j].resourceType;
        console.log(`    ${rps.resourceTypes[j].resourceType} (${rps.resourceTypes[j].capabilities})`);
      }
    }
  }

  return result;
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

async function listSkus(bearerToken) {
  // https://learn.microsoft.com/en-us/rest/api/compute/resource-skus/list?tabs=HTTP
  const listSkusUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/skus?api-version=2021-04-01`;

  var armRequest = url.parse(listSkusUri);
  armRequest.headers = {
    'Content-Type': 'application/json',
    'Authorization': bearerToken
  };

  var response = await get(armRequest);

  return response;
}

async function main() {

  var bearerToken = await getBearerToken();

  response = await listProviders(bearerToken);
  summarizeProviders(response);
  // await save('computeResourceTypes.json', response);


  // console.log('Provider Resource Types');
  // response = await listProviderResourceTypes(bearerToken, 'Microsoft.ServiceFabric');
  // await save('serviceFabricResourceTypes.json', response);

  // console.log('Provider');
  // response = await getProvider(bearerToken, 'Microsoft.ServiceFabric');
  // await save('serviceFabricProvider.json', response);

  // console.log('Skus');
  // response = await listSkus(bearerToken);
  // await save('skus.json', response);

}

main();
