/**
 * SafeHTML Wrapper - Sistema di sanitizzazione HTML con DOMPurify
 * 
 * Fornisce sanitizzazione automatica per prevenire XSS attacks
 * Attivazione immediata con fallback sicuro
 */

(function() {
    'use strict';
    
    // Contatore per tracking (utile per monitoring)
    let sanitizationCalls = 0;
    let purifyActive = false;
    
    // Configurazione DOMPurify ottimizzata per il sito
    const DOMPURIFY_CONFIG = {
        ALLOWED_TAGS: [
            // Text formatting
            'b', 'i', 'em', 'strong', 'u', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
            // Links and media
            'a', 'img', 'video', 'audio', 'source', 'picture',
            // Structure
            'br', 'hr', 'p', 'div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'main',
            // Headers
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            // Lists
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            // Tables
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
            // Forms
            'form', 'input', 'textarea', 'select', 'option', 'button', 'label',
            // Other
            'blockquote', 'code', 'pre', 'figure', 'figcaption'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'width', 'height',
            'class', 'id', 'style', 'target', 'rel',
            'data-*', 'aria-*', 'role',
            'type', 'name', 'value', 'placeholder', 'required', 'disabled',
            'for', 'colspan', 'rowspan', 'scope',
            // Portfolio specific attributes
            'data-project-id', 'data-category', 'data-index', 'data-title',
            'data-filter', 'data-cursor-type', 'data-scroll-container'
        ],
        ALLOW_DATA_ATTR: true,
        KEEP_CONTENT: true,
        SAFE_FOR_TEMPLATES: false,
        SANITIZE_DOM: true
    };
    
    // Funzione wrapper con fallback sicuro
    window.safeHTML = function(html, context = 'unknown') {
        sanitizationCalls++;
        
        // Se DOMPurify non è disponibile, ritorna stringa vuota per sicurezza
        if (!purifyActive || typeof DOMPurify === 'undefined') {
            if (typeof DOMPurify !== 'undefined') {
                // Tenta di attivare DOMPurify se disponibile
                activateDOMPurifyInternal();
            }
            
            if (!purifyActive) {
                // Fallback sicuro: escapa l'HTML
                const div = document.createElement('div');
                div.textContent = html;
                return div.innerHTML;
            }
        }
        
        // Sanitizza con DOMPurify
        return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
    };
    
    // Funzione helper per sostituire innerHTML in modo sicuro con rollback
    window.safeReplace = function(element, newContent, options = {}) {
        const {
            useTextContent = false,
            context = 'unknown',
            testCallback = null
        } = options;
        
        if (!element) {
            // Silently fail in production
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
            // Rollback automatico silenzioso
            element.innerHTML = backup;
            return false;
        }
    };
    
    // Funzione interna per attivare DOMPurify
    function activateDOMPurifyInternal() {
        if (typeof DOMPurify !== 'undefined' && !purifyActive) {
            purifyActive = true;
            return true;
        }
        return false;
    }
    
    // Funzione pubblica per configurazione custom
    window.configureSafeHTML = function(customConfig = {}) {
        if (typeof DOMPurify === 'undefined') {
            return false;
        }
        
        // Merge configurazione custom con quella di default
        Object.assign(DOMPURIFY_CONFIG, customConfig);
        purifyActive = true;
        return true;
    };
    
    // Utility per testare la sanitizzazione (solo per development)
    window.testSanitization = function(selector, testHTML = '<img src=x onerror="alert(\'XSS\')">Test') {
        const element = document.querySelector(selector);
        if (!element) {
            return false;
        }
        
        // Test con HTML pericoloso
        const result = window.safeReplace(element, testHTML, {
            context: 'test-sanitization',
            testCallback: (el) => {
                // Verifica che non ci sia script eseguito
                return !el.innerHTML.includes('onerror');
            }
        });
        
        return result;
    };
    
    // Funzione per ottenere statistiche di utilizzo
    window.getSanitizationStats = function() {
        return {
            calls: sanitizationCalls,
            purifyActive: purifyActive,
            dompurifyLoaded: typeof DOMPurify !== 'undefined'
        };
    };
    
    // ATTIVAZIONE IMMEDIATA
    // Tenta di attivare DOMPurify immediatamente
    if (typeof DOMPurify !== 'undefined') {
        activateDOMPurifyInternal();
    } else {
        // Se DOMPurify non è ancora caricato, attendi il DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                activateDOMPurifyInternal();
            });
        } else {
            // Fallback: controlla ogni 100ms per massimo 3 secondi
            let attempts = 0;
            const checkInterval = setInterval(function() {
                attempts++;
                if (typeof DOMPurify !== 'undefined') {
                    activateDOMPurifyInternal();
                    clearInterval(checkInterval);
                } else if (attempts >= 30) { // 3 secondi
                    clearInterval(checkInterval);
                }
            }, 100);
        }
    }
})();