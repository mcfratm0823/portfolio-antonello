/**
 * Portfolio Font Handler
 * Gestisce il caricamento dei font senza dipendere da GSAP
 */

(function() {
    'use strict';
    
    // Aggiungi classe iniziale per nascondere elementi durante caricamento
    document.documentElement.classList.add('fonts-loading');
    
    // Funzione per verificare se i font sono caricati
    function checkFontsLoaded() {
        // Verifica se Font Face API è supportata
        if ('fonts' in document) {
            document.fonts.ready.then(function() {
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-loaded');
            });
        } else {
            // Fallback per browser più vecchi
            // Aspetta un breve momento e poi mostra tutto
            setTimeout(function() {
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-loaded');
            }, 300);
        }
    }
    
    // Esegui al caricamento del DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkFontsLoaded);
    } else {
        checkFontsLoaded();
    }
})();