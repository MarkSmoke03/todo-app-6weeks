require("dotenv").config();
const { Pool } = require("pg");

// Create a connection pool using your existing configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test connection
pool.on("connect", () => {
  console.log("✅ Database connected");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err.message);
});

// Helper function to check database health
async function checkDatabaseHealth() {
  try {
    const result = await pool.query("SELECT 1 as status");
    return { healthy: true, message: "Database connected" };
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${error.message}`,
    };
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  checkDatabaseHealth,
  end: () => pool.end(),
};
