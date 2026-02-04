// ===== CONFIGURATION =====
const API_URL = "http://localhost:5000/api/todos";
let currentFilter = "all";
let currentTodos = [];
let editingTodoId = null;

// ===== DOM ELEMENTS =====
const elements = {
  todoList: document.getElementById("todoList"),
  todoInput: document.getElementById("todoInput"),
  addBtn: document.getElementById("addBtn"),
  loadingState: document.getElementById("loadingState"),
  emptyState: document.getElementById("emptyState"),
  errorState: document.getElementById("errorState"),
  totalCount: document.getElementById("totalCount"),
  completedCount: document.getElementById("completedCount"),
  pendingCount: document.getElementById("pendingCount"),
  filterBtns: document.querySelectorAll(".filter-btn"),
  editModal: document.getElementById("editModal"),
  editTodoInput: document.getElementById("editTodoInput"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  retryBtn: document.getElementById("retryBtn"),
  backendStatus: document.getElementById("backendStatus"),
  charCount: document.getElementById("charCount"),
};

// ===== API FUNCTIONS =====
class TodoAPI {
  static async fetchTodos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static async addTodo(title) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("Failed to add todo");
    return await response.json();
  }

  static async updateTodo(id, updates) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return await response.json();
  }

  static async deleteTodo(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo");
    return await response.json();
  }

  static async checkBackend() {
    try {
      const response = await fetch(API_URL);
      elements.backendStatus.textContent = "Connected ✅";
      elements.backendStatus.style.color = "var(--success)";
      return true;
    } catch (error) {
      elements.backendStatus.textContent = "Disconnected ❌";
      elements.backendStatus.style.color = "var(--danger)";
      return false;
    }
  }
}

// ===== UI STATE MANAGEMENT =====
function showLoading() {
  elements.loadingState.classList.remove("hidden");
  elements.emptyState.classList.add("hidden");
  elements.errorState.classList.add("hidden");
  elements.todoList.classList.add("hidden");
}

function showEmptyState() {
  elements.loadingState.classList.add("hidden");
  elements.emptyState.classList.remove("hidden");
  elements.errorState.classList.add("hidden");
  elements.todoList.classList.add("hidden");
}

function showErrorState() {
  elements.loadingState.classList.add("hidden");
  elements.emptyState.classList.add("hidden");
  elements.errorState.classList.remove("hidden");
  elements.todoList.classList.add("hidden");
}

function showTodoList() {
  elements.loadingState.classList.add("hidden");
  elements.emptyState.classList.add("hidden");
  elements.errorState.classList.add("hidden");
  elements.todoList.classList.remove("hidden");
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Todo App Initializing...");

  // Check backend connection
  await TodoAPI.checkBackend();

  // Set up character counter
  elements.todoInput.addEventListener("input", updateCharCount);

  // Load initial todos
  await loadTodos();

  // Set up periodic backend check (every 30 seconds)
  setInterval(TodoAPI.checkBackend, 30000);
});

function updateCharCount() {
  const length = elements.todoInput.value.length;
  elements.charCount.textContent = length;
  elements.charCount.style.color =
    length >= 200 ? "var(--danger)" : "var(--gray)";
}

// ===== LOAD AND RENDER TODOS =====
async function loadTodos() {
  showLoading();

  try {
    const todos = await TodoAPI.fetchTodos();
    currentTodos = todos;
    renderTodos();
    updateStats();
    showTodoList();
  } catch (error) {
    console.error("Failed to load todos:", error);
    showErrorState();
  }
}

function filterTodos() {
  switch (currentFilter) {
    case "completed":
      return currentTodos.filter((todo) => todo.completed);
    case "pending":
      return currentTodos.filter((todo) => !todo.completed);
    default:
      return currentTodos;
  }
}

function renderTodos() {
  const filteredTodos = filterTodos();

  if (filteredTodos.length === 0) {
    showEmptyState();
    return;
  }

  elements.todoList.innerHTML = filteredTodos
    .map(
      (todo) => `
        <li class="todo-item" data-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? "checked" : ""}
                aria-label="${todo.completed ? "Mark as pending" : "Mark as completed"}"
            >
            <div class="todo-content">
                <span class="todo-text ${todo.completed ? "completed" : ""}">
                    ${escapeHtml(todo.title)}
                </span>
                <span class="todo-date">
                    ${formatDate(todo.createdAt || todo.updatedAt)}
                </span>
            </div>
            <div class="todo-actions">
                <button class="btn-icon edit-btn" aria-label="Edit todo">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-btn" aria-label="Delete todo">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `,
    )
    .join("");

  showTodoList();
}

function updateStats() {
  const total = currentTodos.length;
  const completed = currentTodos.filter((todo) => todo.completed).length;
  const pending = total - completed;

  elements.totalCount.textContent = total;
  elements.completedCount.textContent = completed;
  elements.pendingCount.textContent = pending;
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
  // Add todo
  elements.addBtn.addEventListener("click", addNewTodo);
  elements.todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNewTodo();
    }
  });

  // Filter buttons
  elements.filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Event delegation for todo list actions
  elements.todoList.addEventListener("click", handleTodoAction);

  // Modal actions
  elements.saveEditBtn.addEventListener("click", saveTodoEdit);
  elements.cancelEditBtn.addEventListener("click", closeEditModal);
  elements.retryBtn.addEventListener("click", loadTodos);

  // Close modal on background click
  elements.editModal.addEventListener("click", (e) => {
    if (e.target === elements.editModal) {
      closeEditModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !elements.editModal.classList.contains("hidden")
    ) {
      closeEditModal();
    }
  });
}

// ===== CRUD OPERATIONS =====
async function addNewTodo() {
  const title = elements.todoInput.value.trim();

  if (!title) {
    showToast("Please enter a todo!", "warning");
    elements.todoInput.focus();
    return;
  }

  if (title.length > 200) {
    showToast("Todo must be 200 characters or less", "warning");
    return;
  }

  try {
    await TodoAPI.addTodo(title);
    elements.todoInput.value = "";
    updateCharCount();
    await loadTodos(); // Refresh the list
    showToast("Todo added successfully!", "success");
    elements.todoInput.focus();
  } catch (error) {
    console.error("Error adding todo:", error);
    showToast("Failed to add todo. Please try again.", "error");
  }
}

function handleTodoAction(e) {
  const todoItem = e.target.closest(".todo-item");
  if (!todoItem) return;

  const todoId = todoItem.dataset.id;
  const todo = currentTodos.find((t) => t.id == todoId);
  if (!todo) return;

  // Checkbox toggle
  if (e.target.classList.contains("todo-checkbox")) {
    toggleTodoCompletion(todoId, todo.completed);
    return;
  }

  // Edit button
  if (e.target.closest(".edit-btn")) {
    openEditModal(todo);
    return;
  }

  // Delete button
  if (e.target.closest(".delete-btn")) {
    deleteTodo(todoId);
    return;
  }
}

async function toggleTodoCompletion(id, currentStatus) {
  try {
    await TodoAPI.updateTodo(id, { completed: !currentStatus });
    await loadTodos(); // Refresh to update stats
    showToast("Todo updated!", "success");
  } catch (error) {
    console.error("Error toggling todo:", error);
    showToast("Failed to update todo", "error");
  }
}

function openEditModal(todo) {
  editingTodoId = todo.id;
  elements.editTodoInput.value = todo.title;
  elements.editModal.classList.remove("hidden");
  elements.editTodoInput.focus();
  elements.editTodoInput.select();
}

function closeEditModal() {
  editingTodoId = null;
  elements.editModal.classList.add("hidden");
  elements.editTodoInput.value = "";
}

async function saveTodoEdit() {
  const newTitle = elements.editTodoInput.value.trim();

  if (!newTitle) {
    showToast("Todo cannot be empty!", "warning");
    return;
  }

  if (newTitle.length > 200) {
    showToast("Todo must be 200 characters or less", "warning");
    return;
  }

  try {
    await TodoAPI.updateTodo(editingTodoId, { title: newTitle });
    closeEditModal();
    await loadTodos();
    showToast("Todo updated successfully!", "success");
  } catch (error) {
    console.error("Error updating todo:", error);
    showToast("Failed to update todo", "error");
  }
}

async function deleteTodo(id) {
  if (!confirm("Are you sure you want to delete this todo?")) {
    return;
  }

  try {
    await TodoAPI.deleteTodo(id);
    await loadTodos();
    showToast("Todo deleted!", "success");
  } catch (error) {
    console.error("Error deleting todo:", error);
    showToast("Failed to delete todo", "error");
  }
}

// ===== NOTIFICATION SYSTEM =====
function showToast(message, type = "info") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Style the toast
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        background: ${getToastColor(type)};
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
        box-shadow: var(--shadow);
        max-width: 300px;
    `;

  // Add animation styles
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getToastColor(type) {
  const colors = {
    success: "var(--success)",
    error: "var(--danger)",
    warning: "var(--warning)",
    info: "var(--primary)",
  };
  return colors[type] || colors.info;
}

// ===== INITIALIZE APP =====
// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Todo App Initializing...");

  // Check backend connection
  await TodoAPI.checkBackend();

  // Set up character counter
  elements.todoInput.addEventListener("input", updateCharCount);

  // Set up all event listeners
  setupEventListeners();

  // Load initial todos
  await loadTodos();

  // Set focus to input
  elements.todoInput.focus();

  // Set up periodic backend check
  setInterval(TodoAPI.checkBackend, 30000);
});
