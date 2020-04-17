const {Git, Web, Postgres,Common} = require("./commands");
const DeploymentSettings = require("./deployment");
const NameGenerator = require("./name_gen");
const PostgresInfo = require("./data/db_sizes");
const AppServicePlans = require("./data/plans");
const Locations = require("./data/locations");
const RemotePG = require("./data/remote");

class Azure{

  static NameGenerator = NameGenerator;
  static PostgresInfo = PostgresInfo;
  static AppServicePlans = AppServicePlans;
  static Locations = Locations;
  static DeploymentSettings = DeploymentSettings;

  static init(settings){
    return new Azure(settings);
  }

  constructor(settings){
    this.settings = settings;
    this.Git = new Git(settings);
    this.Web = new Web(settings);
    this.Postgres = new Postgres(settings);
    this.Common = new Common(settings);
  }

  async createPostgresServer(){
    //resource group
    await this.Common.createResourceGroup();

    //do the server
    await this.Postgres.createServer();

    //firewall for this user's IP
    await this.Postgres.userFirewall();

    //Azure services firewall
    await this.Postgres.servicesFirewall();

    //now configure it
    const pg = new RemotePG(this.settings);
    await pg.init();
  };

  async createAppServiceForLinux(){

    //git config
    await this.Git.createRemote();

    //resource group
    await this.Common.createResourceGroup();
    
    //service plan
    await this.Web.createServicePlan();

    //deploy user
    try{
      await this.Web.configureDeploymentUser();
    }catch(err){
      //there's a warning that comes back for some dumb reason
      //and Node treats it like an error
      console.log("Error ith deployment user", err);
    }

    //app
    await this.Web.createWebApp();

    //logging
    await this.Web.configureLogging();

    //settings
    await this.Web.configureDatabase();

    //deploy it!
    //await this.Git.pushToRemote();

  }

}

module.exports = Azure;