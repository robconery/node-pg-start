const {exec} = require("child_process");

exports.run = function(cmd){

  return new Promise((resolve, reject) => {
    //console.log(cmd);
    exec(cmd, function(err, stdout, stderr){
      if(err) return reject(err)
      return resolve(stdout);
    });
  }) 
}