/**
 * Module Registry - Gestione centralizzata dei moduli
 * @class ModuleRegistry
 * @version 1.0.0
 */
class ModuleRegistry {
    constructor() {
        this.modules = new Map();
        this.initialized = new Set();
        this.initializing = new Set();
        this.debug = window.location.search.includes('debug=true');
    }
    
    /**
     * Registra un modulo
     * @param {string} name - Nome del modulo
     * @param {Function} factory - Factory function che ritorna il modulo
     * @param {Object} options - Opzioni (dependencies, priority)
     */
    register(name, factory, options = {}) {
        if (this.modules.has(name)) {
            if (this.debug) {
                // ModuleRegistry module already registered, skipping
            }
            return;
        }
        
        if (typeof factory !== 'function') {
            throw new Error(`Module factory for "${name}" must be a function`);
        }
        
        this.modules.set(name, {
            name,
            factory,
            instance: null,
            dependencies: options.dependencies || [],
            priority: options.priority || 0,
            metadata: options.metadata || {}
        });
        
        if (this.debug) {
            // ModuleRegistry module registered
        }
        
        // Emit event
        if (window.APP_EVENT_BUS) {
            window.APP_EVENT_BUS.emit('module:registered', { name, options });
        }
    }
    
    /**
     * Inizializza un modulo e le sue dipendenze
     * @param {string} name - Nome del modulo
     * @returns {Promise} Instance del modulo
     */
    async initialize(name) {
        // Se già inizializzato, ritorna l'istanza
        if (this.initialized.has(name)) {
            const module = this.modules.get(name);
            return module ? module.instance : null;
        }
        
        // Se in fase di inizializzazione, attendi
        if (this.initializing.has(name)) {
            if (this.debug) {
                // ModuleRegistry module already initializing, waiting
            }
            // Attendi che l'inizializzazione completi
            await this.waitForInitialization(name);
            const module = this.modules.get(name);
            return module ? module.instance : null;
        }
        
        const module = this.modules.get(name);
        if (!module) {
            throw new Error(`Module "${name}" not found in registry`);
        }
        
        if (this.debug) {
            // ModuleRegistry initializing module
        }
        
        // Segna come in inizializzazione
        this.initializing.add(name);
        
        try {
            // Inizializza dipendenze prima
            if (module.dependencies.length > 0) {
                if (this.debug) {
                    // ModuleRegistry initializing dependencies
                }
                
                await Promise.all(
                    module.dependencies.map(dep => this.initialize(dep))
                );
            }
            
            // Inizializza il modulo
            const startTime = performance.now();
            module.instance = await module.factory();
            const initTime = performance.now() - startTime;
            
            // Segna come inizializzato
            this.initialized.add(name);
            this.initializing.delete(name);
            
            if (this.debug) {
                // ModuleRegistry module initialized
            }
            
            // Emit event
            if (window.APP_EVENT_BUS) {
                window.APP_EVENT_BUS.emit('module:initialized', { 
                    name, 
                    instance: module.instance,
                    initTime 
                });
            }
            
            return module.instance;
            
        } catch (error) {
            // Rimuovi da initializing in caso di errore
            this.initializing.delete(name);
            
            // ModuleRegistry failed to initialize module
            
            // Emit error event
            if (window.APP_EVENT_BUS) {
                window.APP_EVENT_BUS.emit('module:error', { name, error });
            }
            
            throw error;
        }
    }
    
    /**
     * Attende che un modulo completi l'inizializzazione
     * @private
     */
    async waitForInitialization(name) {
        const checkInterval = 50; // ms
        const maxWait = 10000; // 10 secondi
        let waited = 0;
        
        while (this.initializing.has(name) && waited < maxWait) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        if (waited >= maxWait) {
            throw new Error(`Timeout waiting for module "${name}" to initialize`);
        }
    }
    
    /**
     * Inizializza tutti i moduli registrati
     * @returns {Promise<Map>} Map of module instances
     */
    async initializeAll() {
        const moduleNames = Array.from(this.modules.keys());
        
        // Ordina per priorità
        moduleNames.sort((a, b) => {
            const moduleA = this.modules.get(a);
            const moduleB = this.modules.get(b);
            return (moduleB.priority || 0) - (moduleA.priority || 0);
        });
        
        if (this.debug) {
            // ModuleRegistry initializing all modules in order
        }
        
        const results = new Map();
        
        for (const name of moduleNames) {
            try {
                const instance = await this.initialize(name);
                results.set(name, instance);
            } catch (error) {
                // ModuleRegistry failed to initialize module, continuing
                results.set(name, null);
            }
        }
        
        return results;
    }
    
    /**
     * Ottiene un'istanza di un modulo
     * @param {string} name - Nome del modulo
     * @returns {*} Instance del modulo o null
     */
    get(name) {
        const module = this.modules.get(name);
        return module ? module.instance : null;
    }
    
    /**
     * Verifica se un modulo è registrato
     * @param {string} name - Nome del modulo
     * @returns {boolean}
     */
    has(name) {
        return this.modules.has(name);
    }
    
    /**
     * Verifica se un modulo è inizializzato
     * @param {string} name - Nome del modulo
     * @returns {boolean}
     */
    isInitialized(name) {
        return this.initialized.has(name);
    }
    
    /**
     * Debug: mostra tutti i moduli
     */
    debugModules() {
        // ModuleRegistry Registered modules:
        this.modules.forEach((module, name) => {
            // Module info
        });
    }
}

// Singleton globale
window.MODULE_REGISTRY = new ModuleRegistry();

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleRegistry;
}