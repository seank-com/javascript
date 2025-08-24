const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function main(argc, argv) {

  console.log(`Listing soft deleted services...`);
  const { stdout, stderr } = await exec('az apim deletedservice list');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return;
  }

  const services = JSON.parse(stdout);

  for (const service of services) {
    console.log(`Deleting ${service.name}...`);
    const { stdout, stderr } = await exec(`az apim deletedservice purge --service-name ${service.name} --location "${service.location}"`);
    if (stderr) {
      console.error(`error: ${stderr}`);
      return;
    }
    console.log(stdout);
  }
}

main(process.argv.length, process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});