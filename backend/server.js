const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// In-memory storage
let todos = [
  {
    id: 1,
    title: "Complete Week 4 - Calendar Integration",
    description: "Add due dates and calendar view to TODO-IT",
    priority: "high",
    completed: false,
    due_date: "2026-02-15",
    order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Fix sidebar collapse issue",
    description: "Make icons stay with text when sidebar is collapsed",
    priority: "medium",
    completed: false,
    due_date: "2026-02-12",
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Test calendar with due dates",
    description: "Verify tasks appear on correct dates",
    priority: "low",
    completed: false,
    due_date: "2026-02-20",
    order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
let nextId = 4;

// ========== HEALTH CHECK ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "✅ TODO-IT Backend is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
    todos: todos.length,
  });
});

// ========== GET ALL TODOS ==========
app.get("/api/todos", (req, res) => {
  const { filter, sort, date } = req.query;

  let filteredTodos = [...todos];

  // Filter by status
  if (filter === "completed") {
    filteredTodos = filteredTodos.filter((t) => t.completed === true);
  } else if (filter === "pending") {
    filteredTodos = filteredTodos.filter((t) => t.completed === false);
  }

  // Filter by date (for calendar)
  if (date) {
    filteredTodos = filteredTodos.filter((t) => t.due_date === date);
  }

  // Sort
  if (sort === "due_date") {
    filteredTodos.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  } else if (sort === "priority") {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filteredTodos.sort(
      (a, b) =>
        (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1),
    );
  } else {
    filteredTodos.sort((a, b) => a.order - b.order);
  }

  res.json(filteredTodos);
});

// ========== GET SINGLE TODO ==========
app.get("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  res.json(todo);
});

// ========== CREATE TODO ==========
app.post("/api/todos", (req, res) => {
  const { title, description, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Extract YYYY-MM-DD from due_date
  let dueDateValue = null;
  if (due_date) {
    const match = String(due_date).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) dueDateValue = match[0];
  }

  const newTodo = {
    id: nextId++,
    title,
    description: description || "",
    priority: priority || "medium",
    completed: false,
    due_date: dueDateValue,
    order: todos.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// ========== UPDATE TODO ==========
app.put("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const { title, description, priority, completed, due_date } = req.body;

  // Format due date
  let dueDateValue = todos[index].due_date;
  if (due_date !== undefined) {
    if (due_date === null) {
      dueDateValue = null;
    } else {
      const match = String(due_date).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) dueDateValue = match[0];
    }
  }

  todos[index] = {
    ...todos[index],
    title: title || todos[index].title,
    description:
      description !== undefined ? description : todos[index].description,
    priority: priority || todos[index].priority,
    completed: completed !== undefined ? completed : todos[index].completed,
    due_date: dueDateValue,
    updated_at: new Date().toISOString(),
  };

  res.json(todos[index]);
});

// ========== DELETE TODO ==========
app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos.splice(index, 1);
  res.status(204).send();
});

// ========== REORDER TODOS ==========
app.put("/api/todos/reorder", (req, res) => {
  const { order } = req.body;

  if (!order || !Array.isArray(order)) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  order.forEach((item) => {
    const todo = todos.find((t) => t.id === item.id);
    if (todo) todo.order = item.position;
  });

  res.json({ message: "Todos reordered successfully" });
});

// ========== CALENDAR DATA ==========
app.get("/api/todos/calendar/grouped", (req, res) => {
  const tasksByDate = {};

  todos.forEach((todo) => {
    if (todo.due_date) {
      if (!tasksByDate[todo.due_date]) {
        tasksByDate[todo.due_date] = {
          date: todo.due_date,
          task_count: 0,
          completed_count: 0,
          tasks: [],
        };
      }
      tasksByDate[todo.due_date].task_count++;
      if (todo.completed) tasksByDate[todo.due_date].completed_count++;
      tasksByDate[todo.due_date].tasks.push(todo);
    }
  });

  res.json(Object.values(tasksByDate));
});

// ========== OVERDUE TODOS ==========
app.get("/api/todos/overdue", (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = todos.filter((todo) => {
    if (!todo.due_date || todo.completed) return false;
    const dueDate = new Date(todo.due_date + "T12:00:00");
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  res.json(overdue);
});

// ========== ROOT ROUTE ==========
app.get("/", (req, res) => {
  res.json({
    name: "TODO-IT Backend API",
    version: "4.0",
    status: "🟢 Online",
    port: PORT,
    endpoints: [
      "GET /api/health",
      "GET /api/todos",
      "POST /api/todos",
      "GET /api/todos/:id",
      "PUT /api/todos/:id",
      "DELETE /api/todos/:id",
      "PUT /api/todos/reorder",
      "GET /api/todos/calendar/grouped",
      "GET /api/todos/overdue",
    ],
    stats: {
      total_todos: todos.length,
      with_due_dates: todos.filter((t) => t.due_date).length,
      completed: todos.filter((t) => t.completed).length,
    },
  });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("✅ TODO-IT BACKEND IS RUNNING!");
  console.log("=".repeat(50));
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 API: http://localhost:${PORT}/api/todos`);
  console.log(
    `📅 Calendar: http://localhost:${PORT}/api/todos/calendar/grouped`,
  );
  console.log("=".repeat(50));
  console.log(`🗂️  Todos loaded: ${todos.length}`);
  console.log(`📊 Sample tasks ready for testing\n`);
});
