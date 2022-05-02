# The Tailwind Traders Node/PG Starter Site (Preview)

This is a work in progress and I'll be filling this README out a bit more, but if you want to play around right now here's what you'll need to do...

 - Clone this repo and install Node modules
 - Install the Remote Containers extension
 - Make sure you have Docker running
 - Setup your ENV stuff

If you don't want to use Docker/Remote containers that's fine you can use the docker-compose.yml file in the `.devcontainer` directory directly OR you can just update your ENV settings with your local credentials. 

## ENV Variables

You'll need a few if you want everything to work right, and those are:

```
DATABASE_URL="postgres://localhost/tailwind"

REDIS_HOST=""
REDIS_PORT=""
REDIS_PASSWORD=""

GOOGLE_ID="GET ONE FROM GOOGLE"
GOOGLE_SECRET="GET FROM GOOGLE"

GITHUB_ID="GET FROM GITHUB"
GITHUB_SECRET="GET FROM GITHUB"

SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=465
SMTP_USER="postmaster@YOURDOMAIN"
SMTP_PASSWORD="YOUR PASSWORD"
```

If you're running a Remote Container, you can find these in `.devcontainer/docker-compose.yml`. Update them there and rebuild.


If you're running locally, pop these into a `.env` file in the project root so they can be read by the app on boot. There's a `sample.env` file in the root you can rename if you like.


## Azure Deployment

If you want to push this to Azure you'll need to:

 - Make sure you have an account and the Azure CLI installed on your local machine
 - Do a `printenv` and make sure you ENV variables are set

I have a little project called [AZX](https://github.com/robconery/azx) that can make deployment extremely simple. Go have a look!

