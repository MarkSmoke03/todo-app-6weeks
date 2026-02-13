require("dotenv").config();
const { Pool } = require("pg");

async function resetDatabase() {
  console.log("🔄 Resetting database...");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  try {
    // Drop the database if it exists
    console.log("🗑️  Dropping database...");
    await pool.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log("✅ Database dropped");

    await pool.end();

    // Reinitialize
    console.log("\n🚀 Reinitializing database...");
    require("./init-db.js");
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    process.exit(1);
  }
}

resetDatabase();
