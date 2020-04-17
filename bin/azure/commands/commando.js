const Exec = require("./exec");
const assert = require("assert");

class Commando{
  constructor(settings){
    assert(settings, "Need the deploy settings for this to work");
    this.settings = settings;
  }

  run(cmd){
    assert(cmd, "No command given");
    return Exec.run(cmd);
  }
}

module.exports = Commando;