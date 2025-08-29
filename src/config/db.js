const { Pool } = require('pg');
require('dotenv').config();

// A Pool is better than a single Client for web applications
// as it manages a pool of connections automatically.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;