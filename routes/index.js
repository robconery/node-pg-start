var express = require('express');
var router = express.Router();
const assert = require("assert");

//make this global so can be used from any route
ensureLoggedIn = function(req,res,next){
  //is there a session?
  if(req.session.user) next();
  else {
    //we need to pop a login warning
    req.flash("error", "You need to login for that...")
    res.redirect("/")
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/profile", ensureLoggedIn, function(req,res){
  res.render('profile');
});


module.exports = router;