// Add these methods to your existing apiService object

// Update createTodo method
const createTodo = async (todoData) => {
  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      throw new Error("Failed to create todo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
};

// Update updateTodo method
const updateTodo = async (id, todoData) => {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      throw new Error("Failed to update todo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
};

// Add new calendar methods
const getCalendarData = async () => {
  try {
    const response = await fetch(`${API_URL}/todos/calendar/upcoming`);
    if (!response.ok) throw new Error("Failed to fetch calendar data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    throw error;
  }
};

const getOverdueTodos = async () => {
  try {
    const response = await fetch(`${API_URL}/todos/overdue`);
    if (!response.ok) throw new Error("Failed to fetch overdue todos");
    return await response.json();
  } catch (error) {
    console.error("Error fetching overdue todos:", error);
    throw error;
  }
};

const getTodosByDate = async (date) => {
  try {
    const response = await fetch(`${API_URL}/todos?date=${date}`);
    if (!response.ok) throw new Error("Failed to fetch todos by date");
    return await response.json();
  } catch (error) {
    console.error("Error fetching todos by date:", error);
    throw error;
  }
};

// Export the new methods
export {
  createTodo,
  updateTodo,
  getCalendarData,
  getOverdueTodos,
  getTodosByDate,
  // ... keep your existing exports
};
