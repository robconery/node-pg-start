
describe("Auth basics", () => {
  let user;
  before(async function(){
    user = {name: "Baby Driver", email: "baby@test.com"};
  });

  it("will register a new user", async ()=> {
    user.password = "cheese beer thanks";
    user = await Auth.register(user);
    assert(user.id)
  });

  it("will authenticate our new user", async () => {
    const result = await Auth.authenticate({email: user.email, password:"cheese beer thanks"});
    assert(result.success);
  })

  it("will not authenticate a bad guy", async () => {
    const result = await Auth.authenticate({email: user.email, password:"khkjkjb"});
    assert(!result.success);
  });

  it("will automatically register a user who uses oauth", async function(){
    const authData =  {
      provider: "test", 
      uid: "xxx", 
      data: {email: "thing@test.com", name: "Bubbles"}
    };
    const res = await Auth.authenticateOauth(authData);

    assert(res.id > 0);
  });

  it("will locate a user based on provider login", async () => {
    const res = await Auth.authenticateOauth(
      {
        provider: "test", 
        uid: "xxx", 
        data: {email: "thing@test.com", name: "Bubbles"}
      });
    assert(res.id > 0)
  })

  it("will register a user if they don't exist", async () => {
    const res = await Auth.authenticateOauth({
      provider: "test", 
      uid: "yyyy", 
      data: {
        email: "pops@test.com", 
        name: "Bubbles"
      }
    });

    assert(res.id > 0)
  });

  it("Won't duplicate a user who has both oauth and email/pass", async function(){
    const res = await Auth.authenticateOauth({
      provider: "github",
      uid: "yyyy", 
      data: {
        email: "pops@test.com", 
        name: "Bubbles"
      }
    });

    assert.equal(res.email, "pops@test.com")
  });

});

describe("A Valid password reset", () => {
  let user=null;
  before(async function(){
    await Auth.register({name: "Chirro Slonst", email: "cheerio@test.com", password: "dojp2k32o32p32k32j"})
    user = await Auth.prepareReset("cheerio@test.com");
  });

  it("prepares a token", async function(){
    assert(user.resetToken);
  });

  it("that expires in an hour", async function(){
    const expires = new Date(user.resetTokenExpires);
    assert.equal(1,expires.getHours() - new Date().getHours());
  });

  it("and passes validation", async function(){
    const validation = await Auth.validateReset(user.resetToken);
    assert(validation.success);
  });

  it("and resets the password", async function(){
    const res = await Auth.resetPasswordWithToken({token: user.resetToken, password: "puhpuhpuhpassword"});
    assert(res.success, res.message);
  });
})