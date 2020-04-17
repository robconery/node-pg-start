//this function will create the user DB with an admin user
const pgp = require('pg-promise')({});
//if you're here, this should be in your .env
const bcrypt = require("bcrypt");
const nameGen = require("../name_gen");

class RemotePG{
  constructor({pgUrl}){
    this.db = pgp(pgUrl);
  }
  async findUser(term){
    term = `%${term}%`;
    const sql = "select * from users where (doc ->> 'email') ilike $1 OR(doc ->> 'name') ilike $1"
    const result = await this.db.any(sql,[term]);
    this.db.$pool.end();
    return result;
  }
  async createAdmin({email, name="Admin Jill"}){
    const passPhrase = nameGen.passPhrase();
    //an admin user if you want it
    const newAdmin = {
      name: name,
      email: email,
      hashedPassword: bcrypt.hashSync(passPhrase, 10)
    }
    console.log("Creating admin user",newAdmin);
    console.log("Please remember your pass phrase... ", passPhrase);
    await this.db.any(`insert into users (doc) values($1)`, [newAdmin]);
    this.db.$pool.end();
  }
  async init(){

    console.log("Creating PGCRYPTO extension (for uuid, md5, etc)");
    await this.db.any("create extension if not exists pgcrypto;");
    
    console.log("Creating pg_stat_statements extension (for profiling/tuning your DB)");
    await this.db.any("create extension if not exists pgcrypto;");
    
    console.log("Creating Users table");
    await this.db.any(`create table if not exists users(
      id bigserial primary key,
      key text not null default gen_random_uuid(),
      doc jsonb not null,
      search tsvector,
      created_at timestamp not null default now(),
      updated_at timestamp not null default now()
    );`);

    console.log("Applying indexes to users");
    await this.db.any("create unique index idx_user_email on users ((doc ->> 'email'));");
    await this.db.any("create unique index idx_user_key on users (key);");
    await this.db.any("create index idx_user_search on users using GIN(search);");
  
    this.db.$pool.end();
  }
}

module.exports = RemotePG;


