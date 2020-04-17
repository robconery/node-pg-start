var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
const flash = require('connect-flash');
var http = require('http');
const bodyParser = require("body-parser");

//the bootup/startup file for stuff I've added to the app
const boot = require("./config/boot");

//for pretty output
const consola = require("consola");

const start = async function(){
  
  var app = express();

  //the "typical" Express boot stuff is in this file (app.js) as a matter
  //of convention however the "app stuff - things I've added - are in the 
  //config/boot.js file for convenience
  await boot.theApp(app);
  
  //default the port to PORT or 3000
  //Azure will set this automatically
  const port = process.env.PORT || 3000;
  consola.info("Trying to start on", port);
  
  app.set('port', port);

  var server = http.createServer(app);

  server.listen(port);
  server.on('error', error => {
    consola.error(error);
  });

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));


  const expires = 1000 * 60 * 60 * 24 * 14;
  app.use(session({ 
    secret: 'burke burke burke', 
    cookie: { maxAge: expires },
    resave: true,
    saveUninitialized: true
  }))

  app.use(flash());

  app.use(function(req,res,next){
    res.locals.user = req.session.user;
    res.locals.info = req.flash('info');
    res.locals.errors = req.flash('error');
    next();
  });



  
  var indexRouter = require('./routes/index');
  var authRouter = require('./routes/auth');
  
  app.use('/', indexRouter);
  app.use('/auth', authRouter);

  
  
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}

start().then(app => {
  const port = app.get("port");
  consola.success(`App is running on port ${port}`);
});
