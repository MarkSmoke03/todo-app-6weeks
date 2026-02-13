require("dotenv").config();
const { Pool } = require("pg");

async function cleanupDatabase() {
  console.log("🧹 Cleaning up database...");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Delete all todos
    const result = await pool.query("DELETE FROM todos RETURNING *");
    console.log(`🗑️  Deleted ${result.rowCount} todos`);

    // Reset sequence
    await pool.query("ALTER SEQUENCE todos_id_seq RESTART WITH 1");
    console.log("🔄 Reset auto-increment counter");

    await pool.end();
    console.log("✅ Cleanup complete!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  }
}

cleanupDatabase();
