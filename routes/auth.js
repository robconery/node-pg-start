
const express = require('express');
const router = express.Router();
const passport = require("passport");
const {User} = require("../lib/models/");
const Mailer = require("../mail");


router.get("/login", function(req,res){
  res.render('login');
});

router.post("/login", async function(req,res){
  const email = req.body.email;
  const rootUrl = `${req.protocol}://${req.get("host")}/auth/validate`;
  if(email){
    //do we have this user? if not, we could create an account for them on the fly
    //or we force them to register. this is up to your needs
    
    let user = await User.findOne({where: {email: email}});
    if(!user){
      //let's be nice and register them shall we?
      //change this as you need
      console.log("User doesn't exist... creating...");
      user = await User.create({email: email})
    }
    await user.setLoginToken();
    const link = `${rootUrl}/${user.login_token}`;
    try{
      await Mailer.sendMagicLink(user.email,link);
      req.flash("success","Email is on its way - you should see it in just a minute.");
    }catch(err){
      console.log(err);
      req.flash("errors","There was a problem sending this email. The server might not be responding...");       
    }

  }else{
    req.flash("errors","Please give an email... thanks...");
  }
  console.log("Redirecting...");
  res.redirect("/auth/login");
});

router.get("/validate/:token", async function(req,res){
  const token = req.params.token;
  if(token){
    const {success, user} = await User.tokenLogin(req.params.token);
    if(success){
      req.flash("info","Welcome back - you're logged in...");
      req.user = user;
      req.session.user = user;
      req.session.save();
      const redirectTo = "/";
      
      res.redirect(redirectTo);
    }else{
      req.flash("errors","That token is invalid or expired.");
      res.redirect("/auth/login");
    }
  }else{
    res.redirect("/auth/login");
  }
});

router.get("/logout", function(req,res){
  //kill the session
  req.session.user = null;
  req.session.save();
  res.redirect("/");
});


router.get('/google', (req,res,next) => {
  passport.authenticate('google', { 
    callbackURL: `${req.protocol}://${req.get("host")}/auth/google/callback`,
    scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
    ] 
  })(req, res, next)
});

router.get('/github', (req, res, next) => {
  passport.authenticate('github', {
    callbackURL: `${req.protocol}://${req.get("host")}/auth/github/callback`,
  })(req, res, next)
});


router.get('/google/callback', passport.authenticate('google'), function(req,res){
  req.session.user = req.user;
  const redirectTo = "/";
  req.flash("success","Successfully logged in");
  res.redirect(redirectTo);
});

router.get('/github/callback', passport.authenticate('github'), function(req,res){
  req.session.user = req.user;
  const redirectTo = "/";
  req.flash("success","Successfully logged in");
  res.redirect(redirectTo);
});


module.exports = router;