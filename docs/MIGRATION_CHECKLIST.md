# Migration Checklist - Event-Driven Architecture

## ✅ Completed Tasks

### Core Architecture
- [x] Created EventBus system (`/js/core/event-bus.js`)
- [x] Created ModuleRegistry (`/js/core/module-registry.js`)
- [x] Created AppState manager (`/js/core/app-state.js`)
- [x] Created AppInitializer (`/js/core/app-initializer.js`)
- [x] Created main app entry point (`/js/app.js`)

### Module Wrappers
- [x] Created CMSModule (`/js/modules/cms-module.js`)
- [x] Created HomepageModule (`/js/modules/homepage-module.js`)
- [x] Created PortfolioModule (`/js/modules/portfolio-module.js`)

### HTML Updates
- [x] Updated index.html script loading order
- [x] Updated portfolio.html script loading order
- [x] Removed app-coordinator.js references

### Documentation
- [x] Created architecture documentation
- [x] Created this migration checklist

## ⚠️ Pending Tasks

### Remove DOMContentLoaded Listeners
Files that still have DOMContentLoaded and need updating:
- [ ] `/js/cms-loader.js` - Replace with module registration
- [ ] `/js/global-cursor.js` - Wrap in module
- [ ] `/js/navbar.js` - Wrap in module
- [ ] `/js/form-handler.js` - Wrap in module
- [ ] `/js/form-ajax.js` - Wrap in module
- [ ] `/js/main.js` - Check if still needed
- [ ] `/utils/performanceMonitor.js` - Wrap in module
- [ ] `/utils/imageLoader.js` - Wrap in module

### Update Other HTML Files
- [ ] `/progetti/project-detail.html` - Update script loading
- [ ] `/admin/index.html` - Update if using same scripts
- [ ] `/success.html` - Update if using same scripts
- [ ] `/test-form.html` - Update if using same scripts

### Testing Required
- [ ] Test homepage animations
- [ ] Test portfolio page functionality
- [ ] Test project detail pages
- [ ] Test form submissions
- [ ] Test mobile responsiveness
- [ ] Test with ?debug=true

### Performance Validation
- [ ] Verify no double initialization
- [ ] Check load time metrics
- [ ] Validate memory usage
- [ ] Test scroll performance

## Migration Steps for Remaining Files

### Example: Migrating a DOMContentLoaded File

#### Before:
```javascript
// navbar.js
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    // initialization code
});
```

#### After:
```javascript
// navbar-module.js
class NavbarModule {
    constructor() {
        this.navbar = null;
        this.initialized = false;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        this.navbar = document.getElementById('navbar');
        if (!this.navbar) return;
        
        // initialization code
        
        this.initialized = true;
    }
}

// Register module
if (window.MODULE_REGISTRY) {
    window.MODULE_REGISTRY.register('navbar', async () => {
        const instance = new NavbarModule();
        await instance.initialize();
        return instance;
    }, { priority: 20 });
}
```

## Benefits After Full Migration

1. **Elimination of Race Conditions**: All modules initialize in correct order
2. **Better Error Handling**: Centralized error management
3. **Improved Performance**: No duplicate initializations
4. **Enhanced Debugging**: Clear initialization flow
5. **Maintainability**: Modular, testable code

## Rollback Plan

If issues arise:
1. Keep old files as `.backup`
2. Revert HTML script loading
3. Re-enable app-coordinator.js
4. Document any issues found

## Success Criteria

- [ ] No console errors on page load
- [ ] All features working as before
- [ ] Page loads faster or same speed
- [ ] No double content loading
- [ ] Debug mode shows clean initialization

## Notes

- The old cms-loader.js is partially replaced by CMSModule but may still be needed for some pages
- Some utility files might not need full module conversion if they don't have initialization logic
- Focus on files that have complex initialization or dependencies first