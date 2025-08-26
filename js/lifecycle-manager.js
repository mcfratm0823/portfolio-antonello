/**
 * LifecycleManager - Sistema centralizzato per gestione memoria
 * Previene memory leak gestendo cleanup di componenti
 * @author Senior Developer
 * @version 1.0.0
 */

class LifecycleManager {
    constructor() {
        // Map per tenere traccia di tutti i componenti e loro cleanup
        this.components = new Map();
        
        // Contatori per debugging
        this.stats = {
            componentsRegistered: 0,
            cleanupsCalled: 0,
            activeComponents: 0
        };
        
        // Flag per evitare cleanup multipli
        this.isCleaningUp = false;
        
    }
    
    /**
     * Registra un componente con la sua funzione di cleanup
     * @param {string} componentId - ID univoco del componente
     * @param {Object} component - Istanza del componente
     * @param {Function} cleanupFn - Funzione di cleanup da chiamare
     */
    register(componentId, component, cleanupFn) {
        if (this.components.has(componentId)) {
            console.warn(`[LifecycleManager] ⚠️ Componente ${componentId} già registrato. Cleaning up vecchia istanza...`);
            this.cleanup(componentId);
        }
        
        this.components.set(componentId, {
            component: component,
            cleanupFn: cleanupFn,
            registeredAt: Date.now()
        });
        
        this.stats.componentsRegistered++;
        this.stats.activeComponents = this.components.size;
        
    }
    
    /**
     * Esegue cleanup di un componente specifico
     * @param {string} componentId - ID del componente da pulire
     * @returns {boolean} true se cleanup eseguito, false se non trovato
     */
    cleanup(componentId) {
        const entry = this.components.get(componentId);
        
        if (!entry) {
            console.warn(`[LifecycleManager] ⚠️ Componente ${componentId} non trovato`);
            return false;
        }
        
        try {
            
            // Esegui la funzione di cleanup
            if (typeof entry.cleanupFn === 'function') {
                entry.cleanupFn.call(entry.component);
            }
            
            // Rimuovi dalla map
            this.components.delete(componentId);
            this.stats.cleanupsCalled++;
            this.stats.activeComponents = this.components.size;
            
            return true;
            
        } catch (error) {
            console.error(`[LifecycleManager] ❌ Errore cleanup ${componentId}:`, error);
            return false;
        }
    }
    
    /**
     * Esegue cleanup di tutti i componenti registrati
     */
    cleanupAll() {
        if (this.isCleaningUp) {
            console.warn('[LifecycleManager] ⚠️ Cleanup già in corso, skip...');
            return;
        }
        
        this.isCleaningUp = true;
        
        const componentIds = Array.from(this.components.keys());
        let cleaned = 0;
        
        componentIds.forEach(componentId => {
            if (this.cleanup(componentId)) {
                cleaned++;
            }
        });
        
        this.isCleaningUp = false;
    }
    
    /**
     * Ottieni statistiche correnti
     * @returns {Object} Statistiche del lifecycle manager
     */
    getStats() {
        return {
            ...this.stats,
            components: Array.from(this.components.keys())
        };
    }
    
    /**
     * Verifica se un componente è registrato
     * @param {string} componentId - ID del componente
     * @returns {boolean}
     */
    has(componentId) {
        return this.components.has(componentId);
    }
    
    /**
     * Debug: mostra tutti i componenti registrati
     */
    debug() {
        console.group('[LifecycleManager] Debug Info');
        console.groupEnd();
    }
}

// Crea istanza singleton
const lifecycleManager = new LifecycleManager();

// Registra cleanup su eventi di navigazione
if (typeof window !== 'undefined') {
    // Cleanup prima di lasciare la pagina
    window.addEventListener('beforeunload', () => {
        lifecycleManager.cleanupAll();
    });
    
    // Cleanup su navigazione SPA (se usi History API)
    window.addEventListener('popstate', () => {
        lifecycleManager.cleanupAll();
    });
    
    // Esponi globalmente per debug (solo in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.lifecycleManager = lifecycleManager;
    }
}

// Export per ES6 modules
export default lifecycleManager;

// Export per compatibilità
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lifecycleManager;
}