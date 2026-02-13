// ===========================================
// APP.JS - Main Application Logic
// ===========================================

// ===================
// GLOBAL VARIABLES
// ===================
let currentFilter = "all";
let currentSearch = "";
let currentSort = "order";
let todos = [];

// ===================
// INITIALIZE APP
// ===================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  try {
    // Load initial data
    await loadTodos();
    updateDashboard();

    // Set current date in header
    updateCurrentDate();

    // Setup event listeners
    setupEventListeners();

    // Check connection
    checkConnection();
  } catch (error) {
    console.error("Error initializing app:", error);
    showToast("Failed to load application", "error");
  }
}

// ===================
// LOAD TODOS
// ===================
async function loadTodos() {
  try {
    // Show loading state
    const container = document.getElementById("todosContainer");
    container.innerHTML = '<div class="loading">Loading tasks...</div>';

    // Build query string
    let url = "http://localhost:5000/todos?";
    if (currentFilter !== "all") url += `filter=${currentFilter}&`;
    if (currentSearch) url += `search=${encodeURIComponent(currentSearch)}&`;
    if (currentSort) url += `sort=${currentSort}&`;

    // Fetch todos
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch todos");

    todos = await response.json();

    // Render todos
    renderTodos();
  } catch (error) {
    console.error("Error loading todos:", error);
    document.getElementById("todosContainer").innerHTML = `
      <div class="error">
        <p>Failed to load tasks. Please check your connection.</p>
        <button onclick="loadTodos()">Retry</button>
      </div>
    `;
  }
}

// ===================
// RENDER TODOS
// ===================
function renderTodos() {
  const container = document.getElementById("todosContainer");

  if (todos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No tasks found</h3>
        <p>${currentSearch ? "Try a different search term" : "Create your first task to get started!"}</p>
        <button onclick="openAddModal()">➕ Add New Task</button>
      </div>
    `;
    return;
  }

  // Generate todo items HTML
  let todosHTML = "";
  todos.forEach((todo) => {
    todosHTML += todoItemTemplate(todo);
  });

  container.innerHTML = todosHTML;

  // Setup drag and drop for reordering
  setupDragAndDrop();
}

// ===================
// TODO ITEM TEMPLATE
// ===================
function todoItemTemplate(todo) {
  // Check if task is overdue
  const isOverdue =
    todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  // Format due date
  let dueDateText = "";
  if (todo.due_date) {
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate.toDateString() === today.toDateString()) {
      dueDateText = "Today";
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      dueDateText = "Tomorrow";
    } else {
      dueDateText = dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  return `
    <div class="todo-item ${todo.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}" 
         data-id="${todo.id}" 
         draggable="true"
         ondragstart="handleDragStart(event)">
      
      <!-- Checkbox -->
      <div class="todo-checkbox" onclick="toggleTodoCompletion('${todo.id}')">
        <div class="checkbox ${todo.completed ? "checked" : ""}">
          ${todo.completed ? "✓" : ""}
        </div>
      </div>
      
      <!-- Todo Content -->
      <div class="todo-content" onclick="openEditModal('${todo.id}')">
        <h3 class="todo-title">${todo.title}</h3>
        
        ${
          todo.description
            ? `
          <p class="todo-description">${todo.description}</p>
        `
            : ""
        }
        
        <!-- Meta Information -->
        <div class="todo-meta">
          <span class="priority-badge ${todo.priority}">${todo.priority}</span>
          
          ${
            todo.due_date
              ? `
            <span class="due-date-badge ${isOverdue ? "overdue" : ""}">
              📅 ${dueDateText}
              ${isOverdue ? " ⚠️ Overdue!" : ""}
            </span>
          `
              : ""
          }
        </div>
      </div>
      
      <!-- Actions -->
      <div class="todo-actions">
        <button class="action-btn drag-handle" title="Drag to reorder">
          ≡
        </button>
        <button class="action-btn delete-btn" onclick="deleteTodo('${todo.id}')" title="Delete">
          🗑️
        </button>
      </div>
    </div>
  `;
}

// ===================
// TOGGLE TODO COMPLETION
// ===================
async function toggleTodoCompletion(todoId) {
  try {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    // Toggle completion status
    const updatedTodo = { ...todo, completed: !todo.completed };

    await fetch(`http://localhost:5000/todos/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });

    // Reload todos and update dashboard
    await loadTodos();
    updateDashboard();

    showToast(
      `Task marked as ${updatedTodo.completed ? "completed" : "pending"}`,
      "success",
    );
  } catch (error) {
    console.error("Error toggling todo completion:", error);
    showToast("Failed to update task", "error");
  }
}

// ===================
// DELETE TODO
// ===================
async function deleteTodo(todoId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await fetch(`http://localhost:5000/todos/${todoId}`, {
      method: "DELETE",
    });

    // Reload todos and update dashboard
    await loadTodos();
    updateDashboard();

    showToast("Task deleted successfully", "success");
  } catch (error) {
    console.error("Error deleting todo:", error);
    showToast("Failed to delete task", "error");
  }
}

// ===================
// OPEN ADD MODAL
// ===================
function openAddModal() {
  document.body.insertAdjacentHTML("beforeend", createTodoModal());
}

// ===================
// OPEN EDIT MODAL
// ===================
async function openEditModal(todoId) {
  try {
    const response = await fetch(`http://localhost:5000/todos/${todoId}`);
    const todo = await response.json();

    document.body.insertAdjacentHTML("beforeend", createTodoModal(todo));
  } catch (error) {
    console.error("Error opening edit modal:", error);
    showToast("Failed to load task details", "error");
  }
}

// ===================
// HANDLE TODO SUBMIT
// ===================
async function handleTodoSubmit(event, todoId = null) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Prepare todo data
  const todoData = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    due_date: formData.get("dueDate") || null,
  };

  // Add completion status for edits
  if (todoId) {
    todoData.completed = form.elements.completed?.checked || false;
  }

  try {
    if (todoId) {
      // Update existing todo
      await fetch(`http://localhost:5000/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });
      showToast("Task updated successfully!", "success");
    } else {
      // Create new todo
      await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });
      showToast("Task created successfully!", "success");
    }

    // Close modal and refresh
    closeModal();
    await loadTodos();
    updateDashboard();
  } catch (error) {
    console.error("Error saving todo:", error);
    showToast("Failed to save task. Please try again.", "error");
  }
}

// ===================
// CLOSE MODAL
// ===================
function closeModal() {
  const modal = document.getElementById("todoModalOverlay");
  if (modal) modal.remove();
}

// ===================
// SWITCH TAB
// ===================
function switchTab(tabName) {
  // Update active tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.textContent.includes(tabName)) {
      btn.classList.add("active");
    }
  });

  // Update current filter
  currentFilter = tabName;

  // Show/hide calendar view
  const calendarView = document.getElementById("calendarView");
  const todosContainer = document.getElementById("todosContainer");

  if (tabName === "planned") {
    // Show calendar view
    if (calendarView) calendarView.style.display = "block";
    if (todosContainer) todosContainer.style.display = "none";

    // Initialize calendar
    if (typeof calendar !== "undefined" && calendar.init) {
      calendar.init();
    }
  } else {
    // Show todo list
    if (calendarView) calendarView.style.display = "none";
    if (todosContainer) todosContainer.style.display = "block";

    // Load todos with current filter
    loadTodos();
  }
}

// ===================
// UPDATE DASHBOARD
// ===================
async function updateDashboard() {
  try {
    // Load all todos for statistics
    const response = await fetch("http://localhost:5000/todos");
    const allTodos = await response.json();

    // Calculate statistics
    const total = allTodos.length;
    const completed = allTodos.filter((t) => t.completed).length;
    const pending = total - completed;

    // Load overdue todos
    const overdueResponse = await fetch("http://localhost:5000/todos/overdue");
    const overdueTodos = await overdueResponse.json();

    // Update dashboard elements
    document.getElementById("totalCount").textContent = total;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("overdueCount").textContent = overdueTodos.length;

    // Update progress bar
    const progressPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById("progressFill").style.width =
      `${progressPercentage}%`;
    document.getElementById("progressText").textContent =
      `${progressPercentage}%`;
  } catch (error) {
    console.error("Error updating dashboard:", error);
  }
}

// ===================
// SETUP EVENT LISTENERS
// ===================
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      loadTodos();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      loadTodos();
    });
  }

  // Quick add button
  const quickAddBtn = document.getElementById("quickAddBtn");
  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", () => {
      document.body.insertAdjacentHTML("beforeend", quickAddTodoModal());
    });
  }
}

// ===================
// DRAG AND DROP
// ===================
function setupDragAndDrop() {
  const todoItems = document.querySelectorAll(".todo-item");

  todoItems.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", this.dataset.id);
  this.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
}

async function handleDrop(e) {
  e.preventDefault();

  const draggedId = e.dataTransfer.getData("text/plain");
  const targetId = this.dataset.id;

  if (draggedId === targetId) return;

  // Reorder todos
  const draggedIndex = todos.findIndex((t) => t.id === draggedId);
  const targetIndex = todos.findIndex((t) => t.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) return;

  // Move todo in array
  const [draggedTodo] = todos.splice(draggedIndex, 1);
  todos.splice(targetIndex, 0, draggedTodo);

  // Update order numbers
  todos.forEach((todo, index) => {
    todo.order = index;
  });

  try {
    // Save new order to backend
    await fetch("http://localhost:5000/todos/reorder/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todos }),
    });

    // Re-render todos
    renderTodos();
    showToast("Tasks reordered!", "success");
  } catch (error) {
    console.error("Error reordering todos:", error);
    showToast("Failed to reorder tasks", "error");
  }
}

function handleDragEnd() {
  this.classList.remove("dragging");
}

// ===================
// UTILITY FUNCTIONS
// ===================
function updateCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "en-US",
    options,
  );
}

function showToast(message, type = "info") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // Add to DOM
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function checkConnection() {
  try {
    await fetch("http://localhost:5000/todos");
    document.getElementById("connectionStatus").textContent = "🟢 Connected";
  } catch (error) {
    document.getElementById("connectionStatus").textContent = "🔴 Offline";
    showToast("You are offline. Some features may not work.", "warning");
  }
}
