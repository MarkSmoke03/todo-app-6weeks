// src/models/todoModel.js - Database operations
const pool = require("../db/pool");

const todoModel = {
  // Get all todos
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC",
    );
    return result.rows;
  },

  // Get todo by ID
  async findById(id) {
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    return result.rows[0];
  },

  // Create new todo
  async create(todoData) {
    const { title, description } = todoData;
    const result = await pool.query(
      "INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *",
      [title, description],
    );
    return result.rows[0];
  },

  // Update todo
  async update(id, todoData) {
    const { title, description, completed } = todoData;
    const result = await pool.query(
      `UPDATE todos 
       SET title = $1, description = $2, completed = $3, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [title, description, completed, id],
    );
    return result.rows[0];
  },

  // Delete todo
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  },

  // Toggle completion status
  async toggleComplete(id) {
    const result = await pool.query(
      `UPDATE todos 
       SET completed = NOT completed, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id],
    );
    return result.rows[0];
  },
};

module.exports = todoModel;
