const nameGenerator = require("./name_gen");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

class Deployment{
  constructor(args={}){
    //names of things
    //this.appName = args.appName || `${settings.name.toLowerCase()}-${nameGenerator.randomIze(100)}`;
    this.resourceGroup = args.resourceGroup || `${nameGenerator.generateAppName()}`;
    this.appName = args.appName || `${this.resourceGroup}-web`;
    this.location = args.location || "westus";
    this.planName = args.planName || `${this.appName}-plan`;
    this.runtime = args.runtime || "NODE|10.14"
    this.deployUser = `${this.appName}-deployer`;
    this.deployPassword = args.deployPassword || uuid.v4();

    this.dbServerName = `${this.resourceGroup}-pg`
    this.dbUser = `admin_${nameGenerator.randomIze(1000)}`;
    this.dbPassword = args.dbPassword || uuid.v4();

    //sku selection
    this.webSku = args.webSku || "B1";
    this.dbSku = args.dbSku || "B_Gen5_1";
  }

  gitRemote(){
    return `https://${this.deployUser}:${this.deployPassword}@${this.appName}.scm.azurewebsites.net/${this.appName}.git`
  }
  pgUrl(){
    return `postgres://${this.dbUser}%40${this.dbServerName}:${this.dbPassword}@${this.dbServerName}.postgres.database.azure.com/postgres`
  }
  siteUrl(){
    return `https://${this.appName}.azurewebsites.net`
  }

}

module.exports = Deployment;
