
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const crypto = require('crypto');
const assert = require("assert");

//this is a reasonable starting point for a User class
//right now the auth is handled in the model, but you might
//want to consider moving that logic to a service class
//for now, we start small and simple

let db = null;

class User {
  
  static init({documentDb}){
    db = documentDb;
  }

  constructor(args){


    assert(args.name, "Need a name for the user");

    //only set the id if we have one Massive won't like it otherwise
    if(args.id) this.id = args.id;
    this.name = args.name;
    this.email = args.email;
    this.isActive = args.isActive || true;
    this.hashedPassword = args.hashedPassword || bcrypt.hashSync(uuid.v4(),10);
    this.signinCount = args.signinCount || 0;
    this.currentSignin = args.currentSignin || new Date();
    this.lastSignIn = args.lastSignIn || new Date();
    this.identities = args.identities || [];
    this.avatar = args.avatar;

    if(!this.avatar){
      const emailHash = crypto.createHash('md5').update(this.email).digest("hex");
      this.avatar = `https://www.gravatar.com/avatar/${emailHash}.jpg"`
    }

  }

  //convenience method so we don't send a bunch
  //of extra information around the app. Primarily
  //for use with UI and you could move there if you
  //want...
  summary(){
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar
    }
  }

}

module.exports = User;