const User = require("./models/user");
const bcrypt = require("bcrypt");
const assert = require("assert");
const uuid = require("uuid");
const moment = require("moment");
let db = null;


//record when a user logs in and when
//you could also record the IP here but
//privacy... if you don't need it, don't store it
function updateLoginStats(user){
  user.signinCount+=1;
  user.lastSignIn = new Date(this.currentSignin);
  user.currentSignin = new Date();
}

exports.validateReset = async function (token){
  //pull the token and check the expiration
  const user = await db.users.findDoc({resetToken: token}, {single: true});
  if(user){
    const now = moment();
    const expires = moment(user.resetTokenExpires);
    const diff = moment.duration(expires.diff(now)).as("hours");
    //make sure token isn't in the past
    if(diff > 0) return {success: true, user: user};
    else return {success: false, message: "This token has expired"}
  }else{
    return {success: false, message: "Invalid token"}
  }
}

//the initializer that sets the DB instance
exports.init = function(args){
  db = args.db;
}


exports.resetPasswordWithToken = async function({token, password}){
  //pull the token and check the expiration
  const validation = await this.validateReset(token);

  if(validation.success){
    //reset the password
    const user = validation.user;
    user.hashedPassword = bcrypt.hashSync(password,10);
    //remove the token bits
    delete user.resetToken;
    delete user.resetTokenExpires;
    //save the user
    await db.users.saveDoc(user);

    return {success: true, user: new User(user)};
  }else{
    return validation
  }

};

exports.prepareReset = async function(email){

  //do we have a user?
  let user = await db.users.findDoc({email: email}, {single: true});

  if(user){
    //create a reset token that expires in 1 hour
    user.resetToken = uuid.v1();
    user.resetTokenExpires = moment().add(1, "hours");
    
    //save it
    await db.users.saveDoc(user);
  }
  return user; //will be null if there's no email

}


exports.authenticateOauth = async function(auth){

  assert(auth.provider, "No provider specified");
  assert(auth.uid, "Need an identifier for the user");
  assert(auth.data, "Pass the data from the auth provider in the data prop");

  const email = auth.email || auth.data.email;
  assert(email, "Need an email address from the provider");

  const name = auth.name || auth.data.name;
  assert(name, "No name given from provider");

  //step 1: find the user based on their identity profile
  let user = await db.users.findDoc({
    identities: [{provider: auth.provider, uid:auth.uid}]
  }, {single: true});


  //if the identity doesn't exist...
  if(!user){

    //maybe the user exists but with a different email or profile?
    //it's entirely possible - EMAIL is our primary identifier
    user = await db.users.findDoc({email: email}, {single: true});

    //if we don't have their email, create the user record
    if(!user){
      user = new User({
        email: email, 
        name: name,
        data: auth
      });
    }else{
      //create an instance if we have data... though I hate the way this reads
      user = new User(user);
    }

    //the identity doesn't exist in the DB so add it to 
    //the user record, which will either be an existing one
    //or a new one
    user.identities.push(auth);
    
  }

  //they're logged in now
  updateLoginStats(user);

  //save
  const res = await db.users.saveDoc(user);
  //make sure the id is set
  user.id = res.id;
  return user;
}


exports.authenticate = async function({email, password}){
  //let's see if they exist
  let res = await db.users.findDoc({email: email}, {single: true});
  if(!res) return {success: false, message: "User doesn't exist"}
  //now, let's see if they gave us the right password
  const user = new User(res);
  if(user){
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if(!passwordMatch) {
      return {success: false, message: "Invalid login or password"}
    }else{
      //tick the login stats
      updateLoginStats(user);
      await db.users.saveDoc(user);
      return {success: true, user: user}
    }
  }
}


exports.register = async function({name, email, password}){

  if(!password) throw new Error("No password given");
  if(!name) throw new Error ("No name given");
  if(!email) throw new Error("No email given");

  //make sure user doesn't already exist
  //this is also safeguarded at the PG level with
  //a unique constraint, but just to be sure
  const exists = await db.users.findDoc({email: email}, {single: true});
  if(exists) throw new Error("This email already exists")


  //hash the password
  //if you want some rules, here's where they should go
  const hashedPassword = bcrypt.hashSync(password,10);
  let newUser = new User({
    name: name, 
    email: email, 
    hashedPassword: hashedPassword
  });

  //reload it with the goodies from the db
  const res = await db.users.saveDoc(newUser);
  return new User(res);
}