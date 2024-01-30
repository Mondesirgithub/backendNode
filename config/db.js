const { Sequelize } = require('sequelize');
let sequelize;

let mysqlHost = process.env.MYSQL_HOST || 'msql';
let mysqlPort = process.env.MYSQL_PORT || '3306';
let mysqlUser = process.env.MYSQL_USER || 'mondesiruser';
let mysqlPass = process.env.MYSQL_PASS || 'mondesirpass';
let mysqlDB   = process.env.MYSQL_DB   || 'gestion_utilisateurs';


sequelize = new Sequelize(
    mysqlDB,
    mysqlUser,
    mysqlPass,
    {
      host: mysqlHost,
      port: mysqlPort,
      dialect: 'mysql'
    }
  )

module.exports = sequelize;
