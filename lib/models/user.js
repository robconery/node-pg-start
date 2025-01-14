const { DataTypes, Model } = require('sequelize');
const shortid = require("shortid")
const crypto = require("crypto");

const hashPassword = async function(pw){
  //use scrypt to hash the password, not argon2
  return new Promise((resolve, reject) => {
    crypto.scrypt(pw, "salt", 64, (err, derivedKey) => {
      if(err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  })
}

class User extends Model {

  static async tokenLogin(token){
    const found = await User.findOne({where: {login_token : token}});
    if(found) {
      if(found.login_token_expires.getTime() > new Date().getTime()){
        //reset the login token
        found.login_token = null;
        found.login_token_expires = new Date();
        //will also save
        await found.updateStats();
        return {success: true, user: found};
      }
    }
    return {success: false, user: null};
  }
  static async authenticateOauth(auth){

    assert(auth.provider, "No provider specified");
    assert(auth.uid, "Need an identifier for the user");
    assert(auth.data, "Pass the data from the auth provider in the data prop");
  
    const email = auth.email || auth.data.email;
    assert(email, "Need an email address from the provider");
  
    const name = auth.name || auth.data.name;
    assert(name, "No name given from provider");
  
    //step 1: find the user based on their identity profile
    //change of course as needed
    //setting success = true here might seem silly BUT 
    //we're defaulting to letting everyone in. You can change this
    //if you have a site that requires user/pass first
    let user, success = true;
    if(auth.provider === "google"){
      user = await User.findOne({where: {google: auth.uid}})
    }else{
      user = await User.findOne({where: {github: auth.uid}})
    }

    //if the identity doesn't exist...
    if(!user){
      //maybe the user exists but with a different email or profile?
      //it's entirely possible - EMAIL is our primary identifier
      user = await User.findOne({where: {email: email}});
  
      //if we don't have their email, create the user record
      if(!user){
        user = new User({
          email: email, 
          name: name,
          signin_count: 1 //because we're signing them in also
        });

      }    
    }else{
      await user.updateStats()
    }
    if(auth.provider === "google"){
      user.google = auth.uid;
    }else{
      user.github = auth.uid;
    }
    //save it up
    await user.save()
    return {success: success, user: user};
  }
  static async authenticate({email, password}){
    let user = await User.findOne({where: {email: email}});
    if(!user) return {success: false, error: "User doesn't exist"};
    //now, let's see if they gave us the right password using scrypt
    const hashed = await hashPassword(password);
    const passwordMatch = hashed === user.hashed_password;
    if(!passwordMatch) {
      return  {success: false, error: "Invalid credentials"};;
    }else{
      //tick the login stats
      await user.updateStats();

      return {
        success: true,
        user: user,
        token: user.token //this is just what the thing expects
      }
    }
  }
  static async register({name, email, password, confirm}){
    if(password !== confirm) return {success: false, error: "Passwords don't match"}
    const hashed = await hashPassword(password)
    try{
      const newUser = await  User.create({name: name, email: email, hashed_password: hashed});
      return {success: true, user: newUser}
    }catch(err){
      return {success: false, error: err}
    }
  }
  async setLoginToken(){
    this.login_token = shortid.generate();
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + (24 * 14)); //expires in two weeks
    this.login_token_expires = expireDate;
    await this.save();
    return this;
  }
  updateStats(){
    this.signin_count+=1;
    this.last_signin = new Date(this.current_signin);
    this.current_signin = new Date();
    return this.save();
  }

}
exports.definition = function(sequelize){
  User.init({
    name: {
      type : DataTypes.TEXT
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    avatar: DataTypes.TEXT,
    hashed_password: {
      type: DataTypes.TEXT, //allowing null here because of oauth
      validate: {
        min: 6
      }
    },
    login_token: DataTypes.TEXT,
    google: DataTypes.TEXT, //change this as needed
    github: DataTypes.TEXT, //change this as needed
    signin_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    login_token_expires: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    last_sign_in: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    current_sign_in: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks : {
      beforeValidate: (user, options) => {
        const emailHash = crypto.createHash('md5').update(user.email).digest("hex");
        user.avatar = `https://www.gravatar.com/avatar/${emailHash}.jpg`
      }
    },
    tableName: "users",
    underscored: true,
    sequelize
  });
  return User;
}
