/**
 * Debug Init Tracker - Traccia tutte le inizializzazioni per debug
 */
(function() {
    'use strict';
    
    window.__INIT_TRACKER__ = {
        events: [],
        startTime: performance.now()
    };
    
    // Override addEventListener per tracciare tutti i DOMContentLoaded
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = function(event, listener, options) {
        if (event === 'DOMContentLoaded') {
            const stack = new Error().stack;
            const caller = stack.split('\n')[2] || 'unknown';
            
            window.__INIT_TRACKER__.events.push({
                type: 'DOMContentLoaded registered',
                time: performance.now() - window.__INIT_TRACKER__.startTime,
                caller: caller.trim(),
                timestamp: new Date().toISOString()
            });
            
            // Wrap listener per tracciare esecuzione
            const wrappedListener = function() {
                window.__INIT_TRACKER__.events.push({
                    type: 'DOMContentLoaded executed',
                    time: performance.now() - window.__INIT_TRACKER__.startTime,
                    caller: caller.trim(),
                    timestamp: new Date().toISOString()
                });
                
                return listener.apply(this, arguments);
            };
            
            return originalAddEventListener.call(this, event, wrappedListener, options);
        }
        
        return originalAddEventListener.apply(this, arguments);
    };
    
    // Traccia quando il DOM è ready
    originalAddEventListener.call(document, 'DOMContentLoaded', function() {
        window.__INIT_TRACKER__.events.push({
            type: 'DOM Ready',
            time: performance.now() - window.__INIT_TRACKER__.startTime,
            timestamp: new Date().toISOString()
        });
    });
    
    // Funzione per mostrare report
    window.showInitReport = function() {
        console.group('🔍 Initialization Report');
        console.table(window.__INIT_TRACKER__.events);
        
        // Conta duplicati
        const executions = window.__INIT_TRACKER__.events.filter(e => e.type === 'DOMContentLoaded executed');
        
        if (executions.length > 1) {
            console.warn('⚠️ Multiple DOMContentLoaded executions detected!');
        }
        
        console.groupEnd();
    };
    
    // Auto-show report dopo 3 secondi
    setTimeout(() => {
        if (window.location.search.includes('debug=true')) {
            window.showInitReport();
        }
    }, 3000);
})();