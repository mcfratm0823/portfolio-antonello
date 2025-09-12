/**
 * Production Web Vitals Monitoring
 * Configurazione per monitoring in production tramite Google Analytics o servizi esterni
 */

class ProductionVitalsMonitor {
    constructor() {
        this.isProduction = window.location.hostname !== 'localhost';
        this.sessionId = this.generateSessionId();
        this.sampleRate = 0.1; // Monitor 10% del traffico
        
        if (this.isProduction && this.shouldSample() && window.performanceMonitor) {
            this.init();
        }
    }
    
    /**
     * Genera session ID unico
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Decide se campionare questa sessione
     */
    shouldSample() {
        return Math.random() < this.sampleRate;
    }
    
    /**
     * Inizializza monitoring production
     */
    init() {
        // Setup listeners
        window.performanceMonitor.addListener((event) => {
            if (event.type === 'metric') {
                this.handleMetric(event.metric);
            }
        });
        
        // Invia report finale quando utente esce
        this.setupBeforeUnload();
        
        // Invia report periodici per sessioni lunghe
        this.setupPeriodicReporting();
        
        console.log(`🔍 Production Web Vitals monitoring attivo (session: ${this.sessionId})`);
    }
    
    /**
     * Gestisce singola metrica
     */
    handleMetric(metric) {
        // Invia metriche Core Web Vitals critiche immediatamente
        if (['LCP', 'FID', 'CLS'].includes(metric.name)) {
            this.sendToAnalytics(metric);
        }
        
        // Log per debug in console (solo per rating poor)
        if (metric.rating === 'poor') {
            console.warn(`⚠️ Poor ${metric.name}: ${metric.value}ms (${metric.rating})`);
        }
    }
    
    /**
     * Invia metrica a Google Analytics (o altro servizio)
     */
    sendToAnalytics(metric) {
        // Google Analytics 4 (gtag)
        if (typeof gtag === 'function') {
            gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: metric.name,
                value: Math.round(metric.value),
                custom_parameters: {
                    metric_rating: metric.rating,
                    session_id: this.sessionId,
                    connection_type: this.getConnectionType(),
                    device_type: this.getDeviceType()
                }
            });
        }
        
        // Alternativa: invia a endpoint custom
        this.sendToCustomEndpoint({
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            timestamp: Date.now(),
            session_id: this.sessionId,
            url: window.location.href,
            user_agent: navigator.userAgent,
            connection: this.getConnectionType(),
            device: this.getDeviceType()
        });
    }
    
    /**
     * Invia a endpoint custom (es: Sentry, DataDog, etc.)
     */
    async sendToCustomEndpoint(data) {
        try {
            // Sostituisci con il tuo endpoint di monitoring
            const endpoint = '/api/web-vitals'; 
            
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true // Importante per beforeunload
            });
        } catch (error) {
            // Fail silently in production
            if (window.location.hostname === 'localhost') {
                console.warn('Failed to send vitals to endpoint:', error);
            }
        }
    }
    
    /**
     * Setup report finale prima che utente esca
     */
    setupBeforeUnload() {
        const sendFinalReport = () => {
            if (!window.performanceMonitor) return;
            
            const report = window.performanceMonitor.getReport();
            
            // Invia report completo
            this.sendFinalReport(report);
        };
        
        // Multiple eventi per catturare tutti i modi di uscire
        window.addEventListener('beforeunload', sendFinalReport);
        window.addEventListener('pagehide', sendFinalReport);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                sendFinalReport();
            }
        });
    }
    
    /**
     * Invia report finale
     */
    sendFinalReport(report) {
        const finalData = {
            type: 'final_report',
            session_id: this.sessionId,
            url: window.location.href,
            metrics: report.metrics,
            device: report.device,
            timestamp: Date.now(),
            session_duration: Date.now() - parseInt(this.sessionId, 36)
        };
        
        // Usa sendBeacon per garantire invio anche se pagina si chiude
        if (navigator.sendBeacon) {
            const endpoint = '/api/web-vitals-final';
            navigator.sendBeacon(
                endpoint, 
                JSON.stringify(finalData)
            );
        } else {
            this.sendToCustomEndpoint(finalData);
        }
    }
    
    /**
     * Setup report periodici
     */
    setupPeriodicReporting() {
        // Ogni 30 secondi per sessioni attive
        setInterval(() => {
            if (document.visibilityState === 'visible' && window.performanceMonitor) {
                const quickReport = {
                    type: 'periodic_report',
                    session_id: this.sessionId,
                    timestamp: Date.now(),
                    core_vitals: this.getCoreVitalsSnapshot()
                };
                
                this.sendToCustomEndpoint(quickReport);
            }
        }, 30000);
    }
    
    /**
     * Snapshot veloce delle Core Web Vitals
     */
    getCoreVitalsSnapshot() {
        const monitor = window.performanceMonitor;
        if (!monitor) return {};
        
        const snapshot = {};
        ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(name => {
            const metrics = monitor.getMetric(name);
            if (metrics.length > 0) {
                const latest = metrics[metrics.length - 1];
                snapshot[name] = {
                    value: latest.value,
                    rating: latest.rating,
                    timestamp: latest.timestamp
                };
            }
        });
        
        return snapshot;
    }
    
    /**
     * Ottieni tipo connessione
     */
    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType;
        }
        return 'unknown';
    }
    
    /**
     * Ottieni tipo dispositivo
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
}

// Export per ES6 modules
export { ProductionVitalsMonitor };

// Auto-inizializza in production
window.productionVitalsMonitor = new ProductionVitalsMonitor();