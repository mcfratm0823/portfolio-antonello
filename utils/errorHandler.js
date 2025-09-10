/**
 * Professional Error Handling System
 * Gestisce tutti gli errori dell'applicazione in modo centralizzato
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Mantieni solo gli ultimi 100 errori in memoria
        this.listeners = new Set();
        this.setupGlobalHandlers();
    }
    
    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Cattura errori JavaScript non gestiti
        window.addEventListener('error', (event) => {
            this.handle(event.error, {
                type: 'uncaught',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });
        
        // Cattura Promise rejections non gestite
        window.addEventListener('unhandledrejection', (event) => {
            this.handle(event.reason, {
                type: 'unhandled_promise',
                promise: event.promise
            });
            event.preventDefault();
        });
    }
    
    /**
     * Main error handling method
     * @param {Error|string} error - L'errore da gestire
     * @param {Object} context - Contesto aggiuntivo
     * @returns {*} Fallback value appropriato
     */
    handle(error, context = {}) {
        // Normalizza l'errore
        const normalizedError = this.normalizeError(error);
        
        // Aggiungi contesto
        normalizedError.context = {
            ...context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // Categorizza l'errore
        normalizedError.category = this.categorizeError(normalizedError);
        normalizedError.severity = this.calculateSeverity(normalizedError);
        
        // Salva l'errore
        this.saveError(normalizedError);
        
        // Notifica listeners
        this.notifyListeners(normalizedError);
        
        // Log appropriato
        this.logError(normalizedError);
        
        // Notifica utente se necessario
        if (normalizedError.severity >= 3) {
            this.notifyUser(normalizedError);
        }
        
        // Ritorna fallback appropriato
        return this.getFallback(normalizedError);
    }
    
    /**
     * Normalizza diversi tipi di errore in formato standard
     */
    normalizeError(error) {
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                originalError: error
            };
        } else if (typeof error === 'string') {
            return {
                name: 'StringError',
                message: error,
                stack: new Error().stack
            };
        } else {
            return {
                name: 'UnknownError',
                message: String(error),
                stack: new Error().stack,
                originalError: error
            };
        }
    }
    
    /**
     * Categorizza l'errore per tipo
     */
    categorizeError(error) {
        const message = error.message.toLowerCase();
        const name = error.name.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'network';
        } else if (message.includes('image') || message.includes('img')) {
            return 'media';
        } else if (name.includes('syntax')) {
            return 'syntax';
        } else if (name.includes('type')) {
            return 'type';
        } else if (message.includes('permission')) {
            return 'permission';
        } else {
            return 'runtime';
        }
    }
    
    /**
     * Calcola la severità dell'errore (1-5)
     */
    calculateSeverity(error) {
        // Critico (5): Errori che bloccano l'app
        if (error.category === 'syntax' || error.context.type === 'uncaught') {
            return 5;
        }
        
        // Alto (4): Errori di rete critici
        if (error.category === 'network' && error.context.critical) {
            return 4;
        }
        
        // Medio (3): Errori che impattano UX
        if (error.category === 'network' || error.category === 'permission') {
            return 3;
        }
        
        // Basso (2): Errori media
        if (error.category === 'media') {
            return 2;
        }
        
        // Info (1): Altri errori
        return 1;
    }
    
    /**
     * Salva errore in memoria con limite
     */
    saveError(error) {
        this.errors.push(error);
        
        // Mantieni solo gli ultimi N errori
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Salva anche in localStorage per debugging
        try {
            const recentErrors = this.errors.slice(-10); // Ultimi 10
            localStorage.setItem('app_errors', JSON.stringify(recentErrors));
        } catch (e) {
            // localStorage potrebbe essere pieno
        }
    }
    
    /**
     * Log error appropriato per ambiente
     */
    logError(error) {
        const logMethod = error.severity >= 4 ? 'error' : 
                         error.severity >= 3 ? 'warn' : 'log';
        
        // In development
        if (window.location.hostname === 'localhost') {
            console.group(`🚨 ${error.category.toUpperCase()} ERROR`);
            console[logMethod]('Message:', error.message);
            console[logMethod]('Context:', error.context);
            console[logMethod]('Stack:', error.stack);
            console.groupEnd();
        }
        
        // In production: invia a servizio di monitoring
        if (window.location.hostname !== 'localhost') {
            this.sendToMonitoring(error);
        }
    }
    
    /**
     * Notifica utente in modo user-friendly
     */
    notifyUser(error) {
        let message = '';
        let action = null;
        
        switch (error.category) {
            case 'network':
                message = 'Connessione persa. Alcune funzionalità potrebbero non essere disponibili.';
                action = { text: 'Riprova', callback: () => window.location.reload() };
                break;
            
            case 'media':
                message = 'Alcune immagini non sono disponibili.';
                break;
            
            case 'permission':
                message = 'Permesso negato. Verifica le impostazioni del browser.';
                break;
            
            default:
                if (error.severity >= 4) {
                    message = 'Si è verificato un errore. Ricarica la pagina.';
                    action = { text: 'Ricarica', callback: () => window.location.reload() };
                }
        }
        
        if (message) {
            this.showNotification(message, error.severity, action);
        }
    }
    
    /**
     * Mostra notifica non invasiva
     */
    showNotification(message, severity, action) {
        // Rimuovi notifiche esistenti
        const existing = document.querySelector('.error-notification');
        if (existing) existing.remove();
        
        // Crea notifica
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        
        // Fix XSS: Usa DOM sicuro per contenuto dinamico
        const content = document.createElement('div');
        content.className = 'error-notification-content';
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'error-notification-message';
        messageSpan.textContent = message;
        content.appendChild(messageSpan);
        
        if (action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'error-notification-action';
            actionBtn.textContent = action.text;
            content.appendChild(actionBtn);
        }
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'error-notification-close';
        closeBtn.textContent = '×';
        content.appendChild(closeBtn);
        
        notification.appendChild(content);
        
        // Stili inline per evitare dipendenze CSS
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${severity >= 4 ? '#ff4444' : '#333'};
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 100000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        // Aggiungi animazione
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .error-notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .error-notification-action,
            .error-notification-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 4px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .error-notification-close {
                padding: 4px 8px;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
        
        // Event handlers - già aggiunti direttamente agli elementi
        closeBtn.onclick = () => notification.remove();
        
        if (action) {
            const actionBtn = content.querySelector('.error-notification-action');
            if (actionBtn) {
                actionBtn.onclick = () => {
                    action.callback();
                    notification.remove();
                };
            }
        }
        
        // Aggiungi al DOM
        document.body.appendChild(notification);
        
        // Auto-rimuovi dopo 6 secondi
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 6000);
    }
    
    /**
     * Ottieni fallback appropriato per tipo di errore
     */
    getFallback(error) {
        switch (error.category) {
            case 'media':
                return '/assets/placeholder.svg';
            
            case 'network':
                return { error: true, data: null, cached: true };
            
            default:
                return null;
        }
    }
    
    /**
     * Invia errore a servizio di monitoring (es: Sentry, LogRocket)
     */
    sendToMonitoring(error) {
        // Monitoring disabilitato in produzione fino a setup servizio dedicato
        // Endpoint placeholder per future integrazioni (Sentry, LogRocket, etc)
        if (window.fetch && window.location.hostname === 'localhost') {
            fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            }).catch(() => {
                // Fallback silenzioso se monitoring non disponibile
            });
        }
    }
    
    /**
     * Registra listener per errori
     */
    addListener(callback) {
        this.listeners.add(callback);
    }
    
    /**
     * Notifica tutti i listeners
     */
    notifyListeners(error) {
        this.listeners.forEach(callback => {
            try {
                callback(error);
            } catch (e) {
                // Previeni loop infiniti
            }
        });
    }
    
    /**
     * Ottieni errori recenti per debugging
     */
    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }
    
    /**
     * Pulisci errori salvati
     */
    clearErrors() {
        this.errors = [];
        localStorage.removeItem('app_errors');
    }
}

// Helper function per network requests con retry
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(10000) // 10s timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            lastError = error;
            
            // Non riprovare per errori client (4xx)
            if (error.message.includes('HTTP 4')) {
                throw error;
            }
            
            // Aspetta con exponential backoff
            if (i < maxRetries - 1) {
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, i) * 1000)
                );
            }
        }
    }
    
    throw lastError;
}

// Export per ES6 modules
export { ErrorHandler, fetchWithRetry };

// Crea istanza globale per retrocompatibilità
window.errorHandler = new ErrorHandler();
window.fetchWithRetry = fetchWithRetry;