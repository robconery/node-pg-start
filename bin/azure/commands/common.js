const Commando = require("./commando");

class CommonCommands extends Commando{
  constructor(settings){
    super(settings);
  }
  createResourceGroup(){
    console.log("Setting resource group", this.settings.resourceGroup);
    const cmd = `az group create -n ${this.settings.resourceGroup} --location ${this.settings.location} --output none`;
    return this.run(cmd);
  }
  destroyResourceGroup(){
    console.log(`Destroying group ${this.settings.resourceGroup} and everything in it!`);
    const cmd = `az group delete -n ${this.settings.resourceGroup}  -y --output none`;
    return this.run(cmd);
  }
}

module.exports = CommonCommands;