/**
 * Video Manager - Gestione centralizzata e robusta del video hero
 * @class VideoManager
 * @version 1.0.0
 * 
 * Risolve problemi di:
 * - Race conditions tra moduli
 * - Multiple inizializzazioni
 * - Event listener duplication
 * - Gestione stato inconsistente
 */
class VideoManager {
    constructor() {
        this.video = null;
        this.initialized = false;
        this.isPlaying = false;
        this.loadAttempts = 0;
        this.maxLoadAttempts = 3;
        this.eventListeners = new Map();
        this.debug = window.location.search.includes('debug=true');
        this.pendingSeek = false;
        
        // Video states
        this.VIDEO_STATES = {
            UNINITIALIZED: 'uninitialized',
            LOADING: 'loading',
            READY: 'ready',
            PLAYING: 'playing',
            PAUSED: 'paused',
            ERROR: 'error'
        };
        
        this.currentState = this.VIDEO_STATES.UNINITIALIZED;
        
        // Bind methods
        this.handleLoadedData = this.handleLoadedData.bind(this);
        this.handleCanPlay = this.handleCanPlay.bind(this);
        this.handleSeeked = this.handleSeeked.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleLoadStart = this.handleLoadStart.bind(this);
        this.handleStalled = this.handleStalled.bind(this);
        this.handleSuspend = this.handleSuspend.bind(this);
        
        if (this.debug) {
            console.log('[VideoManager] Instance created');
        }
    }
    
    /**
     * Initialize video manager
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.initialized) {
            if (this.debug) {
                console.log('[VideoManager] Already initialized, skipping');
            }
            return true;
        }
        
        const video = document.getElementById('hero-video');
        if (!video) {
            console.warn('[VideoManager] Video element not found');
            return false;
        }
        
        this.video = video;
        this.setState(this.VIDEO_STATES.LOADING);
        
        // Clean any existing state
        this.cleanup();
        
        // Setup video configuration
        this.setupVideoConfiguration();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize video loading
        await this.initializeVideoLoading();
        
        this.initialized = true;
        
        if (this.debug) {
            console.log('[VideoManager] Initialization complete');
        }
        
        return true;
    }
    
    /**
     * Setup video configuration
     * @private
     */
    setupVideoConfiguration() {
        if (!this.video) return;
        
        // Ensure proper video attributes
        this.video.muted = true;
        this.video.loop = true;
        this.video.playsInline = true;
        this.video.preload = 'metadata';
        this.video.autoplay = false; // Controlled manually
        
        // Reset to first frame
        this.video.currentTime = 0;
        
        // Ensure video is paused initially
        if (!this.video.paused) {
            this.video.pause();
        }
        
        if (this.debug) {
            console.log('[VideoManager] Video configuration set');
        }
    }
    
    /**
     * Setup event listeners with cleanup tracking
     * @private
     */
    setupEventListeners() {
        if (!this.video) return;
        
        const events = [
            ['loadeddata', this.handleLoadedData, { once: true }],
            ['canplay', this.handleCanPlay],
            ['seeked', this.handleSeeked],
            ['error', this.handleError],
            ['loadstart', this.handleLoadStart],
            ['stalled', this.handleStalled],
            ['suspend', this.handleSuspend]
        ];
        
        events.forEach(([event, handler, options = {}]) => {
            this.video.addEventListener(event, handler, options);
            this.eventListeners.set(event, { handler, options });
        });
        
        if (this.debug) {
            console.log('[VideoManager] Event listeners attached');
        }
    }
    
    /**
     * Initialize video loading with retry logic
     * @private
     */
    async initializeVideoLoading() {
        if (!this.video) return false;
        
        return new Promise((resolve) => {
            // Set timeout for loading
            const loadTimeout = setTimeout(() => {
                if (this.currentState === this.VIDEO_STATES.LOADING) {
                    this.handleLoadError('Timeout during video load');
                    resolve(false);
                }
            }, 10000); // 10 second timeout
            
            // Success handler
            const onSuccess = () => {
                clearTimeout(loadTimeout);
                resolve(true);
            };
            
            // Store success handler for cleanup
            this.loadSuccessHandler = onSuccess;
            
            try {
                this.video.load();
                this.loadAttempts++;
                
                if (this.debug) {
                    console.log(`[VideoManager] Load attempt ${this.loadAttempts}`);
                }
                
            } catch (error) {
                clearTimeout(loadTimeout);
                this.handleLoadError(error);
                resolve(false);
            }
        });
    }
    
    /**
     * Handle loaded data event
     * @private
     */
    handleLoadedData() {
        if (!this.video || this.currentState !== this.VIDEO_STATES.LOADING) {
            return;
        }
        
        try {
            // Ensure paused state first
            if (!this.video.paused) {
                this.video.pause();
            }
            
            // Don't seek immediately - wait for canplay or use safer approach
            this.prepareFirstFrame();
            
        } catch (error) {
            this.handleLoadError(error);
        }
    }
    
    /**
     * Prepare first frame with safe seeking strategy
     * @private
     */
    prepareFirstFrame() {
        if (!this.video) return;
        
        // Strategy 1: If video duration is available, we can seek safely
        if (this.video.duration && this.video.duration > 0) {
            this.performSafeSeek();
        } else {
            // Strategy 2: Wait for more video data
            this.waitForVideoReadiness();
        }
    }
    
    /**
     * Perform safe seek to first frame
     * @private
     */
    performSafeSeek() {
        if (!this.video) return;
        
        try {
            // Use very small offset to ensure we're not at exactly 0
            const seekTime = Math.min(0.1, this.video.duration * 0.01);
            this.video.currentTime = seekTime;
            
            // Wait for seeked event before marking as ready
            this.pendingSeek = true;
            
            if (this.debug) {
                console.log(`[VideoManager] Seeking to ${seekTime}s`);
            }
            
        } catch (error) {
            // If seek fails, try without seeking
            this.finalizeVideoReady();
        }
    }
    
    /**
     * Wait for video to be fully ready
     * @private
     */
    waitForVideoReadiness() {
        if (!this.video) return;
        
        // Set up a one-time listener for when we can play
        const readyHandler = () => {
            this.video.removeEventListener('canplaythrough', readyHandler);
            this.performSafeSeek();
        };
        
        this.video.addEventListener('canplaythrough', readyHandler, { once: true });
        
        // Fallback timeout - don't wait forever
        setTimeout(() => {
            this.video.removeEventListener('canplaythrough', readyHandler);
            this.finalizeVideoReady();
        }, 2000);
    }
    
    /**
     * Finalize video ready state
     * @private
     */
    finalizeVideoReady() {
        if (!this.video || this.currentState !== this.VIDEO_STATES.LOADING) {
            return;
        }
        
        // Make video visible
        this.video.style.opacity = '1';
        
        // Set ready state
        this.setState(this.VIDEO_STATES.READY);
        
        // Call success handler if exists
        if (this.loadSuccessHandler) {
            this.loadSuccessHandler();
            this.loadSuccessHandler = null;
        }
        
        if (this.debug) {
            console.log('[VideoManager] Video ready');
        }
    }
    
    /**
     * Handle can play event
     * @private
     */
    handleCanPlay() {
        if (this.debug) {
            console.log('[VideoManager] Video can play');
        }
    }
    
    /**
     * Handle seeked event
     * @private
     */
    handleSeeked() {
        if (!this.video || !this.pendingSeek) {
            return;
        }
        
        this.pendingSeek = false;
        
        if (this.debug) {
            console.log(`[VideoManager] Seek completed to ${this.video.currentTime}s`);
        }
        
        // Now that seek is complete, finalize ready state
        this.finalizeVideoReady();
    }
    
    /**
     * Handle error event
     * @private
     */
    handleError(event) {
        const error = this.video ? this.video.error : event;
        this.handleLoadError(error);
    }
    
    /**
     * Handle load start event
     * @private
     */
    handleLoadStart() {
        if (this.debug) {
            console.log('[VideoManager] Load started');
        }
    }
    
    /**
     * Handle stalled event
     * @private
     */
    handleStalled() {
        if (this.debug) {
            console.log('[VideoManager] Video stalled');
        }
        
        // Attempt to resume after stall
        if (this.video && this.currentState === this.VIDEO_STATES.PLAYING) {
            setTimeout(() => {
                this.tryPlay();
            }, 1000);
        }
    }
    
    /**
     * Handle suspend event
     * @private
     */
    handleSuspend() {
        if (this.debug) {
            console.log('[VideoManager] Video suspended');
        }
    }
    
    /**
     * Handle load errors with retry logic
     * @private
     */
    handleLoadError(error) {
        console.error('[VideoManager] Load error:', error);
        
        this.setState(this.VIDEO_STATES.ERROR);
        
        if (this.loadAttempts < this.maxLoadAttempts) {
            setTimeout(() => {
                if (this.debug) {
                    console.log(`[VideoManager] Retrying load (${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
                }
                this.initializeVideoLoading();
            }, 2000);
        } else {
            console.error('[VideoManager] Max load attempts reached, giving up');
            
            // Fallback: show first frame as static image
            if (this.video) {
                this.video.style.opacity = '1';
                this.video.poster = this.video.currentSrc || '';
            }
        }
    }
    
    /**
     * Start video playback safely
     * @param {number} delay - Optional delay before starting
     * @returns {Promise<boolean>} Success status
     */
    async startPlayback(delay = 0) {
        if (!this.video || this.currentState === this.VIDEO_STATES.ERROR) {
            return false;
        }
        
        // Wait for video to be ready
        if (this.currentState !== this.VIDEO_STATES.READY && this.currentState !== this.VIDEO_STATES.PAUSED) {
            if (this.debug) {
                console.log('[VideoManager] Waiting for video to be ready...');
            }
            
            // Wait up to 5 seconds for ready state
            const waitForReady = new Promise((resolve) => {
                const checkReady = () => {
                    if (this.currentState === this.VIDEO_STATES.READY || this.currentState === this.VIDEO_STATES.PAUSED) {
                        resolve(true);
                    } else if (this.currentState === this.VIDEO_STATES.ERROR) {
                        resolve(false);
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                setTimeout(() => resolve(false), 5000); // 5 second timeout
                checkReady();
            });
            
            const isReady = await waitForReady;
            if (!isReady) {
                console.warn('[VideoManager] Video not ready for playback');
                return false;
            }
        }
        
        return new Promise((resolve) => {
            const startPlay = () => {
                this.tryPlay().then(resolve);
            };
            
            if (delay > 0) {
                setTimeout(startPlay, delay);
            } else {
                startPlay();
            }
        });
    }
    
    /**
     * Try to play video with error handling
     * @private
     * @returns {Promise<boolean>}
     */
    async tryPlay() {
        if (!this.video) return false;
        
        try {
            // Reset to beginning - but do it safely
            if (this.video.duration && this.video.duration > 0) {
                this.video.currentTime = 0;
            }
            
            // Ensure visibility
            this.video.style.opacity = '1';
            
            // Attempt play
            await this.video.play();
            
            this.setState(this.VIDEO_STATES.PLAYING);
            this.isPlaying = true;
            
            if (this.debug) {
                console.log('[VideoManager] Playback started successfully');
            }
            
            return true;
            
        } catch (error) {
            // Handle autoplay policy blocks gracefully
            if (error.name === 'NotAllowedError') {
                if (this.debug) {
                    console.log('[VideoManager] Autoplay blocked by browser policy');
                }
                
                // Show first frame as fallback
                this.video.style.opacity = '1';
                this.setState(this.VIDEO_STATES.PAUSED);
                
            } else {
                console.error('[VideoManager] Play failed:', error);
                this.setState(this.VIDEO_STATES.ERROR);
            }
            
            return false;
        }
    }
    
    /**
     * Pause video playback
     */
    pausePlayback() {
        if (!this.video) return;
        
        try {
            this.video.pause();
            this.setState(this.VIDEO_STATES.PAUSED);
            this.isPlaying = false;
            
            if (this.debug) {
                console.log('[VideoManager] Playback paused');
            }
            
        } catch (error) {
            console.error('[VideoManager] Pause failed:', error);
        }
    }
    
    /**
     * Reset video to initial state
     */
    reset() {
        if (!this.video) return;
        
        try {
            this.video.pause();
            this.video.currentTime = 0;
            this.setState(this.VIDEO_STATES.PAUSED);
            this.isPlaying = false;
            
            if (this.debug) {
                console.log('[VideoManager] Video reset');
            }
            
        } catch (error) {
            console.error('[VideoManager] Reset failed:', error);
        }
    }
    
    /**
     * Set internal state
     * @private
     */
    setState(newState) {
        if (this.currentState !== newState) {
            const oldState = this.currentState;
            this.currentState = newState;
            
            if (this.debug) {
                console.log(`[VideoManager] State: ${oldState} → ${newState}`);
            }
            
            // Emit state change event
            if (window.APP_EVENT_BUS) {
                window.APP_EVENT_BUS.emit('video:stateChanged', {
                    oldState,
                    newState,
                    isPlaying: this.isPlaying
                });
            }
        }
    }
    
    /**
     * Get current video state
     */
    getState() {
        return {
            state: this.currentState,
            isPlaying: this.isPlaying,
            isReady: this.currentState === this.VIDEO_STATES.READY || this.currentState === this.VIDEO_STATES.PAUSED,
            hasError: this.currentState === this.VIDEO_STATES.ERROR
        };
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        if (this.video && this.eventListeners.size > 0) {
            // Remove all event listeners
            this.eventListeners.forEach(({ handler }, event) => {
                this.video.removeEventListener(event, handler);
            });
            this.eventListeners.clear();
            
            if (this.debug) {
                console.log('[VideoManager] Event listeners cleaned up');
            }
        }
        
        // Clear any pending handlers
        this.loadSuccessHandler = null;
        this.pendingSeek = false;
    }
    
    /**
     * Destroy video manager instance
     */
    destroy() {
        this.cleanup();
        
        if (this.video) {
            this.video.pause();
        }
        
        this.video = null;
        this.initialized = false;
        this.setState(this.VIDEO_STATES.UNINITIALIZED);
        
        if (this.debug) {
            console.log('[VideoManager] Instance destroyed');
        }
    }
}

// Singleton instance
let videoManagerInstance = null;

/**
 * Get or create VideoManager singleton
 * @returns {VideoManager}
 */
function getVideoManager() {
    if (!videoManagerInstance) {
        videoManagerInstance = new VideoManager();
    }
    return videoManagerInstance;
}

/**
 * Initialize video manager globally
 * @returns {Promise<VideoManager>}
 */
async function initializeVideoManager() {
    const manager = getVideoManager();
    await manager.initialize();
    return manager;
}

// Global API
window.VideoManager = VideoManager;
window.getVideoManager = getVideoManager;
window.initializeVideoManager = initializeVideoManager;

// Register with lifecycle manager if available
if (window.lifecycleManager) {
    window.lifecycleManager.register('videoManager', videoManagerInstance, () => {
        if (videoManagerInstance) {
            videoManagerInstance.destroy();
            videoManagerInstance = null;
        }
    });
}

// Export for ES6 modules
export { VideoManager, getVideoManager, initializeVideoManager };