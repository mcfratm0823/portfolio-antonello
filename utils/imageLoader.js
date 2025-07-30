/**
 * @typedef {Object} ImageLoaderOptions
 * @property {string} [placeholderSrc] - Data URI per placeholder durante caricamento
 * @property {string} [errorSrc] - Data URI per immagine di errore
 * @property {number} [retryAttempts=2] - Numero di tentativi in caso di errore
 * @property {number} [retryDelay=1000] - Delay in ms tra tentativi
 * @property {boolean} [fadeIn=true] - Se applicare fade-in al caricamento
 * @property {number} [fadeInDuration=300] - Durata fade-in in ms
 */

/**
 * ImageLoader - Unified image loading with error handling
 * Handles image loading, error states, and placeholders
 * @class
 */
class ImageLoader {
    /**
     * Crea una nuova istanza di ImageLoader
     * @param {ImageLoaderOptions} [options={}] - Opzioni di configurazione
     */
    constructor(options = {}) {
        /** @type {ImageLoaderOptions} */
        this.config = {
            placeholderSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="16" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3EImage Loading...%3C/text%3E%3C/svg%3E',
            errorSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="14" fill="%23666" text-anchor="middle" dominant-baseline="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E',
            retryAttempts: 2,
            retryDelay: 1000,
            fadeIn: true,
            fadeInDuration: 300,
            ...options
        };
        
        /** @type {Set<string>} */
        this.loadedImages = new Set();
        
        /** @type {Map<string, Date>} */
        this.failedImages = new Map();
    }
    
    /**
     * Inizializza error handling per tutte le immagini nella pagina
     * @returns {void}
     */
    init() {
        // Handle existing images
        document.querySelectorAll('img').forEach(img => {
            this.handleImage(img);
        });
        
        // Watch for new images added to DOM
        this.observeNewImages();
    }
    
    /**
     * Gestisce caricamento ed errori per singola immagine
     * @param {HTMLImageElement} img - Elemento immagine da gestire
     * @returns {void}
     */
    handleImage(img) {
        // Skip if already processed
        if (img.dataset.imageLoaderProcessed) return;
        img.dataset.imageLoaderProcessed = 'true';
        
        // Store original src
        const originalSrc = img.src || img.dataset.src;
        if (!originalSrc) return;
        
        img.dataset.originalSrc = originalSrc;
        
        // Add loading class
        img.classList.add('image-loading');
        
        // Set up error handling
        img.addEventListener('error', () => this.handleError(img));
        img.addEventListener('load', () => this.handleLoad(img));
        
        // If image already failed (cached error)
        if (img.complete && img.naturalWidth === 0) {
            this.handleError(img);
        }
    }
    
    /**
     * Gestisce caricamento immagine completato con successo
     * @param {HTMLImageElement} img - Immagine caricata
     * @returns {void}
     */
    handleLoad(img) {
        img.classList.remove('image-loading', 'image-error');
        img.classList.add('image-loaded');
        
        // Add to loaded set
        this.loadedImages.add(img.dataset.originalSrc);
        
        // Fade in effect if enabled
        if (this.config.fadeIn && !img.dataset.noFade) {
            img.style.opacity = '0';
            img.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in-out`;
            
            // Force reflow
            img.offsetHeight;
            
            img.style.opacity = '1';
        }
    }
    
    /**
     * Gestisce errore caricamento con logica di retry
     * @param {HTMLImageElement} img - Immagine che ha generato errore
     * @returns {Promise<void>}
     */
    async handleError(img) {
        const originalSrc = img.dataset.originalSrc;
        const attempts = parseInt(img.dataset.retryAttempts || '0');
        
        // Try to retry if attempts remaining
        if (attempts < this.config.retryAttempts) {
            img.dataset.retryAttempts = (attempts + 1).toString();
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            
            // Retry with cache buster
            img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 't=' + Date.now();
            return;
        }
        
        // All retries failed
        img.classList.remove('image-loading');
        img.classList.add('image-error');
        
        // Record failed image
        this.failedImages.set(originalSrc, new Date());
        
        // Report to error handler if available
        if (window.errorHandler) {
            window.errorHandler.handle(
                new Error(`Failed to load image: ${originalSrc}`),
                {
                    component: 'ImageLoader',
                    category: 'media',
                    originalSrc,
                    attempts: attempts + 1,
                    element: img.tagName
                }
            );
        }
        
        // Use error placeholder
        img.src = this.config.errorSrc;
        
        // Dispatch custom event
        img.dispatchEvent(new CustomEvent('imageerror', {
            detail: { originalSrc, attempts }
        }));
    }
    
    /**
     * Carica immagine quando entra nel viewport
     * @param {HTMLImageElement} img - Immagine da caricare lazy
     * @returns {void}
     */
    lazyLoad(img) {
        if (!img.dataset.src) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                    this.handleImage(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        observer.observe(img);
    }
    
    /**
     * Observe DOM for new images
     */
    observeNewImages() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'IMG') {
                        this.handleImage(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(img => {
                            this.handleImage(img);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Pre-carica array di immagini
     * @param {string[]} urls - Array di URL immagini da precaricare
     * @returns {Promise<Array<{url: string, success: boolean}>>} Risultati caricamento
     */
    preload(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ url, success: true });
                img.onerror = () => resolve({ url, success: false });
                img.src = url;
            });
        });
        
        return Promise.all(promises);
    }
}

// Export for ES6 modules
export { ImageLoader };

// Create global instance for backward compatibility
window.imageLoader = new ImageLoader();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageLoader.init();
    });
} else {
    window.imageLoader.init();
}