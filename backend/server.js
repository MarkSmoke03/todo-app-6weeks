// server.js - Main Express server
// ADD THIS AT VERY TOP of server.js
const path = require("path");
console.log("Loading .env from:", path.resolve(".env"));
require("dotenv").config({ path: path.resolve(".env") });
console.log("DATABASE_URL set?:", !!process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

// Import routes
const todoRoutes = require("./src/routes/todoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/todos", todoRoutes);

// Homepage
app.get("/", (req, res) => {
  res.json({
    message: "Todo API with Database Migrations 🚀",
    version: "1.0.0",
    endpoints: {
      getAllTodos: "GET    /api/todos",
      getTodoById: "GET    /api/todos/:id",
      createTodo: "POST   /api/todos",
      updateTodo: "PUT    /api/todos/:id",
      deleteTodo: "DELETE /api/todos/:id",
      toggleComplete: "PATCH  /api/todos/:id/complete",
    },
    testing: "Use Thunder Client in VS Code to test endpoints",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}`);
  console.log(`⚡ Use Thunder Client to test endpoints`);
});
