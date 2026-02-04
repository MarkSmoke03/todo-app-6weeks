// test-password.js - Test different passwords
const { Pool } = require("pg");

const testPasswords = [
  "1738", // Your current
  "postgres", // Common default
  "", // Empty
  "password", // Another common
  "admin", // Sometimes this
];

async function testConnection(password) {
  console.log(`\nTesting password: "${password || "(empty)"}"`);

  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "todo_app",
    password: password,
    port: 5432,
  });

  try {
    const result = await pool.query("SELECT NOW()");
    console.log(`✅ SUCCESS: Connected at ${result.rows[0].now}`);
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    return false;
  } finally {
    await pool.end();
  }
}

async function testAll() {
  console.log("=== Testing PostgreSQL Passwords ===");

  for (const password of testPasswords) {
    const success = await testConnection(password);
    if (success) {
      console.log(`\n🎉 Correct password is: "${password}"`);
      return password;
    }
  }

  console.log("\n⚠️ No password worked. PostgreSQL might not be running.");
  return null;
}

testAll();
