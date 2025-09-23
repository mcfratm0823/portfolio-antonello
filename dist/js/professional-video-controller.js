/**
 * Professional Video Controller
 * Soluzione definitiva per il controllo video senza interruzioni
 * Approccio non-invasivo con wrapper pattern
 */

class ProfessionalVideoController {
    constructor() {
        this.state = 'uninitialized';
        this.video = null;
        this.canPlayPromise = null;
        this.isUserInitiated = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.isLocked = false;
        this.debugMode = false;
        
        // Event management
        this.eventListeners = new Map();
        this.cleanupFunctions = [];
        
        // Performance monitoring
        this.metrics = {
            playAttempts: 0,
            playSuccesses: 0,
            errors: 0,
            lastPlayTime: 0
        };
        
        // Bind methods
        this.handleVideoEvent = this.handleVideoEvent.bind(this);
        this.safePlay = this.safePlay.bind(this);
        this.safePause = this.safePause.bind(this);
    }

    /**
     * Inizializzazione sicura del controller
     */
    async initialize(videoElement, options = {}) {
        if (this.state !== 'uninitialized') {
            this.log('Controller already initialized');
            return this;
        }

        this.state = 'initializing';
        this.video = videoElement;
        this.debugMode = options.debug || false;
        
        this.log('Initializing Professional Video Controller');

        try {
            // Cleanup eventuali listener esistenti
            await this.cleanupExistingListeners();
            
            // Setup nuovo sistema di eventi
            await this.setupEventListeners();
            
            // Gestione stato iniziale
            await this.handleInitialState();
            
            // Creazione wrapper
            this.createVideoWrapper();
            
            this.state = 'ready';
            this.log('Controller initialized successfully');
            
            return this;
            
        } catch (error) {
            this.state = 'error';
            this.handleError('Initialization failed', error);
            throw error;
        }
    }

    /**
     * Cleanup listener esistenti per prevenire conflitti
     */
    async cleanupExistingListeners() {
        const events = [
            'loadstart', 'loadeddata', 'loadedmetadata', 'canplay', 
            'canplaythrough', 'play', 'pause', 'seeking', 'seeked', 
            'timeupdate', 'ended', 'error', 'stalled', 'waiting'
        ];

        events.forEach(eventType => {
            // Clona il video element per rimuovere tutti i listener
            const newVideo = this.video.cloneNode(true);
            this.video.parentNode?.replaceChild(newVideo, this.video);
            this.video = newVideo;
        });

        this.log('Cleaned up existing event listeners');
    }

    /**
     * Setup eventi consolidati
     */
    async setupEventListeners() {
        const events = {
            'loadeddata': () => this.handleLoadedData(),
            'canplay': () => this.handleCanPlay(),
            'canplaythrough': () => this.handleCanPlayThrough(),
            'play': () => this.handlePlay(),
            'pause': () => this.handlePause(),
            'seeking': () => this.handleSeeking(),
            'seeked': () => this.handleSeeked(),
            'timeupdate': () => this.handleTimeUpdate(),
            'ended': () => this.handleEnded(),
            'error': (e) => this.handleVideoError(e),
            'stalled': () => this.handleStalled(),
            'waiting': () => this.handleWaiting()
        };

        Object.entries(events).forEach(([event, handler]) => {
            this.video.addEventListener(event, handler, { passive: true });
            this.eventListeners.set(event, handler);
        });

        this.log('Event listeners setup completed');
    }

    /**
     * Gestione stato iniziale del video
     */
    async handleInitialState() {
        // Assicurati che il video sia pronto
        if (this.video.readyState >= 2) {
            await this.handleCanPlay();
        }
        
        // Configura attributi base
        this.video.muted = true;
        this.video.loop = true;
        this.video.playsInline = true;
        
        // Preload strategico
        if (this.video.preload !== 'auto') {
            this.video.preload = 'metadata';
        }

        this.log('Initial state configured');
    }

    /**
     * Creazione wrapper per intercettare chiamate
     */
    createVideoWrapper() {
        const controller = this;
        
        // Backup metodi originali
        const originalPlay = this.video.play.bind(this.video);
        const originalPause = this.video.pause.bind(this.video);
        
        // Override metodo play
        this.video.play = function() {
            return controller.safePlay();
        };
        
        // Override metodo pause
        this.video.pause = function() {
            return controller.safePause();
        };
        
        // Protezione currentTime
        let originalCurrentTime = this.video.currentTime;
        Object.defineProperty(this.video, 'currentTime', {
            get() {
                return originalCurrentTime;
            },
            set(value) {
                if (controller.isLocked) {
                    controller.log('Blocked currentTime change while locked');
                    return;
                }
                originalCurrentTime = value;
                // Usa requestAnimationFrame per evitare blocking
                requestAnimationFrame(() => {
                    this.currentTime = value;
                });
            }
        });

        this.log('Video wrapper created');
    }

    /**
     * Play sicuro con retry logic
     */
    async safePlay() {
        if (this.state === 'error' || !this.video) {
            this.log('Cannot play: invalid state');
            return Promise.reject(new Error('Invalid state for play'));
        }

        this.metrics.playAttempts++;
        this.metrics.lastPlayTime = Date.now();

        // Se c'è già una promise di play in corso, aspettala
        if (this.canPlayPromise) {
            try {
                await this.canPlayPromise;
            } catch (e) {
                // Ignora errori precedenti
            }
        }

        try {
            this.log('Attempting to play video');
            this.canPlayPromise = this.video.play();
            await this.canPlayPromise;
            
            this.metrics.playSuccesses++;
            this.retryCount = 0;
            this.log('Video play successful');
            
            return this.canPlayPromise;
            
        } catch (error) {
            this.canPlayPromise = null;
            this.handlePlayError(error);
            
            // Retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.log(`Play failed, retrying (${this.retryCount}/${this.maxRetries})`);
                
                // Exponential backoff
                const delay = Math.pow(2, this.retryCount - 1) * 100;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return this.safePlay();
            }
            
            throw error;
        }
    }

    /**
     * Pause sicuro
     */
    safePause() {
        if (!this.video) return;
        
        try {
            this.log('Pausing video');
            this.video.pause();
            this.canPlayPromise = null;
        } catch (error) {
            this.handleError('Pause failed', error);
        }
    }

    /**
     * Lock del video per prevenire modifiche esterne
     */
    lockVideo() {
        this.isLocked = true;
        this.log('Video locked');
    }

    /**
     * Unlock del video
     */
    unlockVideo() {
        this.isLocked = false;
        this.log('Video unlocked');
    }

    /**
     * Reset sicuro del video
     */
    async resetVideo() {
        this.log('Resetting video');
        
        this.lockVideo();
        
        try {
            this.safePause();
            
            // Aspetta che il video sia fermo
            await new Promise(resolve => {
                if (this.video.paused) {
                    resolve();
                } else {
                    this.video.addEventListener('pause', resolve, { once: true });
                }
            });
            
            // Reset sicuro al primo frame
            if (this.video.currentTime !== 0) {
                this.video.currentTime = 0;
                
                // Aspetta il seek
                await new Promise(resolve => {
                    if (this.video.currentTime === 0) {
                        resolve();
                    } else {
                        this.video.addEventListener('seeked', resolve, { once: true });
                    }
                });
            }
            
        } finally {
            this.unlockVideo();
        }
        
        this.log('Video reset completed');
    }

    /**
     * Event Handlers
     */
    handleVideoEvent(event) {
        this.log(`Video event: ${event.type}`);
    }

    handleLoadedData() {
        this.log('Video data loaded');
        this.state = 'loaded';
    }

    handleCanPlay() {
        this.log('Video can play');
        if (this.state === 'initializing' || this.state === 'loaded') {
            this.state = 'ready';
        }
    }

    handleCanPlayThrough() {
        this.log('Video can play through');
    }

    handlePlay() {
        this.log('Video play event');
    }

    handlePause() {
        this.log('Video pause event');
        this.canPlayPromise = null;
    }

    handleSeeking() {
        this.log('Video seeking');
    }

    handleSeeked() {
        this.log('Video seeked');
    }

    handleTimeUpdate() {
        // Throttled logging per performance
        if (this.debugMode && Math.random() < 0.01) {
            this.log(`Time update: ${this.video.currentTime}`);
        }
    }

    handleEnded() {
        this.log('Video ended');
        this.canPlayPromise = null;
    }

    handleVideoError(event) {
        const error = this.video.error;
        this.handleError('Video error', error);
    }

    handleStalled() {
        this.log('Video stalled');
    }

    handleWaiting() {
        this.log('Video waiting');
    }

    /**
     * Error handling
     */
    handlePlayError(error) {
        this.metrics.errors++;
        
        if (error.name === 'NotAllowedError') {
            this.log('Play prevented by browser policy');
            // Aspetta interazione utente
            this.waitForUserInteraction();
        } else if (error.name === 'AbortError') {
            this.log('Play aborted');
        } else {
            this.handleError('Play error', error);
        }
    }

    handleError(message, error) {
        this.metrics.errors++;
        console.error(`[VideoController] ${message}:`, error);
        
        if (this.debugMode) {
            this.showErrorNotification(message, error);
        }
    }

    /**
     * Aspetta interazione utente per autoplay
     */
    waitForUserInteraction() {
        if (this.isUserInitiated) return;
        
        const events = ['click', 'touchstart', 'keydown'];
        const handler = () => {
            this.isUserInitiated = true;
            events.forEach(event => {
                document.removeEventListener(event, handler);
            });
            
            this.log('User interaction detected, attempting play');
            this.safePlay().catch(e => this.log('Play after interaction failed', e));
        };
        
        events.forEach(event => {
            document.addEventListener(event, handler, { once: true, passive: true });
        });
    }

    /**
     * Cleanup completo
     */
    destroy() {
        this.log('Destroying controller');
        
        // Rimuovi tutti gli event listeners
        this.eventListeners.forEach((handler, event) => {
            this.video.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
        
        // Esegui cleanup functions
        this.cleanupFunctions.forEach(fn => fn());
        this.cleanupFunctions = [];
        
        // Reset stato
        this.state = 'destroyed';
        this.video = null;
        this.canPlayPromise = null;
    }

    /**
     * Utility: Logging condizionale
     */
    log(message, data = null) {
        if (this.debugMode) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[VideoController ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * Get metrics per monitoring
     */
    getMetrics() {
        return {
            ...this.metrics,
            state: this.state,
            retryCount: this.retryCount,
            isLocked: this.isLocked,
            successRate: this.metrics.playAttempts > 0 ? 
                (this.metrics.playSuccesses / this.metrics.playAttempts * 100).toFixed(2) + '%' : '0%'
        };
    }

    /**
     * Notifica errori in debug mode
     */
    showErrorNotification(message, error) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 4px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
        `;
        notification.textContent = `${message}: ${error.message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Factory function per creare l'istanza
function createProfessionalVideoController() {
    return new ProfessionalVideoController();
}

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProfessionalVideoController, createProfessionalVideoController };
}

// Global per browser
if (typeof window !== 'undefined') {
    window.ProfessionalVideoController = ProfessionalVideoController;
    window.createProfessionalVideoController = createProfessionalVideoController;
}