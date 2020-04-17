const Massive = require("massive");
const Auth = require("../../lib/auth");

before(async () => {
  const testDb = await Massive(process.env.DATABASE_URL);

  await testDb.dropTable("users");
  await testDb.dropTable("dogs");


  await testDb.createDocumentTable("users");

  await testDb.query("create unique index idx_user_email on users ((body ->> 'email'));");
  
  global.db = testDb;
  Auth.init({db: testDb});
  global.Auth = Auth;
});

after(async () => {
  db.instance.$pool.end();
})
