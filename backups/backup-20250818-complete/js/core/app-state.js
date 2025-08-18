/**
 * App State Manager - Gestione centralizzata dello stato dell'applicazione
 * @class AppState
 * @version 1.0.0
 */
class AppState {
    constructor() {
        this.state = {
            initialization: {
                status: 'idle', // idle, initializing, ready, error
                modules: new Map(), // nome -> { status, error, timestamp }
                startTime: null,
                endTime: null
            },
            data: {
                projects: [],
                categories: [],
                homepage: null,
                currentPage: null
            },
            ui: {
                preloaderShown: false,
                portfolioVisible: false,
                filtersActive: 'all',
                scrollLocked: false
            },
            performance: {
                loadTimes: new Map(),
                errors: []
            }
        };
        
        this.debug = window.location.search.includes('debug=true');
        this.subscribers = new Map();
        
        // Bind event bus if available
        if (window.APP_EVENT_BUS) {
            this.setupEventBindings();
        }
    }
    
    /**
     * Setup event bindings con EventBus
     * @private
     */
    setupEventBindings() {
        // Ascolta eventi dei moduli
        window.APP_EVENT_BUS.on('module:initialized', (data) => {
            this.updateModuleStatus(data.name, 'initialized');
            this.setPerformanceMetric(`module_${data.name}_init`, data.initTime);
        });
        
        window.APP_EVENT_BUS.on('module:error', (data) => {
            this.updateModuleStatus(data.name, 'error', data.error);
            this.logError(data.error, data.name);
        });
        
        // Ascolta eventi di dati
        window.APP_EVENT_BUS.on('data:loaded', (data) => {
            this.updateData(data.type, data.content);
        });
    }
    
    /**
     * Ottieni stato corrente
     * @param {string} [path] - Path specifico (es. 'initialization.status')
     * @returns {*} Valore dello stato
     */
    get(path) {
        if (!path) return this.state;
        
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }
    
    /**
     * Aggiorna stato
     * @param {string} path - Path da aggiornare
     * @param {*} value - Nuovo valore
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state);
        
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        if (this.debug) {
            console.log(`[AppState] Updated ${path}:`, oldValue, '->', value);
        }
        
        // Notifica subscribers
        this.notify(path, value, oldValue);
        
        // Emit event
        if (window.APP_EVENT_BUS) {
            window.APP_EVENT_BUS.emit('state:changed', { path, value, oldValue });
        }
    }
    
    /**
     * Sottoscrivi a cambiamenti di stato
     * @param {string} path - Path da osservare
     * @param {Function} callback - Callback da eseguire
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        
        this.subscribers.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const subs = this.subscribers.get(path);
            if (subs) {
                subs.delete(callback);
                if (subs.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }
    
    /**
     * Notifica subscribers
     * @private
     */
    notify(path, newValue, oldValue) {
        // Notifica exact path
        const exactSubs = this.subscribers.get(path);
        if (exactSubs) {
            exactSubs.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error(`[AppState] Error in subscriber for ${path}:`, error);
                }
            });
        }
        
        // Notifica parent paths
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            const parentSubs = this.subscribers.get(parentPath);
            if (parentSubs) {
                const parentValue = this.get(parentPath);
                parentSubs.forEach(callback => {
                    try {
                        callback(parentValue, null, parentPath);
                    } catch (error) {
                        console.error(`[AppState] Error in parent subscriber for ${parentPath}:`, error);
                    }
                });
            }
        }
    }
    
    /**
     * Aggiorna stato del modulo
     * @param {string} moduleName - Nome del modulo
     * @param {string} status - Stato del modulo
     * @param {Error} [error] - Eventuale errore
     */
    updateModuleStatus(moduleName, status, error = null) {
        const moduleState = {
            status,
            error,
            timestamp: Date.now()
        };
        
        this.state.initialization.modules.set(moduleName, moduleState);
        
        // Controlla se tutti i moduli sono pronti
        this.checkAllModulesReady();
    }
    
    /**
     * Controlla se tutti i moduli sono pronti
     * @private
     */
    checkAllModulesReady() {
        const modules = Array.from(this.state.initialization.modules.values());
        const allReady = modules.length > 0 && 
                        modules.every(m => m.status === 'initialized' || m.status === 'error');
        
        if (allReady && this.state.initialization.status !== 'ready') {
            this.set('initialization.status', 'ready');
            this.set('initialization.endTime', Date.now());
            
            const totalTime = this.state.initialization.endTime - this.state.initialization.startTime;
            
            if (this.debug) {
                console.log(`[AppState] All modules ready in ${totalTime}ms`);
                this.debugModuleStatus();
            }
            
            // Emit ready event
            if (window.APP_EVENT_BUS) {
                window.APP_EVENT_BUS.emit('app:ready', { totalTime });
            }
        }
    }
    
    /**
     * Aggiorna dati
     * @param {string} type - Tipo di dato
     * @param {*} content - Contenuto
     */
    updateData(type, content) {
        this.set(`data.${type}`, content);
    }
    
    /**
     * Imposta metrica di performance
     * @param {string} metric - Nome metrica
     * @param {number} value - Valore
     */
    setPerformanceMetric(metric, value) {
        this.state.performance.loadTimes.set(metric, value);
    }
    
    /**
     * Log errore
     * @param {Error} error - Errore
     * @param {string} [context] - Contesto
     */
    logError(error, context = '') {
        this.state.performance.errors.push({
            error,
            context,
            timestamp: Date.now()
        });
    }
    
    /**
     * Debug stato moduli
     */
    debugModuleStatus() {
        console.log('[AppState] Module Status:');
        this.state.initialization.modules.forEach((state, name) => {
            console.log(`  ${name}: ${state.status}${state.error ? ' (ERROR)' : ''}`);
        });
    }
    
    /**
     * Reset stato
     * @param {string} [section] - Sezione specifica da resettare
     */
    reset(section) {
        if (section) {
            if (section === 'initialization') {
                this.state.initialization = {
                    status: 'idle',
                    modules: new Map(),
                    startTime: null,
                    endTime: null
                };
            } else if (this.state[section]) {
                // Reset sezione specifica
                const defaultState = {
                    data: { projects: [], categories: [], homepage: null, currentPage: null },
                    ui: { preloaderShown: false, portfolioVisible: false, filtersActive: 'all', scrollLocked: false },
                    performance: { loadTimes: new Map(), errors: [] }
                };
                
                if (defaultState[section]) {
                    this.state[section] = defaultState[section];
                }
            }
        } else {
            // Reset completo
            this.state = {
                initialization: {
                    status: 'idle',
                    modules: new Map(),
                    startTime: null,
                    endTime: null
                },
                data: {
                    projects: [],
                    categories: [],
                    homepage: null,
                    currentPage: null
                },
                ui: {
                    preloaderShown: false,
                    portfolioVisible: false,
                    filtersActive: 'all',
                    scrollLocked: false
                },
                performance: {
                    loadTimes: new Map(),
                    errors: []
                }
            };
        }
        
        // Notifica reset
        if (window.APP_EVENT_BUS) {
            window.APP_EVENT_BUS.emit('state:reset', { section });
        }
    }
}

// Singleton globale
window.APP_STATE = new AppState();

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}