const path = require('path');
const fs = require('fs');

function main(argv) {
  if (argv.length !== 1) {
    console.log("Usage: node processlog.js <filename>");
    process.exit();
  }
  var lines = fs.readFileSync(path.resolve(".", argv[0]), "utf8").split("\n");
  var errors = {}, i = 0, j = 0, error = {};
  for (i = 0; i < lines.length; i+=1) {
    if (lines[i] === "--------------------------------------------------------------------------------") {
      if (errors[lines[i+2]]) {
        errors[lines[i+2]].count += 1;
      } else {
        error = { count: 1, msg: []};
        for(j=i+1; j<lines.length; j+=1) {
          if (lines[j] === "--------------------------------------------------------------------------------") {
            error.msg = error.msg.join("\n");
            errors[lines[i+2]] = error;
            break;
          }
          error.msg.push(lines[j])
        }
      }
    }
  }

  Object.keys(errors).forEach(function(key){
    console.log("The following error occured ", errors[key].count, "times");
    console.log(errors[key].msg);
  })
};

main(process.argv.slice(2));
