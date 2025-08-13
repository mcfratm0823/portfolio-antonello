/**
 * App Initializer - Orchestratore principale dell'inizializzazione
 * @class AppInitializer
 * @version 1.0.0
 */
class AppInitializer {
    constructor() {
        this.debug = window.location.search.includes('debug=true');
        this.initialized = false;
        this.initPromise = null;
        
        // Dipendenze richieste
        this.requiredDependencies = [
            'APP_EVENT_BUS',
            'MODULE_REGISTRY', 
            'APP_STATE'
        ];
        
        // Controlla dipendenze
        this.checkDependencies();
    }
    
    /**
     * Controlla che tutte le dipendenze siano caricate
     * @private
     */
    checkDependencies() {
        const missing = this.requiredDependencies.filter(dep => !window[dep]);
        if (missing.length > 0) {
            throw new Error(`[AppInitializer] Missing dependencies: ${missing.join(', ')}`);
        }
    }
    
    /**
     * Inizializza l'applicazione
     * @returns {Promise<void>}
     */
    async initialize() {
        // Previeni inizializzazioni multiple
        if (this.initialized) {
            if (this.debug) {
                console.warn('[AppInitializer] Already initialized, skipping');
            }
            return this.initPromise;
        }
        
        if (this.initPromise) {
            if (this.debug) {
                console.log('[AppInitializer] Initialization already in progress, waiting...');
            }
            return this.initPromise;
        }
        
        // Crea promise di inizializzazione
        this.initPromise = this._performInitialization();
        
        try {
            await this.initPromise;
            this.initialized = true;
        } catch (error) {
            console.error('[AppInitializer] Initialization failed:', error);
            window.APP_STATE.set('initialization.status', 'error');
            throw error;
        }
        
        return this.initPromise;
    }
    
    /**
     * Esegue l'inizializzazione
     * @private
     */
    async _performInitialization() {
        const startTime = performance.now();
        
        if (this.debug) {
            console.log('[AppInitializer] Starting application initialization...');
        }
        
        // Imposta stato iniziale
        window.APP_STATE.set('initialization.status', 'initializing');
        window.APP_STATE.set('initialization.startTime', Date.now());
        
        // Emit start event
        window.APP_EVENT_BUS.emit('app:initializing');
        
        try {
            // Step 1: Registra moduli core
            await this.registerCoreModules();
            
            // Step 2: Attendi che DOM sia pronto
            await this.waitForDOM();
            
            // Step 3: Registra moduli della pagina
            await this.registerPageModules();
            
            // Step 4: Inizializza tutti i moduli
            await this.initializeModules();
            
            // Step 5: Setup finale
            await this.finalSetup();
            
            const totalTime = performance.now() - startTime;
            
            if (this.debug) {
                console.log(`[AppInitializer] Initialization completed in ${totalTime.toFixed(2)}ms`);
            }
            
            // Emit complete event
            window.APP_EVENT_BUS.emit('app:initialized', { totalTime });
            
        } catch (error) {
            console.error('[AppInitializer] Critical initialization error:', error);
            window.APP_EVENT_BUS.emit('app:error', { error, phase: 'initialization' });
            throw error;
        }
    }
    
    /**
     * Registra moduli core sempre presenti
     * @private
     */
    async registerCoreModules() {
        if (this.debug) {
            console.log('[AppInitializer] Registering core modules...');
        }
        
        // Constants loader
        window.MODULE_REGISTRY.register('constants', async () => {
            // Constants già definite globalmente
            return window.CONSTANTS || {};
        }, { priority: 100 });
        
        // Error handler
        window.MODULE_REGISTRY.register('errorHandler', async () => {
            // Error handler già definito o crea nuovo
            return window.errorHandler || {
                handle: (error, context) => {
                    console.error('[ErrorHandler]', context, error);
                    window.APP_STATE.logError(error, context.component);
                }
            };
        }, { priority: 90 });
        
        // Form validator
        window.MODULE_REGISTRY.register('formValidator', async () => {
            // Return existing FormValidator class
            return window.FormValidator || null;
        }, { priority: 80 });
        
        // Smart preloader
        window.MODULE_REGISTRY.register('smartPreloader', async () => {
            return window.smartImagePreloader || null;
        }, { priority: 70 });
    }
    
    /**
     * Attende che il DOM sia pronto
     * @private
     */
    async waitForDOM() {
        if (document.readyState === 'loading') {
            if (this.debug) {
                console.log('[AppInitializer] Waiting for DOM...');
            }
            
            await new Promise(resolve => {
                const handler = () => {
                    document.removeEventListener('DOMContentLoaded', handler);
                    resolve();
                };
                document.addEventListener('DOMContentLoaded', handler);
            });
        }
        
        if (this.debug) {
            console.log('[AppInitializer] DOM ready');
        }
    }
    
    /**
     * Registra moduli specifici della pagina
     * @private
     */
    async registerPageModules() {
        const path = window.location.pathname;
        const isHomepage = path === '/' || path === '/index.html' || path.endsWith('/');
        const isPortfolioPage = path.includes('portfolio');
        const isProjectDetailPage = path.includes('project-detail');
        
        if (this.debug) {
            console.log('[AppInitializer] Registering page modules for:', path);
        }
        
        // CMS Loader - sempre presente
        window.MODULE_REGISTRY.register('cmsLoader', async () => {
            // Importa il modulo esistente se disponibile
            if (window.CMSLoader) {
                return new window.CMSLoader();
            }
            
            // Altrimenti crea wrapper per funzionalità esistente
            return {
                async loadPageData() {
                    // Usa logica esistente di cms-loader.js
                    const dataElement = document.getElementById('page-data');
                    if (dataElement?.textContent) {
                        try {
                            const data = JSON.parse(dataElement.textContent);
                            window.APP_EVENT_BUS.emit('data:loaded', { 
                                type: 'pageData', 
                                content: data 
                            });
                            return data;
                        } catch (error) {
                            console.error('[CMSLoader] Error parsing page data:', error);
                        }
                    }
                    return null;
                }
            };
        }, { priority: 60 });
        
        // Homepage modules
        if (isHomepage) {
            // Preloader animation
            window.MODULE_REGISTRY.register('preloaderAnimation', async () => {
                return {
                    async animate() {
                        // Logica esistente del preloader
                        const preloaderShown = sessionStorage.getItem('preloaderShown');
                        if (preloaderShown) {
                            const preloader = document.getElementById('preloader');
                            if (preloader) preloader.style.display = 'none';
                            return;
                        }
                        
                        // Esegui animazione preloader
                        await this.performPreloaderAnimation();
                        sessionStorage.setItem('preloaderShown', 'true');
                    },
                    
                    async performPreloaderAnimation() {
                        // Implementazione esistente
                        return new Promise(resolve => {
                            setTimeout(resolve, window.CONSTANTS?.TIMING?.PRELOADER_DURATION || 2500);
                        });
                    }
                };
            }, { priority: 50, dependencies: ['constants'] });
            
            // Hero animation
            window.MODULE_REGISTRY.register('heroAnimation', async () => {
                return {
                    init() {
                        // Logica esistente per animazione hero
                        if (window.innerWidth >= 1024) {
                            // Setup ScrollTrigger animation
                        }
                    }
                };
            }, { priority: 40 });
            
            // Services section
            window.MODULE_REGISTRY.register('servicesSection', async () => {
                return {
                    init() {
                        // Logica esistente per services
                    }
                };
            }, { priority: 30 });
        }
        
        // Portfolio page modules
        if (isPortfolioPage) {
            // Portfolio manager
            window.MODULE_REGISTRY.register('portfolioManager', async () => {
                // Usa classe esistente
                if (window.StaticPortfolio) {
                    return new window.StaticPortfolio();
                }
                return null;
            }, { priority: 40, dependencies: ['cmsLoader'] });
            
            // Project stack
            window.MODULE_REGISTRY.register('projectStack', async () => {
                if (window.ProjectStack && !window.__PROJECT_STACK_INITIALIZED__) {
                    window.__PROJECT_STACK_INITIALIZED__ = true;
                    return new window.ProjectStack();
                }
                return window.projectStackInstance || null;
            }, { priority: 30 });
            
            // Filter system
            window.MODULE_REGISTRY.register('filterSystem', async () => {
                if (window.FilterSystem && !window.__FILTER_SYSTEM_INITIALIZED__) {
                    window.__FILTER_SYSTEM_INITIALIZED__ = true;
                    return new window.FilterSystem();
                }
                return window.filterSystemInstance || null;
            }, { priority: 20 });
        }
        
        // Project detail page modules
        if (isProjectDetailPage) {
            window.MODULE_REGISTRY.register('projectDetail', async () => {
                return {
                    async loadProject() {
                        // Logica per caricare dettagli progetto
                        const urlParams = new URLSearchParams(window.location.search);
                        const projectSlug = urlParams.get('p');
                        
                        if (projectSlug) {
                            // Carica dati progetto
                            window.APP_EVENT_BUS.emit('project:loading', { slug: projectSlug });
                        }
                    }
                };
            }, { priority: 40 });
        }
        
        // Global modules (sempre presenti)
        
        // Global cursor
        window.MODULE_REGISTRY.register('globalCursor', async () => {
            return window.customCursor || null;
        }, { priority: 10 });
        
        // Lazy loader
        window.MODULE_REGISTRY.register('lazyLoader', async () => {
            if (window.PortfolioLazyLoader) {
                return new window.PortfolioLazyLoader();
            }
            return null;
        }, { priority: 10 });
    }
    
    /**
     * Inizializza tutti i moduli registrati
     * @private
     */
    async initializeModules() {
        if (this.debug) {
            console.log('[AppInitializer] Initializing all modules...');
        }
        
        try {
            const results = await window.MODULE_REGISTRY.initializeAll();
            
            if (this.debug) {
                console.log('[AppInitializer] Module initialization results:', results);
            }
            
            // Store module instances
            this.modules = results;
            
        } catch (error) {
            console.error('[AppInitializer] Module initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Setup finale dopo inizializzazione moduli
     * @private
     */
    async finalSetup() {
        if (this.debug) {
            console.log('[AppInitializer] Performing final setup...');
        }
        
        // Setup global error handling
        window.addEventListener('error', (event) => {
            window.APP_STATE.logError(event.error, 'window.error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            window.APP_STATE.logError(new Error(event.reason), 'unhandledRejection');
        });
        
        // Setup performance observer
        if ('PerformanceObserver' in window) {
            try {
                const perfObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            window.APP_STATE.setPerformanceMetric('lcp', entry.startTime);
                        }
                    }
                });
                perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // PerformanceObserver may not support all entry types
            }
        }
        
        // Cleanup initialization tracking
        delete window.__APP_INITIALIZING__;
        
        // Final state update
        window.APP_STATE.set('initialization.status', 'ready');
    }
    
    /**
     * Ottieni istanza di un modulo
     * @param {string} name - Nome del modulo
     * @returns {*} Istanza del modulo
     */
    getModule(name) {
        return window.MODULE_REGISTRY.get(name);
    }
    
    /**
     * Verifica se inizializzato
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
    
    /**
     * Attendi inizializzazione
     * @returns {Promise<void>}
     */
    async waitForInit() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;
        
        // Wait for initialization event
        return window.APP_EVENT_BUS.waitFor('app:initialized', 10000);
    }
}

// Singleton globale
window.APP_INITIALIZER = new AppInitializer();

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppInitializer;
}