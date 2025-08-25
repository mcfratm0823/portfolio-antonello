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
        // Start cursor off-screen until we have a real position
        this.cursor.style.transform = 'translate(-100px, -100px)';
        document.body.appendChild(this.cursor);
        
        // Create "Scopri" text element
        this.cursorText = document.createElement('div');
        this.cursorText.className = 'cursor-text';
        this.cursorText.textContent = 'scopri';
        this.cursorText.style.cssText = `
            position: fixed;
            color: white;
            font-family: 'Neue', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: none;
            pointer-events: none;
            z-index: 100002;
            opacity: 0;
            transition: opacity 0.2s ease;
            margin-left: 2px;
            margin-top: -8px;
        `;
        document.body.appendChild(this.cursorText);

        // Setup mouse tracking
        this.setupMouseTracking();
        
        // Setup scroll optimization
        this.setupScrollOptimization();
        
        // Ensure cursor stays on top when new elements are added
        this.setupMutationObserver();
        
        // Setup hover detection for project cards
        this.setupProjectHover();
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
                    this.cursorText.style.transform = `translate(${e.clientX + 6}px, ${e.clientY - 5}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * Setup hover detection for project cards
     * @private
     * @returns {void}
     */
    setupProjectHover() {
        // Use event delegation for better performance
        document.addEventListener('mouseover', (e) => {
            // Only show "scopri" on portfolio page project cards
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                this.cursorText.style.opacity = '1';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (projectCard && !e.relatedTarget?.closest('.project-card')) {
                this.cursorText.style.opacity = '0';
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

// Initialize for backward compatibility - con controllo duplicazione
if (!window.__GLOBAL_CURSOR_INITIALIZED__) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.__GLOBAL_CURSOR_INITIALIZED__) {
                window.__GLOBAL_CURSOR_INITIALIZED__ = true;
                initializeGlobalCursor();
            }
        });
    } else {
        window.__GLOBAL_CURSOR_INITIALIZED__ = true;
        initializeGlobalCursor();
    }
}