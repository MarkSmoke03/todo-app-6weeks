// Update createTodoModal method
const createTodoModal = (todo = null) => {
  const isEdit = !!todo;
  const dueDate = todo?.due_date ? todo.due_date.split("T")[0] : "";

  return `
    <div class="modal-overlay" id="todoModalOverlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>${isEdit ? "Edit Task" : "Add New Task"}</h2>
          <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="todoForm" onsubmit="handleTodoSubmit(event, ${isEdit ? `'${todo.id}'` : "null"})">
            <div class="form-group">
              <label for="title">Task Title *</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value="${todo?.title || ""}"
                placeholder="What needs to be done?"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                name="description" 
                placeholder="Add details, notes, or context..."
                rows="3"
              >${todo?.description || ""}</textarea>
            </div>
            
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
};

// Update quickAddTodoModal method
const quickAddTodoModal = () => {
  return `
    <div class="modal-overlay" id="quickAddModalOverlay">
      <div class="modal-container quick-add-modal">
        <div class="modal-header">
          <h2>Quick Add Task</h2>
          <button class="close-modal" onclick="closeQuickAddModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="quickTodoForm" onsubmit="handleQuickTodoSubmit(event)">
            <div class="form-group">
              <input 
                type="text" 
                id="quickTitle" 
                placeholder="What needs to be done?"
                required
                autofocus
              >
            </div>
            
            <div class="quick-options">
              <div class="quick-option">
                <label>Priority</label>
                <div class="priority-options">
                  <button type="button" class="priority-btn low" onclick="setQuickPriority('low')">Low</button>
                  <button type="button" class="priority-btn medium active" onclick="setQuickPriority('medium')">Medium</button>
                  <button type="button" class="priority-btn high" onclick="setQuickPriority('high')">High</button>
                </div>
              </div>
              
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
            
            <div class="modal-actions">
              <button type="submit" class="btn-primary full-width">Add Task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
};
