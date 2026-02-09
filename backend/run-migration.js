const { Pool } = require("pg");
require("dotenv").config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.connect();
    console.log("✅ Connected to database");

    // Add position column
    await pool.query(`
            ALTER TABLE todos 
            ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0
        `);

    console.log("✅ Added position column to todos table");

    // Update existing todos with positions based on creation order
    await pool.query(`
            UPDATE todos 
            SET position = sub.row_num - 1
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
                FROM todos
            ) AS sub
            WHERE todos.id = sub.id
        `);

    console.log("✅ Updated existing todos with position numbers");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
