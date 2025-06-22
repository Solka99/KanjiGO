// scripts/db-setup.js
const fs = require("fs");
const path = require("path");
const pool = require("../backend/src/config/database");

async function setupDatabase() {
  try {
    // テーブル作成
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "../database/schema/01_create_tables.sql"),
      "utf8"
    );
    await pool.query(schemaSQL);

    // マスターデータ投入
    const seedSQL = fs.readFileSync(
      path.join(__dirname, "../database/schema/02_insert_master_data.sql"),
      "utf8"
    );
    await pool.query(seedSQL);

    console.log("Database setup completed");
  } catch (error) {
    console.error("Database setup failed:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
