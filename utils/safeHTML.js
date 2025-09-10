/**
 * SafeHTML Wrapper - Sistema di sanitizzazione HTML progressivo
 * 
 * Fase 1: Log only (non modifica nulla)
 * Fase 2: Sanitizzazione attiva con DOMPurify
 */

(function() {
    'use strict';
    
    // Contatore per tracking
    let sanitizationCalls = 0;
    
    // Funzione wrapper iniziale - NON MODIFICA L'HTML
    window.safeHTML = function(html, context = 'unknown') {
        sanitizationCalls++;
        
        // Log per debugging
        
        // Per ora ritorna HTML non modificato
        return html;
    };
    
    // Funzione helper per sostituire innerHTML in modo sicuro con rollback
    window.safeReplace = function(element, newContent, options = {}) {
        const {
            useTextContent = false,
            context = 'unknown',
            testCallback = null
        } = options;
        
        if (!element) {
            console.error('[SafeReplace] Element not found');
            return false;
        }
        
        // Backup del contenuto originale
        const backup = element.innerHTML;
        
        try {
            if (useTextContent) {
                // Caso sicuro: solo testo
                element.textContent = newContent;
            } else {
                // Caso HTML: usa wrapper (per ora non sanitizza)
                element.innerHTML = window.safeHTML(newContent, context);
            }
            
            // Se fornito, esegui test
            if (testCallback && typeof testCallback === 'function') {
                const testResult = testCallback(element);
                if (!testResult) {
                    throw new Error('Test callback failed');
                }
            }
            
            return true;
        } catch (error) {
            // Rollback automatico
            console.error(`[SafeReplace] Error in ${context}, rolling back:`, error);
            element.innerHTML = backup;
            return false;
        }
    };
    
    // Funzione per attivare DOMPurify quando siamo pronti
    window.activateDOMPurify = function(config = {}) {
        if (typeof DOMPurify === 'undefined') {
            console.error('[SafeHTML] DOMPurify not loaded! Add script to HTML first.');
            return false;
        }
        
        const defaultConfig = {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'img', 'br', 'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'style', 'target', 'data-*'],
            ALLOW_DATA_ATTR: true,
            KEEP_CONTENT: true
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        // Sostituisci la funzione wrapper con DOMPurify attivo
        window.safeHTML = function(html, context = 'unknown') {
            sanitizationCalls++;
            return DOMPurify.sanitize(html, finalConfig);
        };
        
        return true;
    };
    
    // Utility per testare singoli elementi
    window.testSanitization = function(selector, testHTML = '<img src=x onerror="alert(\'XSS\')">Test') {
        const element = document.querySelector(selector);
        if (!element) {
            console.error('[TestSanitization] Element not found:', selector);
            return;
        }
        
        
        // Test con HTML pericoloso
        const result = window.safeReplace(element, testHTML, {
            context: 'test-sanitization',
            testCallback: (el) => {
                // Verifica che non ci sia script eseguito
                return !el.innerHTML.includes('onerror');
            }
        });
        
    };
    
    
    // Flag per stato DOMPurify
    window.isDOMPurifyActive = false;
    
    // AUTO-ATTIVAZIONE dopo 100ms (per dare tempo a DOMPurify di caricarsi)
    setTimeout(() => {
        if (typeof DOMPurify !== 'undefined') {
            window.isDOMPurifyActive = window.activateDOMPurify();
            console.log('[SafeHTML] ✅ DOMPurify attivato con successo');
        } else {
            console.warn('[SafeHTML] ⚠️ DOMPurify non trovato - protezione non attiva');
        }
    }, 100);
})();