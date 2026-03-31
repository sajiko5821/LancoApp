// Utility functions

/**
 * Debounce a function call
 */
export function debounce(fn, delay = 100) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Check if device is likely mobile
 */
export function isMobile() {
    return window.innerWidth < 768;
}

/**
 * Get pixel ratio capped for performance
 */
export function getPixelRatio() {
    return Math.min(window.devicePixelRatio, 2);
}
