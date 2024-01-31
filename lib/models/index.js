require("dotenv").config();
const { Sequelize,QueryTypes } = require('sequelize');

var sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});;

//convenience for testing and other things
exports.DB = {
  close(){
    sequelize.close();
  },
  async sync(){
    await sequelize.sync({
      force: true
    })
    return "DONE"
  },
  async run(sql, opts={}){
    return sequelize.query(sql,opts);
  },
  async query(sql){
    return sequelize.query(sql,{type: sequelize.QueryTypes.SELECT});
  }
}

exports.User = require("./user").definition(sequelize);