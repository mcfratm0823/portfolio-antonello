/**
 * Portfolio Module - Wrapper per funzionalità portfolio con architettura event-driven
 * @class PortfolioModule
 * @version 2.0.0
 */
class PortfolioModule {
    constructor() {
        this.projectStack = null;
        this.filterSystem = null;
        this.initialized = false;
        this.debug = window.location.search.includes('debug=true');
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Ascolta quando i progetti sono renderizzati
        window.APP_EVENT_BUS.on('projects:rendered', () => {
            this.initializeComponents();
        });
        
        // Ascolta cambiamenti di filtro
        window.APP_EVENT_BUS.on('filter:changed', (data) => {
            this.handleFilterChange(data.filter);
        });
        
        // Ascolta richieste di rotazione
        window.APP_EVENT_BUS.on('stack:rotate', (data) => {
            if (this.projectStack) {
                if (data.direction === 'up') {
                    this.projectStack.rotateUp();
                } else {
                    this.projectStack.rotateDown();
                }
            }
        });
    }
    
    /**
     * Initialize the module
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            if (this.debug) {
                console.log('[PortfolioModule] Already initialized');
            }
            return;
        }
        
        // Track initialization
        if (window.trackModuleInit) {
            window.trackModuleInit('PortfolioModule');
        }
        
        if (this.debug) {
            console.log('[PortfolioModule] Initializing...');
        }
        
        try {
            // Verifica che siamo sulla pagina portfolio
            const isPortfolioPage = window.location.pathname.includes('portfolio');
            if (!isPortfolioPage) {
                if (this.debug) {
                    console.log('[PortfolioModule] Not on portfolio page, skipping initialization');
                }
                return;
            }
            
            // Attendi che i progetti siano caricati
            const projects = window.APP_STATE.get('data.projects');
            if (!projects || projects.length === 0) {
                if (this.debug) {
                    console.log('[PortfolioModule] Waiting for projects to load...');
                }
                
                // Attendi evento di caricamento progetti
                await window.APP_EVENT_BUS.waitFor('data:loaded', 5000);
            }
            
            // Se i progetti sono già nel DOM, inizializza subito
            const projectCards = document.querySelectorAll('.project-card');
            if (projectCards.length > 0) {
                await this.initializeComponents();
            }
            
            this.initialized = true;
            
            if (this.debug) {
                console.log('[PortfolioModule] Initialization complete');
            }
            
        } catch (error) {
            console.error('[PortfolioModule] Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Initialize portfolio components
     * @private
     */
    async initializeComponents() {
        // Previeni inizializzazioni multiple
        if (this.projectStack || this.filterSystem) {
            if (this.debug) {
                console.log('[PortfolioModule] Components already initialized');
            }
            return;
        }
        
        // Verifica che le classi siano disponibili
        if (!window.ProjectStack || !window.FilterSystem) {
            console.error('[PortfolioModule] Required classes not found');
            return;
        }
        
        // Usa requestAnimationFrame per timing ottimale
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                try {
                    // Inizializza ProjectStack se non già fatto
                    if (!window.__PROJECT_STACK_INITIALIZED__) {
                        window.__PROJECT_STACK_INITIALIZED__ = true;
                        this.projectStack = new window.ProjectStack();
                        window.projectStackInstance = this.projectStack;
                        
                        if (this.debug) {
                            console.log('[PortfolioModule] ProjectStack initialized');
                        }
                    } else {
                        this.projectStack = window.projectStackInstance;
                    }
                    
                    // Inizializza FilterSystem se non già fatto
                    if (!window.__FILTER_SYSTEM_INITIALIZED__) {
                        window.__FILTER_SYSTEM_INITIALIZED__ = true;
                        this.filterSystem = new window.FilterSystem();
                        window.filterSystemInstance = this.filterSystem;
                        
                        if (this.debug) {
                            console.log('[PortfolioModule] FilterSystem initialized');
                        }
                    } else {
                        this.filterSystem = window.filterSystemInstance;
                    }
                    
                    // Aggiungi classe mobile se necessario
                    if (window.innerWidth <= (window.CONSTANTS?.BREAKPOINTS?.MOBILE || 768)) {
                        document.body.classList.add('mobile-view');
                    }
                    
                    // Emit initialization complete
                    window.APP_EVENT_BUS.emit('portfolio:initialized', {
                        projectCount: document.querySelectorAll('.project-card').length,
                        filterCount: document.querySelectorAll('.filter-item').length
                    });
                    
                    resolve();
                    
                } catch (error) {
                    console.error('[PortfolioModule] Error initializing components:', error);
                    resolve(); // Risolvi comunque per non bloccare
                }
            });
        });
    }
    
    /**
     * Handle filter change
     * @private
     */
    handleFilterChange(filter) {
        if (!this.filterSystem) return;
        
        // Aggiorna stato
        window.APP_STATE.set('ui.filtersActive', filter);
        
        // Filtra progetti
        const projects = document.querySelectorAll('.project-card');
        let visibleCount = 0;
        
        projects.forEach(project => {
            const category = project.dataset.category;
            if (filter === 'all' || category === filter) {
                project.style.display = 'block';
                visibleCount++;
            } else {
                project.style.display = 'none';
            }
        });
        
        // Reinizializza stack se necessario
        if (this.projectStack && visibleCount > 0) {
            this.projectStack.currentOffset = 0;
            this.projectStack.positionProjects();
        }
        
        // Emit event
        window.APP_EVENT_BUS.emit('portfolio:filtered', {
            filter,
            visibleCount,
            totalCount: projects.length
        });
    }
    
    /**
     * Get current filter
     * @returns {string}
     */
    getCurrentFilter() {
        return window.APP_STATE.get('ui.filtersActive') || 'all';
    }
    
    /**
     * Get visible projects count
     * @returns {number}
     */
    getVisibleProjectsCount() {
        const projects = document.querySelectorAll('.project-card');
        let count = 0;
        projects.forEach(p => {
            if (p.style.display !== 'none') count++;
        });
        return count;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Rimuovi event listeners dal wheel
        if (this.projectStack && this.projectStack.wheelHandler) {
            document.removeEventListener('wheel', this.projectStack.wheelHandler);
        }
        
        // Reset flags
        window.__PROJECT_STACK_INITIALIZED__ = false;
        window.__FILTER_SYSTEM_INITIALIZED__ = false;
        
        // Clear instances
        this.projectStack = null;
        this.filterSystem = null;
        window.projectStackInstance = null;
        window.filterSystemInstance = null;
        
        this.initialized = false;
    }
}

// Registra il modulo se il registry è disponibile
if (window.MODULE_REGISTRY) {
    window.MODULE_REGISTRY.register('portfolio', () => {
        const instance = new PortfolioModule();
        return instance.initialize().then(() => instance);
    }, {
        priority: 30,
        dependencies: ['cms']
    });
}

// Export
window.PortfolioModule = PortfolioModule;