/**
 * Event Bus - Sistema centralizzato di gestione eventi
 * @class EventBus
 * @version 1.0.0
 */
class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
        this.eventHistory = [];
        this.debug = window.location.search.includes('debug=true');
    }
    
    /**
     * Registra un listener per un evento
     * @param {string} event - Nome evento
     * @param {Function} callback - Callback da eseguire
     * @param {Object} options - Opzioni (once, priority)
     */
    on(event, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        if (options.once) {
            if (!this.onceEvents.has(event)) {
                this.onceEvents.set(event, []);
            }
            this.onceEvents.get(event).push({ callback, priority: options.priority || 0 });
        } else {
            if (!this.events.has(event)) {
                this.events.set(event, []);
            }
            this.events.get(event).push({ callback, priority: options.priority || 0 });
        }
        
        // Sort by priority
        this.sortListeners(event);
        
        if (this.debug) {
            console.log(`[EventBus] Listener registered for: ${event}`);
        }
    }
    
    /**
     * Rimuove un listener
     * @param {string} event - Nome evento
     * @param {Function} callback - Callback da rimuovere
     */
    off(event, callback) {
        if (this.events.has(event)) {
            const listeners = this.events.get(event);
            this.events.set(event, listeners.filter(l => l.callback !== callback));
        }
        
        if (this.onceEvents.has(event)) {
            const listeners = this.onceEvents.get(event);
            this.onceEvents.set(event, listeners.filter(l => l.callback !== callback));
        }
    }
    
    /**
     * Emette un evento
     * @param {string} event - Nome evento
     * @param {*} data - Dati da passare ai listener
     */
    emit(event, data) {
        const timestamp = Date.now();
        
        if (this.debug) {
            console.log(`[EventBus] Emitting: ${event}`, data);
        }
        
        // Log event history
        this.eventHistory.push({ event, data, timestamp });
        
        // Execute once listeners
        if (this.onceEvents.has(event)) {
            const listeners = [...this.onceEvents.get(event)];
            this.onceEvents.delete(event);
            listeners.forEach(({ callback }) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] Error in once listener for ${event}:`, error);
                }
            });
        }
        
        // Execute regular listeners
        if (this.events.has(event)) {
            const listeners = [...this.events.get(event)];
            listeners.forEach(({ callback }) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] Error in listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Attende un evento (Promise-based)
     * @param {string} event - Nome evento
     * @param {number} timeout - Timeout in ms (opzionale)
     * @returns {Promise}
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            const timer = timeout ? setTimeout(() => {
                this.off(event, handler);
                reject(new Error(`Timeout waiting for event: ${event}`));
            }, timeout) : null;
            
            const handler = (data) => {
                if (timer) clearTimeout(timer);
                resolve(data);
            };
            
            this.on(event, handler, { once: true });
        });
    }
    
    /**
     * Ordina i listener per priorità
     * @private
     */
    sortListeners(event) {
        if (this.events.has(event)) {
            const listeners = this.events.get(event);
            listeners.sort((a, b) => b.priority - a.priority);
        }
        
        if (this.onceEvents.has(event)) {
            const listeners = this.onceEvents.get(event);
            listeners.sort((a, b) => b.priority - a.priority);
        }
    }
    
    /**
     * Debug: mostra tutti gli eventi registrati
     */
    debugEvents() {
        console.log('[EventBus] Registered events:');
        this.events.forEach((listeners, event) => {
            console.log(`  ${event}: ${listeners.length} listeners`);
        });
        console.log('[EventBus] Once events:');
        this.onceEvents.forEach((listeners, event) => {
            console.log(`  ${event}: ${listeners.length} listeners`);
        });
    }
}

// Singleton globale
window.APP_EVENT_BUS = new EventBus();

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}