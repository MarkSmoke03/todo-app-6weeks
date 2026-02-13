// src/controllers/todoController.js - Business logic
const todoModel = require("../models/todoModel");

const todoController = {
  // GET /api/todos
  async getAllTodos(req, res) {
    try {
      const todos = await todoModel.findAll();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/todos/:id
  async getTodoById(req, res) {
    try {
      const todo = await todoModel.findById(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/todos
  async createTodo(req, res) {
    try {
      const { title, description } = req.body;

      if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
      }

      const newTodo = await todoModel.create({ title, description });
      res.status(201).json(newTodo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/todos/:id
  async updateTodo(req, res) {
    try {
      const updatedTodo = await todoModel.update(req.params.id, req.body);
      if (!updatedTodo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(updatedTodo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/todos/:id
  async deleteTodo(req, res) {
    try {
      const deletedTodo = await todoModel.delete(req.params.id);
      if (!deletedTodo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PATCH /api/todos/:id/complete
  async toggleComplete(req, res) {
    try {
      const toggledTodo = await todoModel.toggleComplete(req.params.id);
      if (!toggledTodo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(toggledTodo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = todoController;
