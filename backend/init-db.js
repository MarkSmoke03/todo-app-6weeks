require("dotenv").config();
const { Pool } = require("pg");

async function initializeDatabase() {
  console.log("🚀 Initializing database...");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Test connection first
    console.log("🔗 Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to database");

    // Check if todos table exists with position column
    console.log("📊 Checking table structure...");
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'todos'
    `);

    if (tableCheck.rows.length === 0) {
      console.log("📊 Creating todos table...");
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE todos (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT FALSE,
          position INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Table created");
    } else {
      console.log("✅ Table already exists");

      // Check if position column exists
      const hasPositionColumn = tableCheck.rows.some(
        (col) => col.column_name === "position",
      );
      if (!hasPositionColumn) {
        console.log("➕ Adding position column...");
        await pool.query(
          "ALTER TABLE todos ADD COLUMN position INTEGER DEFAULT 0",
        );
        console.log("✅ Position column added");
      }
    }

    // Create indexes if they don't exist
    console.log("📈 Creating indexes...");
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC)
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_todos_position ON todos(position ASC)
      `);
      console.log("✅ Indexes created/verified");
    } catch (indexError) {
      console.log("⚠️  Indexes may already exist, continuing...");
    }

    // Check if we have any data
    const countResult = await pool.query("SELECT COUNT(*) FROM todos");
    const todoCount = parseInt(countResult.rows[0].count);

    if (todoCount === 0) {
      console.log("📝 Inserting sample data...");
      await pool.query(`
        INSERT INTO todos (title, description, completed, position) VALUES
        ('Welcome to Todo App', 'This is your first todo. Click to edit or delete.', false, 1),
        ('Learn Full-Stack Development', 'Build amazing web applications', false, 2),
        ('Complete Week 4 Project', 'Finish the Todo App backend', true, 3)
      `);
      console.log("✅ Sample data inserted");
    } else {
      console.log(`📊 Found ${todoCount} existing todos`);
    }

    console.log("🎉 Database initialization complete!");
    await pool.end();
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log(
      "1. Make sure PostgreSQL is running: `sudo service postgresql status`",
    );
    console.log("2. Check your credentials in .env file");
    console.log('3. Verify database exists: `psql -U postgres -c "\\l"`');
    process.exit(1);
  }
}

initializeDatabase();
