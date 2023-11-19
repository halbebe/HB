requre('dotenv').config();

module.exports = 
{
  "development": {
    "username": process.env.RDS_NM,
    "password": process.env.RDS_PW,
    "database": process.env.RDS_DB,
    "host": `${process.env.RDS_EP}.ap-southeast-2.rds.amazonaws.com`,
    "dialect": "mysql"
  },
  "test": {
    "username": process.env.RDS_NM,
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.RDS_NM,
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
