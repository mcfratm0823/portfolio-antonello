/**
 * Preloader Guard - Previene animazioni multiple del preloader
 * Deve essere caricato PRIMA di nuovahome.js
 */
(function() {
    'use strict';
    
    // Flag globale per tracciare stato preloader
    window.__PRELOADER_STATE__ = {
        animationStarted: false,
        animationCompleted: false,
        hidden: false
    };
    
    // Intercetta modifiche al preloader
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const preloader = mutation.target;
                if (preloader.id === 'preloader') {
                    if (preloader.style.display === 'none' && !window.__PRELOADER_STATE__.hidden) {
                        window.__PRELOADER_STATE__.hidden = true;
                    }
                }
            }
        });
    });
    
    // Osserva il preloader quando disponibile
    const checkPreloader = setInterval(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            observer.observe(preloader, {
                attributes: true,
                attributeFilter: ['style']
            });
            clearInterval(checkPreloader);
        }
    }, 10);
    
    // Override gsap.to per intercettare animazioni preloader
    if (window.gsap) {
        const originalTo = gsap.to;
        const originalTimeline = gsap.timeline;
        
        gsap.to = function(target, vars) {
            // Controlla se è un'animazione del preloader
            if (isPreloaderElement(target)) {
                if (window.__PRELOADER_STATE__.animationStarted) {
                    console.warn('[PreloaderGuard] Blocked duplicate preloader animation');
                    return gsap.set(target, vars); // Applica immediatamente senza animazione
                }
                window.__PRELOADER_STATE__.animationStarted = true;
            }
            
            return originalTo.apply(this, arguments);
        };
        
        // Intercetta anche timeline
        gsap.timeline = function(config) {
            const timeline = originalTimeline.apply(this, arguments);
            const originalAdd = timeline.to;
            
            timeline.to = function(target, vars, position) {
                if (isPreloaderElement(target)) {
                    if (window.__PRELOADER_STATE__.animationStarted) {
                        console.warn('[PreloaderGuard] Blocked duplicate preloader timeline animation');
                        return timeline.set(target, vars, position);
                    }
                    window.__PRELOADER_STATE__.animationStarted = true;
                }
                
                return originalAdd.apply(this, arguments);
            };
            
            return timeline;
        };
    }
    
    function isPreloaderElement(target) {
        if (typeof target === 'string') {
            return target.includes('preloader');
        }
        if (target && target.id) {
            return target.id.includes('preloader');
        }
        if (target && target.className) {
            return target.className.includes('preloader');
        }
        return false;
    }
    
    // Blocca sessionStorage duplicati
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key, value) {
        if (key === 'preloaderShown' && sessionStorage.getItem(key) === 'true') {
            return;
        }
        return originalSetItem.apply(this, arguments);
    };
})();