const Commando = require("./commando");

class GitCommands extends Commando {
  constructor(settings){
    super(settings);
  }

  async createRemote(){
    console.log("Configuring git...");
    try{
      console.log("removing existing azure remote (if there)");
      await this.run(`git remote rm azure`);
    }catch(err){
      //let it fail - it's OK if it does
    }
    console.log("Adding azure remote to your local git");
    return this.run(`git remote add azure ${this.settings.gitRemote}`)
  }
  async pushToRemote(){
    console.log("Deploying...")
    return this.run('git push azure master');
  }
}

module.exports = GitCommands;