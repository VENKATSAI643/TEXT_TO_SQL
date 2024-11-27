const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Enter your MySQL root password
  database: '', // No default database as it will be dynamic
});

module.exports = pool.promise();
