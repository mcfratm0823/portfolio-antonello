/**
 * App Coordinator - Gestisce l'inizializzazione coordinata dei moduli
 * Previene il doppio caricamento e sincronizza CMS con rendering
 */

(function() {
    'use strict';
    
    // Flag globale per tracking inizializzazione
    window.__APP_STATE__ = {
        initialized: false,
        modulesLoaded: new Set(),
        cmsDataReady: false,
        renderingComplete: false
    };
    
    // Coordinatore centrale
    window.AppCoordinator = {
        /**
         * Registra un modulo come caricato
         */
        registerModule(moduleName) {
            window.__APP_STATE__.modulesLoaded.add(moduleName);
        },
        
        /**
         * Verifica se un modulo è già stato caricato
         */
        isModuleLoaded(moduleName) {
            return window.__APP_STATE__.modulesLoaded.has(moduleName);
        },
        
        /**
         * Segnala che i dati CMS sono pronti
         */
        setCMSReady() {
            window.__APP_STATE__.cmsDataReady = true;
        },
        
        /**
         * Verifica se i dati CMS sono pronti
         */
        isCMSReady() {
            return window.__APP_STATE__.cmsDataReady;
        },
        
        /**
         * Inizializza l'app una sola volta
         */
        init() {
            if (window.__APP_STATE__.initialized) {
                return;
            }
            
            window.__APP_STATE__.initialized = true;
            
            // Aggiungi listener per debug
            if (window.location.search.includes('debug=true')) {
                this.enableDebugMode();
            }
        },
        
        /**
         * Modalità debug per tracciare il flusso
         */
        enableDebugMode() {
            
            // Log di tutti i DOMContentLoaded
            const originalAddEventListener = document.addEventListener;
            document.addEventListener = function(event, handler, options) {
                if (event === 'DOMContentLoaded') {
                }
                return originalAddEventListener.call(this, event, handler, options);
            };
        }
    };
    
    // Inizializza il coordinatore
    window.AppCoordinator.init();
    
})();