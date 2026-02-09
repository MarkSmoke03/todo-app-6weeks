const express = require("express");
const router = express.Router();

// Database connection
const db = require("../db/pool");

// ===== HELPER FUNCTIONS =====
function handleDatabaseError(error, res) {
  console.error("Database error:", error);
  res.status(500).json({
    error: "Database error",
    details: error.message,
  });
}

function validateTodoData(todo) {
  if (!todo || typeof todo !== "object") {
    return { valid: false, error: "Todo data is required" };
  }

  if (
    todo.title !== undefined &&
    (typeof todo.title !== "string" || todo.title.trim() === "")
  ) {
    return { valid: false, error: "Title must be a non-empty string" };
  }

  if (todo.description !== undefined && typeof todo.description !== "string") {
    return { valid: false, error: "Description must be a string" };
  }

  if (todo.completed !== undefined && typeof todo.completed !== "boolean") {
    return { valid: false, error: "Completed must be a boolean" };
  }

  if (todo.position !== undefined && typeof todo.position !== "number") {
    return { valid: false, error: "Position must be a number" };
  }

  return { valid: true };
}

// ===== GET ALL TODOS =====
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all todos...");

    const result = await db.query(
      "SELECT * FROM todos ORDER BY position ASC, created_at DESC",
    );

    console.log(`Found ${result.rows.length} todos`);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== GET TODO BY ID =====
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching todo ID: ${id}`);

    const result = await db.query("SELECT * FROM todos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `Todo with ID ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== CREATE NEW TODO =====
router.post("/", async (req, res) => {
  try {
    const { title, description = "", completed = false } = req.body;

    console.log("Received data:", { title, description, completed });

    // Validation
    const validation = validateTodoData({ title, description, completed });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    console.log(`Creating todo: "${title}" with description: "${description}"`);

    // Get next position
    const positionResult = await db.query(
      "SELECT COALESCE(MAX(position), 0) as max_position FROM todos",
    );
    const nextPosition = positionResult.rows[0].max_position + 1;

    const result = await db.query(
      `INSERT INTO todos (title, description, completed, position) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
      [title.trim(), description.trim(), completed, nextPosition],
    );

    console.log(`Created todo ID: ${result.rows[0].id}`);
    console.log("Saved description:", result.rows[0].description);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create error:", error);
    handleDatabaseError(error, res);
  }
});

// ===== UPDATE TODO =====
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`Updating todo ID: ${id}`, updates);

    // Validation
    const validation = validateTodoData(updates);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if todo exists
    const checkResult = await db.query("SELECT * FROM todos WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: `Todo with ID ${id} not found`,
      });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(updates.title.trim());
      paramCount++;
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(updates.description.trim());
      paramCount++;
    }

    if (updates.completed !== undefined) {
      fields.push(`completed = $${paramCount}`);
      values.push(updates.completed);
      paramCount++;
    }

    if (updates.position !== undefined) {
      fields.push(`position = $${paramCount}`);
      values.push(updates.position);
      paramCount++;
    }

    // Always update updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 0) {
      return res.status(400).json({
        error: "No valid fields to update",
      });
    }

    values.push(id); // For WHERE clause

    const query = `
            UPDATE todos 
            SET ${fields.join(", ")} 
            WHERE id = $${paramCount} 
            RETURNING *
        `;

    console.log("Update query:", query);
    console.log("Update values:", values);

    const result = await db.query(query, values);

    console.log(`Updated todo ID: ${id}`);
    console.log("Updated description:", result.rows[0].description);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update error:", error);
    handleDatabaseError(error, res);
  }
});

// ===== DELETE TODO =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting todo ID: ${id}`);

    const checkResult = await db.query("SELECT * FROM todos WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: `Todo with ID ${id} not found`,
      });
    }

    const result = await db.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id],
    );

    console.log(`Deleted todo ID: ${id}`);
    res.json({
      success: true,
      message: `Todo ${id} deleted`,
      todo: result.rows[0],
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== SAVE REORDER =====
router.put("/reorder", async (req, res) => {
  try {
    const { order } = req.body;

    console.log("Saving todo order:", order);

    if (!Array.isArray(order)) {
      return res.status(400).json({
        error: "Order must be an array of todo IDs",
      });
    }

    for (let i = 0; i < order.length; i++) {
      const todoId = order[i];

      await db.query(
        `UPDATE todos 
                 SET position = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
        [i, todoId],
      );
    }

    console.log(`Updated positions for ${order.length} todos`);

    res.json({
      success: true,
      message: `Order saved for ${order.length} todos`,
      order,
    });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({
      error: "Failed to save order",
      details: error.message,
    });
  }
});

module.exports = router;
