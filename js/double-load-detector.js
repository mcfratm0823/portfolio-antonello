/**
 * Double Load Detector - Rileva e previene caricamenti doppi
 * Versione avanzata per debugging
 */
(function() {
    'use strict';
    
    // Traccia tutti i caricamenti
    window.__LOAD_TRACKER__ = {
        preloader: {
            animations: 0,
            completed: 0
        },
        cms: {
            dataLoads: 0,
            projectLoads: 0
        },
        modules: {
            initialized: new Set(),
            duplicates: []
        },
        animations: {
            hero: 0,
            portfolio: 0,
            services: 0
        },
        startTime: performance.now()
    };
    
    // Intercetta animazioni GSAP
    if (window.gsap) {
        const originalTo = gsap.to;
        const originalFromTo = gsap.fromTo;
        const originalTimeline = gsap.timeline;
        
        gsap.to = function(target, vars) {
            trackAnimation('to', target);
            return originalTo.apply(this, arguments);
        };
        
        gsap.fromTo = function(target, fromVars, toVars) {
            trackAnimation('fromTo', target);
            return originalFromTo.apply(this, arguments);
        };
        
        gsap.timeline = function(vars) {
            if (vars && vars.scrollTrigger) {
                trackAnimation('timeline-scroll', vars.scrollTrigger.trigger);
            }
            return originalTimeline.apply(this, arguments);
        };
    }
    
    function trackAnimation(type, target) {
        const targetStr = typeof target === 'string' ? target : target?.id || target?.className || 'unknown';
        
        // Traccia animazioni specifiche
        if (targetStr.includes('preloader')) {
            window.__LOAD_TRACKER__.preloader.animations++;
        } else if (targetStr.includes('hero') || targetStr.includes('antonello') || targetStr.includes('guarnieri')) {
            window.__LOAD_TRACKER__.animations.hero++;
        } else if (targetStr.includes('portfolio') || targetStr.includes('selected_work')) {
            window.__LOAD_TRACKER__.animations.portfolio++;
        } else if (targetStr.includes('service')) {
            window.__LOAD_TRACKER__.animations.services++;
        }
    }
    
    // Intercetta fetch per tracciare caricamenti CMS
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            if (url.includes('homepage.json')) {
                window.__LOAD_TRACKER__.cms.dataLoads++;
                console.warn(`[DoubleLoadDetector] Homepage data load #${window.__LOAD_TRACKER__.cms.dataLoads}`);
            } else if (url.includes('projects.json')) {
                window.__LOAD_TRACKER__.cms.projectLoads++;
                console.warn(`[DoubleLoadDetector] Projects data load #${window.__LOAD_TRACKER__.cms.projectLoads}`);
            }
        }
        return originalFetch.apply(this, arguments);
    };
    
    // Traccia inizializzazioni moduli
    window.trackModuleInit = function(moduleName) {
        if (window.__LOAD_TRACKER__.modules.initialized.has(moduleName)) {
            window.__LOAD_TRACKER__.modules.duplicates.push({
                module: moduleName,
                time: performance.now() - window.__LOAD_TRACKER__.startTime,
                stack: new Error().stack
            });
            console.error(`[DoubleLoadDetector] DUPLICATE INIT: ${moduleName}`);
        } else {
            window.__LOAD_TRACKER__.modules.initialized.add(moduleName);
        }
    };
    
    // Monitora preloader
    const checkPreloader = setInterval(() => {
        const preloader = document.getElementById('preloader');
        if (preloader && preloader.style.display === 'none') {
            window.__LOAD_TRACKER__.preloader.completed++;
            if (window.__LOAD_TRACKER__.preloader.completed > 1) {
                console.error('[DoubleLoadDetector] Preloader hidden multiple times!');
            }
        }
    }, 100);
    
    // Report finale
    window.showLoadReport = function() {
        console.group('🔍 Double Load Detection Report');
        
        // Controlla problemi
        const issues = [];
        
        if (window.__LOAD_TRACKER__.preloader.animations > 1) {
            issues.push(`Preloader animated ${window.__LOAD_TRACKER__.preloader.animations} times`);
        }
        
        if (window.__LOAD_TRACKER__.cms.dataLoads > 1) {
            issues.push(`Homepage data loaded ${window.__LOAD_TRACKER__.cms.dataLoads} times`);
        }
        
        if (window.__LOAD_TRACKER__.cms.projectLoads > 1) {
            issues.push(`Projects loaded ${window.__LOAD_TRACKER__.cms.projectLoads} times`);
        }
        
        if (window.__LOAD_TRACKER__.modules.duplicates.length > 0) {
            issues.push(`${window.__LOAD_TRACKER__.modules.duplicates.length} duplicate module initializations`);
            console.table(window.__LOAD_TRACKER__.modules.duplicates);
        }
        
        if (window.__LOAD_TRACKER__.animations.hero > 10) {
            issues.push(`Hero animated ${window.__LOAD_TRACKER__.animations.hero} times (expected ~10)`);
        }
        
        if (issues.length === 0) {
            console.log('✅ No double loading detected!');
        } else {
            console.error('❌ Double loading issues found:');
            issues.forEach(issue => console.error(`  - ${issue}`));
        }
        
        console.log('\n📊 Full Statistics:');
        console.table({
            'Preloader Animations': window.__LOAD_TRACKER__.preloader.animations,
            'Homepage Data Loads': window.__LOAD_TRACKER__.cms.dataLoads,
            'Project Loads': window.__LOAD_TRACKER__.cms.projectLoads,
            'Hero Animations': window.__LOAD_TRACKER__.animations.hero,
            'Portfolio Animations': window.__LOAD_TRACKER__.animations.portfolio,
            'Service Animations': window.__LOAD_TRACKER__.animations.services,
            'Duplicate Modules': window.__LOAD_TRACKER__.modules.duplicates.length
        });
        
        console.groupEnd();
        
        // Pulisci interval
        clearInterval(checkPreloader);
    };
    
    // Auto report dopo 5 secondi
    setTimeout(() => {
        window.showLoadReport();
        
        // Mostra anche nel DOM se in debug
        if (window.location.search.includes('debug=true')) {
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 15px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 99999;
                max-width: 300px;
            `;
            
            const hasIssues = window.__LOAD_TRACKER__.cms.dataLoads > 1 || 
                             window.__LOAD_TRACKER__.cms.projectLoads > 1 ||
                             window.__LOAD_TRACKER__.modules.duplicates.length > 0;
            
            debugDiv.innerHTML = `
                <h4 style="margin: 0 0 10px; color: ${hasIssues ? '#ff6b6b' : '#51cf66'};">
                    ${hasIssues ? '❌ Double Load Detected' : '✅ No Double Load'}
                </h4>
                <div>CMS Loads: ${window.__LOAD_TRACKER__.cms.dataLoads}</div>
                <div>Project Loads: ${window.__LOAD_TRACKER__.cms.projectLoads}</div>
                <div>Duplicate Modules: ${window.__LOAD_TRACKER__.modules.duplicates.length}</div>
                <button onclick="this.parentElement.remove()" style="
                    margin-top: 10px;
                    background: #333;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                ">Close</button>
            `;
            
            document.body.appendChild(debugDiv);
        }
    }, 5000);
})();