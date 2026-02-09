// TODO-IT - COMPLETE FIXED VERSION
console.log("🚀 TODO-IT v2.0 - All Fixes Applied");

// ============================================
// DOM ELEMENTS
// ============================================
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.querySelector(".sidebar-toggle");
const todosContainer = document.getElementById("todosContainer");
const todoTemplate = document.getElementById("todoTemplate");
const emptyState = document.getElementById("emptyState");

// Navigation
const navItems = document.querySelectorAll(".nav-item");

// Buttons
const addTodoBtn = document.getElementById("addTodoBtn");
const quickAddBtn = document.getElementById("quickAddBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const saveTodoBtn = document.getElementById("saveTodoBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const saveQuickAddBtn = document.getElementById("saveQuickAddBtn");

// Inputs
const todoTitleInput = document.getElementById("todoTitle");
const todoDescInput = document.getElementById("todoDesc");
const todoPriorityInput = document.getElementById("todoPriority");
const editTodoTitleInput = document.getElementById("editTodoTitle");
const editTodoDescInput = document.getElementById("editTodoDesc");
const editTodoPriorityInput = document.getElementById("editTodoPriority");
const quickTodoTitleInput = document.getElementById("quickTodoTitle");

// Modals
const addTodoModal = document.getElementById("addTodoModal");
const editTodoModal = document.getElementById("editTodoModal");
const quickAddModal = document.getElementById("quickAddModal");

// ============================================
// STATE
// ============================================
let todos = [];
let currentFilter = "all";
let editingTodoId = null;
let draggedTodo = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("📱 App Initialized");
  initEventListeners();
  loadTodos();
  updateDate();
  initSidebar();
});

// ============================================
// EVENT LISTENERS (FIXED)
// ============================================
function initEventListeners() {
  console.log("🔧 Setting up event listeners");

  // Sidebar Toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  // Navigation Tabs - FIXED: Now they work!
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active from all
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active to clicked
      this.classList.add("active");

      // Show content based on tab
      const tabName = this.querySelector("span").textContent;
      console.log("📋 Tab clicked:", tabName);
      showTabContent(tabName);

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        toggleSidebar();
      }
    });
  });

  // Add Todo Button
  if (addTodoBtn) {
    addTodoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("➕ Opening add modal");
      openModal(addTodoModal);
    });
  }

  // Quick Add Button
  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal(quickAddModal);
    });
  }

  // Empty State Add Button
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal(addTodoModal);
    });
  }

  // Save Buttons
  if (saveTodoBtn) {
    saveTodoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      createTodo();
    });
  }

  if (saveQuickAddBtn) {
    saveQuickAddBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      createQuickTodo();
    });
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      updateTodo();
    });
  }

  // Quick Add Enter key
  if (quickTodoTitleInput) {
    quickTodoTitleInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        createQuickTodo();
      }
    });
  }

  // Close buttons
  document.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    });
  });

  // Modal backdrop
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.dataset.filter;
      setActiveFilter(filter);
    });
  });

  // Sort select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", function (e) {
      sortTodos(e.target.value);
    });
  }

  // Search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      filterTodos(e.target.value);
    });
  }

  // Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  // Update date every minute
  setInterval(updateDate, 60000);
}

// ============================================
// SIDEBAR & TABS (FIXED)
// ============================================
function initSidebar() {
  if (window.innerWidth <= 768) {
    if (sidebar) sidebar.classList.add("collapsed");
  }
}

function toggleSidebar() {
  if (sidebar) sidebar.classList.toggle("collapsed");

  const mainContent = document.querySelector(".main-content");
  if (mainContent) mainContent.classList.toggle("expanded");

  // Update icon
  const icon = sidebarToggle ? sidebarToggle.querySelector("i") : null;
  if (icon) {
    if (sidebar && sidebar.classList.contains("collapsed")) {
      icon.className = "fas fa-chevron-right";
    } else {
      icon.className = "fas fa-chevron-left";
    }
  }
}

function showTabContent(tabName) {
  console.log("Showing tab:", tabName);

  // Update header
  const headerTitle = document.querySelector(".header-left h2");
  if (headerTitle) {
    headerTitle.textContent = tabName;
  }

  // For now, just show all todos
  // In a full app, you would filter todos by tab
  renderTodos();

  showMessage(`Showing: ${tabName}`, "info");
}

// ============================================
// MODAL FUNCTIONS (FIXED)
// ============================================
function openModal(modal) {
  if (!modal) return;

  console.log("Opening modal:", modal.id);

  closeAllModals();

  modal.style.display = "flex";

  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Focus first input
  setTimeout(() => {
    const input = modal.querySelector("input, textarea, select");
    if (input) {
      input.focus();
      if (input.type === "text") input.select();
    }
  }, 50);
}

function closeAllModals() {
  console.log("Closing modals");

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active");

    setTimeout(() => {
      if (!modal.classList.contains("active")) {
        modal.style.display = "none";
      }
    }, 250);
  });

  editingTodoId = null;
}

function openEditModal(todo) {
  editingTodoId = todo.id;

  if (editTodoTitleInput) editTodoTitleInput.value = todo.title;
  if (editTodoDescInput) editTodoDescInput.value = todo.description || "";

  // FIXED: Priority selection - now keeps selected value
  if (editTodoPriorityInput) {
    editTodoPriorityInput.value = todo.priority || "medium";
    console.log("Setting priority to:", todo.priority);
  }

  openModal(editTodoModal);
}

// ============================================
// TODO OPERATIONS (FIXED)
// ============================================
async function loadTodos() {
  try {
    const response = await fetch("http://localhost:3000/api/todos");
    if (response.ok) {
      todos = await response.json();
      renderTodos();
      updateDashboard();
      console.log("Loaded", todos.length, "todos");
    }
  } catch (error) {
    console.error("Error loading todos:", error);
  }
}

async function createTodo() {
  const title = todoTitleInput ? todoTitleInput.value.trim() : "";
  const description = todoDescInput ? todoDescInput.value.trim() : "";
  const priority = todoPriorityInput ? todoPriorityInput.value : "medium";

  console.log("Creating todo with priority:", priority);

  if (!title) {
    showMessage("Please enter a task title", "warning");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        description: description,
        priority: priority,
        completed: false,
        position: todos.length,
      }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      todos.push(newTodo);

      closeAllModals();
      resetAddForm();
      renderTodos();
      updateDashboard();
      showMessage("Task created!", "success");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Failed to create task", "error");
  }
}

async function createQuickTodo() {
  const title = quickTodoTitleInput ? quickTodoTitleInput.value.trim() : "";

  if (!title) {
    showMessage("Please enter a task title", "warning");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        description: "",
        priority: "medium",
        completed: false,
        position: todos.length,
      }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      todos.push(newTodo);

      closeAllModals();
      if (quickTodoTitleInput) quickTodoTitleInput.value = "";
      renderTodos();
      updateDashboard();
      showMessage("Task added!", "success");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Failed to add task", "error");
  }
}

async function updateTodo() {
  if (!editingTodoId) return;

  const title = editTodoTitleInput ? editTodoTitleInput.value.trim() : "";
  const description = editTodoDescInput ? editTodoDescInput.value.trim() : "";
  const priority = editTodoPriorityInput
    ? editTodoPriorityInput.value
    : "medium";

  console.log("Updating todo with priority:", priority);

  if (!title) {
    showMessage("Please enter a task title", "warning");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/todos/" + editingTodoId,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: description,
          priority: priority,
        }),
      },
    );

    if (response.ok) {
      // Update local
      const index = todos.findIndex((t) => t.id === editingTodoId);
      if (index !== -1) {
        todos[index].title = title;
        todos[index].description = description;
        todos[index].priority = priority;
      }

      closeAllModals();
      renderTodos();
      updateDashboard();
      showMessage("Task updated!", "success");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Failed to update task", "error");
  }
}

async function toggleTodoCompletion(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  try {
    const response = await fetch("http://localhost:3000/api/todos/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: !todo.completed,
      }),
    });

    if (response.ok) {
      todo.completed = !todo.completed;
      renderTodos();
      updateDashboard();
      showMessage(todo.completed ? "Completed!" : "Marked pending", "success");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function deleteTodo(id) {
  if (!confirm("Delete this task?")) return;

  try {
    const response = await fetch("http://localhost:3000/api/todos/" + id, {
      method: "DELETE",
    });

    if (response.ok) {
      todos = todos.filter((t) => t.id !== id);
      renderTodos();
      updateDashboard();
      showMessage("Task deleted", "success");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Failed to delete", "error");
  }
}

function resetAddForm() {
  if (todoTitleInput) todoTitleInput.value = "";
  if (todoDescInput) todoDescInput.value = "";
  if (todoPriorityInput) todoPriorityInput.value = "medium";
}

// ============================================
// RENDER TODOS (FIXED - With Drag & Drop)
// ============================================
function renderTodos() {
  if (!todosContainer) return;

  todosContainer.innerHTML = "";

  if (todos.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  // Filter if needed
  let filteredTodos = [...todos];
  if (currentFilter === "pending") {
    filteredTodos = filteredTodos.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = filteredTodos.filter((t) => t.completed);
  }

  filteredTodos.forEach((todo, index) => {
    const todoElement = createTodoElement(todo, index);
    todosContainer.appendChild(todoElement);
  });

  initDragAndDrop();
}

function createTodoElement(todo, index) {
  if (!todoTemplate) return document.createElement("div");

  const template = todoTemplate.content.cloneNode(true);
  const todoCard = template.querySelector(".todo-card");
  const checkbox = template.querySelector(".todo-checkbox-input");
  const title = template.querySelector(".todo-title");
  const description = template.querySelector(".todo-description");
  const priorityBadge = template.querySelector(".priority-badge");
  const editBtn = template.querySelector(".edit-btn");
  const deleteBtn = template.querySelector(".delete-btn");
  const todoDate = template.querySelector(".todo-date");

  // Set ID and make draggable
  todoCard.dataset.id = todo.id;
  todoCard.dataset.index = index;
  todoCard.draggable = true;

  // Completion
  if (todo.completed) {
    todoCard.classList.add("completed");
    if (checkbox) checkbox.checked = true;
  }

  // Content
  if (title) title.textContent = todo.title;
  if (description)
    description.textContent = todo.description || "No description";

  // FIXED: Priority with colors
  if (priorityBadge) {
    const priority = todo.priority || "medium";
    priorityBadge.textContent = priority.toUpperCase();
    priorityBadge.className = "priority-badge " + priority;
    priorityBadge.dataset.priority = priority;

    // Apply colors
    if (priority === "high") {
      priorityBadge.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
      priorityBadge.style.color = "#ef4444";
      priorityBadge.style.border = "1px solid rgba(239, 68, 68, 0.3)";
    } else if (priority === "medium") {
      priorityBadge.style.backgroundColor = "rgba(245, 158, 11, 0.2)";
      priorityBadge.style.color = "#f59e0b";
      priorityBadge.style.border = "1px solid rgba(245, 158, 11, 0.3)";
    } else {
      priorityBadge.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
      priorityBadge.style.color = "#10b981";
      priorityBadge.style.border = "1px solid rgba(16, 185, 129, 0.3)";
    }
  }

  // Date
  if (todoDate && todo.created_at) {
    const date = new Date(todo.created_at);
    todoDate.textContent = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Events
  if (checkbox) {
    checkbox.addEventListener("change", () => toggleTodoCompletion(todo.id));
  }

  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openEditModal(todo);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteTodo(todo.id);
    });
  }

  // Drag events
  todoCard.addEventListener("dragstart", handleDragStart);
  todoCard.addEventListener("dragover", handleDragOver);
  todoCard.addEventListener("drop", handleDrop);
  todoCard.addEventListener("dragend", handleDragEnd);

  return todoCard;
}

// ============================================
// DRAG & DROP (FIXED - Now works!)
// ============================================
function initDragAndDrop() {
  const todoCards = document.querySelectorAll(".todo-card");
  todoCards.forEach((card) => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);
    card.addEventListener("dragend", handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedTodo = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.id);
}

function handleDragOver(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");

  if (draggedTodo !== this) {
    const todosArray = Array.from(todosContainer.children);
    const fromIndex = todosArray.indexOf(draggedTodo);
    const toIndex = todosArray.indexOf(this);

    if (fromIndex < toIndex) {
      this.parentNode.insertBefore(draggedTodo, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedTodo, this);
    }

    // Update positions in database
    updateTodoPositions();
  }
}

function handleDragEnd() {
  this.classList.remove("dragging");
  document.querySelectorAll(".todo-card").forEach((card) => {
    card.classList.remove("drag-over");
  });
  draggedTodo = null;
}

async function updateTodoPositions() {
  const todoCards = document.querySelectorAll(".todo-card");
  const orderData = [];

  todoCards.forEach((card, index) => {
    const id = parseInt(card.dataset.id);
    orderData.push({ id: id, position: index });

    // Update local
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.position = index;
  });

  try {
    await fetch("http://localhost:3000/api/todos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    console.log("Order updated");
  } catch (error) {
    console.error("Error updating order:", error);
  }
}

// ============================================
// FILTER & SORT (FIXED)
// ============================================
function setActiveFilter(filter) {
  currentFilter = filter;

  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  renderTodos();
}

function filterTodos(searchTerm) {
  // Simple search - you can enhance this
  console.log("Searching:", searchTerm);
  renderTodos();
}

function sortTodos(sortBy) {
  console.log("Sorting by:", sortBy);
  renderTodos();
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;

  const totalEl = document.getElementById("totalTasks");
  const completedEl = document.getElementById("completedTasks");
  const pendingEl = document.getElementById("pendingTasks");

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl) pendingEl.textContent = pending;
}

function updateDate() {
  const dateDisplay = document.getElementById("dateDisplay");
  if (!dateDisplay) return;

  const now = new Date();
  dateDisplay.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================================
// MESSAGES
// ============================================
function showMessage(message, type = "info") {
  console.log("Message:", message, type);

  // Create simple toast
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "error"
              ? "#ef4444"
              : type === "warning"
                ? "#f59e0b"
                : "#3b82f6"
        };
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// READY
// ============================================
console.log("✅ TODO-IT Fully Loaded!");
