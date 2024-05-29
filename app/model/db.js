// const mysql = require("mysql");

// const config = require("./../config/config");

// const connection = mysql.createConnection({
//   host: config.host,
//   user: config.username,
//   password: config.password,
//   database: config.database,
// });

// module.exports = connection;

const { createPool } = require("mysql");

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  timezone: "UTC",
});

module.exports = pool;
