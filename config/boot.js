const Auth = require("../lib/auth");
const Mail = require("../mail");
const Passport = require("./passport");
const Massive = require("massive");
const consola = require("consola");
const settings = require("../package.json");
require("dotenv").config();

exports.theApp = async function(app){
  
  let rootUrl = `http://localhost:${app.get("port")}`;
  if(process.env.NODE_ENV === "production" && settings.azure){
    rootUrl = settings.azure.siteUrl;
  }

  //set the root URL for use throughout the app
  app.set("rootUrl", rootUrl);

  consola.info(`Connecting to ${process.env.DATABASE_URL}`)
  
  //spin up massive... yay!
  const db = await Massive(process.env.DATABASE_URL);  
  app.set("db", db);

  consola.info("Initializing Auth service...");
  Auth.init({db:db});

  consola.info("Initializing Passport service...");
  let passport = Passport.init({
    Auth: Auth,
    GoogleSettings: {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackUrl: `${rootUrl}/auth/google/callback`
    },
    GithubSettings: {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbakUrl: `${rootUrl}/auth/github/callback`,
      scope: ["user:email"]
    }
  });

  consola.info("Initializing email...")
  Mail.init({
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  })

  app.use(passport.initialize());
  app.use(passport.session());

}