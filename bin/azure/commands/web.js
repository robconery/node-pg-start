const Commando = require("./commando");

class WebCommands extends Commando {
  constructor(settings){
    super(settings); 
  }

  tailLogs(){
    const cmd = `az  webapp log tail -n ${this.settings.appName} -g ${this.settings.resourceGroup}`;
    return this.run(cmd);
  }
  showLogs(){
    const cmd = `az  webapp log show -n ${this.settings.appName} -g ${this.settings.resourceGroup}`;
    return this.run(cmd);
  }

  open(){

    const cmd = `open ${this.settings.siteUrl}`;
    return this.run(cmd);
  }
  openOryx(){
    const cmd = `open https://${this.settings.appName}.scm.azurewebsites.net`
    return this.run(cmd);
  }
  createServicePlan(){
    console.log(`Creating service plan ${this.settings.planName} with ${this.settings.webSku}` );
    const cmd = `az appservice plan create -g ${this.settings.resourceGroup} -n ${this.settings.planName} --sku ${this.settings.webSku} --is-linux --output none`;
    return this.run(cmd);
  }
  createWebApp(){
    console.log(`Creating web app ${this.settings.appName} with runtime ${this.settings.runtime}` );
    const cmd = `az webapp create -n ${this.settings.appName} -g ${this.settings.resourceGroup} -p ${this.settings.planName} --runtime "${this.settings.runtime}" --deployment-local-git --output none`
    return this.run(cmd);
  }
  configureLogging(){
    console.log("Configuring logging...");
    const cmd = `az webapp log config -n ${this.settings.appName} -g ${this.settings.resourceGroup} --application-logging true --web-server-logging filesystem --docker-container-logging filesystem --level information --detailed-error-messages true --output none`  
    return this.run(cmd);
  }
  configureDatabase(){

    this.configureAppSettings(`DATABASE_URL=${this.settings.pgUrl}`)
  }
  configureAppSettings(appSettings){
    console.log(`Adding App Setting(s) ${appSettings}`);
    const cmd = `az webapp config appsettings set -n ${this.settings.appName} -g ${this.settings.resourceGroup} --output none --settings ${appSettings}`
    return this.run(cmd);
  }
  configureDeploymentUser(){
    console.log("Adding a deployment user...");
    const cmd = `az webapp deployment user set --user-name ${this.settings.deployUser} --password ${this.settings.deployPassword} --output none`
    return this.run(cmd);
  }
}

module.exports = WebCommands;