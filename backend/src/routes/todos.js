const express = require("express");
const router = express.Router();
// FIXED: Use correct path based on your structure
const db = require("../../db/db"); // Make sure this file exists!

// ===================
// HEALTH CHECK - ADDED
// ===================
router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      message: "API is healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

// ===================
// GET ALL TODOS
// ===================
router.get("/", async (req, res) => {
  try {
    const { filter, search, sort, date } = req.query;

    let query = "SELECT * FROM todos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filter === "completed") {
      query += ` AND completed = true`;
    } else if (filter === "pending") {
      query += ` AND completed = false`;
    }

    if (date) {
      query += ` AND DATE(due_date) = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // FIXED: Sort by "order" as default, not position
    if (sort === "due_date") {
      query += " ORDER BY due_date NULLS LAST";
    } else if (sort === "priority") {
      query += ` ORDER BY CASE priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
                ELSE 4 END`;
    } else if (sort === "newest") {
      query += " ORDER BY created_at DESC";
    } else if (sort === "oldest") {
      query += " ORDER BY created_at ASC";
    } else {
      query += ' ORDER BY "order" ASC, created_at DESC';
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// ===================
// GET SINGLE TODO
// ===================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM todos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// ===================
// CREATE TODO
// ===================
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // FIXED: Get max order for new todo
    const orderResult = await db.query(
      'SELECT COALESCE(MAX("order"), 0) as max_order FROM todos',
    );
    const newOrder = orderResult.rows[0].max_order + 1;

    let dueDateValue = null;
    if (due_date) {
      const dateMatch = String(due_date).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        dueDateValue = dateMatch[0];
      }
    }

    const result = await db.query(
      `INSERT INTO todos (title, description, priority, "order", due_date, completed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        title,
        description || "",
        priority || "medium",
        newOrder,
        dueDateValue,
        false,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// ===================
// UPDATE TODO
// ===================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, completed, due_date } = req.body;

    let dueDateValue = null;
    if (due_date) {
      const dateMatch = String(due_date).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        dueDateValue = dateMatch[0];
      }
    }

    const result = await db.query(
      `UPDATE todos 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           completed = COALESCE($4, completed),
           due_date = COALESCE($5, due_date),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, priority, completed, dueDateValue, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// ===================
// DELETE TODO
// ===================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// ===================
// REORDER TODOS - FIXED VERSION
// ===================
router.put("/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body; // CHANGED: from 'order' to 'orderedIds' for consistency

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds array is required" });
    }

    // Update each todo with its new order position
    for (let i = 0; i < orderedIds.length; i++) {
      await db.query('UPDATE todos SET "order" = $1 WHERE id = $2', [
        i + 1,
        orderedIds[i],
      ]);
    }

    // Fetch and return the reordered todos
    const result = await db.query(
      'SELECT * FROM todos ORDER BY "order" ASC, created_at DESC',
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error reordering todos:", error);
    res.status(500).json({ error: "Failed to reorder todos" });
  }
});

// ===================
// BATCH DELETE - NEW FEATURE
// ===================
router.delete("/batch/delete", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Array of ids is required" });
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    const query = `DELETE FROM todos WHERE id IN (${placeholders}) RETURNING id`;

    const result = await db.query(query, ids);

    res.json({
      message: "Todos deleted successfully",
      deleted: result.rows.length,
    });
  } catch (error) {
    console.error("Error batch deleting todos:", error);
    res.status(500).json({ error: "Failed to delete todos" });
  }
});

// ===================
// GET STATISTICS - NEW FEATURE
// ===================
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed,
        COUNT(CASE WHEN completed = false THEN 1 END) as pending,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND completed = false THEN 1 END) as overdue,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority,
        COUNT(CASE WHEN due_date IS NOT NULL THEN 1 END) as has_due_date
      FROM todos
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// ===================
// GET UPCOMING DUES - NEW FEATURE
// ===================
router.get("/filter/upcoming", async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const result = await db.query(
      `SELECT * FROM todos 
       WHERE completed = false 
         AND due_date IS NOT NULL 
         AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::integer
       ORDER BY due_date ASC`,
      [days],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching upcoming todos:", error);
    res.status(500).json({ error: "Failed to fetch upcoming todos" });
  }
});

// ===================
// GET TODAY'S TASKS - NEW FEATURE
// ===================
router.get("/filter/today", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM todos 
       WHERE completed = false 
         AND due_date = CURRENT_DATE
       ORDER BY priority DESC, "order" ASC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching today's todos:", error);
    res.status(500).json({ error: "Failed to fetch today's todos" });
  }
});

module.exports = router;
