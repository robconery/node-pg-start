# The Tailwind Traders Node/PG Starter Site (Preview)

This is a work in progress and I'll be filling this README out a bit more, but if you want to play around right now here's what you'll need to do...

 - Clone this repo and install Node modules
 - Optionally have Postgres up and running locally
 - Setup your ENV stuff

## ENV Variables

You'll need a few if you want everything to work right, and those are:

```
DATABASE_URL="postgres://localhost/tailwind"
GOOGLE_ID="GET ONE FROM GOOGLE"
GOOGLE_SECRET="GET FROM GOOGLE"

GITHUB_ID="GET FROM GITHUB"
GITHUB_SECRET="GET FROM GITHUB"

SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=465
SMTP_USER="postmaster@YOURDOMAIN"
SMTP_PASSWORD="SMTPPASS-aa4b0867-4fa1f484"

alias azure="node ./bin/azure.js"
```

Pop these into a `.env` file in the project root so they can be read by the app on boot.

The last entry there is for the CLI that works with this app - specifically the Azure stuff. You can see what's going on by entering `azure` in the root of this app. Make sure your ENV stuff is loaded first.

## Azure Deployment

If you want to push this to Azure you'll need to:

 - Make sure you have an account and the CLI installed on your local machine
 - Do a `printenv` and make sure you ENV variables are set

If all of that is ready to roll, just start things off with `azure`. You'll be prompted to answer what location you want to use and what SKUs you want to deploy to.

When that's done you can see your setup using `azure info` and then you can setup Azure itself using `azure init`, which will setup your infrastructure on Azure according to your choices.

If you goof up, you can destroy everything using `azure destroy`. See the CLI help stuff for more `azure --help`. 

I'll add a lot more to this as I round it out.