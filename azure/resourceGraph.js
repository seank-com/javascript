const { DefaultAzureCredential } = require("@azure/identity");
const { ResourceGraphClient } = require("@azure/arm-resourcegraph");

async function main() {

  const credentials = new DefaultAzureCredential();
  const client = new ResourceGraphClient(credentials);
  const result = await client.resources(
    {
        query: "Resources | summarize count()"
    }
    // ,
    // { resultFormat: "table" }
 );

  console.log(result);
}

main();
