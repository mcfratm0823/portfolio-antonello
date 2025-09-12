/**
 * Web Vitals Dashboard - Developer-friendly performance monitoring
 * Sfrutta il PerformanceMonitor esistente per creare una dashboard visual
 */

class WebVitalsDashboard {
    constructor() {
        this.isActive = false;
        this.panel = null;
        this.metrics = {};
        this.updateInterval = null;
        
        // Attiva solo in development o con ?debug=performance
        const shouldActivate = window.location.hostname === 'localhost' || 
                              window.location.search.includes('debug=performance');
        
        if (shouldActivate && window.performanceMonitor) {
            this.init();
        }
    }
    
    /**
     * Inizializza dashboard
     */
    init() {
        this.createPanel();
        this.setupListeners();
        this.startUpdating();
        this.isActive = true;
        
        console.log('🚀 Web Vitals Dashboard attivato - Premi P per toggle');
    }
    
    /**
     * Crea pannello visual
     */
    createPanel() {
        // Crea container principale
        this.panel = document.createElement('div');
        this.panel.id = 'web-vitals-dashboard';
        this.panel.innerHTML = `
            <div class="wvd-header">
                <h3>⚡ Web Vitals Live</h3>
                <div class="wvd-controls">
                    <button id="wvd-clear">Clear</button>
                    <button id="wvd-export">Export</button>
                    <button id="wvd-close">×</button>
                </div>
            </div>
            <div class="wvd-content">
                <div class="wvd-vitals">
                    <div class="wvd-metric" id="lcp-metric">
                        <span class="wvd-label">LCP</span>
                        <span class="wvd-value">-</span>
                        <span class="wvd-rating">-</span>
                    </div>
                    <div class="wvd-metric" id="fid-metric">
                        <span class="wvd-label">FID</span>
                        <span class="wvd-value">-</span>
                        <span class="wvd-rating">-</span>
                    </div>
                    <div class="wvd-metric" id="cls-metric">
                        <span class="wvd-label">CLS</span>
                        <span class="wvd-value">-</span>
                        <span class="wvd-rating">-</span>
                    </div>
                    <div class="wvd-metric" id="fcp-metric">
                        <span class="wvd-label">FCP</span>
                        <span class="wvd-value">-</span>
                        <span class="wvd-rating">-</span>
                    </div>
                </div>
                <div class="wvd-additional">
                    <div class="wvd-metric" id="ttfb-metric">
                        <span class="wvd-label">TTFB</span>
                        <span class="wvd-value">-</span>
                        <span class="wvd-rating">-</span>
                    </div>
                    <div class="wvd-metric" id="memory-metric">
                        <span class="wvd-label">Memory</span>
                        <span class="wvd-value">-</span>
                        <span class="wvd-rating">-</span>
                    </div>
                </div>
                <div class="wvd-log" id="wvd-log"></div>
            </div>
        `;
        
        // Aggiungi stili
        this.injectStyles();
        
        // Aggiungi al DOM
        document.body.appendChild(this.panel);
        
        // Event handlers
        this.panel.querySelector('#wvd-close').onclick = () => this.hide();
        this.panel.querySelector('#wvd-clear').onclick = () => this.clearLog();
        this.panel.querySelector('#wvd-export').onclick = () => this.exportData();
        
        // Inizialmente nascosto
        this.hide();
    }
    
    /**
     * Inietta CSS per dashboard
     */
    injectStyles() {
        if (document.getElementById('wvd-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wvd-styles';
        style.textContent = `
            #web-vitals-dashboard {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                background: rgba(0, 0, 0, 0.95);
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 100000;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                backdrop-filter: blur(10px);
            }
            
            .wvd-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px 8px 0 0;
            }
            
            .wvd-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: bold;
            }
            
            .wvd-controls {
                display: flex;
                gap: 8px;
            }
            
            .wvd-controls button {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }
            
            .wvd-controls button:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .wvd-content {
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .wvd-vitals, .wvd-additional {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .wvd-metric {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .wvd-label {
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 11px;
                opacity: 0.7;
            }
            
            .wvd-value {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .wvd-rating {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                text-transform: uppercase;
            }
            
            .wvd-rating.good {
                background: #4CAF50;
                color: white;
            }
            
            .wvd-rating.needs-improvement {
                background: #FF9800;
                color: white;
            }
            
            .wvd-rating.poor {
                background: #F44336;
                color: white;
            }
            
            .wvd-log {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                padding: 8px;
                max-height: 120px;
                overflow-y: auto;
                font-size: 10px;
                line-height: 1.4;
            }
            
            .wvd-log-entry {
                margin-bottom: 4px;
                opacity: 0.8;
            }
            
            .wvd-log-entry.warning {
                color: #FF9800;
            }
            
            .wvd-log-entry.error {
                color: #F44336;
            }
            
            .wvd-log-entry .time {
                opacity: 0.5;
                margin-right: 8px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Setup listeners per performance monitor
     */
    setupListeners() {
        if (!window.performanceMonitor) return;
        
        window.performanceMonitor.addListener((event) => {
            if (event.type === 'metric') {
                this.updateMetric(event.metric);
                this.logEvent(event.metric);
            } else if (event.type === 'warning') {
                this.logWarning(event.message);
            }
        });
        
        // Keyboard shortcut per toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggle();
                }
            }
        });
    }
    
    /**
     * Aggiorna metrica nel pannello
     */
    updateMetric(metric) {
        this.metrics[metric.name] = metric;
        
        const formatValue = (name, value) => {
            if (name === 'CLS') return value.toFixed(3);
            if (name === 'MemoryUsage') return Math.round(value / 1024 / 1024) + 'MB';
            return Math.round(value) + 'ms';
        };
        
        const elementMap = {
            'LCP': 'lcp-metric',
            'FID': 'fid-metric', 
            'CLS': 'cls-metric',
            'FCP': 'fcp-metric',
            'TTFB': 'ttfb-metric',
            'MemoryUsage': 'memory-metric'
        };
        
        const elementId = elementMap[metric.name];
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                const value = element.querySelector('.wvd-value');
                const rating = element.querySelector('.wvd-rating');
                
                value.textContent = formatValue(metric.name, metric.value);
                rating.textContent = metric.rating;
                rating.className = `wvd-rating ${metric.rating}`;
            }
        }
    }
    
    /**
     * Log evento nel pannello
     */
    logEvent(metric) {
        const log = document.getElementById('wvd-log');
        if (!log) return;
        
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'wvd-log-entry';
        entry.innerHTML = `
            <span class="time">${time}</span>
            ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})
        `;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // Mantieni solo ultimi 20 log
        while (log.children.length > 20) {
            log.removeChild(log.firstChild);
        }
    }
    
    /**
     * Log warning
     */
    logWarning(message) {
        const log = document.getElementById('wvd-log');
        if (!log) return;
        
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'wvd-log-entry warning';
        entry.innerHTML = `
            <span class="time">${time}</span>
            ⚠️ ${message}
        `;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }
    
    /**
     * Avvia aggiornamento periodico
     */
    startUpdating() {
        this.updateInterval = setInterval(() => {
            if (window.performanceMonitor) {
                const report = window.performanceMonitor.getReport();
                
                // Aggiorna metriche mostrate
                report.metrics.forEach(metric => {
                    const syntheticMetric = {
                        name: metric.name,
                        value: metric.latest,
                        rating: metric.rating
                    };
                    this.updateMetric(syntheticMetric);
                });
            }
        }, 2000); // Ogni 2 secondi
    }
    
    /**
     * Show/hide dashboard
     */
    toggle() {
        if (this.panel.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        if (this.panel) {
            this.panel.style.display = 'block';
        }
    }
    
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }
    
    /**
     * Clear log
     */
    clearLog() {
        const log = document.getElementById('wvd-log');
        if (log) {
            log.innerHTML = '';
        }
    }
    
    /**
     * Export dati performance
     */
    exportData() {
        if (!window.performanceMonitor) return;
        
        const report = window.performanceMonitor.getReport();
        const data = {
            report,
            exportTime: new Date().toISOString(),
            url: window.location.href
        };
        
        // Download come JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `web-vitals-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📊 Web Vitals data exported:', data);
    }
    
    /**
     * Distruggi dashboard
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.panel) {
            this.panel.remove();
        }
        this.isActive = false;
    }
}

// Export per ES6 modules  
export { WebVitalsDashboard };

// Crea istanza globale per debug
window.webVitalsDashboard = new WebVitalsDashboard();