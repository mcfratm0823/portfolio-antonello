/**
 * Main Entry Point for ES6 Modules
 * Centralizes all imports and initialization
 */

// Import all modules
import { TIMING, BREAKPOINTS, SIZES, Z_INDEX, ANIMATIONS } from '../config/constants.js';
import { FormValidator } from '../utils/formValidator.js';
import { ImageLoader } from '../utils/imageLoader.js';
import { SmartImagePreloader } from '../utils/smartImagePreloader.js';
import { PortfolioLazyLoader } from '../utils/portfolioLazyLoader.js';
import { ErrorHandler, fetchWithRetry } from '../utils/errorHandler.js';
import { PerformanceMonitor } from '../utils/performanceMonitor.js';
import { CLSOptimizer } from '../utils/clsOptimizer.js';
import { initializeGlobalCursor } from './global-cursor.js';
import { initializeNavbar } from './navbar.js';

// Export all modules for other pages to use
export {
    TIMING,
    BREAKPOINTS,
    SIZES,
    Z_INDEX,
    ANIMATIONS,
    FormValidator,
    ImageLoader,
    SmartImagePreloader,
    PortfolioLazyLoader,
    ErrorHandler,
    fetchWithRetry,
    PerformanceMonitor
};

// Initialize core components when DOM is ready
function initializeCore() {
    try {
        // Initialize error handler first
        if (!window.errorHandler) {
            window.errorHandler = new ErrorHandler();
        }
        
        // Initialize performance monitor
        if (!window.performanceMonitor) {
            window.performanceMonitor = new PerformanceMonitor();
        }
        
        // Initialize CLS optimizer
        if (!window.clsOptimizer) {
            window.clsOptimizer = new CLSOptimizer();
        }
        
        // Initialize global cursor
        initializeGlobalCursor();
        
        // Initialize navbar
        initializeNavbar();
        
        // Initialize image loader
        if (!window.imageLoader) {
            window.imageLoader = new ImageLoader();
            window.imageLoader.init();
        }
        
        // Initialize smart preloader
        if (!window.smartImagePreloader) {
            window.smartImagePreloader = new SmartImagePreloader();
        }
        
        // Initialize portfolio lazy loader
        if (!window.portfolioLazyLoader) {
            window.portfolioLazyLoader = new PortfolioLazyLoader();
        }
    } catch (error) {
        // Fallback nel caso errorHandler non sia ancora disponibile
        console.error('Failed to initialize core components:', error);
        
        // Mostra messaggio all'utente
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center; padding: 20px;">
                <div>
                    <h1>Oops! Qualcosa è andato storto</h1>
                    <p>Ricarica la pagina per riprovare</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Ricarica
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCore);
} else {
    initializeCore();
}