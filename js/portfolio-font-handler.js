/**
 * Portfolio Font Handler
 * Gestisce il caricamento dei font senza dipendere da GSAP
 */

(function() {
    'use strict';
    
    // Aggiungi classe iniziale per nascondere elementi durante caricamento
    document.documentElement.classList.add('fonts-loading');
    
    // Timeout di sicurezza per evitare che il contenuto rimanga nascosto
    let safetyTimeout = setTimeout(function() {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    }, 1000); // Max 1 secondo di attesa
    
    // Funzione per verificare se i font sono caricati
    function checkFontsLoaded() {
        // Verifica se Font Face API è supportata
        if ('fonts' in document) {
            // Controlla specificamente i font Neue che usiamo
            const fontsToCheck = [
                new FontFace('Neue', 'url(./fonts/PPNeueMontreal-Medium.woff2)', { weight: '500' }),
                new FontFace('Neue', 'url(./fonts/PPNeueMontreal-Bold.woff2)', { weight: '700' }),
                new FontFace('Neue', 'url(./fonts/PPNeueMontreal-Regular.woff2)', { weight: '400' })
            ];
            
            // Attendi che i font siano pronti
            Promise.all(fontsToCheck.map(font => font.load().catch(() => null))).then(function() {
                clearTimeout(safetyTimeout);
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-loaded');
            });
            
            // Fallback con document.fonts.ready
            document.fonts.ready.then(function() {
                clearTimeout(safetyTimeout);
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-loaded');
            });
        } else {
            // Fallback per browser più vecchi
            // Aspetta un breve momento e poi mostra tutto
            setTimeout(function() {
                clearTimeout(safetyTimeout);
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-loaded');
            }, 300);
        }
    }
    
    // Esegui immediatamente se possibile
    checkFontsLoaded();
})();