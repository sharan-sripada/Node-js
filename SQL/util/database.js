const Sequelize = require("sequelize");

const sequelize = new Sequelize("node", "sharan", "Mysql@123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
