/**
 * Video Integration Manager
 * Integrazione sicura del Video Controller con il sistema esistente
 * Approccio non-invasivo con feature detection e fallback
 */

class VideoIntegrationManager {
    constructor() {
        this.controller = null;
        this.originalVideo = null;
        this.isActive = false;
        this.integrationState = 'pending';
        this.fallbackMode = false;
        this.debugMode = false;
        
        // Feature detection
        this.features = {
            gsapAvailable: false,
            scrollTriggerAvailable: false,
            bundleLoaded: false,
            domReady: false
        };
        
        // Integration hooks
        this.hooks = {
            beforeInit: [],
            afterInit: [],
            beforePlay: [],
            afterPlay: [],
            onError: []
        };
        
        // Performance monitoring
        this.metrics = {
            integrationTime: 0,
            initAttempts: 0,
            fallbackActivations: 0
        };
    }

    /**
     * Inizializzazione principale dell'integrazione
     */
    async initialize(options = {}) {
        const startTime = performance.now();
        this.metrics.initAttempts++;
        
        this.debugMode = options.debug || false;
        this.log('Starting Video Integration Manager');

        try {
            // Feature detection
            await this.detectFeatures();
            
            // Aspetta che tutto sia pronto
            await this.waitForReadiness();
            
            // Trova e prepara il video
            const video = await this.findVideoElement();
            
            // Hook: before init
            await this.executeHooks('beforeInit', { video });
            
            // Crea e inizializza il controller
            await this.initializeController(video, options);
            
            // Setup integrazione GSAP se disponibile
            if (this.features.gsapAvailable) {
                await this.setupGSAPIntegration();
            }
            
            // Setup navigation handling
            await this.setupNavigationHandling();
            
            // Hook: after init
            await this.executeHooks('afterInit', { controller: this.controller });
            
            this.integrationState = 'active';
            this.isActive = true;
            
            this.metrics.integrationTime = performance.now() - startTime;
            this.log(`Integration completed in ${this.metrics.integrationTime.toFixed(2)}ms`);
            
            return this;
            
        } catch (error) {
            this.integrationState = 'error';
            await this.activateFallback(error);
            throw error;
        }
    }

    /**
     * Feature detection per compatibilità
     */
    async detectFeatures() {
        this.log('Detecting features...');
        
        // Check GSAP
        this.features.gsapAvailable = typeof gsap !== 'undefined';
        this.features.scrollTriggerAvailable = typeof ScrollTrigger !== 'undefined';
        
        // Check se il bundle principale è caricato
        this.features.bundleLoaded = this.checkBundleLoaded();
        
        // Check DOM ready
        this.features.domReady = document.readyState !== 'loading';
        
        this.log('Features detected:', this.features);
    }

    /**
     * Controlla se il bundle principale è caricato
     */
    checkBundleLoaded() {
        // Cerca indicatori che il bundle Vite sia caricato
        const indicators = [
            () => document.querySelector('script[src*="index-"]'),
            () => window.USING_MODULES !== undefined,
            () => document.querySelector('#hero-video'),
            () => document.querySelector('#preloader')
        ];
        
        return indicators.some(check => {
            try {
                return check();
            } catch (e) {
                return false;
            }
        });
    }

    /**
     * Aspetta che tutto sia pronto per l'integrazione
     */
    async waitForReadiness() {
        this.log('Waiting for readiness...');
        
        // Aspetta DOM ready
        if (!this.features.domReady) {
            await new Promise(resolve => {
                if (document.readyState !== 'loading') {
                    resolve();
                } else {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                }
            });
        }
        
        // Aspetta che il bundle sia caricato
        let attempts = 0;
        const maxAttempts = 50; // 5 secondi max
        
        while (!this.features.bundleLoaded && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            this.features.bundleLoaded = this.checkBundleLoaded();
            attempts++;
        }
        
        if (!this.features.bundleLoaded) {
            this.log('Warning: Bundle not detected, proceeding anyway');
        }
        
        // Aspetta un frame per assicurarsi che tutto sia renderizzato
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        this.log('Readiness check completed');
    }

    /**
     * Trova l'elemento video target
     */
    async findVideoElement() {
        this.log('Looking for video element...');
        
        const selectors = [
            '#hero-video',
            'video[src*="intro"]',
            '#center-video video',
            'video[muted][loop]',
            'video'
        ];
        
        for (const selector of selectors) {
            const video = document.querySelector(selector);
            if (video && video.tagName === 'VIDEO') {
                this.log(`Video found with selector: ${selector}`);
                this.originalVideo = video;
                return video;
            }
        }
        
        throw new Error('Video element not found');
    }

    /**
     * Inizializza il controller video
     */
    async initializeController(video, options) {
        this.log('Initializing video controller...');
        
        if (typeof ProfessionalVideoController === 'undefined') {
            throw new Error('ProfessionalVideoController not available');
        }
        
        this.controller = new ProfessionalVideoController();
        
        const controllerOptions = {
            debug: this.debugMode,
            ...options.controller
        };
        
        await this.controller.initialize(video, controllerOptions);
        
        // Esponi il controller globalmente per debug
        if (this.debugMode) {
            window.__videoController = this.controller;
            window.__videoIntegration = this;
        }
        
        this.log('Video controller initialized');
    }

    /**
     * Setup integrazione con GSAP
     */
    async setupGSAPIntegration() {
        if (!this.features.gsapAvailable) return;
        
        this.log('Setting up GSAP integration...');
        
        // Monkey patch GSAP per video safety
        const originalSet = gsap.set;
        const controller = this.controller;
        
        gsap.set = function(targets, vars, ...args) {
            // Se il target è il nostro video, filtra le proprietà pericolose
            if (targets === controller.video || 
                (targets && targets.length && Array.from(targets).includes(controller.video))) {
                
                const safeVars = { ...vars };
                
                // Blocca currentTime se il video è locked
                if ('currentTime' in safeVars && controller.isLocked) {
                    controller.log('GSAP currentTime blocked - video is locked');
                    delete safeVars.currentTime;
                }
                
                // Intercetta play/pause
                if ('play' in safeVars || 'pause' in safeVars) {
                    controller.log('GSAP video control intercepted');
                    delete safeVars.play;
                    delete safeVars.pause;
                    
                    // Usa i metodi sicuri del controller
                    requestAnimationFrame(() => {
                        if (vars.play) controller.safePlay();
                        if (vars.pause) controller.safePause();
                    });
                }
                
                return originalSet.call(this, targets, safeVars, ...args);
            }
            
            return originalSet.call(this, targets, vars, ...args);
        };
        
        // Se ScrollTrigger è disponibile, setup protezioni aggiuntive
        if (this.features.scrollTriggerAvailable) {
            this.setupScrollTriggerIntegration();
        }
        
        this.log('GSAP integration completed');
    }

    /**
     * Setup integrazione con ScrollTrigger
     */
    setupScrollTriggerIntegration() {
        this.log('Setting up ScrollTrigger integration...');
        
        // Hook into ScrollTrigger refresh per gestire il video
        const originalRefresh = ScrollTrigger.refresh;
        const controller = this.controller;
        
        ScrollTrigger.refresh = function(...args) {
            controller.log('ScrollTrigger refresh detected');
            
            // Proteggi il video durante il refresh
            controller.lockVideo();
            
            const result = originalRefresh.apply(this, args);
            
            // Sblocca dopo un frame
            requestAnimationFrame(() => {
                controller.unlockVideo();
            });
            
            return result;
        };
        
        this.log('ScrollTrigger integration completed');
    }

    /**
     * Setup gestione navigazione
     */
    async setupNavigationHandling() {
        this.log('Setting up navigation handling...');
        
        // Gestione navigation API
        if ('navigation' in window) {
            window.navigation.addEventListener('navigate', (event) => {
                this.handleNavigation(event);
            });
        }
        
        // Fallback per browser più vecchi
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });
        
        // Gestione page visibility
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Gestione focus/blur
        window.addEventListener('focus', () => {
            this.handleWindowFocus();
        });
        
        window.addEventListener('blur', () => {
            this.handleWindowBlur();
        });
        
        this.log('Navigation handling setup completed');
    }

    /**
     * Event Handlers per navigazione
     */
    handleNavigation(event) {
        this.log('Navigation detected:', event.destination?.url);
        
        if (this.controller && this.isActive) {
            // Pausa il video durante la navigazione
            this.controller.safePause();
        }
    }

    handleBeforeUnload() {
        this.log('Page unloading');
        
        if (this.controller && this.isActive) {
            this.controller.safePause();
        }
    }

    handleVisibilityChange() {
        const isVisible = !document.hidden;
        this.log(`Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
        
        if (this.controller && this.isActive) {
            if (isVisible) {
                // Riprendi il video quando la pagina diventa visibile
                setTimeout(() => {
                    this.controller.safePlay().catch(e => 
                        this.log('Auto-resume failed:', e.message)
                    );
                }, 100);
            } else {
                // Pausa quando diventa nascosta
                this.controller.safePause();
            }
        }
    }

    handleWindowFocus() {
        this.log('Window focused');
        
        if (this.controller && this.isActive) {
            // Riprendi il video quando la finestra riceve focus
            setTimeout(() => {
                this.controller.safePlay().catch(e => 
                    this.log('Focus resume failed:', e.message)
                );
            }, 100);
        }
    }

    handleWindowBlur() {
        this.log('Window blurred');
        
        if (this.controller && this.isActive) {
            this.controller.safePause();
        }
    }

    /**
     * Attiva fallback mode in caso di errori
     */
    async activateFallback(error) {
        this.log('Activating fallback mode due to error:', error.message);
        this.metrics.fallbackActivations++;
        this.fallbackMode = true;
        
        // Esegui hooks di errore
        await this.executeHooks('onError', { error, manager: this });
        
        // Fallback: gestione video base
        if (this.originalVideo) {
            this.setupBasicVideoFallback();
        }
    }

    /**
     * Setup fallback base per il video
     */
    setupBasicVideoFallback() {
        this.log('Setting up basic video fallback');
        
        const video = this.originalVideo;
        
        // Gestione base play/pause
        const safePlay = async () => {
            try {
                await video.play();
            } catch (e) {
                console.warn('Fallback play failed:', e.message);
            }
        };
        
        const safePause = () => {
            try {
                video.pause();
            } catch (e) {
                console.warn('Fallback pause failed:', e.message);
            }
        };
        
        // Auto-play quando pronto
        if (video.readyState >= 3) {
            safePlay();
        } else {
            video.addEventListener('canplay', safePlay, { once: true });
        }
        
        // Gestione base degli errori
        video.addEventListener('error', (e) => {
            console.error('Video fallback error:', e);
        });
        
        this.log('Basic video fallback active');
    }

    /**
     * Sistema di hook per estensibilità
     */
    addHook(event, callback) {
        if (this.hooks[event]) {
            this.hooks[event].push(callback);
            this.log(`Hook added for ${event}`);
        }
    }

    async executeHooks(event, data = {}) {
        if (!this.hooks[event]) return;
        
        this.log(`Executing ${this.hooks[event].length} hooks for ${event}`);
        
        for (const callback of this.hooks[event]) {
            try {
                await callback(data);
            } catch (error) {
                this.log(`Hook error in ${event}:`, error.message);
            }
        }
    }

    /**
     * API pubbliche per controllo
     */
    play() {
        if (this.controller && this.isActive) {
            return this.controller.safePlay();
        } else if (this.fallbackMode && this.originalVideo) {
            return this.originalVideo.play();
        }
        return Promise.reject(new Error('No active video controller'));
    }

    pause() {
        if (this.controller && this.isActive) {
            this.controller.safePause();
        } else if (this.fallbackMode && this.originalVideo) {
            this.originalVideo.pause();
        }
    }

    reset() {
        if (this.controller && this.isActive) {
            return this.controller.resetVideo();
        }
        return Promise.resolve();
    }

    /**
     * Cleanup e destroy
     */
    destroy() {
        this.log('Destroying integration manager');
        
        if (this.controller) {
            this.controller.destroy();
        }
        
        this.isActive = false;
        this.integrationState = 'destroyed';
        
        // Cleanup hooks
        Object.keys(this.hooks).forEach(key => {
            this.hooks[key] = [];
        });
    }

    /**
     * Get status e metrics
     */
    getStatus() {
        return {
            isActive: this.isActive,
            integrationState: this.integrationState,
            fallbackMode: this.fallbackMode,
            features: this.features,
            metrics: this.metrics,
            controllerMetrics: this.controller ? this.controller.getMetrics() : null
        };
    }

    /**
     * Logging utility
     */
    log(message, data = null) {
        if (this.debugMode) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[VideoIntegration ${timestamp}] ${message}`, data || '');
        }
    }
}

// Factory function
function createVideoIntegrationManager() {
    return new VideoIntegrationManager();
}

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VideoIntegrationManager, createVideoIntegrationManager };
}

// Global per browser
if (typeof window !== 'undefined') {
    window.VideoIntegrationManager = VideoIntegrationManager;
    window.createVideoIntegrationManager = createVideoIntegrationManager;
}