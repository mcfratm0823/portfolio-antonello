/**
 * CLS Optimizer
 * Previene Cumulative Layout Shift ottimizzando caricamento risorse
 * @module CLSOptimizer
 */

class CLSOptimizer {
    constructor() {
        this.init();
    }
    
    /**
     * Inizializza ottimizzazioni CLS
     */
    init() {
        // Stabilizza font loading
        this.optimizeFonts();
        
        // Stabilizza immagini
        this.optimizeImages();
        
        // Stabilizza animazioni
        this.optimizeAnimations();
        
        // Riserva spazio per elementi dinamici
        this.reserveSpace();
    }
    
    /**
     * Ottimizza caricamento font
     */
    optimizeFonts() {
        // Aggiungi font-display: optional per font critici se non caricano velocemente
        if (document.fonts && document.fonts.ready) {
            const timeout = setTimeout(() => {
                // Se i font non caricano in 100ms, usa fallback
                document.documentElement.classList.add('fonts-failed');
            }, 100);
            
            document.fonts.ready.then(() => {
                clearTimeout(timeout);
                document.documentElement.classList.add('fonts-loaded');
            });
        }
    }
    
    /**
     * Ottimizza immagini con placeholder
     */
    optimizeImages() {
        // Aggiungi min-height basato su aspect ratio
        document.querySelectorAll('img[width][height]').forEach(img => {
            if (!img.complete) {
                const aspectRatio = img.getAttribute('width') / img.getAttribute('height');
                const width = img.offsetWidth || parseInt(img.getAttribute('width'));
                const minHeight = width / aspectRatio;
                
                img.style.minHeight = `${minHeight}px`;
                
                img.addEventListener('load', () => {
                    img.style.minHeight = '';
                }, { once: true });
            }
        });
    }
    
    /**
     * Stabilizza elementi animati
     */
    optimizeAnimations() {
        // Aggiungi contain per elementi che si animano
        const animatedElements = [
            '#preloader',
            '#hero-section',
            '.selected_work_item',
            '.service-item'
        ];
        
        animatedElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Contain previene reflow durante animazioni
                el.style.contain = 'layout';
                
                // GPU acceleration per transform
                if (getComputedStyle(el).transform !== 'none') {
                    el.style.willChange = 'transform';
                }
            });
        });
    }
    
    /**
     * Riserva spazio per contenuti dinamici
     */
    reserveSpace() {
        // Hero section photo placeholder - only on desktop
        const centerPhoto = document.querySelector('#center-photo');
        if (centerPhoto && !centerPhoto.querySelector('img').complete && window.innerWidth >= 1024) {
            centerPhoto.style.minHeight = '280px';
        }
        
        // Service images placeholder
        const serviceContainer = document.querySelector('.service-image-container');
        if (serviceContainer) {
            serviceContainer.style.minHeight = '300px';
            serviceContainer.style.minWidth = '400px';
        }
        
        // Portfolio placeholders
        document.querySelectorAll('.selected_work_box_image').forEach(img => {
            if (!img.complete) {
                img.parentElement.style.minHeight = '600px';
            }
        });
    }
}

// CSS Helper per font fallback
const fontFallbackCSS = `
    /* Usa system font come fallback immediato */
    .fonts-failed body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    
    /* Transizione smooth quando font custom carica */
    .fonts-loaded body {
        transition: font-family 0.1s ease-out;
    }
`;

// Inietta CSS
const style = document.createElement('style');
style.textContent = fontFallbackCSS;
document.head.appendChild(style);

// Export
export { CLSOptimizer };

// Inizializza
window.clsOptimizer = new CLSOptimizer();