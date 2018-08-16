const eventhub = require("azure-event-hubs");

const connectionString = "PUT CONNECTION STRING HERE";
const consumerGroup = "$Default";

var ehClient = null;

eventhub.EventHubClient.createFromIotHubConnectionString(connectionString).then(function (result) {
  var onMessage = function (eventData) {
    console.log(JSON.stringify(eventData));
  },
  onError = function (err) {
    console.log("ERROR:", JSON.stringify(err));
  },
  options = {
    eventPosition: eventhub.EventPosition.fromStart(),
    consumerGroup: consumerGroupName
  },
  timestamp = null;

  ehClient = result;

  ehClient.getPartitionIds().then(function (partitions) {  
    partitions.forEach(function (partition) {    
        ehClient.receive(partition, onMessage, onError, options);
    });    
  });
}).catch(function (err) {
  log.err("catch\n", JSON.stringify(err);
  failure = err;
  if (ehClient) {
    ehClient.close();
    ehClient = null;  
  }
});
};

