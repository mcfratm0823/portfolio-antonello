/**
 * Wrapper temporaneo per prevenire inizializzazioni multiple di nuovahome.js
 * Questo file controlla che le inizializzazioni avvengano una sola volta
 */
(function() {
    'use strict';
    
    // Flag globale per tracciare se nuovahome è già inizializzato
    window.__NUOVAHOME_INITIALIZED__ = false;
    window.__NUOVAHOME_INITIALIZING__ = false;
    
    // Override temporaneo di addEventListener per intercettare DOMContentLoaded
    const originalAddEventListener = document.addEventListener;
    const blockedListeners = [];
    
    document.addEventListener = function(event, listener, options) {
        if (event === 'DOMContentLoaded' && window.__NUOVAHOME_INITIALIZED__) {
            // Se già inizializzato, non aggiungere il listener
            console.warn('[NuovaHomeWrapper] Blocked duplicate DOMContentLoaded listener');
            return;
        }
        
        if (event === 'DOMContentLoaded') {
            // Salva il listener per esecuzione controllata
            blockedListeners.push({ listener, options });
            
            // Se è il primo listener e non stiamo già inizializzando
            if (blockedListeners.length === 1 && !window.__NUOVAHOME_INITIALIZING__) {
                window.__NUOVAHOME_INITIALIZING__ = true;
                
                // Usa il listener originale per eseguire una volta sola
                originalAddEventListener.call(document, 'DOMContentLoaded', function() {
                    if (window.__NUOVAHOME_INITIALIZED__) return;
                    
                    console.log('[NuovaHomeWrapper] Executing nuovahome initializations...');
                    
                    // Esegui tutti i listener salvati
                    blockedListeners.forEach(({ listener, options }) => {
                        try {
                            listener();
                        } catch (error) {
                            console.error('[NuovaHomeWrapper] Error in listener:', error);
                        }
                    });
                    
                    window.__NUOVAHOME_INITIALIZED__ = true;
                    window.__NUOVAHOME_INITIALIZING__ = false;
                    
                    // Ripristina addEventListener originale
                    document.addEventListener = originalAddEventListener;
                    
                    console.log('[NuovaHomeWrapper] Initialization complete');
                }, options);
            }
            
            return;
        }
        
        // Per tutti gli altri eventi, usa il comportamento normale
        return originalAddEventListener.call(this, event, listener, options);
    };
})();