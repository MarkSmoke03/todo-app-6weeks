// Todo App - Frontend JavaScript
// API Configuration
const API_BASE_URL = "http://localhost:3000/api/todos";

// DOM Elements
const todoForm = document.getElementById("todoForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const todoList = document.getElementById("todoList");
const loadingElement = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const apiStatus = document.getElementById("apiStatus");
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const filterButtons = document.querySelectorAll(".filter-btn");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitleInput = document.getElementById("editTitle");
const editDescriptionInput = document.getElementById("editDescription");
const editCompletedCheckbox = document.getElementById("editCompleted");
const editIdInput = document.getElementById("editId");

// State
let currentFilter = "all";
let todos = [];

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// Initialize application
function initApp() {
  setupEventListeners();
  loadTodos();
  updateAPIStatus();
}

// Set up event listeners
function setupEventListeners() {
  // Form submission
  todoForm.addEventListener("submit", handleAddTodo);

  // Clear form button
  document.getElementById("clearForm").addEventListener("click", clearForm);

  // Title input character count
  titleInput.addEventListener("input", updateCharCount);

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      setActiveFilter(filter);
    });
  });

  // Retry button
  retryButton.addEventListener("click", loadTodos);

  // Modal close buttons
  document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", closeEditModal);
  });

  // Edit form submission
  editForm.addEventListener("submit", handleEditTodo);

  // Close modal on outside click
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
}

// Load todos from API
async function loadTodos() {
  showLoading();
  hideError();

  try {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    todos = await response.json();
    renderTodos();
    updateStats();
    updateAPIStatus(true);
  } catch (error) {
    console.error("Error loading todos:", error);
    showError(
      "Failed to load tasks. Please check if the backend server is running.",
    );
    updateAPIStatus(false);
  } finally {
    hideLoading();
  }
}

// Add new todo
async function handleAddTodo(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showFormError("Title is required");
    return;
  }

  const todoData = {
    title,
    description: description || null,
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      throw new Error("Failed to add todo");
    }

    const newTodo = await response.json();
    todos.unshift(newTodo); // Add to beginning
    renderTodos();
    updateStats();
    clearForm();

    // Show success message (could add toast notification)
    console.log("Todo added successfully:", newTodo);
  } catch (error) {
    console.error("Error adding todo:", error);
    showFormError("Failed to add task. Please try again.");
  }
}

// Update todo
async function handleEditTodo(e) {
  e.preventDefault();

  const id = parseInt(editIdInput.value);
  const title = editTitleInput.value.trim();
  const description = editDescriptionInput.value.trim();
  const completed = editCompletedCheckbox.checked;

  if (!title) {
    alert("Title is required");
    return;
  }

  const todoData = {
    title,
    description: description || null,
    completed,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      throw new Error("Failed to update todo");
    }

    const updatedTodo = await response.json();

    // Update in local array
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos[index] = updatedTodo;
    }

    renderTodos();
    updateStats();
    closeEditModal();
  } catch (error) {
    console.error("Error updating todo:", error);
    alert("Failed to update task. Please try again.");
  }
}

// Delete todo
async function deleteTodo(id) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }

    // Remove from local array
    todos = todos.filter((todo) => todo.id !== id);
    renderTodos();
    updateStats();
  } catch (error) {
    console.error("Error deleting todo:", error);
    alert("Failed to delete task. Please try again.");
  }
}

// Toggle todo completion
async function toggleTodoComplete(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/complete`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Failed to toggle completion");
    }

    const updatedTodo = await response.json();

    // Update in local array
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos[index] = updatedTodo;
    }

    renderTodos();
    updateStats();
  } catch (error) {
    console.error("Error toggling completion:", error);
    alert("Failed to update task status. Please try again.");
  }
}

// Render todos based on current filter
function renderTodos() {
  // Filter todos based on current filter
  let filteredTodos = todos;

  if (currentFilter === "active") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  // Clear current list
  todoList.innerHTML = "";

  // Show empty state if no todos
  if (filteredTodos.length === 0) {
    showEmptyState();
    return;
  }

  // Hide empty state
  hideEmptyState();

  // Create todo items
  filteredTodos.forEach((todo) => {
    const todoItem = createTodoElement(todo);
    todoList.appendChild(todoItem);
  });
}

// Create todo element
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item ${todo.completed ? "completed" : ""}`;
  li.dataset.id = todo.id;

  const formattedDate = new Date(todo.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  li.innerHTML = `
        <div class="todo-content">
            <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
            ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ""}
            <div class="todo-meta">
                <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                <span><i class="far fa-clock"></i> ${todo.completed ? "Completed" : "Pending"}</span>
            </div>
        </div>
        <div class="todo-actions">
            <button class="btn-complete" title="${todo.completed ? "Mark as pending" : "Mark as complete"}">
                <i class="fas ${todo.completed ? "fa-undo" : "fa-check"}"></i>
            </button>
            <button class="btn-edit" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

  // Add event listeners to buttons
  const completeBtn = li.querySelector(".btn-complete");
  const editBtn = li.querySelector(".btn-edit");
  const deleteBtn = li.querySelector(".btn-delete");

  completeBtn.addEventListener("click", () => toggleTodoComplete(todo.id));
  editBtn.addEventListener("click", () => openEditModal(todo));
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  return li;
}

// Open edit modal
function openEditModal(todo) {
  editIdInput.value = todo.id;
  editTitleInput.value = todo.title;
  editDescriptionInput.value = todo.description || "";
  editCompletedCheckbox.checked = todo.completed;

  editModal.classList.remove("hidden");
}

// Close edit modal
function closeEditModal() {
  editModal.classList.add("hidden");
  editForm.reset();
}

// Set active filter
function setActiveFilter(filter) {
  currentFilter = filter;

  // Update button states
  filterButtons.forEach((button) => {
    if (button.dataset.filter === filter) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  renderTodos();
}

// Update statistics
function updateStats() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;

  totalCount.textContent = total;
  activeCount.textContent = active;
  completedCount.textContent = completed;
}

// Update API status indicator
function updateAPIStatus(isConnected = false) {
  if (isConnected) {
    apiStatus.className = "status-online";
    apiStatus.innerHTML = '<i class="fas fa-circle"></i> API: Connected';
  } else {
    apiStatus.className = "status-offline";
    apiStatus.innerHTML = '<i class="fas fa-circle"></i> API: Disconnected';
  }
}

// Show loading state
function showLoading() {
  loadingElement.classList.remove("hidden");
  todoList.classList.add("hidden");
}

// Hide loading state
function hideLoading() {
  loadingElement.classList.add("hidden");
  todoList.classList.remove("hidden");
}

// Show empty state
function showEmptyState() {
  emptyState.classList.remove("hidden");
  todoList.classList.add("hidden");
}

// Hide empty state
function hideEmptyState() {
  emptyState.classList.add("hidden");
  todoList.classList.remove("hidden");
}

// Show error state
function showError(message) {
  errorMessage.textContent = message;
  errorState.classList.remove("hidden");
  todoList.classList.add("hidden");
}

// Hide error state
function hideError() {
  errorState.classList.add("hidden");
  todoList.classList.remove("hidden");
}

// Show form error
function showFormError(message) {
  alert(message); // Could be replaced with a better UI
}

// Clear form
function clearForm() {
  todoForm.reset();
  updateCharCount();
}

// Update character count
function updateCharCount() {
  const count = titleInput.value.length;
  const charCount = document.querySelector(".char-count");
  charCount.textContent = `${count}/255`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add a sample todo for testing (remove in production)
function addSampleTodo() {
  const sampleTodo = {
    title: "Welcome to Todo Master!",
    description:
      "This is a sample task. Try adding, editing, and deleting tasks.",
    completed: false,
    created_at: new Date().toISOString(),
    id: Date.now(),
  };

  todos.unshift(sampleTodo);
  renderTodos();
  updateStats();
}

// Uncomment to add sample todo on first load
// addSampleTodo();
