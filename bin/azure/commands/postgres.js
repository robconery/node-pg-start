const axios = require('axios');
const Commando = require("./commando");

async function getPublicIp(){
  const url = "http://ipinfo.io/ip";
  const res = await axios.get(url);
  return res.data.trim();
}

class PostgresCommands extends Commando{
  constructor(settings){
    super(settings);
  }
  createServer(){
    console.log("Creating a PostgreSQL Server. This is going to take 5 minutes or so. Go get some coffee...");
    const cmd = `az postgres server create --resource-group ${this.settings.resourceGroup} --name ${this.settings.dbServerName} --admin-user ${this.settings.dbUser} --admin-password ${this.settings.dbPassword} --sku-name ${this.settings.dbSku} --ssl-enforcement Disabled --location ${this.settings.location} --output none`
    return this.run(cmd);
  }
  async userFirewall(){
    const ip = await getPublicIp();
    console.log(`Adding a firewall rule for ${ip} (that's you) so you can access remotely`);
    const cmd = `az postgres server firewall-rule create -g ${this.settings.resourceGroup} --server ${this.settings.dbServerName} --name AllowMyIP --start-ip-address ${ip} --end-ip-address ${ip} --output none`
    return this.run(cmd);
  }
  async servicesFirewall(){
    console.log("Adding firewall rule for app services (0.0.0.0)");
    const cmd = `az postgres server firewall-rule create -g ${this.settings.resourceGroup} --server ${this.settings.dbServerName} --name AllowAzureIP --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 --output none`
    return this.run(cmd);
  }
}

module.exports = PostgresCommands;