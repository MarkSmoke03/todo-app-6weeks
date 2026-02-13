// ===========================================
// CALENDAR.JS - Complete Calendar Implementation
// ===========================================

class CalendarView {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.tasksByDate = {};
    this.isInitialized = false;
  }

  // Initialize calendar
  async init() {
    try {
      logger.log("CALENDAR", "Initializing calendar view");

      // Load tasks with due dates
      await this.loadTasks();

      // Render calendar UI
      this.renderCalendar();

      // Setup event listeners
      this.setupEventListeners();

      // Select today's date by default
      const today = new Date().toISOString().split("T")[0];
      this.selectDate(today);

      this.isInitialized = true;
      logger.log("CALENDAR", "Calendar initialized successfully");
    } catch (error) {
      logger.error("CALENDAR", "Failed to initialize calendar", error);
      this.showError("Failed to load calendar. Please try again.");
    }
  }

  // Load tasks with due dates
  async loadTasks() {
    try {
      logger.log("CALENDAR", "Loading tasks for calendar");

      const response = await fetch("http://localhost:5000/api/todos");
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const tasks = await response.json();
      this.tasksByDate = {};

      // Organize tasks by date
      tasks.forEach((task) => {
        if (task.due_date) {
          const dateKey = task.due_date.split("T")[0];

          if (!this.tasksByDate[dateKey]) {
            this.tasksByDate[dateKey] = [];
          }

          this.tasksByDate[dateKey].push(task);
          logger.debug(
            "CALENDAR",
            `Task "${task.title}" scheduled for ${dateKey}`,
          );
        }
      });

      logger.log(
        "CALENDAR",
        `Loaded ${Object.keys(this.tasksByDate).length} dates with tasks`,
      );
    } catch (error) {
      logger.error("CALENDAR", "Error loading tasks", error);
      this.tasksByDate = {};
    }
  }

  // Render calendar UI
  renderCalendar() {
    const container = document.getElementById("calendarView");
    if (!container) {
      logger.error("CALENDAR", "Calendar container not found");
      return;
    }

    container.innerHTML = `
      <div class="calendar-main">
        <!-- Calendar Header -->
        <div class="calendar-header">
          <button class="calendar-nav-btn" id="prevMonthBtn">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h2 class="calendar-title" id="calendarTitle">${this.getMonthYear()}</h2>
          <button class="calendar-nav-btn" id="nextMonthBtn">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <!-- Calendar Grid -->
        <div class="calendar-grid" id="calendarGrid">
          ${this.generateCalendarGrid()}
        </div>
        
        <!-- Selected Date Tasks -->
        <div class="selected-date-section">
          <h3 id="selectedDateTitle">Select a date to view tasks</h3>
          <div class="date-tasks-container" id="dateTasksContainer">
            <p class="no-tasks-message">Click on any date to see tasks</p>
          </div>
          <button class="btn-primary" id="addTaskToDateBtn" style="display: none;">
            <i class="fas fa-plus"></i> Add Task to Selected Date
          </button>
        </div>
      </div>
    `;

    logger.debug("CALENDAR", "Calendar UI rendered");
  }

  // Generate calendar grid
  generateCalendarGrid() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();

    let html = "";

    // Day headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach((day) => {
      html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const isToday = date.toDateString() === today.toDateString();
      const isSelected =
        date.toDateString() === this.selectedDate.toDateString();
      const tasks = this.tasksByDate[dateString] || [];
      const hasTasks = tasks.length > 0;
      const completedTasks = tasks.filter((t) => t.completed).length;
      const allCompleted = hasTasks && completedTasks === tasks.length;
      const isOverdue =
        date < today && hasTasks && completedTasks < tasks.length;

      // Build CSS classes
      let dayClass = "calendar-day";
      if (isToday) dayClass += " today";
      if (isSelected) dayClass += " selected";
      if (hasTasks) dayClass += " has-tasks";
      if (allCompleted) dayClass += " all-completed";
      if (isOverdue) dayClass += " overdue";

      html += `
        <div class="${dayClass}" 
             data-date="${dateString}"
             data-draggable="true">
          <div class="day-number">${day}</div>
          ${
            hasTasks
              ? `
            <div class="day-tasks-indicator">
              <span class="task-dot ${allCompleted ? "completed" : ""}"></span>
              ${tasks.length > 1 ? `<span class="task-count">${tasks.length}</span>` : ""}
            </div>
          `
              : ""
          }
          ${isOverdue ? `<div class="overdue-indicator">!</div>` : ""}
        </div>
      `;
    }

    return html;
  }

  // Setup event listeners
  setupEventListeners() {
    // Month navigation
    document.getElementById("prevMonthBtn")?.addEventListener("click", () => {
      logger.log("CALENDAR", "Previous month clicked");
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    document.getElementById("nextMonthBtn")?.addEventListener("click", () => {
      logger.log("CALENDAR", "Next month clicked");
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    // Date selection
    setTimeout(() => {
      document.querySelectorAll(".calendar-day:not(.empty)").forEach((day) => {
        day.addEventListener("click", () => {
          const dateString = day.dataset.date;
          logger.log("CALENDAR", `Date selected: ${dateString}`);
          this.selectDate(dateString);
        });

        // Drag and drop for tasks
        day.addEventListener("dragover", (e) => {
          e.preventDefault();
          day.classList.add("drag-over");
        });

        day.addEventListener("dragleave", () => {
          day.classList.remove("drag-over");
        });

        day.addEventListener("drop", async (e) => {
          e.preventDefault();
          day.classList.remove("drag-over");
          const todoId = e.dataTransfer.getData("text/plain");
          const dateString = day.dataset.date;

          if (todoId) {
            await this.moveTaskToDate(todoId, dateString);
          }
        });
      });

      // Add task to selected date button
      document
        .getElementById("addTaskToDateBtn")
        ?.addEventListener("click", () => {
          const selectedDate = this.selectedDate.toISOString().split("T")[0];
          logger.log("CALENDAR", `Adding task to date: ${selectedDate}`);
          this.openAddTaskModal(selectedDate);
        });
    }, 100);

    // Enable drag from todo list to calendar
    document.addEventListener("dragstart", (e) => {
      if (e.target.closest(".todo-item")) {
        const todoId = e.target.closest(".todo-item").dataset.id;
        e.dataTransfer.setData("text/plain", todoId);
        logger.debug("CALENDAR", `Dragging task: ${todoId}`);
      }
    });
  }

  // Select a date
  async selectDate(dateString) {
    try {
      this.selectedDate = new Date(dateString);

      // Update UI to show selected date
      this.renderCalendar();

      // Load tasks for selected date
      await this.showDateTasks(dateString);

      // Show add task button
      const addBtn = document.getElementById("addTaskToDateBtn");
      if (addBtn) {
        addBtn.style.display = "block";
        addBtn.onclick = () => this.openAddTaskModal(dateString);
      }

      logger.log("CALENDAR", `Date selected: ${this.formatDate(dateString)}`);
    } catch (error) {
      logger.error("CALENDAR", "Error selecting date", error);
    }
  }

  // Show tasks for selected date
  async showDateTasks(dateString) {
    const container = document.getElementById("dateTasksContainer");
    const title = document.getElementById("selectedDateTitle");

    if (!container || !title) return;

    const tasks = this.tasksByDate[dateString] || [];
    const formattedDate = this.formatDate(dateString);

    title.textContent = `${formattedDate} (${tasks.length} task${tasks.length !== 1 ? "s" : ""})`;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-date-state">
          <i class="fas fa-calendar-plus"></i>
          <p>No tasks scheduled for this day</p>
        </div>
      `;
      return;
    }

    let tasksHtml = '<div class="date-tasks-list">';

    tasks.forEach((task) => {
      const isOverdue = new Date(task.due_date) < new Date() && !task.completed;

      tasksHtml += `
        <div class="date-task-item ${task.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}" 
             data-id="${task.id}">
          <div class="date-task-header">
            <span class="priority-badge ${task.priority}">${task.priority}</span>
            <div class="date-task-info">
              <h4 class="date-task-title">${task.title}</h4>
              ${task.description ? `<p class="date-task-desc">${task.description}</p>` : ""}
            </div>
          </div>
          <div class="date-task-actions">
            <button class="btn-small complete-btn" onclick="calendar.toggleTaskCompletion('${task.id}')">
              ${task.completed ? '<i class="fas fa-undo"></i> Undo' : '<i class="fas fa-check"></i> Complete'}
            </button>
            <button class="btn-small edit-btn" onclick="calendar.editTask('${task.id}')">
              <i class="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      `;
    });

    tasksHtml += "</div>";
    container.innerHTML = tasksHtml;

    logger.debug(
      "CALENDAR",
      `Displayed ${tasks.length} tasks for ${dateString}`,
    );
  }

  // Move task to different date
  async moveTaskToDate(todoId, dateString) {
    try {
      logger.log("CALENDAR", `Moving task ${todoId} to ${dateString}`);

      const response = await fetch(
        `http://localhost:5000/api/todos/${todoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ due_date: dateString }),
        },
      );

      if (!response.ok) throw new Error("Failed to update task");

      // Update local data
      await this.loadTasks();
      await this.showDateTasks(dateString);
      this.renderCalendar();

      // Refresh main todo list
      if (typeof loadTodos === "function") {
        loadTodos();
      }

      showToast(`Task moved to ${this.formatDate(dateString)}`, "success");
      logger.log("CALENDAR", `Task moved successfully to ${dateString}`);
    } catch (error) {
      logger.error("CALENDAR", "Failed to move task", error);
      showToast("Failed to update task date", "error");
    }
  }

  // Toggle task completion
  async toggleTaskCompletion(todoId) {
    try {
      // Find the task
      const allTasks = Object.values(this.tasksByDate).flat();
      const task = allTasks.find((t) => t.id === todoId);

      if (!task) return;

      const updatedTask = { ...task, completed: !task.completed };

      logger.log("CALENDAR", `Toggling completion for task: ${task.title}`);

      const response = await fetch(
        `http://localhost:5000/api/todos/${todoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        },
      );

      if (response.ok) {
        // Update local data
        await this.loadTasks();

        // Refresh display
        const dateString = task.due_date.split("T")[0];
        await this.showDateTasks(dateString);
        this.renderCalendar();

        // Refresh dashboard
        if (typeof updateDashboard === "function") {
          updateDashboard();
        }

        showToast(
          `Task marked as ${updatedTask.completed ? "completed" : "pending"}`,
          "success",
        );
        logger.log("CALENDAR", `Task completion toggled successfully`);
      }
    } catch (error) {
      logger.error("CALENDAR", "Failed to toggle task completion", error);
      showToast("Failed to update task", "error");
    }
  }

  // Edit task
  editTask(todoId) {
    logger.log("CALENDAR", `Opening edit for task: ${todoId}`);

    if (typeof openEditModal === "function") {
      openEditModal(todoId);
    } else {
      // Fallback: redirect to main todos view
      switchTab("all");
      setTimeout(() => {
        if (typeof openEditModal === "function") {
          openEditModal(todoId);
        }
      }, 100);
    }
  }

  // Open add task modal with pre-filled date
  openAddTaskModal(dateString) {
    logger.log("CALENDAR", `Opening add modal for date: ${dateString}`);

    // Show add modal
    const modal = document.getElementById("addTodoModal");
    if (modal) {
      modal.style.display = "block";

      // Pre-fill due date after a short delay
      setTimeout(() => {
        const dueDateInput = document.getElementById("dueDate");
        if (dueDateInput) {
          dueDateInput.value = dateString;
        }

        // Focus on title
        const titleInput = document.getElementById("todoTitle");
        if (titleInput) {
          titleInput.focus();
        }
      }, 50);
    }
  }

  // Show error message
  showError(message) {
    const container = document.getElementById("calendarView");
    if (container) {
      container.innerHTML = `
        <div class="calendar-error">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Calendar Error</h3>
          <p>${message}</p>
          <button class="btn-secondary" onclick="calendar.init()">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      `;
    }
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Get month and year for header
  getMonthYear() {
    return this.currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
}

// Global calendar instance
const calendar = new CalendarView();

// Export for debugging
window.calendar = calendar;
