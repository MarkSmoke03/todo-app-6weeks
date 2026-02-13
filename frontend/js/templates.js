// ===========================================
// TEMPLATES.JS - HTML Templates
// ===========================================

// ===================
// CREATE TODO MODAL
// ===================
function createTodoModal(todo = null) {
  const isEdit = !!todo;
  const dueDate = todo?.due_date ? todo.due_date.split("T")[0] : "";

  return `
    <div class="modal-overlay" id="todoModalOverlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>${isEdit ? "✏️ Edit Task" : "➕ Add New Task"}</h2>
          <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="todoForm" onsubmit="handleTodoSubmit(event, ${isEdit ? `'${todo.id}'` : "null"})">
            <!-- Title -->
            <div class="form-group">
              <label for="title">Task Title *</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value="${todo?.title || ""}"
                placeholder="What needs to be done?"
                required
                autofocus
              >
            </div>
            
            <!-- Description -->
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                name="description" 
                placeholder="Add details, notes, or context..."
                rows="3"
              >${todo?.description || ""}</textarea>
            </div>
            
            <!-- Priority & Due Date -->
            <div class="form-row">
              <div class="form-group">
                <label for="priority">Priority</label>
                <select id="priority" name="priority">
                  <option value="low" ${todo?.priority === "low" ? "selected" : ""}>Low</option>
                  <option value="medium" ${!todo?.priority || todo.priority === "medium" ? "selected" : ""}>Medium</option>
                  <option value="high" ${todo?.priority === "high" ? "selected" : ""}>High</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="dueDate">Due Date</label>
                <input 
                  type="date" 
                  id="dueDate" 
                  name="dueDate" 
                  value="${dueDate}"
                  min="${new Date().toISOString().split("T")[0]}"
                >
              </div>
            </div>
            
            <!-- Completion Checkbox (Edit Only) -->
            ${
              isEdit
                ? `
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="completed" 
                    name="completed"
                    ${todo?.completed ? "checked" : ""}
                  >
                  <span>Mark as completed</span>
                </label>
              </div>
            `
                : ""
            }
            
            <!-- Modal Actions -->
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
              <button type="submit" class="btn-primary">
                ${isEdit ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// ===================
// QUICK ADD TODO MODAL
// ===================
function quickAddTodoModal() {
  return `
    <div class="modal-overlay" id="quickAddModalOverlay">
      <div class="modal-container quick-add-modal">
        <div class="modal-header">
          <h2>⚡ Quick Add Task</h2>
          <button class="close-modal" onclick="closeQuickAddModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="quickTodoForm" onsubmit="handleQuickTodoSubmit(event)">
            <!-- Quick Title Input -->
            <div class="form-group">
              <input 
                type="text" 
                id="quickTitle" 
                placeholder="What needs to be done?"
                required
                autofocus
              >
            </div>
            
            <!-- Quick Options -->
            <div class="quick-options">
              <!-- Priority Buttons -->
              <div class="quick-option">
                <label>Priority</label>
                <div class="priority-options">
                  <button type="button" class="priority-btn low" onclick="setQuickPriority('low')">Low</button>
                  <button type="button" class="priority-btn medium active" onclick="setQuickPriority('medium')">Medium</button>
                  <button type="button" class="priority-btn high" onclick="setQuickPriority('high')">High</button>
                </div>
              </div>
              
              <!-- Due Date -->
              <div class="quick-option">
                <label>Due Date</label>
                <input 
                  type="date" 
                  id="quickDueDate" 
                  min="${new Date().toISOString().split("T")[0]}"
                  class="quick-date-input"
                >
              </div>
            </div>
            
            <!-- Submit Button -->
            <div class="modal-actions">
              <button type="submit" class="btn-primary full-width">➕ Add Task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// ===================
// CLOSE QUICK ADD MODAL
// ===================
function closeQuickAddModal() {
  const modal = document.getElementById("quickAddModalOverlay");
  if (modal) modal.remove();
}

// ===================
// HANDLE QUICK TODO SUBMIT
// ===================
async function handleQuickTodoSubmit(event) {
  event.preventDefault();

  const titleInput = document.getElementById("quickTitle");
  const dueDateInput = document.getElementById("quickDueDate");
  const activePriorityBtn = document.querySelector(".priority-btn.active");

  // Prepare data
  const todoData = {
    title: titleInput.value,
    description: "",
    priority: activePriorityBtn
      ? activePriorityBtn.textContent.toLowerCase()
      : "medium",
    due_date: dueDateInput.value || null,
  };

  try {
    // Create todo
    await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todoData),
    });

    // Show success message
    showToast("Task added successfully!", "success");

    // Close modal and clear input
    closeQuickAddModal();
    titleInput.value = "";

    // Refresh
    await loadTodos();
    updateDashboard();
  } catch (error) {
    console.error("Error creating quick todo:", error);
    showToast("Failed to add task. Please try again.", "error");
  }
}

// ===================
// SET QUICK PRIORITY
// ===================
function setQuickPriority(priority) {
  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.classList.contains(priority)) {
      btn.classList.add("active");
    }
  });
}
