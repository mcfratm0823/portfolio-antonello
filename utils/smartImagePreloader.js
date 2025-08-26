/**
 * SmartImagePreloader - Intelligent image preloading with memory management
 * Preloads images only when needed and cleans up unused resources
 */
class SmartImagePreloader {
    constructor() {
        this.imageCache = new Map();
        this.observers = new Map();
        this.preloadQueue = new Set();
        this.isPreloading = false;
        this.maxConcurrentLoads = 2;
        this.memoryLimit = 50 * 1024 * 1024; // 50MB limit
        this.currentMemoryUsage = 0;
    }
    
    /**
     * Preload images when user approaches a section
     * @param {Element} triggerElement - Element that triggers preloading when visible
     * @param {Array} imageUrls - Array of image URLs to preload
     * @param {Object} options - Configuration options
     */
    observeAndPreload(triggerElement, imageUrls, options = {}) {
        const config = {
            rootMargin: '200px', // Start loading 200px before element is visible
            threshold: 0,
            onComplete: null,
            priority: 'normal',
            ...options
        };
        
        // Create intersection observer for this element
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start preloading when element is about to be visible
                    this.preloadImages(imageUrls, {
                        priority: config.priority,
                        onComplete: config.onComplete
                    });
                    
                    // Stop observing once triggered
                    observer.unobserve(triggerElement);
                    this.observers.delete(triggerElement);
                }
            });
        }, {
            rootMargin: config.rootMargin,
            threshold: config.threshold
        });
        
        observer.observe(triggerElement);
        this.observers.set(triggerElement, observer);
    }
    
    /**
     * Preload images with priority queue
     */
    async preloadImages(urls, options = {}) {
        const { priority = 'normal', onComplete = null } = options;
        
        // Filter out already cached images
        const urlsToLoad = urls.filter(url => !this.imageCache.has(url));
        
        if (urlsToLoad.length === 0) {
            onComplete && onComplete(this.getCachedImages(urls));
            return;
        }
        
        // Add to queue based on priority
        urlsToLoad.forEach(url => {
            this.preloadQueue.add({ url, priority, onComplete });
        });
        
        // Start preloading if not already running
        if (!this.isPreloading) {
            this.processQueue();
        }
    }
    
    /**
     * Process preload queue with concurrency limit
     */
    async processQueue() {
        if (this.preloadQueue.size === 0) {
            this.isPreloading = false;
            return;
        }
        
        this.isPreloading = true;
        
        // Sort queue by priority
        const queue = Array.from(this.preloadQueue)
            .sort((a, b) => {
                const priorityOrder = { high: 0, normal: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        
        // Load images with concurrency limit
        const concurrent = [];
        
        for (let i = 0; i < Math.min(this.maxConcurrentLoads, queue.length); i++) {
            const item = queue[i];
            this.preloadQueue.delete(item);
            concurrent.push(this.loadImage(item.url));
        }
        
        // Wait for current batch to complete
        await Promise.all(concurrent);
        
        // Check memory usage and clean if needed
        if (this.currentMemoryUsage > this.memoryLimit) {
            this.cleanupOldImages();
        }
        
        // Continue processing queue
        this.processQueue();
    }
    
    /**
     * Load single image
     */
    async loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            const startTime = Date.now();
            
            img.onload = () => {
                // Estimate memory usage (width * height * 4 bytes per pixel)
                const estimatedSize = (img.naturalWidth * img.naturalHeight * 4) || 1000000;
                this.currentMemoryUsage += estimatedSize;
                
                // Cache the image with metadata
                this.imageCache.set(url, {
                    element: img,
                    size: estimatedSize,
                    loadTime: Date.now() - startTime,
                    lastAccessed: Date.now(),
                    accessCount: 0
                });
                
                resolve({ url, success: true, img });
            };
            
            img.onerror = () => {
                // Report to error handler
                if (window.errorHandler) {
                    window.errorHandler.handle(
                        new Error(`Failed to preload image: ${url}`),
                        {
                            component: 'SmartImagePreloader',
                            category: 'media',
                            url,
                            preload: true
                        }
                    );
                }
                
                resolve({ url, success: false });
            };
            
            img.src = url;
        });
    }
    
    /**
     * Get cached images
     */
    getCachedImages(urls) {
        const result = {};
        
        urls.forEach(url => {
            const cached = this.imageCache.get(url);
            if (cached) {
                cached.lastAccessed = Date.now();
                cached.accessCount++;
                result[url] = cached.element;
            }
        });
        
        return result;
    }
    
    /**
     * Get single cached image
     */
    getCachedImage(url) {
        const cached = this.imageCache.get(url);
        if (cached) {
            cached.lastAccessed = Date.now();
            cached.accessCount++;
            return cached.element;
        }
        return null;
    }
    
    /**
     * Clean up least recently used images
     */
    cleanupOldImages() {
        // Sort by last accessed time and access count
        const sorted = Array.from(this.imageCache.entries())
            .sort((a, b) => {
                const scoreA = a[1].lastAccessed + (a[1].accessCount * 1000000);
                const scoreB = b[1].lastAccessed + (b[1].accessCount * 1000000);
                return scoreA - scoreB;
            });
        
        // Remove least used images until under memory limit
        let removed = 0;
        for (const [url, data] of sorted) {
            if (this.currentMemoryUsage <= this.memoryLimit * 0.7) break;
            
            this.imageCache.delete(url);
            this.currentMemoryUsage -= data.size;
            removed++;
        }
        
    }
    
    /**
     * Clear all cached images
     */
    clearCache() {
        this.imageCache.clear();
        this.currentMemoryUsage = 0;
    }
    
    /**
     * Destroy all observers
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.clearCache();
    }
}

// Export for ES6 modules
export { SmartImagePreloader };

// Create singleton instance for backward compatibility
window.smartImagePreloader = new SmartImagePreloader();