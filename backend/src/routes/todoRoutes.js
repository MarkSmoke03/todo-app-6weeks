// src/routes/todoRoutes.js - API endpoints
const express = require("express");
const todoController = require("../controllers/todoController");

const router = express.Router();

// GET all todos
router.get("/", todoController.getAllTodos);

// GET single todo
router.get("/:id", todoController.getTodoById);

// POST create todo
router.post("/", todoController.createTodo);

// PUT update todo
router.put("/:id", todoController.updateTodo);

// DELETE todo
router.delete("/:id", todoController.deleteTodo);

// PATCH toggle completion
router.patch("/:id/complete", todoController.toggleComplete);

module.exports = router;
