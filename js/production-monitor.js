/**
 * Production Monitor - Lightweight monitoring for production
 * Tracks key metrics without debug overhead
 */
(function() {
    'use strict';
    
    // Only run if not already monitoring
    if (window.__PRODUCTION_MONITOR__) return;
    
    window.__PRODUCTION_MONITOR__ = {
        initialized: true,
        metrics: {
            pageLoadTime: 0,
            jsErrors: 0,
            resourceErrors: 0,
            moduleInitTime: 0,
            doubleLoadDetected: false
        }
    };
    
    // Track page load time
    window.addEventListener('load', function() {
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            window.__PRODUCTION_MONITOR__.metrics.pageLoadTime = loadTime;
            
            // Log warning if slow
            if (loadTime > 5000) {
                console.warn('[Monitor] Slow page load detected:', loadTime + 'ms');
            }
        }
    });
    
    // Track JavaScript errors
    window.addEventListener('error', function(e) {
        window.__PRODUCTION_MONITOR__.metrics.jsErrors++;
        
        // Log first 3 errors only
        if (window.__PRODUCTION_MONITOR__.metrics.jsErrors <= 3) {
            console.error('[Monitor] JS Error:', e.message, e.filename, e.lineno);
        }
    });
    
    // Track resource loading errors
    window.addEventListener('error', function(e) {
        if (e.target !== window) {
            window.__PRODUCTION_MONITOR__.metrics.resourceErrors++;
            
            // Log first 3 resource errors
            if (window.__PRODUCTION_MONITOR__.metrics.resourceErrors <= 3) {
                console.warn('[Monitor] Resource failed:', e.target.src || e.target.href);
            }
        }
    }, true);
    
    // Simple double load detection
    let fetchCount = {};
    const originalFetch = window.fetch;
    window.fetch = function(url) {
        if (typeof url === 'string') {
            const cleanUrl = url.split('?')[0]; // Remove query params
            fetchCount[cleanUrl] = (fetchCount[cleanUrl] || 0) + 1;
            
            // Detect double loads
            if (fetchCount[cleanUrl] > 1) {
                window.__PRODUCTION_MONITOR__.metrics.doubleLoadDetected = true;
                console.warn('[Monitor] Potential double load:', cleanUrl);
            }
        }
        return originalFetch.apply(this, arguments);
    };
    
    // Report function (can be called manually or by analytics)
    window.getProductionMetrics = function() {
        const metrics = window.__PRODUCTION_MONITOR__.metrics;
        
        // Add current timestamp
        metrics.timestamp = new Date().toISOString();
        
        // Add browser info
        metrics.userAgent = navigator.userAgent;
        
        // Health score (0-100)
        let healthScore = 100;
        if (metrics.pageLoadTime > 3000) healthScore -= 20;
        if (metrics.pageLoadTime > 5000) healthScore -= 20;
        if (metrics.jsErrors > 0) healthScore -= metrics.jsErrors * 10;
        if (metrics.resourceErrors > 0) healthScore -= metrics.resourceErrors * 5;
        if (metrics.doubleLoadDetected) healthScore -= 30;
        metrics.healthScore = Math.max(0, healthScore);
        
        return metrics;
    };
    
    // Auto-report after 10 seconds if in debug mode
    if (window.location.search.includes('monitor=true')) {
        setTimeout(function() {
            console.log('[Monitor] Production Metrics:', window.getProductionMetrics());
        }, 10000);
    }
    
    // Send to analytics if available
    window.addEventListener('load', function() {
        setTimeout(function() {
            const metrics = window.getProductionMetrics();
            
            // If Google Analytics is available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'production_metrics', {
                    'event_category': 'performance',
                    'health_score': metrics.healthScore,
                    'page_load_time': metrics.pageLoadTime,
                    'has_errors': metrics.jsErrors > 0
                });
            }
            
            // If other analytics available, add here
        }, 5000);
    });
})();