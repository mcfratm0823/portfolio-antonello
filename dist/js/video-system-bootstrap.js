/**
 * Video System Bootstrap
 * Inizializzazione sicura del sistema video professionale
 * Auto-detecting e non-invasivo
 */

(function() {
    'use strict';
    
    // Configurazione bootstrap (usa configurazione globale se disponibile)
    const globalConfig = window.VIDEO_SYSTEM_CONFIG || {};
    const BOOTSTRAP_CONFIG = {
        debug: globalConfig.debug || false,
        maxInitAttempts: globalConfig.maxRetries || 5,
        initDelay: 100,
        fallbackTimeout: 10000,
        enableMetrics: globalConfig.enableMetrics !== false,
        autoInit: globalConfig.autoInit !== false,
        fallbackMode: globalConfig.fallbackMode || false
    };
    
    // Stato bootstrap
    let bootstrapState = {
        initialized: false,
        attempts: 0,
        startTime: 0,
        manager: null,
        errors: []
    };
    
    /**
     * Funzione principale di bootstrap
     */
    async function bootstrap() {
        bootstrapState.startTime = performance.now();
        bootstrapState.attempts++;
        
        log('Starting Video System Bootstrap (attempt ' + bootstrapState.attempts + ')');
        
        try {
            // Check pre-requisiti
            if (!checkPrerequisites()) {
                throw new Error('Prerequisites not met');
            }
            
            // Carica dependenze se necessario
            await loadDependencies();
            
            // Crea e inizializza manager
            const manager = createVideoIntegrationManager();
            
            // Configura opzioni
            const options = {
                debug: BOOTSTRAP_CONFIG.debug,
                controller: {
                    debug: BOOTSTRAP_CONFIG.debug
                }
            };
            
            // Setup hooks se in debug mode
            if (BOOTSTRAP_CONFIG.debug) {
                setupDebugHooks(manager);
            }
            
            // Inizializza
            await manager.initialize(options);
            
            // Salva manager
            bootstrapState.manager = manager;
            bootstrapState.initialized = true;
            
            // Esponi API globali
            exposeGlobalAPI(manager);
            
            // Setup monitoring se abilitato
            if (BOOTSTRAP_CONFIG.enableMetrics) {
                setupMetricsMonitoring(manager);
            }
            
            const initTime = performance.now() - bootstrapState.startTime;
            log('Video System Bootstrap completed in ' + initTime.toFixed(2) + 'ms');
            
            // Dispatch evento personalizzato
            dispatchBootstrapEvent('success', { manager, initTime });
            
            return manager;
            
        } catch (error) {
            bootstrapState.errors.push({
                attempt: bootstrapState.attempts,
                error: error.message,
                timestamp: Date.now()
            });
            
            log('Bootstrap attempt ' + bootstrapState.attempts + ' failed:', error.message);
            
            // Retry logic
            if (bootstrapState.attempts < BOOTSTRAP_CONFIG.maxInitAttempts) {
                const delay = Math.pow(2, bootstrapState.attempts - 1) * BOOTSTRAP_CONFIG.initDelay;
                log('Retrying bootstrap in ' + delay + 'ms...');
                
                setTimeout(bootstrap, delay);
                return;
            }
            
            // Fallback finale
            log('All bootstrap attempts failed, activating emergency fallback');
            activateEmergencyFallback();
            
            dispatchBootstrapEvent('error', { error, attempts: bootstrapState.attempts });
            throw error;
        }
    }
    
    /**
     * Check pre-requisiti per l'inizializzazione
     */
    function checkPrerequisites() {
        log('Checking prerequisites...');
        
        const checks = [
            () => typeof window !== 'undefined',
            () => typeof document !== 'undefined',
            () => document.querySelector('video') !== null,
            () => typeof Promise !== 'undefined',
            () => typeof requestAnimationFrame !== 'undefined'
        ];
        
        for (let i = 0; i < checks.length; i++) {
            if (!checks[i]()) {
                log('Prerequisite check failed at index ' + i);
                return false;
            }
        }
        
        log('Prerequisites check passed');
        return true;
    }
    
    /**
     * Carica dependenze mancanti
     */
    async function loadDependencies() {
        log('Loading dependencies...');
        
        const dependencies = [
            {
                name: 'ProfessionalVideoController',
                test: () => typeof ProfessionalVideoController !== 'undefined',
                src: './js/professional-video-controller.js'
            },
            {
                name: 'VideoIntegrationManager', 
                test: () => typeof VideoIntegrationManager !== 'undefined',
                src: './js/video-integration-manager.js'
            }
        ];
        
        for (const dep of dependencies) {
            if (!dep.test()) {
                log('Loading dependency: ' + dep.name);
                await loadScript(dep.src);
                
                // Aspetta che sia disponibile
                let attempts = 0;
                while (!dep.test() && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 20));
                    attempts++;
                }
                
                if (!dep.test()) {
                    throw new Error('Failed to load dependency: ' + dep.name);
                }
            }
        }
        
        log('Dependencies loaded successfully');
    }
    
    /**
     * Carica script dinamicamente
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load script: ' + src));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Setup hook di debug
     */
    function setupDebugHooks(manager) {
        log('Setting up debug hooks...');
        
        manager.addHook('beforeInit', async (data) => {
            log('Hook: Before init', data);
        });
        
        manager.addHook('afterInit', async (data) => {
            log('Hook: After init - Controller ready');
            
            // Test di base
            setTimeout(() => {
                if (data.controller) {
                    log('Running basic test...');
                    data.controller.safePlay().then(() => {
                        log('Basic test: Play successful');
                    }).catch(e => {
                        log('Basic test: Play failed -', e.message);
                    });
                }
            }, 1000);
        });
        
        manager.addHook('onError', async (data) => {
            log('Hook: Error occurred', data.error.message);
        });
    }
    
    /**
     * Espone API globali per debugging e controllo
     */
    function exposeGlobalAPI(manager) {
        // API pubblica sicura
        window.VideoSystem = {
            // Controlli base
            play: () => manager.play(),
            pause: () => manager.pause(),
            reset: () => manager.reset(),
            
            // Status e debug
            getStatus: () => manager.getStatus(),
            isActive: () => manager.isActive,
            
            // Controllo debug
            enableDebug: () => {
                BOOTSTRAP_CONFIG.debug = true;
                if (manager.controller) {
                    manager.controller.debugMode = true;
                }
                manager.debugMode = true;
            },
            
            disableDebug: () => {
                BOOTSTRAP_CONFIG.debug = false;
                if (manager.controller) {
                    manager.controller.debugMode = false;
                }
                manager.debugMode = false;
            },
            
            // Metrics
            getMetrics: () => ({
                bootstrap: bootstrapState,
                system: manager.getStatus()
            }),
            
            // Emergency controls
            destroy: () => manager.destroy(),
            restart: () => {
                manager.destroy();
                bootstrapState.initialized = false;
                bootstrapState.attempts = 0;
                bootstrap();
            }
        };
        
        // In debug mode, esponi anche internals
        if (BOOTSTRAP_CONFIG.debug) {
            window.VideoSystem._manager = manager;
            window.VideoSystem._bootstrap = bootstrapState;
            window.VideoSystem._config = BOOTSTRAP_CONFIG;
        }
        
        log('Global API exposed');
    }
    
    /**
     * Setup monitoring delle metriche
     */
    function setupMetricsMonitoring(manager) {
        log('Setting up metrics monitoring...');
        
        // Monitoring periodico
        const monitoringInterval = setInterval(() => {
            const status = manager.getStatus();
            
            // Log metriche ogni 30 secondi in debug mode
            if (BOOTSTRAP_CONFIG.debug && Math.random() < 0.1) {
                log('Metrics update:', status.metrics);
            }
            
            // Check salute del sistema
            if (!manager.isActive && status.integrationState !== 'destroyed') {
                log('Warning: System appears inactive');
            }
            
        }, 5000);
        
        // Cleanup monitoring on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(monitoringInterval);
        });
        
        log('Metrics monitoring active');
    }
    
    /**
     * Fallback di emergenza
     */
    function activateEmergencyFallback() {
        log('Activating emergency fallback...');
        
        try {
            const video = document.querySelector('video');
            if (!video) return;
            
            // Setup video base
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            
            // Auto-play quando possibile
            const attemptPlay = () => {
                video.play().catch(e => {
                    log('Emergency fallback play failed:', e.message);
                    
                    // Aspetta interazione utente
                    const events = ['click', 'touchstart', 'keydown'];
                    const handler = () => {
                        video.play().catch(() => {});
                        events.forEach(evt => document.removeEventListener(evt, handler));
                    };
                    events.forEach(evt => document.addEventListener(evt, handler, { once: true }));
                });
            };
            
            if (video.readyState >= 3) {
                attemptPlay();
            } else {
                video.addEventListener('canplay', attemptPlay, { once: true });
            }
            
            // API di emergenza minimale
            window.VideoSystem = {
                play: () => video.play(),
                pause: () => video.pause(),
                reset: () => { video.currentTime = 0; },
                getStatus: () => ({ mode: 'emergency', state: 'active' }),
                isActive: () => true
            };
            
            log('Emergency fallback activated');
            
        } catch (error) {
            log('Emergency fallback failed:', error.message);
        }
    }
    
    /**
     * Dispatch eventi personalizzati
     */
    function dispatchBootstrapEvent(type, detail) {
        const event = new CustomEvent('videosystem:' + type, { detail });
        document.dispatchEvent(event);
        log('Event dispatched: videosystem:' + type);
    }
    
    /**
     * Logging utility
     */
    function log(message, data) {
        if (BOOTSTRAP_CONFIG.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log('[VideoBootstrap ' + timestamp + '] ' + message, data || '');
        }
    }
    
    /**
     * Auto-inizializzazione quando pronto
     */
    function autoInit() {
        // Check se auto-init è abilitato
        if (!BOOTSTRAP_CONFIG.autoInit) {
            log('Auto-initialization disabled by config');
            return;
        }
        
        // Check se siamo nella pagina giusta (con video)
        const hasVideo = document.querySelector('video') || 
                         document.querySelector('#hero-video') ||
                         document.querySelector('#center-video');
        
        if (!hasVideo) {
            log('No video found, skipping initialization');
            return;
        }
        
        if (bootstrapState.initialized) {
            log('Already initialized, skipping');
            return;
        }
        
        // Check se è in modalità fallback forzata
        if (BOOTSTRAP_CONFIG.fallbackMode) {
            log('Fallback mode forced by config');
            activateEmergencyFallback();
            return;
        }
        
        log('Auto-initializing video system...');
        bootstrap().catch(error => {
            log('Auto-initialization failed:', error.message);
        });
    }
    
    // Avvia auto-init quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        // DOM già pronto, avvia dopo un breve delay
        setTimeout(autoInit, BOOTSTRAP_CONFIG.initDelay);
    }
    
    // Esponi funzione di bootstrap manuale
    window.initVideoSystem = bootstrap;
    
    // Event listener per debugging
    document.addEventListener('videosystem:success', (e) => {
        log('Video system initialized successfully');
    });
    
    document.addEventListener('videosystem:error', (e) => {
        log('Video system initialization failed:', e.detail.error.message);
    });
    
})();