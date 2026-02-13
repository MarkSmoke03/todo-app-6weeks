// This builds our todos table
exports.up = (pgm) => {
  // Create table with 6 columns
  pgm.createTable("todos", {
    id: {
      type: "SERIAL",
      primaryKey: true,
    },
    title: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    description: {
      type: "TEXT",
    },
    completed: {
      type: "BOOLEAN",
      default: false,
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Make sorting by date faster
  pgm.createIndex("todos", "created_at");

  console.log("✅ Created todos table");
};

// This removes the table (undo button)
exports.down = (pgm) => {
  pgm.dropTable("todos");
  console.log("✅ Removed todos table");
};
