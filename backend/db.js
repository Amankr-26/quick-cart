// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // your postgres username
  host: 'localhost',
  database: 'quickcart',   // database you created
  password: 'yourpassword',// change to your password
  port: 5432
});

module.exports = pool;
