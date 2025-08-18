/**
 * Keyboard Navigation Enhancement
 * Detects keyboard vs mouse usage and manages focus visibility
 * Works alongside custom cursor without conflicts
 */

class KeyboardNavigationManager {
    constructor() {
        this.isUsingKeyboard = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Detect TAB key usage
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' || e.key === 'Escape') {
                this.activateKeyboardMode();
            }
            
            // Escape key closes menus
            if (e.key === 'Escape') {
                this.closeActiveMenus();
            }
        });

        // Detect mouse usage
        document.addEventListener('mousedown', () => {
            this.deactivateKeyboardMode();
        });

        // Track mouse movement to detect real mouse vs keyboard
        document.addEventListener('mousemove', (e) => {
            const mouseDidMove = 
                Math.abs(e.clientX - this.lastMousePosition.x) > 5 ||
                Math.abs(e.clientY - this.lastMousePosition.y) > 5;
            
            if (mouseDidMove) {
                this.lastMousePosition = { x: e.clientX, y: e.clientY };
                this.deactivateKeyboardMode();
            }
        });

        // Make interactive elements keyboard accessible
        this.enhanceInteractiveElements();
        
        // Add skip navigation link
        this.addSkipNavigation();
    }

    activateKeyboardMode() {
        if (!this.isUsingKeyboard) {
            this.isUsingKeyboard = true;
            document.body.setAttribute('data-keyboard-nav', 'true');
            
            // Announce to screen readers
            this.announce('Keyboard navigation active');
        }
    }

    deactivateKeyboardMode() {
        if (this.isUsingKeyboard) {
            this.isUsingKeyboard = false;
            document.body.setAttribute('data-keyboard-nav', 'false');
        }
    }

    enhanceInteractiveElements() {
        // Make service items keyboard accessible
        const serviceItems = document.querySelectorAll('.service-item');
        serviceItems.forEach(item => {
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
                item.setAttribute('role', 'button');
                item.setAttribute('aria-expanded', 'false');
                
                // Add keyboard handlers
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.click();
                    }
                });
            }
        });

        // Make project cards keyboard accessible
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            // If card contains a link, make sure it's focusable
            const link = card.querySelector('a');
            if (link) {
                link.classList.add('focusable');
            } else if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
                card.classList.add('focusable');
            }
        });

        // Make filter items keyboard accessible
        const filterItems = document.querySelectorAll('.filter-item');
        filterItems.forEach(item => {
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
                item.setAttribute('role', 'button');
                
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.click();
                    }
                });
            }
        });
    }

    addSkipNavigation() {
        // Add skip to content link
        if (!document.querySelector('.skip-nav')) {
            const skipNav = document.createElement('a');
            skipNav.href = '#main-content';
            skipNav.className = 'skip-nav';
            skipNav.textContent = 'Skip to main content';
            
            skipNav.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.getElementById('main-content');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus();
                    main.removeAttribute('tabindex');
                }
            });
            
            document.body.insertBefore(skipNav, document.body.firstChild);
        }
    }

    closeActiveMenus() {
        // Close menu overlay if open
        const menuOverlay = document.getElementById('menu-overlay');
        if (menuOverlay) {
            const closeButton = menuOverlay.querySelector('#close-menu');
            if (closeButton) {
                closeButton.click();
            }
        }

        // Close any open dropdowns
        const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
        openDropdowns.forEach(dropdown => {
            dropdown.setAttribute('aria-expanded', 'false');
            dropdown.click(); // Trigger close
        });
    }

    announce(message) {
        // Create live region for screen reader announcements
        let liveRegion = document.getElementById('sr-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.keyboardNavManager = new KeyboardNavigationManager();
    });
} else {
    window.keyboardNavManager = new KeyboardNavigationManager();
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardNavigationManager;
}