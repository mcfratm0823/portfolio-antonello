/**
 * Performance Monitoring System
 * Traccia Web Vitals e metriche di performance in tempo reale
 * @module PerformanceMonitor
 */

/**
 * @typedef {Object} PerformanceMetric
 * @property {string} name - Nome della metrica (LCP, FID, CLS, etc.)
 * @property {number} value - Valore della metrica
 * @property {string} rating - Rating (good, needs-improvement, poor)
 * @property {number} timestamp - Timestamp della misurazione
 */

/**
 * @typedef {Object} PerformanceReport
 * @property {PerformanceMetric[]} metrics - Array di metriche
 * @property {string} url - URL della pagina
 * @property {string} userAgent - User agent del browser
 * @property {Object} device - Info dispositivo
 * @property {number} timestamp - Timestamp del report
 */

class PerformanceMonitor {
    constructor() {
        /** @type {Map<string, PerformanceMetric[]>} */
        this.metrics = new Map();
        
        /** @type {Set<Function>} */
        this.listeners = new Set();
        
        /** @type {boolean} */
        this.isSupported = this.checkSupport();
        
        /** @type {Object} Thresholds per Web Vitals */
        this.thresholds = {
            LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
            FID: { good: 100, poor: 300 },         // First Input Delay
            CLS: { good: 0.1, poor: 0.25 },        // Cumulative Layout Shift
            FCP: { good: 1800, poor: 3000 },       // First Contentful Paint
            TTFB: { good: 800, poor: 1800 },       // Time to First Byte
            INP: { good: 200, poor: 500 }          // Interaction to Next Paint
        };
        
        if (this.isSupported) {
            this.init();
        }
    }
    
    /**
     * Verifica supporto browser per Performance APIs
     * @returns {boolean}
     */
    checkSupport() {
        return typeof window !== 'undefined' && 
               'PerformanceObserver' in window && 
               'PerformanceLongTaskTiming' in window;
    }
    
    /**
     * Inizializza monitoring
     * @returns {void}
     */
    init() {
        // Web Vitals
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        this.observeFCP();
        
        // Performance generico
        this.observeNavigationTiming();
        this.observeResourceTiming();
        this.observeLongTasks();
        
        // Custom metrics
        this.setupCustomMetrics();
        
        // Error tracking performance-related
        this.setupErrorTracking();
    }
    
    /**
     * Observe Largest Contentful Paint
     * @private
     */
    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.recordMetric('LCP', lastEntry.startTime, {
                    element: lastEntry.element?.tagName,
                    size: lastEntry.size,
                    url: lastEntry.url
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Fallback per browser che non supportano
        }
    }
    
    /**
     * Observe First Input Delay
     * @private
     */
    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const delay = entry.processingStart - entry.startTime;
                    
                    this.recordMetric('FID', delay, {
                        eventType: entry.name,
                        target: entry.target?.tagName
                    });
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            // Fallback
        }
    }
    
    /**
     * Observe Cumulative Layout Shift
     * @private
     */
    observeCLS() {
        try {
            let clsValue = 0;
            let clsEntries = [];
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push({
                            time: entry.startTime,
                            value: entry.value,
                            sources: entry.sources?.map(s => ({
                                node: s.node?.tagName,
                                previousRect: s.previousRect,
                                currentRect: s.currentRect
                            }))
                        });
                    }
                }
                
                this.recordMetric('CLS', clsValue, {
                    shifts: clsEntries.length,
                    details: clsEntries
                });
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            // Fallback
        }
    }
    
    /**
     * Observe First Contentful Paint
     * @private
     */
    observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                
                if (fcpEntry) {
                    this.recordMetric('FCP', fcpEntry.startTime);
                }
            });
            
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            // Fallback
        }
    }
    
    /**
     * Observe Navigation Timing
     * @private
     */
    observeNavigationTiming() {
        try {
            // Usa Navigation Timing API v2
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    // Time to First Byte
                    const ttfb = entry.responseStart - entry.requestStart;
                    this.recordMetric('TTFB', ttfb);
                    
                    // DOM Content Loaded
                    const dcl = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
                    this.recordMetric('DCL', dcl);
                    
                    // Load Complete
                    const loadComplete = entry.loadEventEnd - entry.loadEventStart;
                    this.recordMetric('LoadComplete', loadComplete);
                    
                    // Total Page Load
                    const totalLoad = entry.loadEventEnd - entry.fetchStart;
                    this.recordMetric('TotalPageLoad', totalLoad);
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        } catch (e) {
            // Usa fallback Navigation Timing API v1
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                const ttfb = timing.responseStart - timing.requestStart;
                const dcl = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart;
                const loadComplete = timing.loadEventEnd - timing.loadEventStart;
                
                this.recordMetric('TTFB', ttfb);
                this.recordMetric('DCL', dcl);
                this.recordMetric('LoadComplete', loadComplete);
            });
        }
    }
    
    /**
     * Observe Resource Timing (images, scripts, etc.)
     * @private
     */
    observeResourceTiming() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    // Track risorse lente
                    if (entry.duration > 1000) {
                        this.recordMetric('SlowResource', entry.duration, {
                            name: entry.name,
                            type: entry.initiatorType,
                            size: entry.transferSize,
                            protocol: entry.nextHopProtocol
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            // Fallback
        }
    }
    
    /**
     * Observe Long Tasks (blocking main thread)
     * @private
     */
    observeLongTasks() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    this.recordMetric('LongTask', entry.duration, {
                        startTime: entry.startTime,
                        attribution: entry.attribution
                    });
                    
                    // Avvisa se troppi long tasks
                    const recentLongTasks = this.getMetric('LongTask')
                        .filter(m => Date.now() - m.timestamp < 60000); // Ultimi 60s
                    
                    if (recentLongTasks.length > 5) {
                        this.notifyListeners({
                            type: 'warning',
                            message: 'Troppi long tasks rilevati',
                            data: recentLongTasks
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            // Browser non supporta Long Tasks API
        }
    }
    
    /**
     * Setup metriche custom
     * @private
     */
    setupCustomMetrics() {
        // Time to Interactive (custom)
        this.measureTTI();
        
        // Memory usage
        this.measureMemory();
        
        // Frame rate
        this.measureFrameRate();
    }
    
    /**
     * Misura Time to Interactive
     * @private
     */
    measureTTI() {
        // Semplificato: quando main thread è idle per 5s
        let idleStart = null;
        let measured = false;
        
        const check = () => {
            if (measured) return;
            
            const now = performance.now();
            const longTasks = this.getMetric('LongTask');
            const recentTask = longTasks.find(t => now - t.timestamp < 5000);
            
            if (!recentTask) {
                if (!idleStart) {
                    idleStart = now;
                } else if (now - idleStart > 5000) {
                    this.recordMetric('TTI', idleStart);
                    measured = true;
                }
            } else {
                idleStart = null;
            }
            
            if (!measured) {
                requestIdleCallback(check);
            }
        };
        
        requestIdleCallback(check);
    }
    
    /**
     * Misura memory usage
     * @private
     */
    measureMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.recordMetric('MemoryUsage', memory.usedJSHeapSize, {
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
                });
            }, 10000); // Ogni 10 secondi
        }
    }
    
    /**
     * Misura frame rate
     * @private
     */
    measureFrameRate() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // Registra solo se FPS basso
                if (fps < 50) {
                    this.recordMetric('LowFPS', fps);
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    /**
     * Setup error tracking correlato a performance
     * @private
     */
    setupErrorTracking() {
        // Ascolta errori dal error handler
        if (window.errorHandler) {
            window.errorHandler.addListener((error) => {
                // Correla errori con metriche performance
                if (error.category === 'network') {
                    this.recordMetric('NetworkError', 1, {
                        url: error.context.url,
                        timing: this.getResourceTiming(error.context.url)
                    });
                }
            });
        }
    }
    
    /**
     * Registra una metrica
     * @param {string} name - Nome metrica
     * @param {number} value - Valore
     * @param {Object} [metadata={}] - Metadata aggiuntivi
     */
    recordMetric(name, value, metadata = {}) {
        const rating = this.getRating(name, value);
        
        const metric = {
            name,
            value,
            rating,
            metadata,
            timestamp: Date.now(),
            url: window.location.href,
            connection: this.getConnectionInfo()
        };
        
        // Salva metrica
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push(metric);
        
        // Mantieni solo ultime 100 per tipo
        const metrics = this.metrics.get(name);
        if (metrics.length > 100) {
            metrics.shift();
        }
        
        // Notifica listeners
        this.notifyListeners({
            type: 'metric',
            metric
        });
        
        // Log in development
        if (window.location.hostname === 'localhost') {
            const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        }
    }
    
    /**
     * Ottieni rating per metrica
     * @param {string} name - Nome metrica
     * @param {number} value - Valore
     * @returns {string} Rating (good, needs-improvement, poor)
     */
    getRating(name, value) {
        const threshold = this.thresholds[name];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }
    
    /**
     * Ottieni metriche per nome
     * @param {string} name - Nome metrica
     * @returns {PerformanceMetric[]}
     */
    getMetric(name) {
        return this.metrics.get(name) || [];
    }
    
    /**
     * Ottieni tutte le metriche
     * @returns {Object}
     */
    getAllMetrics() {
        const result = {};
        this.metrics.forEach((values, name) => {
            result[name] = values;
        });
        return result;
    }
    
    /**
     * Ottieni report completo
     * @returns {PerformanceReport}
     */
    getReport() {
        const metrics = [];
        
        // Aggrega metriche
        this.metrics.forEach((values, name) => {
            if (values.length > 0) {
                const latest = values[values.length - 1];
                const average = values.reduce((sum, m) => sum + m.value, 0) / values.length;
                
                metrics.push({
                    name,
                    latest: latest.value,
                    average,
                    rating: latest.rating,
                    count: values.length
                });
            }
        });
        
        return {
            metrics,
            url: window.location.href,
            userAgent: navigator.userAgent,
            device: {
                type: this.getDeviceType(),
                connection: this.getConnectionInfo(),
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            },
            timestamp: Date.now()
        };
    }
    
    /**
     * Ottieni info connessione
     * @returns {Object}
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                type: conn.type,
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return null;
    }
    
    /**
     * Ottieni tipo dispositivo
     * @returns {string}
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    /**
     * Ottieni resource timing per URL
     * @param {string} url
     * @returns {Object|null}
     */
    getResourceTiming(url) {
        const entries = performance.getEntriesByName(url, 'resource');
        if (entries.length > 0) {
            const entry = entries[0];
            return {
                duration: entry.duration,
                size: entry.transferSize,
                protocol: entry.nextHopProtocol
            };
        }
        return null;
    }
    
    /**
     * Aggiungi listener per eventi
     * @param {Function} callback
     */
    addListener(callback) {
        this.listeners.add(callback);
    }
    
    /**
     * Rimuovi listener
     * @param {Function} callback
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }
    
    /**
     * Notifica tutti i listeners
     * @param {Object} event
     */
    notifyListeners(event) {
        this.listeners.forEach(callback => {
            try {
                callback(event);
            } catch (e) {
                console.error('Performance listener error:', e);
            }
        });
    }
    
    /**
     * Invia report a backend
     * @param {string} endpoint - URL endpoint
     * @returns {Promise<void>}
     */
    async sendReport(endpoint) {
        try {
            const report = this.getReport();
            
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
        } catch (e) {
            // Silently fail
        }
    }
    
    /**
     * Clear all metrics
     */
    clear() {
        this.metrics.clear();
    }
}

// Export per ES6 modules
export { PerformanceMonitor };

// Crea istanza globale
window.performanceMonitor = new PerformanceMonitor();