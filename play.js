const mail = require("./mail");
const Massive = require("massive");
const Auth = require("./lib/auth");

const go = async function(){
  const db = await  Massive(process.env.DATABASE_URL);
  const auth = Auth.init({db: db});
  try{
    const user = await auth.prepareReset("rob@conery.io");
    if(user){
      const thisUrl = `http://localhost:3000/auth/password-reset?token=${user.resetToken}`;
      mail.sendPasswordReminder({email:user.email, link: thisUrl});

      let result = await auth.validateReset(user.resetToken);
      console.log(result);

      //reset the token to < now
      user.resetTokenExpires = new Date();
      user.resetTokenExpires.setHours(new Date().getHours() - 1);

      result = await auth.validateReset(user.resetToken);
    }else{
      console.log("No user dummy");
    }

  }catch(err){
    console.error(err)
    
  }finally{
    db.instance.$pool.end();
  }

  
}

go().then(console.log)
