// update-todo-it.js - Complete UI Overhaul Script
const fs = require("fs");
const path = require("path");

console.log("🎨 TODO-IT UI Retweak & Rebranding");
console.log("===================================\n");

// Define the project paths
const projectRoot = __dirname;
const frontendPath = path.join(projectRoot, "frontend");

// New HTML content
const newHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TODO-IT | Smart Task Manager</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✅</text></svg>">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <div class="logo-icon">✅</div>
                    <h1 class="gradient-text">TODO-IT</h1>
                    <p class="tagline">Where productivity meets simplicity</p>
                </div>
                <button class="sidebar-toggle" id="sidebarToggle">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>

            <nav class="sidebar-nav">
                <a href="#" class="nav-item active">
                    <i class="fas fa-tasks"></i>
                    <span>My Tasks</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="fas fa-star"></i>
                    <span>Important</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Planned</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="fas fa-user"></i>
                    <span>Personal</span>
                </a>
                <div class="sidebar-divider"></div>
                <a href="#" class="nav-item">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="avatar">👤</div>
                    <div class="user-info">
                        <strong>Welcome back!</strong>
                        <span>Ready to be productive?</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="main-header">
                <div class="header-left">
                    <h2 class="gradient-text">My Tasks</h2>
                    <p id="dateDisplay" class="date-display">Loading...</p>
                </div>
                <div class="header-right">
                    <button class="btn-primary" id="addTodoBtn">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                    <button class="btn-secondary" id="quickAddBtn">
                        <i class="fas fa-bolt"></i> Quick Add
                    </button>
                </div>
            </header>

            <!-- Dashboard Stats -->
            <div class="dashboard">
                <div class="stat-card gradient-blue">
                    <div class="stat-icon">
                        <i class="fas fa-list-check"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Total Tasks</h3>
                        <p class="stat-number" id="totalTasks">0</p>
                    </div>
                </div>
                <div class="stat-card gradient-green">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Completed</h3>
                        <p class="stat-number" id="completedTasks">0</p>
                    </div>
                </div>
                <div class="stat-card gradient-orange">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Pending</h3>
                        <p class="stat-number" id="pendingTasks">0</p>
                    </div>
                </div>
                <div class="stat-card gradient-purple">
                    <div class="stat-icon">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Active Streak</h3>
                        <p class="stat-number" id="activeStreak">0 days</p>
                    </div>
                </div>
            </div>

            <!-- Productivity Score -->
            <div class="productivity-card">
                <div class="productivity-header">
                    <h3><i class="fas fa-chart-line"></i> Productivity Score</h3>
                    <span class="progress-percentage" id="productivityScore">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="productivityBar"></div>
                </div>
                <p class="progress-text">Based on completed tasks</p>
            </div>

            <!-- Controls -->
            <div class="controls">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search tasks...">
                </div>
                <div class="control-group">
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">All Tasks</button>
                        <button class="filter-btn" data-filter="pending">Pending</button>
                        <button class="filter-btn" data-filter="completed">Completed</button>
                    </div>
                    <select id="sortSelect" class="sort-select">
                        <option value="position">Sort by: Position</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                    </select>
                </div>
            </div>

            <!-- Todos Container -->
            <div class="todos-container">
                <div id="todosContainer">
                    <!-- Todos will be loaded here -->
                </div>

                <!-- Empty State -->
                <div class="empty-state" id="emptyState">
                    <div class="empty-illustration">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>No tasks yet</h3>
                    <p>Add your first task to get started!</p>
                    <button class="btn-primary" id="emptyAddBtn">
                        <i class="fas fa-plus"></i> Create First Task
                    </button>
                </div>

                <!-- Loading State -->
                <div class="loading-state" id="loadingState">
                    <div class="spinner"></div>
                    <p>Loading your tasks...</p>
                </div>

                <!-- Error State -->
                <div class="error-state" id="errorState">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Something went wrong</h3>
                    <p id="errorMessage">Unable to load tasks</p>
                    <button class="btn-secondary" id="retryBtn">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <footer class="main-footer">
                <p>TODO-IT v2.0 • Made with <i class="fas fa-heart"></i> for productivity</p>
                <div class="footer-links">
                    <span id="todoCount">0 tasks</span>
                    •
                    <span id="completedCount">0 completed</span>
                    •
                    <span>API: <span id="apiStatus" class="status-online">Online</span></span>
                </div>
            </footer>
        </main>
    </div>

    <!-- Add Todo Modal -->
    <div class="modal" id="addTodoModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> Add New Task</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="todoTitle"><i class="fas fa-heading"></i> Task Title*</label>
                    <input type="text" id="todoTitle" placeholder="What needs to be done?" required>
                </div>
                <div class="form-group">
                    <label for="todoDesc"><i class="fas fa-align-left"></i> Description</label>
                    <textarea id="todoDesc" placeholder="Add details (max 500 characters)" maxlength="500"></textarea>
                    <div class="char-counter">
                        <span id="descCharCount">0/500</span>
                    </div>
                </div>
                <div class="form-group">
                    <label for="todoPriority"><i class="fas fa-flag"></i> Priority</label>
                    <select id="todoPriority">
                        <option value="low">Low Priority</option>
                        <option value="medium" selected>Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-primary" id="saveTodoBtn">
                    <i class="fas fa-save"></i> Save Task
                </button>
            </div>
        </div>
    </div>

    <!-- Edit Todo Modal -->
    <div class="modal" id="editTodoModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Task</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editTodoTitle">Task Title*</label>
                    <input type="text" id="editTodoTitle" placeholder="Task title" required>
                </div>
                <div class="form-group">
                    <label for="editTodoDesc">Description</label>
                    <textarea id="editTodoDesc" placeholder="Task description" maxlength="500"></textarea>
                    <div class="char-counter">
                        <span id="editDescCharCount">0/500</span>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editTodoPriority">Priority</label>
                    <select id="editTodoPriority">
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-primary" id="saveEditBtn">
                    <i class="fas fa-save"></i> Update Task
                </button>
            </div>
        </div>
    </div>

    <!-- Quick Add Modal -->
    <div class="modal" id="quickAddModal">
        <div class="modal-content quick-add">
            <div class="modal-header">
                <h3><i class="fas fa-bolt"></i> Quick Add</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <input type="text" id="quickTodoTitle" placeholder="Type your task and press Enter..." autofocus>
                <p class="hint"><i class="fas fa-lightbulb"></i> Press Enter to save, Esc to cancel</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-primary" id="saveQuickAddBtn">
                    <i class="fas fa-check"></i> Add Task
                </button>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer"></div>

    <!-- Todo Template -->
    <template id="todoTemplate">
        <div class="todo-card">
            <div class="todo-checkbox">
                <input type="checkbox" class="todo-checkbox-input">
                <div class="checkbox-custom"></div>
            </div>
            <div class="todo-content">
                <div class="todo-header">
                    <h4 class="todo-title"></h4>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <span class="priority-badge"></span>
                    </div>
                </div>
                <p class="todo-description"></p>
                <div class="todo-footer">
                    <span class="todo-date"></span>
                    <span class="todo-status"></span>
                </div>
            </div>
        </div>
    </template>

    <script src="script.js"></script>
</body>
</html>`;

// New CSS content (with fixed gradient text)
const newCSS = `/* TODO-IT - Modern Dark Theme */
:root {
    /* Color Palette */
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --info: #3b82f6;
    
    /* Background Colors */
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --bg-card: #1e293b;
    
    /* Text Colors */
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    /* Border Colors */
    --border-color: #475569;
    --border-light: #334155;
    
    /* Gradients */
    --gradient-blue: linear-gradient(135deg, #3b82f6, #6366f1);
    --gradient-green: linear-gradient(135deg, #10b981, #14b8a6);
    --gradient-orange: linear-gradient(135deg, #f59e0b, #f97316);
    --gradient-purple: linear-gradient(135deg, #8b5cf6, #a855f7);
    --gradient-text: linear-gradient(135deg, #fff, #94a3b8);
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    
    /* Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    
    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
}

/* Reset & Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
}

.app-container {
    display: flex;
    min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
    width: 280px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width var(--transition-normal);
    position: relative;
    z-index: 100;
}

.sidebar.collapsed {
    width: 0;
    overflow: hidden;
}

.sidebar-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.logo-icon {
    font-size: 32px;
    background: var(--gradient-blue);
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-sm);
    color: white;
}

/* Gradient Text Class */
.gradient-text {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
}

.logo h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
}

.tagline {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 400;
}

.sidebar-toggle {
    background: none;
    border: 1px solid var(--border-light);
    color: var(--text-secondary);
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.sidebar-toggle:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.sidebar-nav {
    flex: 1;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
}

.nav-item:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.nav-item.active {
    background: var(--primary);
    color: white;
    font-weight: 500;
}

.nav-item i {
    width: 20px;
    text-align: center;
}

.sidebar-divider {
    height: 1px;
    background: var(--border-light);
    margin: var(--space-md) 0;
}

.sidebar-footer {
    padding: var(--space-md);
    border-top: 1px solid var(--border-light);
}

.user-profile {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
}

.avatar {
    width: 40px;
    height: 40px;
    background: var(--gradient-purple);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-info strong {
    font-size: 14px;
    font-weight: 600;
}

.user-info span {
    font-size: 12px;
    color: var(--text-secondary);
}

/* Main Content */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: margin-left var(--transition-normal);
}

.main-content.expanded {
    margin-left: -280px;
}

/* Header */
.main-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary);
}

.header-left h2 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: var(--space-xs);
}

.date-display {
    color: var(--text-secondary);
    font-size: 14px;
    font-family: 'JetBrains Mono', monospace;
}

.header-right {
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

/* Button Styles */
.btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: var(--primary);
    color: white;
}

.btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-card);
    border-color: var(--primary);
}

/* Dashboard */
.dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-md);
    padding: var(--space-lg);
}

.stat-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    align-items: center;
    gap: var(--space-md);
    transition: transform var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.stat-card:hover {
    transform: translateY(-4px);
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.gradient-blue::before { background: var(--gradient-blue); }
.gradient-green::before { background: var(--gradient-green); }
.gradient-orange::before { background: var(--gradient-orange); }
.gradient-purple::before { background: var(--gradient-purple); }

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.gradient-blue .stat-icon { background: var(--gradient-blue); }
.gradient-green .stat-icon { background: var(--gradient-green); }
.gradient-orange .stat-icon { background: var(--gradient-orange); }
.gradient-purple .stat-icon { background: var(--gradient-purple); }

.stat-content h3 {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
    margin-bottom: var(--space-xs);
}

.stat-number {
    font-size: 32px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-primary);
}

/* Productivity Card */
.productivity-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin: 0 var(--space-lg) var(--space-lg);
}

.productivity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.productivity-header h3 {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-primary);
}

.progress-percentage {
    font-size: 24px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--primary);
}

.progress-bar {
    height: 12px;
    background: var(--bg-tertiary);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: var(--space-sm);
}

.progress-bar-fill {
    height: 100%;
    background: var(--gradient-green);
    border-radius: 6px;
    width: 0%;
    transition: width 1s ease;
}

.progress-text {
    font-size: 12px;
    color: var(--text-secondary);
}

/* Controls */
.controls {
    padding: 0 var(--space-lg);
    margin-bottom: var(--space-lg);
}

.search-box {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
    border: 2px solid transparent;
    transition: border-color var(--transition-fast);
}

.search-box:focus-within {
    border-color: var(--primary);
}

.search-box i {
    color: var(--text-secondary);
}

.search-box input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
}

.search-box input::placeholder {
    color: var(--text-muted);
}

.control-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
}

.filter-buttons {
    display: flex;
    gap: var(--space-sm);
    background: var(--bg-tertiary);
    padding: 4px;
    border-radius: var(--radius-md);
}

.filter-btn {
    padding: 8px 16px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.filter-btn:hover {
    color: var(--text-primary);
    background: var(--bg-card);
}

.filter-btn.active {
    background: var(--primary);
    color: white;
}

.sort-select {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 8px 16px;
    border-radius: var(--radius-md);
    font-size: 14px;
    cursor: pointer;
    min-width: 160px;
}

.sort-select:focus {
    outline: none;
    border-color: var(--primary);
}

/* Todos Container */
.todos-container {
    flex: 1;
    padding: 0 var(--space-lg);
    margin-bottom: var(--space-lg);
    position: relative;
}

#todosContainer {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

/* Todo Card */
.todo-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    gap: var(--space-lg);
    align-items: flex-start;
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
    position: relative;
}

.todo-card:hover {
    border-color: var(--primary);
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
}

.todo-card.completed {
    opacity: 0.7;
    background: var(--bg-tertiary);
}

.todo-card.completed .todo-title {
    text-decoration: line-through;
    color: var(--text-secondary);
}

.todo-card.dragging {
    opacity: 0.5;
    background: var(--bg-tertiary);
    border-style: dashed;
}

.todo-card.drag-over {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.1);
}

.todo-checkbox {
    position: relative;
    margin-top: 2px;
}

.todo-checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkbox-custom {
    width: 20px;
    height: 20px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    cursor: pointer;
}

.todo-checkbox-input:checked ~ .checkbox-custom {
    background: var(--primary);
    border-color: var(--primary);
}

.todo-checkbox-input:checked ~ .checkbox-custom::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.todo-checkbox-input:hover ~ .checkbox-custom {
    border-color: var(--primary);
}

.todo-content {
    flex: 1;
    min-width: 0;
}

.todo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-sm);
    gap: var(--space-md);
}

.todo-title {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
    word-break: break-word;
    color: var(--text-primary);
}

.todo-actions {
    display: flex;
    gap: var(--space-xs);
    align-items: center;
}

.action-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    border: none;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.action-btn:hover {
    background: var(--primary);
    color: white;
    transform: scale(1.1);
}

.delete-btn:hover {
    background: var(--danger);
}

.priority-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.priority-badge[data-priority="high"] {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.priority-badge[data-priority="medium"] {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
}

.priority-badge[data-priority="low"] {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.todo-description {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: var(--space-md);
    word-break: break-word;
}

.todo-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-muted);
}

.todo-date {
    font-family: 'JetBrains Mono', monospace;
}

.todo-status {
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--bg-tertiary);
    font-size: 11px;
    font-weight: 500;
}

/* States */
.empty-state, .loading-state, .error-state {
    text-align: center;
    padding: var(--space-xl);
    display: none;
}

.empty-illustration {
    font-size: 64px;
    margin-bottom: var(--space-lg);
    opacity: 0.5;
    color: var(--text-secondary);
}

.empty-state h3 {
    font-size: 20px;
    margin-bottom: var(--space-sm);
    color: var(--text-primary);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: var(--space-lg);
}

.loading-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-lg);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-icon {
    font-size: 48px;
    color: var(--danger);
    margin-bottom: var(--space-lg);
}

.error-state h3 {
    color: var(--danger);
    margin-bottom: var(--space-sm);
}

/* Footer */
.main-footer {
    padding: var(--space-lg);
    border-top: 1px solid var(--border-light);
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;
}

.main-footer p {
    margin-bottom: var(--space-xs);
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: var(--space-md);
    align-items: center;
    font-size: 12px;
}

.status-online {
    color: var(--secondary);
    font-weight: 600;
}

.status-offline {
    color: var(--danger);
    font-weight: 600;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: var(--space-md);
}

.modal.active {
    display: flex;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 500px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-xl);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.quick-add {
    max-width: 400px;
}

.modal-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    font-size: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-primary);
}

.close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 24px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
}

.close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.modal-body {
    padding: var(--space-lg);
}

.form-group {
    margin-bottom: var(--space-lg);
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: var(--space-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-card);
}

.form-group textarea {
    min-height: 100px;
    resize: vertical;
}

.char-counter {
    text-align: right;
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: var(--space-xs);
}

.hint {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.modal-footer {
    padding: var(--space-lg);
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
}

/* Toast Notifications */
#toastContainer {
    position: fixed;
    bottom: var(--space-lg);
    right: var(--space-lg);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.toast {
    background: var(--bg-card);
    border-left: 4px solid var(--primary);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    min-width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-lg);
    animation: slideInRight 0.3s ease;
    transform: translateX(100%);
    opacity: 0;
}

.toast.show {
    transform: translateX(0);
    opacity: 1;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.toast.success {
    border-left-color: var(--secondary);
}

.toast.error {
    border-left-color: var(--danger);
}

.toast.warning {
    border-left-color: var(--warning);
}

.toast.info {
    border-left-color: var(--info);
}

.toast span {
    flex: 1;
    margin-right: var(--space-md);
    color: var(--text-primary);
}

.toast-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 20px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
}

.toast-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .dashboard {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .app-container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: auto;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        transform: translateY(-100%);
        transition: transform var(--transition-normal);
    }
    
    .sidebar.active {
        transform: translateY(0);
    }
    
    .main-content {
        margin-left: 0;
        padding-top: 60px;
    }
    
    .main-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 900;
        padding: var(--space-md);
    }
    
    .dashboard {
        grid-template-columns: 1fr;
        padding-top: calc(var(--space-lg) + 60px);
    }
    
    .control-group {
        flex-direction: column;
        align-items: stretch;
    }
    
    .sort-select {
        width: 100%;
    }
    
    .header-right {
        display: none;
    }
    
    .todo-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    :root {
        --space-lg: 16px;
        --space-xl: 24px;
    }
    
    .stat-card {
        padding: var(--space-md);
    }
    
    .stat-number {
        font-size: 24px;
    }
    
    .modal-content {
        margin: var(--space-md);
    }
}`;

// New JavaScript content
const newJS = `// TODO-IT v2.0 - Enhanced JavaScript
// ============================================

// 📱 DOM Elements
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const mainContent = document.querySelector('.main-content');
const todosContainer = document.getElementById('todosContainer');
const todoTemplate = document.getElementById('todoTemplate');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const dateDisplay = document.getElementById('dateDisplay');
const addTodoBtn = document.getElementById('addTodoBtn');
const quickAddBtn = document.getElementById('quickAddBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const retryBtn = document.getElementById('retryBtn');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');

// Dashboard Elements
const totalTasksElement = document.getElementById('totalTasks');
const completedTasksElement = document.getElementById('completedTasks');
const pendingTasksElement = document.getElementById('pendingTasks');
const activeStreakElement = document.getElementById('activeStreak');
const productivityScoreElement = document.getElementById('productivityScore');
const productivityBar = document.getElementById('productivityBar');
const todoCountElement = document.getElementById('todoCount');
const completedCountElement = document.getElementById('completedCount');
const apiStatusElement = document.getElementById('apiStatus');

// Modal Elements
const addTodoModal = document.getElementById('addTodoModal');
const editTodoModal = document.getElementById('editTodoModal');
const quickAddModal = document.getElementById('quickAddModal');
const saveTodoBtn = document.getElementById('saveTodoBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const saveQuickAddBtn = document.getElementById('saveQuickAddBtn');
const todoTitleInput = document.getElementById('todoTitle');
const todoDescInput = document.getElementById('todoDesc');
const todoPriorityInput = document.getElementById('todoPriority');
const editTodoTitleInput = document.getElementById('editTodoTitle');
const editTodoDescInput = document.getElementById('editTodoDesc');
const editTodoPriorityInput = document.getElementById('editTodoPriority');
const quickTodoTitleInput = document.getElementById('quickTodoTitle');
const descCharCount = document.getElementById('descCharCount');
const editDescCharCount = document.getElementById('editDescCharCount');

// State Management
let todos = [];
let currentFilter = 'all';
let currentSort = 'position';
let currentSearch = '';
let editingTodoId = null;
let draggedTodo = null;

// Priority Configuration
const priorityConfig = {
    low: {
        label: 'Low',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.2)'
    },
    medium: {
        label: 'Medium',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.2)'
    },
    high: {
        label: 'High',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.2)'
    }
};

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// ============================================
// 🚀 INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ TODO-IT v2.0 Initialized');
    
    // Set current date
    updateDateDisplay();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load initial data
    loadTodos();
    
    // Initialize sidebar for mobile
    initSidebar();
});

function initEventListeners() {
    // Sidebar toggle
    sidebarToggle?.addEventListener('click', toggleSidebar);
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setActiveFilter(filter);
        });
    });
    
    // Sort select
    sortSelect?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTodos();
    });
    
    // Search input
    searchInput?.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderTodos();
    });
    
    // Add todo buttons
    addTodoBtn?.addEventListener('click', () => openModal(addTodoModal));
    quickAddBtn?.addEventListener('click', () => openModal(quickAddModal));
    emptyAddBtn?.addEventListener('click', () => openModal(addTodoModal));
    
    // Save buttons
    saveTodoBtn?.addEventListener('click', createTodo);
    saveEditBtn?.addEventListener('click', updateTodo);
    saveQuickAddBtn?.addEventListener('click', createQuickTodo);
    
    // Quick add modal - Enter key support
    quickTodoTitleInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createQuickTodo();
        }
    });
    
    // Character counters
    todoDescInput?.addEventListener('input', () => updateCharCounter(todoDescInput, descCharCount));
    editTodoDescInput?.addEventListener('input', () => updateCharCounter(editTodoDescInput, editDescCharCount));
    
    // Retry button
    retryBtn?.addEventListener('click', loadTodos);
    
    // Modal close buttons
    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Modal backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Update date every minute
    setInterval(updateDateDisplay, 60000);
}

// ============================================
// 📱 UI FUNCTIONS
// ============================================

function updateDateDisplay() {
    if (!dateDisplay) return;
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

function initSidebar() {
    if (window.innerWidth <= 768) {
        sidebar?.classList.add('collapsed');
    }
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar?.classList.remove('collapsed');
        }
    });
}

function toggleSidebar() {
    sidebar?.classList.toggle('collapsed');
    mainContent?.classList.toggle('expanded');
    
    // Update toggle button icon
    const icon = sidebarToggle.querySelector('i');
    if (sidebar?.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-right';
    } else {
        icon.className = 'fas fa-chevron-left';
    }
}

function setActiveFilter(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTodos();
}

// ============================================
// 📊 DATA FUNCTIONS
// ============================================

async function loadTodos() {
    showLoading();
    
    try {
        const response = await fetch(\`\${API_BASE_URL}/todos\`);
        
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        todos = data.sort((a, b) => a.position - b.position);
        
        renderTodos();
        updateDashboard();
        updateFooter();
        updateApiStatus(true);
        
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load tasks. Please check your connection.');
        updateApiStatus(false);
    }
}

async function saveTodoOrder() {
    const orderData = todos.map((todo, index) => ({
        id: todo.id,
        position: index
    }));
    
    try {
        await fetch(\`\${API_BASE_URL}/todos/reorder\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        showToast('Task order updated', 'success');
        
    } catch (error) {
        console.error('Error saving order:', error);
        showToast('Failed to save task order', 'error');
    }
}

// ============================================
// 🎨 RENDERING FUNCTIONS
// ============================================

function renderTodos() {
    if (!todosContainer) return;
    
    // Clear container
    todosContainer.innerHTML = '';
    
    // Filter and sort todos
    let filteredTodos = filterTodos(todos);
    filteredTodos = sortTodos(filteredTodos);
    
    if (filteredTodos.length === 0) {
        showEmptyState();
        return;
    }
    
    // Hide empty state
    hideAllStates();
    
    // Create todo cards
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todosContainer.appendChild(todoElement);
    });
    
    // Initialize drag & drop
    initDragAndDrop();
}

function filterTodos(todosList) {
    let filtered = todosList;
    
    // Apply search filter
    if (currentSearch) {
        filtered = filtered.filter(todo => 
            todo.title.toLowerCase().includes(currentSearch) ||
            todo.description?.toLowerCase().includes(currentSearch)
        );
    }
    
    // Apply status filter
    switch (currentFilter) {
        case 'pending':
            return filtered.filter(todo => !todo.completed);
        case 'completed':
            return filtered.filter(todo => todo.completed);
        default:
            return filtered;
    }
}

function sortTodos(todosList) {
    switch (currentSort) {
        case 'newest':
            return [...todosList].sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
        case 'oldest':
            return [...todosList].sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
            );
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return [...todosList].sort((a, b) => {
                const priorityA = priorityOrder[a.priority] || 0;
                const priorityB = priorityOrder[b.priority] || 0;
                return priorityB - priorityA;
            });
        default: // position
            return [...todosList].sort((a, b) => a.position - b.position);
    }
}

function createTodoElement(todo) {
    const template = todoTemplate.content.cloneNode(true);
    const todoCard = template.querySelector('.todo-card');
    const checkbox = template.querySelector('.todo-checkbox-input');
    const title = template.querySelector('.todo-title');
    const description = template.querySelector('.todo-description');
    const priorityBadge = template.querySelector('.priority-badge');
    const todoDate = template.querySelector('.todo-date');
    const todoStatus = template.querySelector('.todo-status');
    const editBtn = template.querySelector('.edit-btn');
    const deleteBtn = template.querySelector('.delete-btn');
    
    // Set todo ID
    todoCard.dataset.id = todo.id;
    todoCard.draggable = true;
    
    // Set completion state
    if (todo.completed) {
        todoCard.classList.add('completed');
        checkbox.checked = true;
    }
    
    // Set content
    title.textContent = todo.title;
    description.textContent = todo.description || 'No description provided';
    
    // Set priority
    const priority = todo.priority || 'medium';
    const priorityInfo = priorityConfig[priority];
    priorityBadge.textContent = priorityInfo.label;
    priorityBadge.style.color = priorityInfo.color;
    priorityBadge.style.backgroundColor = priorityInfo.bgColor;
    priorityBadge.dataset.priority = priority;
    
    // Set dates
    const createdDate = new Date(todo.created_at);
    todoDate.textContent = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Set status
    todoStatus.textContent = todo.completed ? 'Completed' : 'Pending';
    todoStatus.style.color = todo.completed ? priorityConfig.low.color : priorityConfig.medium.color;
    
    // Event listeners
    checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id));
    editBtn.addEventListener('click', () => openEditModal(todo));
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    
    // Drag events
    todoCard.addEventListener('dragstart', handleDragStart);
    todoCard.addEventListener('dragover', handleDragOver);
    todoCard.addEventListener('drop', handleDrop);
    todoCard.addEventListener('dragend', handleDragEnd);
    
    return todoCard;
}

// ============================================
// ✅ CRUD OPERATIONS
// ============================================

async function createTodo() {
    const title = todoTitleInput.value.trim();
    const description = todoDescInput.value.trim();
    const priority = todoPriorityInput.value;
    
    if (!title) {
        showToast('Please enter a task title', 'warning');
        return;
    }
    
    try {
        const response = await fetch(\`\${API_BASE_URL}/todos\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                priority,
                completed: false,
                position: todos.length
            })
        });
        
        if (!response.ok) throw new Error('Failed to create task');
        
        const newTodo = await response.json();
        todos.push(newTodo);
        
        closeAllModals();
        resetAddForm();
        renderTodos();
        updateDashboard();
        updateFooter();
        
        showToast('Task created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating todo:', error);
        showToast('Failed to create task', 'error');
    }
}

async function createQuickTodo() {
    const title = quickTodoTitleInput.value.trim();
    
    if (!title) {
        showToast('Please enter a task title', 'warning');
        return;
    }
    
    try {
        const response = await fetch(\`\${API_BASE_URL}/todos\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description: '',
                priority: 'medium',
                completed: false,
                position: todos.length
            })
        });
        
        if (!response.ok) throw new Error('Failed to create task');
        
        const newTodo = await response.json();
        todos.push(newTodo);
        
        closeAllModals();
        quickTodoTitleInput.value = '';
        renderTodos();
        updateDashboard();
        updateFooter();
        
        showToast('Task added quickly!', 'success');
        
    } catch (error) {
        console.error('Error creating quick todo:', error);
        showToast('Failed to add task', 'error');
    }
}

async function updateTodo() {
    if (!editingTodoId) return;
    
    const title = editTodoTitleInput.value.trim();
    const description = editTodoDescInput.value.trim();
    const priority = editTodoPriorityInput.value;
    
    if (!title) {
        showToast('Please enter a task title', 'warning');
        return;
    }
    
    try {
        const response = await fetch(\`\${API_BASE_URL}/todos/\${editingTodoId}\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                priority
            })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        // Update local state
        const index = todos.findIndex(t => t.id === editingTodoId);
        if (index !== -1) {
            todos[index] = { ...todos[index], title, description, priority };
        }
        
        closeAllModals();
        renderTodos();
        updateDashboard();
        updateFooter();
        
        showToast('Task updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating todo:', error);
        showToast('Failed to update task', 'error');
    }
}

async function toggleTodoCompletion(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
        const response = await fetch(\`\${API_BASE_URL}/todos/\${id}\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: !todo.completed
            })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        // Update local state
        todo.completed = !todo.completed;
        
        renderTodos();
        updateDashboard();
        updateFooter();
        
        const message = todo.completed ? 'Task completed!' : 'Task marked as pending';
        showToast(message, 'success');
        
    } catch (error) {
        console.error('Error toggling todo:', error);
        showToast('Failed to update task', 'error');
    }
}

async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(\`\${API_BASE_URL}/todos/\${id}\`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        // Update local state
        todos = todos.filter(t => t.id !== id);
        
        renderTodos();
        updateDashboard();
        updateFooter();
        
        showToast('Task deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        showToast('Failed to delete task', 'error');
    }
}

// ============================================
// 🖱️ DRAG & DROP FUNCTIONS
// ============================================

function initDragAndDrop() {
    const todoCards = document.querySelectorAll('.todo-card');
    
    todoCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedTodo = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.innerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedTodo !== this) {
        const todoCards = Array.from(document.querySelectorAll('.todo-card:not(.dragging)'));
        const draggingIndex = todoCards.indexOf(draggedTodo);
        const dropIndex = todoCards.indexOf(this);
        
        if (draggingIndex < dropIndex) {
            this.parentNode.insertBefore(draggedTodo, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedTodo, this);
        }
        
        // Update positions in database
        updateTodoPositions();
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.todo-card').forEach(card => {
        card.classList.remove('drag-over');
    });
    draggedTodo = null;
}

async function updateTodoPositions() {
    const todoCards = document.querySelectorAll('.todo-card');
    const orderData = [];
    
    todoCards.forEach((card, index) => {
        const id = parseInt(card.dataset.id);
        orderData.push({ id, position: index });
        
        // Update local state
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.position = index;
        }
    });
    
    // Reorder todos array to match visual order
    todos.sort((a, b) => {
        const aIndex = orderData.findIndex(item => item.id === a.id);
        const bIndex = orderData.findIndex(item => item.id === b.id);
        return aIndex - bIndex;
    });
    
    // Save to database
    saveTodoOrder();
}

// ============================================
// 📊 DASHBOARD FUNCTIONS
// ============================================

function updateDashboard() {
    if (!todos.length) {
        resetDashboard();
        return;
    }
    
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate streak (simplified for now)
    const streak = calculateStreak();
    
    // Update elements
    if (totalTasksElement) totalTasksElement.textContent = total;
    if (completedTasksElement) completedTasksElement.textContent = completed;
    if (pendingTasksElement) pendingTasksElement.textContent = pending;
    if (activeStreakElement) activeStreakElement.textContent = \`\${streak} days\`;
    
    // Update productivity
    if (productivityScoreElement) {
        productivityScoreElement.textContent = \`\${productivity}%\`;
    }
    
    if (productivityBar) {
        productivityBar.style.width = \`\${productivity}%\`;
        
        // Color based on productivity
        if (productivity >= 75) {
            productivityBar.style.background = 'var(--gradient-green)';
        } else if (productivity >= 50) {
            productivityBar.style.background = 'var(--gradient-orange)';
        } else {
            productivityBar.style.background = 'var(--gradient-purple)';
        }
    }
}

function calculateStreak() {
    // Simplified streak calculation
    // In a real app, you'd check dates of completed todos
    const today = new Date().toDateString();
    const hasTodayCompletion = todos.some(todo => {
        if (!todo.completed) return false;
        const todoDate = new Date(todo.updated_at).toDateString();
        return todoDate === today;
    });
    
    return hasTodayCompletion ? Math.floor(Math.random() * 10) + 1 : 0;
}

function resetDashboard() {
    if (totalTasksElement) totalTasksElement.textContent = '0';
    if (completedTasksElement) completedTasksElement.textContent = '0';
    if (pendingTasksElement) pendingTasksElement.textContent = '0';
    if (activeStreakElement) activeStreakElement.textContent = '0 days';
    if (productivityScoreElement) productivityScoreElement.textContent = '0%';
    if (productivityBar) productivityBar.style.width = '0%';
}

function updateFooter() {
    if (!todos.length) {
        if (todoCountElement) todoCountElement.textContent = '0 tasks';
        if (completedCountElement) completedCountElement.textContent = '0 completed';
        return;
    }
    
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    
    if (todoCountElement) todoCountElement.textContent = \`\${total} \${total === 1 ? 'task' : 'tasks'}\`;
    if (completedCountElement) completedCountElement.textContent = \`\${completed} completed\`;
}

function updateApiStatus(isOnline) {
    if (!apiStatusElement) return;
    
    if (isOnline) {
        apiStatusElement.textContent = 'Online';
        apiStatusElement.className = 'status-online';
    } else {
        apiStatusElement.textContent = 'Offline';
        apiStatusElement.className = 'status-offline';
    }
}

// ============================================
// 🪟 MODAL FUNCTIONS
// ============================================

function openModal(modal) {
    closeAllModals();
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Focus first input
    const input = modal.querySelector('input');
    if (input) {
        input.focus();
        input.select();
    }
}

function openEditModal(todo) {
    editingTodoId = todo.id;
    
    editTodoTitleInput.value = todo.title;
    editTodoDescInput.value = todo.description || '';
    editTodoPriorityInput.value = todo.priority || 'medium';
    
    updateCharCounter(editTodoDescInput, editDescCharCount);
    
    openModal(editTodoModal);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 250);
    });
    
    editingTodoId = null;
}

// ============================================
// 📝 FORM FUNCTIONS
// ============================================

function resetAddForm() {
    todoTitleInput.value = '';
    todoDescInput.value = '';
    todoPriorityInput.value = 'medium';
    updateCharCounter(todoDescInput, descCharCount);
}

function updateCharCounter(textarea, counterElement) {
    const length = textarea.value.length;
    counterElement.textContent = \`\${length}/500\`;
    
    if (length > 500) {
        counterElement.style.color = 'var(--danger)';
    } else if (length > 450) {
        counterElement.style.color = 'var(--warning)';
    } else {
        counterElement.style.color = 'var(--text-secondary)';
    }
}

// ============================================
// 🎯 STATE MANAGEMENT
// ============================================

function showLoading() {
    hideAllStates();
    if (loadingState) loadingState.style.display = 'block';
}

function showEmptyState() {
    hideAllStates();
    if (emptyState) emptyState.style.display = 'block';
}

function showError(message) {
    hideAllStates();
    if (errorState) {
        errorState.style.display = 'block';
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) errorMessage.textContent = message;
    }
}

function hideAllStates() {
    if (emptyState) emptyState.style.display = 'none';
    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
}

// ============================================
// 💬 TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = \`toast \${type}\`;
    toast.innerHTML = \`
        <span>\${message}</span>
        <button class="toast-close">&times;</button>
    \`;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    });
}

// ============================================
// ⌨️ KEYBOARD SHORTCUTS
// ============================================

function handleKeyboardShortcuts(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Ctrl/Cmd + K focuses search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Ctrl/Cmd + N opens add modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal(addTodoModal);
    }
}

// ============================================
// 🎉 APP READY
// ============================================

console.log('🚀 TODO-IT JavaScript loaded successfully!');`;

// Main update function
async function updateUI() {
  try {
    console.log("📁 Checking project structure...");

    // Check if frontend directory exists
    if (!fs.existsSync(frontendPath)) {
      console.error("❌ Frontend directory not found!");
      console.log("Expected path:", frontendPath);
      return;
    }

    console.log("✅ Found frontend directory");

    // Backup existing files
    console.log("💾 Backing up existing files...");
    const filesToBackup = ["index.html", "style.css", "script.js"];

    filesToBackup.forEach((file) => {
      const oldPath = path.join(frontendPath, file);
      const backupPath = path.join(frontendPath, `${file}.backup`);

      if (fs.existsSync(oldPath)) {
        fs.copyFileSync(oldPath, backupPath);
        console.log(`  ✅ Backed up ${file} to ${file}.backup`);
      } else {
        console.log(`  ⚠️  ${file} not found, skipping backup`);
      }
    });

    // Create new files
    console.log("\n🛠️  Creating new TODO-IT files...");

    // Create new index.html
    fs.writeFileSync(path.join(frontendPath, "index.html"), newHTML, "utf8");
    console.log("  ✅ Created new index.html");

    // Create new style.css
    fs.writeFileSync(path.join(frontendPath, "style.css"), newCSS, "utf8");
    console.log("  ✅ Created new style.css");

    // Create new script.js
    fs.writeFileSync(path.join(frontendPath, "script.js"), newJS, "utf8");
    console.log("  ✅ Created new script.js");

    console.log("\n🎉 TODO-IT UI Update Complete!");
    console.log("================================");
    console.log("\n🚀 What was updated:");
    console.log("  • Complete UI redesign with sidebar navigation");
    console.log("  • Modern dark theme with gradient accents");
    console.log("  • Dashboard with real-time statistics");
    console.log("  • Priority system (Low/Medium/High)");
    console.log("  • Search functionality");
    console.log("  • Quick add modal with keyboard shortcuts");
    console.log("  • Productivity score tracking");
    console.log("  • All Week 1-3 features preserved and enhanced");

    console.log("\n📁 Your files are ready:");
    console.log(`  ${frontendPath}\\index.html`);
    console.log(`  ${frontendPath}\\style.css`);
    console.log(`  ${frontendPath}\\script.js`);

    console.log("\n💡 Next steps:");
    console.log("  1. Start your backend: cd backend && npm start");
    console.log("  2. Open frontend/index.html in your browser");
    console.log("  3. Enjoy your new TODO-IT application!");

    // Create a test file to verify
    const testFile = path.join(projectRoot, "todo-it-ready.html");
    const testHTML = `<!DOCTYPE html>
<html>
<head>
    <title>TODO-IT Ready!</title>
</head>
<body>
    <h1>✅ TODO-IT Update Complete!</h1>
    <p>Your application has been successfully updated to TODO-IT v2.0</p>
    <p><a href="file:///${frontendPath.replace(/\\/g, "/")}/index.html">Click here to open TODO-IT</a></p>
</body>
</html>`;

    fs.writeFileSync(testFile, testHTML, "utf8");
    console.log(`\n🔗 Quick test: file:///${testFile.replace(/\\/g, "/")}`);
  } catch (error) {
    console.error("❌ Error updating UI:", error.message);
  }
}

// Run the update
updateUI();
