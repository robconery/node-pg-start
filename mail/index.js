//this is the spot for emails!
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
let daemon = null;
var md = require('markdown-it')();
const {User} = require("../lib/models/");
const settings = require("../package.json");

exports.init = function({host, user, password}){
  daemon = nodemailer.createTransport({
    host: host,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: user, // generated ethereal user
      pass: password // generated ethereal password
    }
  });
}


//The connection bits should be in a .env or App Settings
// SMTP_HOST="smtp.mailgun.org"
// SMTP_PORT=465
// SMTP_USER="postmaster@your_domain"
// SMTP_PASSWORD="YOUR API KEY"
require("dotenv").config();

//templates - you could make this configurable but... eh
const templateDir = path.resolve(__dirname, "templates");

const renderMarkdownTemplate = async function(template, data = {}){
  const templateFile = path.resolve(templateDir, template);
  const markdown = fs.readFileSync(templateFile, "utf8");
  // we want to be able to use EJS with markdown, so do that first
  const renderOne = ejs.render(markdown, data);
  //now that we have good markdown, push to HTML
  return md.render(renderOne);
}
//a generalized send routine
const sendEmail = function(subject, to, content){
  //don't send test emails!
  if(process.env.NODE_ENV !== "test"){
    return daemon.sendMail({
      from: '"Rob Conery 😺" <robconery@gmail.com>', // sender address - obvs change
      to: to, // list of receivers
      subject: subject, // Subject line
      html: content
    });
  }
}

exports.sendMagicLink = async function(email, link){

    //the link will be an absolute link to the auth
    const body = await renderMarkdownTemplate("magic_link.md", {link: link});
    await sendEmail(`Login to ${settings.name}`, email, body);
}