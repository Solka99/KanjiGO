const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "kanji_go_db",
  user: process.env.DB_USER || "kanji_dev",
  password: process.env.DB_PASSWORD || "dev_password",
});

module.exports = pool;
