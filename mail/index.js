//this is the spot for emails!
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
let daemon = null;

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
const templates = {
  resetPassword: path.resolve(templateDir, "reset.ejs")
}

//a generalized send routine
const sendEmail = function(subject, to, content){
  //don't send test emails!
  if(process.env.NODE_ENV !== "test"){
    return daemon.sendMail({
      from: '"Rob Conery 😺" <rob@test.io>', // sender address - obvs change
      to: to, // list of receivers
      subject: subject, // Subject line
      html: content
    });
  }
}

//the one exportable method so we can centralize email sending
exports.sendPasswordReminder = async function({email, link}){
  
  //this is the data for the template... obvs change it...
  const data = {
    name: email,
    from: "Rob Conery",
    title: "Chief Chicken Master",
    link: link,
    picture: "https://en.gravatar.com/userimage/109037453/87cb97708d5d8620cd79170166ec4c63.png?size=200"
  };

  const html = await ejs.renderFile(templates.resetPassword, data);
  return sendEmail("Password Reset Request",email,  html);

}