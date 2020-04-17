#!/usr/bin/env node
const nedb = require("nedb-promises");
const program = require('commander');
const Accounting = require("accounting");
const inquirer = require('inquirer');
const Azure = require("./azure/");
const {DeploymentSettings, Locations, AppServicePlans, PostgresInfo} = Azure;
const consola = require("consola");


const fs = require("fs");
const path = require("path");
program.version('0.0.1');
const settingsFile = path.resolve(__dirname, "..", "package.json");
let settings = require(settingsFile);

//this will resolve to the bin directory
const dbPath = path.resolve(__dirname, "azure", "settings.db");
const db = nedb.create(dbPath);

const initSettings = async function(){
  const webSkus = AppServicePlans.map(p => {
    return {name: `${p.name} (${p.key}): ~${Accounting.formatMoney(p.price)}/mo`, value: p.key}
  });

  const dbSkus = PostgresInfo.map(p => {
    return {name: `${p.name}: ${p.cores} cores with ${p.ram}G RAM ~${Accounting.formatMoney(p.price)}/mo`, value: p.key}
  });

  console.log("Hiya! Just need to ask three quick questions...");
  const locQ = await inquirer.prompt({ type: 'list', name: 'location', message: 'What Azure data center do you want?', choices: Locations, default: "westus" })
  const webQ = await inquirer.prompt({ type: 'list', name: 'webSku', message: 'What sku do you want for your web app?', choices: webSkus, default: "F1" })
  const dbQ = await inquirer.prompt({ type: 'list', name: 'dbSku', message: 'Last question: what size Postgres do you need?', choices: dbSkus, default: "B_Gen5_1" })
  
  const deployment = new DeploymentSettings({ webSku: webQ.webSku, dbSku: dbQ.dbSku, location: locQ.location});
  
  //saving this in package.json - NO PASSWORDS HERE
  settings.azure = {
    resourceGroup: deployment.resourceGroup,
    appName: deployment.appName,
    location: deployment.location,
    planName: deployment.planName,
    runtime: deployment.runtime,
    deployUser: deployment.deployUser,
    dbServerName: deployment.dbServerName,
    dbUser: deployment.dbUser,
    webSku: deployment.webSku,
    dbSku: deployment.dbSku,
    siteUrl: deployment.siteUrl()
  };

  fs.writeFileSync(settingsFile,JSON.stringify(settings, null, 2))

  //just in case
  await db.remove({setting: "default"});

  //now, save the URLs and passwords in the settings db locally
  //DO NOT WANT this in the package.json

  await db.insert({
    setting: "default",
    dbPassword: deployment.dbPassword,
    deployPassword: deployment.deployPassword,
    pgUrl: deployment.pgUrl(),
    gitRemote: deployment.gitRemote()
  });


  consola.success("All set! Your settings have been saved in package.json. You can see your passwords by invoking 'azure creds' or all of the settings by using 'azure info'");
  consola.success(`Your app name is ${deployment.resourceGroup}`);
  return deployment;
}


const setUpCLI = function(azure){

  program.command("info").description("Loads the environment information for your review").action(function(){
    consola.info(azure.settings);
  });

  program.command("secrets:set <dbPassword> <deployPassword>").description("You can fix a bad situation where you lose your secrets - just send in the dbPassword and deployPassword").action(async function(dbPassword, deployPassword){
    await db.remove({setting: "default"});

    settings.dbPassword = dbPassword;
    settings.deployPassword = deployPassword;
    //this will reset everything
    const newSettings = new DeploymentSettings(settings)


    await db.insert({
      setting: "default",
      dbPassword: newSettings.dbPassword,
      deployPassword: newSettings.deployPassword,
      pgUrl: newSettings.pgUrl(),
      gitUrl: newSettings.gitRemote()
    });

    consola.success("Secrets reset!");
    consola.success(newSettings);
    consola.success(`PG URL is ${newSettings.pgUrl()}`);
    consola.success(`Git Remote is ${newSettings.gitRemote()}`);
  })

  program.command("reset").description("Reset your deployment settings entirely. This will overwrite your current settings... careful!") .action(initSettings);

  program.command("create").description("Creates a web app for linux").action(async function(){
    await azure.createAppServiceForLinux();
  })

  program.command("pg:create").description("Creates a Postgres database").action(async function(){
    await azure.createPostgresServer();
  })

  program.command("creds").description("Displays your remote postgres connection URL and git remote URL. Store this in a safe place only").action(async function(){
    const setting = await db.findOne({setting: "default"});
    console.log("")
    consola.success(`🔐 ${setting.pgUrl}`);
    consola.success(`🤹🏻‍♂️ ${setting.gitUrl}`);
    console.log("")
  })


  program.command("init").description("Sets up your web service and database on Azure").action(async function(){
      try{
        await azure.createAppServiceForLinux();
      }catch(err){
        console.error("Dang! There was an error setting up the web app");
        console.log(err);
        console.log("You can roll everything back using 'azure destroy'");
        return
      }
      try{
        await azure.createPostgresServer();
      }catch(err){
        console.error("Darn! There was a problem setting up Postgres");
        console.log(err);
        console.log("You can roll everything back using 'azure destroy'");
      }
      
      console.log("You're all set! You can now deploy with 'git push azure master'");
  });

  program.command("destroy").description("Blows up the entire resource group - Careful!").action(function(){
    inquirer.prompt({ type: 'confirm', name: 'destroy', message: 'Hey! This will drop everything - you sure?', default: false })
      .then(async function(answers){
        if(answers.destroy){
          await azure.Common.destroyResourceGroup();
        }else{
          console.log("No prob - canceling");
        }
      });
  })

  program.command("web:config <settings>").description("Open the app in your default browser").action(function(settings){
    azure.Web.configureAppSettings(settings);
  })

  program.command("web:open").description("Open the app in your default browser").action(function(){
    azure.Web.open();
  })

  program.command("web:debug").description("Open the advanced app tools (Oryx - great for troubleshooting) for this app").action(function(){
    azure.Web.openOryx();
  })


  program.command("web:logs").option("-t, --tail","Tail vs. showing the logs").description("Views the log files").action(async function(args){
    if(args.tail){
      await azure.Web.tailLogs();
    }else{
      await azure.Web.showLogs();
    }
  })


  program.command("pg:psql").description("Creates a PSQL shell connected to the remote Postgres").action(function(){
    const { spawn } = require('child_process')
    const shell = spawn('psql',[azure.settings.pgUrl], { stdio: 'inherit' })
    shell.on('close',(code) =>{ console.log("Disconnected from Remote Postgres")})
  });


  program.parse(process.argv);
}


if(!settings.azure){
  console.log("Hi! We need to generate your file settings... ");
    
  initSettings().then(settings => {
    if(settings){
      const azure = Azure.init(settings);
      setUpCLI(azure);
    }else{
      //not sure how we'd get here? I suppose quitting the process
    }
  })
}else{
  //load the secrets back in so we have them later on
  const getSecrets = db.findOne({setting: "default"});
  getSecrets.then(res => {

    settings.azure.dbPassword = res.dbPassword;
    settings.azure.deployPassword= res.deployPassword;
    settings.azure.pgUrl= res.pgUrl;
    settings.azure.gitRemote= res.gitRemote;
    
  }).catch(err => {
    consola.error("💩Looks like the settings DB got blown away, which means you lost your passwords :(. If you can find them somwhere, you can reset using 'azure secrets:set'. Otherwise... the only way to fix this is to reset Azure using azure reset")
  }).finally(() => {
    const azure = Azure.init(settings.azure);
    setUpCLI(azure);
  })

  // console.log("Hi and welcome! To get started, use azure --help.");
  // console.log("To see your settings, use 'azure info'");
}


