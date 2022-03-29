const {User, DB} = require("../lib/models/");

describe("User basics", () => {
  let user, registration;

  before(async function(){
    userData = {
      name: "Test Buddy", 
      email: "buddy@test.com", 
      password: "test",
      confirm: "test"
    };
    registration = await User.register(userData);
    user = registration.user;
  });
  
  it("will register a new user with email/password", async ()=> {
    assert(registration.success);
  });
  it("won't duplicate a emails for email/password", async ()=> {
    const res = await User.register(userData);
    assert(!res.success);
  });

  it("will authenticate our new user", async () => {
    const result = await User.authenticate({email: user.email, password:"test"});
    assert(result.success)
    assert.strictEqual(result.user.id, 1);
  })

  it("will authenticate our new user by magic token", async () => {
    await user.setLoginToken();
    const result = await User.tokenLogin(user.login_token);
    assert(result);
  })

   it("will locate a user based on provider login", async () => {
    const payload = {
      provider: "google",
      uid: "TEST",
      name: "BUDDY",
      email: "test2@test.com",
      picture: "pic",
      data: {}
    }
    const res = await User.authenticateOauth(payload);
    assert(res.success)
    assert(res.user.google === "TEST")
  })
  it("will add a provider if they login with same email, new provider", async () => {
    const payload = {
      provider: "github",
      uid: "TEST",
      name: "BUDDY",
      email: "test2@test.com",
      picture: "pic",
      data: {}
    }
    const res = await User.authenticateOauth(payload);
    assert(res.success)
    assert(res.user.github === "TEST")
    assert(res.user.google === "TEST")
  });
  
  it("will record that our friend is back", async () => {
    const payload = {
      provider: "github",
      uid: "TEST",
      name: "BUDDY",
      email: "test2@test.com",
      picture: "pic",
      data: {}
    }
    const res = await User.authenticateOauth(payload);
    assert.equal(res.user.signin_count,2);
  })


})