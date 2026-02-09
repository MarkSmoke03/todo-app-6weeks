// Drag & Drop Functionality
// Remove the "export default" line and make it globally available

class DragDropManager {
  constructor(todoListElement, onOrderChange) {
    this.todoList = todoListElement;
    this.onOrderChange = onOrderChange;
    this.draggedItem = null;
    this.dragStartY = 0;
    this.currentOrder = [];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateSortableState();
  }

  setupEventListeners() {
    // Mouse events
    this.todoList.addEventListener(
      "mousedown",
      this.handleDragStart.bind(this),
    );

    // Touch events for mobile
    this.todoList.addEventListener(
      "touchstart",
      this.handleDragStart.bind(this),
      { passive: false },
    );

    // HTML5 Drag & Drop events
    this.todoList.addEventListener("dragover", this.handleDragOver.bind(this));
    this.todoList.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );
    this.todoList.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );
    this.todoList.addEventListener("drop", this.handleDrop.bind(this));
    this.todoList.addEventListener("dragend", this.handleDragEnd.bind(this));
  }

  handleDragStart(e) {
    const todoItem = e.target.closest(".todo-item");
    const dragHandle = e.target.closest(".drag-handle");

    // Only start drag on drag handle or if shift key is pressed
    if (!todoItem || (!dragHandle && !e.shiftKey)) return;

    if (e.type === "touchstart") {
      e.preventDefault();
    }

    this.draggedItem = todoItem;
    this.dragStartY = e.clientY || (e.touches && e.touches[0].clientY);

    // Add visual feedback
    setTimeout(() => {
      if (this.draggedItem) {
        this.draggedItem.classList.add("dragging");
      }
    }, 100);

    // For HTML5 drag & drop
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", todoItem.dataset.id);
      e.dataTransfer.effectAllowed = "move";
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    const todoItem = e.target.closest(".todo-item");
    if (todoItem && todoItem !== this.draggedItem) {
      todoItem.classList.add("drag-over");
    }
  }

  handleDragEnter(e) {
    e.preventDefault();
  }

  handleDragLeave(e) {
    const todoItem = e.target.closest(".todo-item");
    if (todoItem) {
      todoItem.classList.remove("drag-over");
    }
  }

  handleDrop(e) {
    e.preventDefault();

    const targetItem = e.target.closest(".todo-item");
    if (!targetItem || !this.draggedItem || targetItem === this.draggedItem)
      return;

    // Remove drag class
    targetItem.classList.remove("drag-over");

    // Insert before target item
    this.todoList.insertBefore(this.draggedItem, targetItem);

    // Update order
    this.updateOrder();

    // Visual feedback
    this.draggedItem.classList.add("reordered");
    setTimeout(() => {
      this.draggedItem.classList.remove("reordered");
    }, 300);
  }

  handleDragEnd() {
    // Clean up
    document.querySelectorAll(".todo-item").forEach((item) => {
      item.classList.remove("dragging", "drag-over");
    });

    this.draggedItem = null;
    this.dragStartY = 0;
  }

  updateOrder() {
    const todoItems = Array.from(this.todoList.querySelectorAll(".todo-item"));
    this.currentOrder = todoItems.map((item) => item.dataset.id);

    // Update order numbers
    todoItems.forEach((item, index) => {
      let orderIndicator = item.querySelector(".todo-order");
      if (!orderIndicator) {
        orderIndicator = document.createElement("span");
        orderIndicator.className = "todo-order";
        item.querySelector(".todo-content").prepend(orderIndicator);
      }
      orderIndicator.textContent = index + 1;
    });

    // Callback
    if (this.onOrderChange) {
      this.onOrderChange(this.currentOrder);
    }
  }

  updateSortableState() {
    const todoItems = this.todoList.querySelectorAll(".todo-item");
    todoItems.forEach((item) => {
      // Add drag handle
      if (!item.querySelector(".drag-handle")) {
        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle";
        dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
        dragHandle.setAttribute("title", "Drag to reorder");
        item.querySelector(".todo-actions").prepend(dragHandle);
      }

      // Make draggable
      item.setAttribute("draggable", "true");
    });

    this.updateOrder();
  }

  async saveOrderToBackend() {
    if (this.currentOrder.length === 0) return;

    try {
      // Use the global API_URL from script.js
      const response = await fetch(window.API_URL + "/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: this.currentOrder }),
      });

      if (!response.ok) throw new Error("Failed to save order");

      return await response.json();
    } catch (error) {
      console.error("Error saving order:", error);
      throw error;
    }
  }
}

// Make globally available
window.DragDropManager = DragDropManager;
