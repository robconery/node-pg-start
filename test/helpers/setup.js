const { User, DB } = require("../../lib/models");

before(async () => {
  await DB.sync();
  global.User = User;
});

after(async () => {
  await DB.close()
})
