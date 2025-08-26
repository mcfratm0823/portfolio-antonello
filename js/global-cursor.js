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
        
        /** @type {boolean} Flag per MutationObserver repositioning */
        this.isRepositioning = false;
        
        /** @type {Array} Array di tutti gli event listener per cleanup */
        this.eventListeners = [];
        
        /** @type {MutationObserver|null} Observer per DOM changes */
        this.mutationObserver = null;
        
        /** @type {number|null} Timeout ID per scroll optimization */
        this.scrollTimeout = null;
        
        /** @type {HTMLDivElement|null} Elemento DOM del testo cursore */
        this.cursorText = null;
        
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
        
        this.mutationObserver = new MutationObserver((mutations) => {
            // Skip if we're already repositioning or if cursor was the only change
            if (this.isRepositioning) return;
            
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
                this.isRepositioning = true;
                document.body.appendChild(this.cursor);
                // Reset flag after a microtask to avoid immediate re-triggering
                Promise.resolve().then(() => {
                    this.isRepositioning = false;
                });
            }
        });

        this.mutationObserver.observe(document.body, {
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
        let firstMove = true;
        
        const mouseMoveHandler = (e) => {
            // Show cursor on first mouse move
            if (firstMove) {
                this.cursor.style.opacity = '1';
                firstMove = false;
            }
            
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.cursor.style.top = `${e.clientY - 5}px`;
                    this.cursor.style.left = `${e.clientX - 5}px`;
                    this.cursorText.style.transform = `translate(${e.clientX + 6}px, ${e.clientY - 5}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        this.eventListeners.push({ element: document, event: 'mousemove', handler: mouseMoveHandler });
    }

    /**
     * Setup hover detection for project cards
     * @private
     * @returns {void}
     */
    setupProjectHover() {
        // Use event delegation for better performance
        const mouseOverHandler = (e) => {
            // Only show "scopri" on portfolio page project cards
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                this.cursorText.style.opacity = '1';
            }
        };
        
        const mouseOutHandler = (e) => {
            const projectCard = e.target.closest('.project-card');
            if (projectCard && !e.relatedTarget?.closest('.project-card')) {
                this.cursorText.style.opacity = '0';
            }
        };
        
        document.addEventListener('mouseover', mouseOverHandler);
        document.addEventListener('mouseout', mouseOutHandler);
        
        this.eventListeners.push(
            { element: document, event: 'mouseover', handler: mouseOverHandler },
            { element: document, event: 'mouseout', handler: mouseOutHandler }
        );
    }

    /**
     * Ottimizza performance durante lo scroll
     * @private
     * @returns {void}
     */
    setupScrollOptimization() {
        const scrollHandler = () => {
            document.body.classList.add('is-scrolling');
            
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 150);
        };
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
        this.eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler, options: { passive: true } });
    }

    /**
     * Pulisce completamente il cursore e rimuove tutti i listener
     * @returns {void}
     */
    destroy() {
        
        // Rimuovi tutti gli event listener
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
        
        // Disconnetti mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        // Cancella timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }
        
        // Rimuovi elementi DOM
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.remove();
            this.cursor = null;
        }
        
        if (this.cursorText && this.cursorText.parentNode) {
            this.cursorText.remove();
            this.cursorText = null;
        }
        
        // Reset instance
        globalCursorInstance = null;
        
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
                const cursor = initializeGlobalCursor();
                
                // Registra con LifecycleManager se disponibile
                if (window.lifecycleManager) {
                    window.lifecycleManager.register('global-cursor', cursor, () => {
                        cursor.destroy();
                    });
                }
            }
        });
    } else {
        window.__GLOBAL_CURSOR_INITIALIZED__ = true;
        const cursor = initializeGlobalCursor();
        
        // Registra con LifecycleManager se disponibile
        if (window.lifecycleManager) {
            window.lifecycleManager.register('global-cursor', cursor, () => {
                cursor.destroy();
            });
        }
    }
}