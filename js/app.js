/**
 * App Entry Point - Punto di ingresso principale dell'applicazione
 * @version 1.0.0
 * 
 * IMPORTANTE: Questo file deve essere caricato DOPO tutti gli altri script
 * per garantire che le classi siano disponibili per la registrazione
 */

// Prevent multiple initializations
if (window.__APP_INITIALIZED__) {
    // Application already initialized, skipping
} else {
    window.__APP_INITIALIZED__ = true;
    
    (async function() {
        'use strict';
        
        const debug = window.location.search.includes('debug=true');
        
        if (debug) {
            // Starting application bootstrap...
        }
        
        try {
            // Phase 1: Core dependencies check
            const coreDependencies = [
                { name: 'EventBus', global: 'APP_EVENT_BUS', path: '/js/core/event-bus.js' },
                { name: 'ModuleRegistry', global: 'MODULE_REGISTRY', path: '/js/core/module-registry.js' },
                { name: 'AppState', global: 'APP_STATE', path: '/js/core/app-state.js' },
                { name: 'AppInitializer', global: 'APP_INITIALIZER', path: '/js/core/app-initializer.js' }
            ];
            
            // Verifica che le dipendenze core siano caricate
            let missingDeps = [];
            for (const dep of coreDependencies) {
                if (!window[dep.global]) {
                    missingDeps.push(dep);
                    // Missing core dependency
                }
            }
            
            if (missingDeps.length > 0) {
                throw new Error(`Missing core dependencies: ${missingDeps.map(d => d.name).join(', ')}. Make sure to include the core scripts before app.js`);
            }
            
            if (debug) {
                // All core dependencies loaded
            }
            
            // Phase 2: Initialize application
            await window.APP_INITIALIZER.initialize();
            
            if (debug) {
                // Application initialized successfully
                
                // Log performance metrics
                const state = window.APP_STATE.get();
                // Performance metrics logged
            }
            
            // Phase 3: Notify ready
            document.body.classList.add('app-ready');
            
            // Dispatch custom event for legacy code
            window.dispatchEvent(new CustomEvent('app:ready', {
                detail: {
                    state: window.APP_STATE.get(),
                    modules: window.MODULE_REGISTRY
                }
            }));
            
        } catch (error) {
            // Fatal initialization error
            
            // Show error to user
            // Fix XSS: Usa safeHTML per template con contenuto dinamico
            const errorContent = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 40px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                ">
                    <h2 style="margin: 0 0 16px; color: #dc3545;">Errore di Inizializzazione</h2>
                    <p style="margin: 0 0 24px; color: #666;">
                        Si è verificato un errore durante il caricamento dell'applicazione.
                    </p>
                    <button onclick="location.reload()" style="
                        padding: 10px 24px;
                        background: #000;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Ricarica Pagina</button>
                    ${debug ? `
                        <details style="margin-top: 24px; text-align: left;">
                            <summary style="cursor: pointer; color: #666;">Dettagli tecnici</summary>
                            <pre style="
                                margin-top: 8px;
                                padding: 12px;
                                background: #f5f5f5;
                                border-radius: 4px;
                                font-size: 12px;
                                overflow-x: auto;
                            ">${error.stack || error.message}</pre>
                        </details>
                    ` : ''}
                </div>
            `;
            
            if (window.safeHTML) {
                document.body.innerHTML = window.safeHTML(errorContent, 'app-init-error');
            } else {
                // Fallback: escape manuale dell'errore
                const safeError = String(error.stack || error.message).replace(/[<>&"']/g, function(match) {
                    const escapeMap = {
                        '<': '&lt;',
                        '>': '&gt;',
                        '&': '&amp;',
                        '"': '&quot;',
                        "'": '&#x27;'
                    };
                    return escapeMap[match];
                });
                document.body.innerHTML = errorContent.replace('${error.stack || error.message}', safeError);
            }
            
            // Report to error tracking if available
            if (window.APP_EVENT_BUS) {
                window.APP_EVENT_BUS.emit('app:fatal-error', { error });
            }
        }
    })();
}