# Event-Driven Architecture Documentation

## Overview

This document describes the new event-driven architecture implemented to solve race conditions and double initialization issues in the portfolio website.

## Architecture Components

### 1. EventBus (`/js/core/event-bus.js`)
- Centralized event management system
- Supports synchronous and asynchronous event handling
- Features: priority handling, once events, event history
- Global instance: `window.APP_EVENT_BUS`

### 2. ModuleRegistry (`/js/core/module-registry.js`)
- Centralized module management
- Handles dependencies and initialization order
- Prevents double initialization
- Global instance: `window.MODULE_REGISTRY`

### 3. AppState (`/js/core/app-state.js`)
- Centralized state management
- Observable state changes
- Performance metrics tracking
- Global instance: `window.APP_STATE`

### 4. AppInitializer (`/js/core/app-initializer.js`)
- Main orchestrator for application initialization
- Manages initialization phases
- Registers and initializes all modules
- Global instance: `window.APP_INITIALIZER`

### 5. App Entry Point (`/js/app.js`)
- Single entry point for the application
- Must be loaded LAST in the HTML
- Handles fatal errors gracefully

## Module Structure

### Core Modules

1. **CMSModule** (`/js/modules/cms-module.js`)
   - Handles all CMS data loading
   - Emits events when data is loaded
   - Updates DOM based on page type

2. **HomepageModule** (`/js/modules/homepage-module.js`)
   - Manages all homepage animations
   - Handles preloader, hero, portfolio sections
   - Integrates with GSAP ScrollTrigger

3. **PortfolioModule** (`/js/modules/portfolio-module.js`)
   - Manages portfolio page functionality
   - Wraps ProjectStack and FilterSystem
   - Prevents double initialization

## Script Loading Order

```html
<!-- 1. External Dependencies -->
<script src="gsap.min.js"></script>
<script src="ScrollTrigger.min.js"></script>

<!-- 2. Core Architecture (MUST be in this order) -->
<script src="./config/constants.js"></script>
<script src="./js/core/event-bus.js"></script>
<script src="./js/core/module-registry.js"></script>
<script src="./js/core/app-state.js"></script>
<script src="./js/core/app-initializer.js"></script>

<!-- 3. Utilities -->
<script src="./utils/*.js"></script>

<!-- 4. Feature Scripts -->
<script src="./js/global-cursor.js"></script>
<script src="./js/portfolio.js"></script>

<!-- 5. Module Wrappers -->
<script src="./js/modules/*.js"></script>

<!-- 6. App Entry Point (MUST BE LAST) -->
<script src="./js/app.js"></script>
```

## Key Events

### System Events
- `app:initializing` - App initialization started
- `app:initialized` - App fully initialized
- `app:ready` - App ready for interaction
- `app:error` - Critical error occurred

### Module Events
- `module:registered` - Module registered
- `module:initialized` - Module initialized
- `module:error` - Module error

### Data Events
- `data:loaded` - Data loaded (with type and content)
- `data:error` - Data loading error

### UI Events
- `projects:rendered` - Projects rendered in DOM
- `filters:rendered` - Filters rendered in DOM
- `portfolio:initialized` - Portfolio components ready
- `homepage:initialized` - Homepage animations ready

## Migration from Old Architecture

### Before (Race Conditions)
```javascript
// Multiple entry points
document.addEventListener('DOMContentLoaded', () => {
    // Initialize feature A
});

// In another file
document.addEventListener('DOMContentLoaded', () => {
    // Initialize feature B
});
```

### After (Event-Driven)
```javascript
// Register module
window.MODULE_REGISTRY.register('featureA', async () => {
    // Initialize and return feature instance
}, { 
    priority: 50,
    dependencies: ['featureB']
});
```

## Benefits

1. **No Race Conditions**: Single initialization flow
2. **Dependency Management**: Modules declare dependencies
3. **Error Handling**: Centralized error management
4. **Performance Tracking**: Built-in metrics
5. **Debug Mode**: Add `?debug=true` to URL
6. **State Management**: Observable application state

## Debug Mode

Enable debug mode by adding `?debug=true` to the URL:
- Detailed console logging
- Module initialization timing
- Event flow visualization
- Performance metrics

## Common Patterns

### Creating a New Module
```javascript
class MyModule {
    constructor() {
        this.initialized = false;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.APP_EVENT_BUS.on('some:event', (data) => {
            this.handleEvent(data);
        });
    }
    
    async initialize() {
        if (this.initialized) return;
        // Initialization logic
        this.initialized = true;
    }
}

// Register the module
window.MODULE_REGISTRY.register('myModule', async () => {
    const instance = new MyModule();
    await instance.initialize();
    return instance;
}, {
    priority: 30,
    dependencies: ['requiredModule']
});
```

### Listening for Data
```javascript
window.APP_EVENT_BUS.on('data:loaded', (event) => {
    if (event.type === 'projects') {
        this.handleProjects(event.content);
    }
});
```

### Updating State
```javascript
// Set state
window.APP_STATE.set('ui.loading', true);

// Get state
const isLoading = window.APP_STATE.get('ui.loading');

// Subscribe to changes
window.APP_STATE.subscribe('ui.loading', (newValue, oldValue) => {
    console.log('Loading state changed:', oldValue, '->', newValue);
});
```

## Troubleshooting

### Module Not Initializing
1. Check console for errors
2. Verify dependencies are met
3. Check module registration name
4. Enable debug mode for details

### Double Initialization
1. Check for duplicate module registration
2. Verify initialization flags
3. Look for legacy DOMContentLoaded listeners

### Event Not Firing
1. Verify event name spelling
2. Check registration order
3. Ensure emitter is initialized
4. Use debug mode to trace events

## Performance Considerations

1. Modules initialize in parallel when possible
2. Dependencies are resolved efficiently
3. Event handlers are optimized
4. State updates are batched
5. Lazy loading supported

## Future Improvements

1. Module hot reloading
2. Advanced error recovery
3. Performance profiling
4. Module versioning
5. Plugin architecture