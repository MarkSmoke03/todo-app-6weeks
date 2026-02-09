// Helper functions for drag & drop

// Debounce function to limit how often a function runs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit function execution rate
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Get touch position
function getTouchPosition(e) {
  return e.clientY || (e.touches && e.touches[0].clientY) || 0;
}

// Check if device is touch-enabled
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Make functions available globally
window.helpers = {
  debounce,
  throttle,
  getTouchPosition,
  isTouchDevice,
};
