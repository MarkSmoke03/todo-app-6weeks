// Update handleTodoSubmit function
const handleTodoSubmit = async (event, todoId = null) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const todoData = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    due_date: formData.get("dueDate") || null,
  };

  if (todoId) {
    todoData.completed = form.elements.completed?.checked || false;
  }

  try {
    if (todoId) {
      await apiService.updateTodo(todoId, todoData);
      showToast("Task updated successfully!", "success");
    } else {
      await apiService.createTodo(todoData);
      showToast("Task created successfully!", "success");
    }

    closeModal();
    loadTodos(); // Refresh the todo list
    updateDashboard(); // Refresh dashboard stats
  } catch (error) {
    showToast("Failed to save task. Please try again.", "error");
    console.error("Error saving todo:", error);
  }
};

// Update handleQuickTodoSubmit function
const handleQuickTodoSubmit = async (event) => {
  event.preventDefault();

  const titleInput = document.getElementById("quickTitle");
  const dueDateInput = document.getElementById("quickDueDate");
  const activePriorityBtn = document.querySelector(".priority-btn.active");

  const todoData = {
    title: titleInput.value,
    description: "",
    priority: activePriorityBtn
      ? activePriorityBtn.textContent.toLowerCase()
      : "medium",
    due_date: dueDateInput.value || null,
  };

  try {
    await apiService.createTodo(todoData);
    showToast("Task added successfully!", "success");

    closeQuickAddModal();
    titleInput.value = ""; // Clear the input
    loadTodos(); // Refresh the todo list
    updateDashboard(); // Refresh dashboard stats
  } catch (error) {
    showToast("Failed to add task. Please try again.", "error");
    console.error("Error creating quick todo:", error);
  }
};

// Add setQuickPriority function
const setQuickPriority = (priority) => {
  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.classList.contains(priority)) {
      btn.classList.add("active");
    }
  });
};
