// ===========================================
// LOGGER.JS - Activity Logging System
// ===========================================

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
    this.enabled = true;
    this.consoleEnabled = true;
    this.storageKey = "todoit_activity_logs";

    // Load previous logs
    this.loadLogs();

    // Log startup
    this.log("SYSTEM", "Logger initialized");
  }

  // Log message
  log(category, message, data = null) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      level: "INFO",
    };

    this.addLog(logEntry);

    if (this.consoleEnabled) {
      console.log(`📝 [${category}] ${message}`, data || "");
    }
  }

  // Log debug message
  debug(category, message, data = null) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      level: "DEBUG",
    };

    this.addLog(logEntry);

    if (this.consoleEnabled && console.debug) {
      console.debug(`🐛 [${category}] ${message}`, data || "");
    }
  }

  // Log error
  error(category, message, error = null) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data: error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : null,
      level: "ERROR",
    };

    this.addLog(logEntry);

    if (this.consoleEnabled) {
      console.error(`❌ [${category}] ${message}`, error || "");
    }
  }

  // Log warning
  warn(category, message, data = null) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      level: "WARN",
    };

    this.addLog(logEntry);

    if (this.consoleEnabled) {
      console.warn(`⚠️ [${category}] ${message}`, data || "");
    }
  }

  // Add log to memory and save
  addLog(entry) {
    this.logs.unshift(entry); // Add to beginning

    // Keep only maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Save to localStorage
    this.saveLogs();

    // Update UI indicator if available
    this.updateLogIndicator();
  }

  // Save logs to localStorage
  saveLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      // localStorage might be full or unavailable
      console.error("Failed to save logs:", error);
    }
  }

  // Load logs from localStorage
  loadLogs() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
      this.logs = [];
    }
  }

  // Get recent logs
  getRecentLogs(count = 50) {
    return this.logs.slice(0, Math.min(count, this.logs.length));
  }

  // Get logs by category
  getLogsByCategory(category) {
    return this.logs.filter((log) => log.category === category);
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
    this.updateLogIndicator();
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Update UI indicator
  updateLogIndicator() {
    const indicator = document.getElementById("loggingStatus");
    if (indicator) {
      indicator.textContent = this.enabled ? "Active" : "Paused";
      indicator.className = this.enabled ? "logging-active" : "logging-paused";
    }
  }

  // Toggle logging
  toggleLogging() {
    this.enabled = !this.enabled;
    this.log("SYSTEM", `Logging ${this.enabled ? "enabled" : "disabled"}`);
    this.updateLogIndicator();
    return this.enabled;
  }

  // Toggle console output
  toggleConsole() {
    this.consoleEnabled = !this.consoleEnabled;
    this.log(
      "SYSTEM",
      `Console output ${this.consoleEnabled ? "enabled" : "disabled"}`,
    );
    return this.consoleEnabled;
  }

  // Get statistics
  getStats() {
    const total = this.logs.length;
    const errors = this.logs.filter((log) => log.level === "ERROR").length;
    const warnings = this.logs.filter((log) => log.level === "WARN").length;
    const categories = [...new Set(this.logs.map((log) => log.category))];

    return {
      total,
      errors,
      warnings,
      categories: categories.length,
      lastLog: this.logs[0] ? this.logs[0].timestamp : null,
    };
  }

  // Log user actions
  logUserAction(action, details = {}) {
    this.log("USER", action, {
      ...details,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  // Log API calls
  logApiCall(method, endpoint, status, duration) {
    this.log("API", `${method} ${endpoint}`, {
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }
}

// Global logger instance
const logger = new Logger();

// Export for debugging
window.logger = logger;
window.loggerStats = () => logger.getStats();
window.loggerToggle = () => logger.toggleLogging();
window.loggerExport = () => {
  const logs = logger.exportLogs();
  const blob = new Blob([logs], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `todoit-logs-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
