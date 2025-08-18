/**
 * Constants Configuration File
 * Centralizes all magic numbers used throughout the application
 */

// Timing constants (in milliseconds)
const TIMING = {
    PRELOADER_DURATION: 2500,      // Duration of preloader animation
    PRELOADER_TEXT_DELAY: 600,     // Delay before hiding preloader text
    SCROLL_DEBOUNCE: 150,          // Scroll event debounce for performance
    RESIZE_DEBOUNCE: 250,          // Window resize debounce
    PORTFOLIO_ROTATION_DURATION: 1000, // Portfolio card rotation animation
};

// Responsive breakpoints (in pixels)
const BREAKPOINTS = {
    MOBILE: 768,                   // Maximum width for mobile devices
    TABLET: 1024,                  // Maximum width for tablets
    DESKTOP: 1440                  // Maximum width for desktop
};

// Size constants
const SIZES = {
    PHOTO_HEIGHT: 280,             // Hero photo height in pixels
    PHOTO_WIDTH: 490,              // Hero photo width in pixels  
    PHOTO_MARGIN_LEFT: 165,        // Photo left margin in pixels
    PROJECT_CARD_HEIGHT: 100,      // Project card height in vh
    CURSOR_SIZE: 10,               // Cursor size in pixels
    NAVBAR_HEIGHT: 80              // Navbar height in pixels
};

// Z-index hierarchy
const Z_INDEX = {
    CONTENT: 1,
    NAVBAR: 999,
    MENU_OVERLAY: 9999,
    PRELOADER: 9999,
    SERVICE_IMAGE: 9999,
    CURSOR: 999999                 // Highest priority
};

// Animation durations (in seconds for GSAP)
const ANIMATIONS = {
    FAST: 0.3,
    NORMAL: 0.6,
    SLOW: 1.2,
    PRELOADER_SLIDE: 1.2,
    TEXT_REVEAL: 1.0,
    PHOTO_SCALE: 1.5
};

// Export for ES6 modules
export { TIMING, BREAKPOINTS, SIZES, Z_INDEX, ANIMATIONS };

// Also make available globally for backward compatibility
// This ensures the site continues to work during the transition
window.CONSTANTS = {
    TIMING,
    BREAKPOINTS,
    SIZES,
    Z_INDEX,
    ANIMATIONS
};