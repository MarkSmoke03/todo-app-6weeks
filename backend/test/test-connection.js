// test-connection.js
require("dotenv").config();
const { Pool } = require("pg");

console.log("Testing database connection...");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Connection failed:", err.message);
  } else {
    console.log("✅ Connected at:", res.rows[0].now);
  }
  pool.end();
});
