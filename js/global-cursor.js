/**
 * Global Custom Cursor
 * @module GlobalCursor
 */

/** @type {GlobalCursor|null} Singleton instance */
let globalCursorInstance = null;

/**
 * Gestisce il cursore custom globale per tutto il sito
 * @class
 */
class GlobalCursor {
    constructor() {
        /** @type {HTMLDivElement|null} Elemento DOM del cursore */
        this.cursor = null;
        
        /** @type {number} Posizione X corrente del mouse */
        this.mouseX = 0;
        
        /** @type {number} Posizione Y corrente del mouse */
        this.mouseY = 0;
        
        /** @type {boolean} Flag per throttling animazioni */
        this.isMoving = false;
        
        this.init();
    }

    /**
     * Inizializza il cursore custom
     * @returns {void}
     */
    init() {
        // Create cursor element
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);

        // Setup mouse tracking
        this.setupMouseTracking();
        
        // Setup scroll optimization
        this.setupScrollOptimization();
        
        // Ensure cursor stays on top when new elements are added
        this.setupMutationObserver();
    }

    setupMutationObserver() {
        // Watch for DOM changes and keep cursor on top
        let isRepositioning = false;
        
        const observer = new MutationObserver((mutations) => {
            // Skip if we're already repositioning or if cursor was the only change
            if (isRepositioning) return;
            
            // Check if any mutation is NOT about the cursor
            const hasNonCursorChanges = mutations.some(mutation => {
                for (let node of mutation.addedNodes) {
                    if (node !== this.cursor) return true;
                }
                for (let node of mutation.removedNodes) {
                    if (node !== this.cursor) return true;
                }
                return false;
            });
            
            // Only reposition if there were non-cursor changes
            if (hasNonCursorChanges && this.cursor && this.cursor.parentNode === document.body) {
                isRepositioning = true;
                document.body.appendChild(this.cursor);
                // Reset flag after a microtask to avoid immediate re-triggering
                Promise.resolve().then(() => {
                    isRepositioning = false;
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
    }

    /**
     * Configura tracking del mouse con ottimizzazione performance
     * @private
     * @returns {void}
     */
    setupMouseTracking() {
        let ticking = false;
        
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.cursor.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * Ottimizza performance durante lo scroll
     * @private
     * @returns {void}
     */
    setupScrollOptimization() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            document.body.classList.add('is-scrolling');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 150);
        }, { passive: true });
    }
}

// Initialize cursor when DOM is ready (Singleton pattern)

/**
 * Inizializza il cursore globale (singleton pattern)
 * @returns {GlobalCursor} Istanza del cursore globale
 */
function initializeGlobalCursor() {
    if (!globalCursorInstance) {
        globalCursorInstance = new GlobalCursor();
    }
    return globalCursorInstance;
}

// Export for ES6 modules
export { GlobalCursor, initializeGlobalCursor };

// Initialize for backward compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalCursor);
} else {
    initializeGlobalCursor();
}