
const express = require('express');
const router = express.Router();
const passport = require("passport");
const Auth = require("../lib/auth");
const Mailer = require("../mail");


router.get("/login", function(req,res){
  res.render('login');
});

router.post("/login", async function(req, res){
  //we really don't need Passport cruft for this
  //just see if the user can authenticate and then
  //throw onto session
  const credentials = req.body;
  const result = await Auth.authenticate({email: credentials.username, password: credentials.password});
  if(result.success){
    req.session.user = result.user.summary();
    res.json({success: true, user: req.session.user})
  }else{
    res.json({success: false, message: "Invalid login or password"})
  }

});

router.post("/register", async function(req,res){

  const userParams = req.body;

  //make sure the pass/confirm are the same
  if(userParams.password !== userParams.password_confirmation) return res.json({success: false, error: "Passwords don't match"});

  try{

    //this will throw if an assert fails
    const newUser = await Auth.register({
      name: userParams.name,
      email: userParams.email,
      password: userParams.password
    });

    //drop user on the session which will effectively log them in
    req.session.user = newUser.summary();
    
    res.json({success: true, message: "User registered and logged in"});
  }catch(err){
    res.json({success: false, message: err.message})
  }
});

router.get("/logout", function(req,res){
  //kill the session
  req.session.user = null;
  req.session.save();
  res.redirect("/");
});


//this route shows the reset screen which REQUIRES a valid token
router.get("/reset-password", async function(req, res){
  const token = req.query.token;
  if(!token) res.redirect("/auth/login");
  
  //make sure the token is valid
  const result = await Auth.validateReset(token);
  if(result.success){
    //don't pass the user back entirely it'll confuse the page
    res.render("reset_password", {success: true, token: result.user.resetToken});
  }else{
    req.flash("error", "This token is expired")
    res.render("reset_password", {success: false, token: ""});
  }
});

router.post("/reset-password", async function(req, res){
  const {token, password, confirm} = req.body;
  if(!token) res.redirect("/auth/login");
  const result = await Auth.resetPasswordWithToken({token, password, confirm});
  if(result.success){
    //log them in
    req.session.user = result.user.summary();
    res.json({success: true, message: "Your password has been changed successfully and you're now logged in!"});
  }else{
    res.json({success: true, message: result.error});
  }
});

router.post("/send-reset", async function(req, res){

  const email = req.body.email;
  if(email){
    const user = await Auth.prepareReset(email);
    if(user){
      const thisUrl = `${req.protocol}://${req.hostname}/auth/reset-password?token=${user.resetToken}`;
      Mailer.sendPasswordReminder({email: user.email, link: thisUrl})
      res.json({success: true, message: "Reminder email is off to you! Check your spam messages if you don't get it soon."})
    }else{
      res.json({success: false, message: "That email is not in our system"})
    }
  }else{
    res.json({success: false, message: "Need an email..."})
  }
});


router.get('/google', passport.authenticate('google', { 
    scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ] 
}));

router.get('/github', passport.authenticate('github'));


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