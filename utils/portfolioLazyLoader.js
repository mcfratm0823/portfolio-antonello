/**
 * Portfolio Lazy Loader
 * Enhanced lazy loading for portfolio images with progressive loading
 */
class PortfolioLazyLoader {
    constructor() {
        this.loadedImages = new Set();
        this.init();
    }
    
    init() {
        // Get all portfolio images
        const portfolioImages = document.querySelectorAll('.selected_work_box_image, .selected_work_img');
        
        if (portfolioImages.length === 0) return;
        
        // First two images (project 1) load immediately - already handled in HTML
        
        // Set up intersection observer for remaining images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Skip if already loaded
                    if (this.loadedImages.has(img)) return;
                    
                    // Mark as loaded
                    this.loadedImages.add(img);
                    
                    // If it has loading="lazy", browser handles it
                    // But we can add loading states
                    if (img.loading === 'lazy') {
                        img.classList.add('lazy-loading');
                        
                        img.addEventListener('load', () => {
                            img.classList.remove('lazy-loading');
                            img.classList.add('lazy-loaded');
                        }, { once: true });
                        
                        img.addEventListener('error', () => {
                            img.classList.remove('lazy-loading');
                            img.classList.add('lazy-error');
                        }, { once: true });
                    }
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            // Start loading when image is 200px away from viewport
            rootMargin: '200px',
            threshold: 0.01
        });
        
        // Observe all portfolio images except the first project
        portfolioImages.forEach((img, index) => {
            // Skip first two images (already loading)
            if (index > 1) {
                imageObserver.observe(img);
            }
        });
        
        // Preload next project when current one is in view
        this.setupProgressiveLoading();
    }
    
    setupProgressiveLoading() {
        const projects = document.querySelectorAll('.selected_work_item');
        
        if (projects.length <= 1) return;
        
        const projectObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentProject = entry.target;
                    const currentIndex = Array.from(projects).indexOf(currentProject);
                    
                    // Preload next project's images
                    if (currentIndex < projects.length - 1) {
                        const nextProject = projects[currentIndex + 1];
                        const nextImages = nextProject.querySelectorAll('img');
                        
                        nextImages.forEach(img => {
                            // Trigger loading by removing lazy attribute if needed
                            if (img.loading === 'lazy' && !this.loadedImages.has(img)) {
                                // Create a preload link
                                const link = document.createElement('link');
                                link.rel = 'preload';
                                link.as = 'image';
                                link.href = img.src;
                                document.head.appendChild(link);
                                
                                // Remove after load
                                setTimeout(() => link.remove(), 5000);
                            }
                        });
                    }
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.5
        });
        
        projects.forEach(project => {
            projectObserver.observe(project);
        });
    }
}

// Export for ES6 modules
export { PortfolioLazyLoader };

// Initialize when DOM is ready for backward compatibility - con controllo duplicazione
if (!window.__PORTFOLIO_LAZY_LOADER_INITIALIZED__) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.__PORTFOLIO_LAZY_LOADER_INITIALIZED__) {
                window.__PORTFOLIO_LAZY_LOADER_INITIALIZED__ = true;
                window.portfolioLazyLoader = new PortfolioLazyLoader();
            }
        });
    } else {
        window.__PORTFOLIO_LAZY_LOADER_INITIALIZED__ = true;
        window.portfolioLazyLoader = new PortfolioLazyLoader();
    }
}