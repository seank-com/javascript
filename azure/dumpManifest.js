
const fs = require('fs');
const path = require('path');

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
    "VIRTUALMACHINES": "Virtual Machines",
    "AVAILABILITYSETS": "Virtual Machine Scale Sets"
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
    "SERVERS":          "Azure SQL Database",
    "MANAGEDINSTANCES": "Azure SQL Managed Instance",
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

function load(filename) {
  return new Promise((resolve, reject) => {
    var pathname = path.resolve('.', filename);

    fs.readFile(pathname, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

async function main(argc, argv) {

  if (argc < 3) {
    console.log('Usage: node dumpManifest.js <manifest.json>');
    return;
  }

  var manifest = await load(argv[2]);

  var resourceProvider = manifest.namespace;

  // if (serviceLookup.hasOwnProperty(resourceProvider.toUpperCase())) {
  //   var service = serviceLookup[resourceProvider.toUpperCase()] || "Unknown";

  //   if (typeof service === 'string') {
  //     if (manifest.management.serviceTreeInfos && ((manifest.management.serviceTreeInfos.length || 0) > 0)) {
  //       for (var i = 0; i < manifest.management.serviceTreeInfos.length; i++) {
  //         var serviceTreeInfo = manifest.management.serviceTreeInfos[i];
  //         console.log(`"${service}","${resourceProvider}","${serviceTreeInfo.serviceId}"`);
  //       }
  //     } else {
  //       console.log(`"${service}","${resourceProvider}","Unknown"`);
  //     }
  //   } else {
  //     for(property in service) {
  //       if (manifest.management.serviceTreeInfos && ((manifest.management.serviceTreeInfos.length || 0) > 0)) {
  //         for (var i = 0; i < manifest.management.serviceTreeInfos.length; i++) {
  //           var serviceTreeInfo = manifest.management.serviceTreeInfos[i];
  //           console.log(`"${service[property]}","${resourceProvider}","${serviceTreeInfo.serviceId}"`);
  //         }
  //       } else {
  //         console.log(`"${service[property]}","${resourceProvider}","Unknown"`);
  //       }
  //     }
  //   }
  // }

  for (var i = 0; i < manifest.resourceTypes.length; i++) {
    if (manifest.resourceTypes[i].routingType === "Default") {
      console.log(`${resourceProvider}/${manifest.resourceTypes[i].name}`);

      var regionFound = false;
      var zonesFound = false;
      var anyZonesFound = false;
      for (var j = 0; j < manifest.resourceTypes[i].endpoints.length; j++) {
        if (manifest.resourceTypes[i].endpoints[j].locations.includes("East US 2 EUAP")) {
          regionFound = true;
          if (manifest.resourceTypes[i].endpoints[j].hasOwnProperty("zones")) {
            zonesFound = true;
            console.log(JSON.stringify(manifest.resourceTypes[i].endpoints[j].zones, null, 2));
          }
        }
        
        if (manifest.resourceTypes[i].endpoints[j].hasOwnProperty("zones")) {
          anyZonesFound = true;
        }
      }

      if (!regionFound) {
        if (anyZonesFound) {
          console.log("No East US 2 EUAP region found but there are regions with zones");
        } else {
          console.log("No East US 2 EUAP region found and no regions have zones");
        }
      } else if (!zonesFound) {
        if (anyZonesFound) {
          console.log("No zones found for East US 2 EUAP region but there are regions with zones");
        } else {
          console.log("No zones found for East US 2 EUAP region, or any other region");
        }
      } 
    }
  }  
}


main(process.argv.length, process.argv);
