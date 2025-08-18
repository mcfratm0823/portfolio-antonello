/**
 * Professional Project Loader
 * Advanced routing and content management system
 * @author Senior Developer
 * @version 1.0.0
 */

class ProjectLoader {
    constructor() {
        this.currentProject = null;
        this.isLoading = false;
        this.cache = new Map();
        this.loadingTimeout = null;
        
        // Performance monitoring
        this.startTime = performance.now();
        
        this.init();
    }
    
    /**
     * Initialize the loader
     */
    async init() {
        console.log('🔍 ProjectLoader init:', window.location.search);
        
        try {
            this.showLoading();
            const slug = this.extractSlugFromURL();
            
            if (!slug) {
                this.handleError('No project specified', true);
                return;
            }
            
            await this.loadProject(slug);
            
        } catch (error) {
            console.error('🔍 Init error:', error);
            this.handleError('Failed to initialize project loader', true);
        }
    }
    
    /**
     * Extract project slug from URL
     * Supports multiple URL patterns:
     * - /progetti/project.html?slug=cafe-124
     * - /progetti/cafe-124 (future routing)
     * - /progetti/project.html#cafe-124
     */
    extractSlugFromURL() {
        const url = new URL(window.location.href);
        
        // Method 1: Query parameter
        const slugParam = url.searchParams.get('slug') || url.searchParams.get('p');
        if (slugParam) return slugParam;
        
        // Method 2: Hash fragment
        const hash = url.hash.replace('#', '');
        if (hash) return hash;
        
        // Method 3: Path-based routing (future)
        const pathSegments = url.pathname.split('/');
        const projectIndex = pathSegments.findIndex(segment => segment === 'progetti');
        if (projectIndex !== -1 && pathSegments[projectIndex + 1]) {
            const potentialSlug = pathSegments[projectIndex + 1];
            if (potentialSlug !== 'project.html') {
                return potentialSlug.replace('.html', '');
            }
        }
        
        return null;
    }
    
    /**
     * Load project data
     */
    async loadProject(slug) {
        try {
            this.isLoading = true;
            
            // Check cache first
            if (this.cache.has(slug)) {
                const cachedData = this.cache.get(slug);
                await this.renderProject(cachedData);
                return;
            }
            
            // Dynamic import with proper error handling
            const moduleUrl = new URL('../js/projects-data.js', window.location.href);
            const { getProject, getRelatedProjects } = await import(moduleUrl.href);
            
            // Get project data
            const projectData = getProject(slug);
            
            if (!projectData) {
                console.error('🔍 Project not found:', slug);
                this.handleError(`Project "${slug}" not found`, true);
                return;
            }
            
            // Get related projects
            const relatedProjects = getRelatedProjects(slug, 4);
            
            // Combine data
            const fullData = {
                ...projectData,
                relatedProjects
            };
            
            // Cache the data
            this.cache.set(slug, fullData);
            
            // Render the project
            await this.renderProject(fullData);
            
        } catch (error) {
            console.error('🔍 Load error:', error);
            this.handleError('Failed to load project data', true);
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Render project data to DOM
     */
    async renderProject(projectData) {
        try {
            // Update document title
            document.title = `${projectData.title} - ANTONELLO GUARNIERI ® VISUAL DESIGNER`;
            
            // Update meta tags for SEO
            this.updateMetaTags(projectData);
            
            // Render header
            this.renderHeader(projectData);
            
            // Render content blocks
            this.renderContent(projectData);
            
            // Show content immediately (progressive loading)
            this.showContent();
            
            // Load images asynchronously without blocking
            this.renderImages(projectData);
            
            // Render related projects
            this.renderRelatedProjects(projectData.relatedProjects);
            
            // Log performance
            const loadTime = performance.now() - this.startTime;
            console.log(`[ProjectLoader] Project "${projectData.slug}" loaded in ${Math.round(loadTime)}ms`);
            
        } catch (error) {
            this.handleError('Failed to render project', false);
            console.error('Render project error:', error);
        }
    }
    
    /**
     * Update meta tags for SEO
     */
    updateMetaTags(projectData) {
        // Update or create meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = `${projectData.title} - ${projectData.content.concept.text.substring(0, 160)}...`;
        
        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;
    }
    
    /**
     * Render header section
     */
    renderHeader(projectData) {
        const titleEl = document.getElementById('project-title');
        const categoryEl = document.getElementById('project-category');
        const yearEl = document.getElementById('project-year');
        const clientEl = document.getElementById('project-client');
        
        if (titleEl) titleEl.textContent = projectData.title;
        if (categoryEl) categoryEl.textContent = projectData.category.toUpperCase();
        if (yearEl) yearEl.textContent = projectData.year;
        if (clientEl) clientEl.textContent = projectData.client;
    }
    
    /**
     * Render content blocks
     */
    renderContent(projectData) {
        // Concept block
        const conceptLabelEl = document.getElementById('concept-label');
        const conceptTextEl = document.getElementById('concept-text');
        
        if (conceptLabelEl && projectData.content.concept) {
            conceptLabelEl.textContent = projectData.content.concept.label;
        }
        if (conceptTextEl && projectData.content.concept) {
            conceptTextEl.textContent = projectData.content.concept.text;
        }
        
        // Approach block
        const approachLabelEl = document.getElementById('approach-label');
        const approachTextEl = document.getElementById('approach-text');
        
        if (approachLabelEl && projectData.content.approach) {
            approachLabelEl.textContent = projectData.content.approach.label;
        }
        if (approachTextEl && projectData.content.approach) {
            approachTextEl.textContent = projectData.content.approach.text;
        }
    }
    
    /**
     * Render images with progressive lazy loading (non-blocking)
     */
    renderImages(projectData) {
        // Hero image - load immediately but don't block
        const heroImg = document.getElementById('hero-img');
        if (heroImg && projectData.hero_image) {
            this.loadImage(heroImg, projectData.hero_image, `${projectData.title} Hero`);
        }
        
        // Gallery images - load progressively
        if (projectData.gallery_images && projectData.gallery_images.length >= 2) {
            const galleryImg1 = document.getElementById('gallery-img-1');
            const galleryImg2 = document.getElementById('gallery-img-2');
            
            if (galleryImg1) {
                this.loadImage(galleryImg1, projectData.gallery_images[0], `${projectData.title} Gallery 1`);
            }
            if (galleryImg2) {
                this.loadImage(galleryImg2, projectData.gallery_images[1], `${projectData.title} Gallery 2`);
            }
        }
    }
    
    /**
     * Load single image with error handling
     */
    loadImage(imgElement, src, alt) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                imgElement.src = src;
                imgElement.alt = alt;
                resolve();
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                // Fallback to placeholder
                imgElement.src = `https://picsum.photos/1200/600?random=${Math.floor(Math.random() * 1000)}`;
                imgElement.alt = `${alt} (placeholder)`;
                resolve();
            };
            
            img.src = src;
        });
    }
    
    /**
     * Render related projects
     */
    renderRelatedProjects(relatedProjects) {
        const container = document.getElementById('related-projects-container');
        if (!container || !relatedProjects || relatedProjects.length === 0) return;
        
        const projectsHTML = relatedProjects.map((project, index) => `
            <div class="project-slide" data-index="${index}">
                <a href="./project.html?slug=${project.slug}" class="project-link">
                    <div class="project-preview">
                        <img src="${project.thumbnail}" alt="${project.title}" loading="lazy" width="1200" height="600">
                        <div class="project-title-overlay">
                            <h3>${project.title}</h3>
                            <div class="project-meta">
                                <span>${project.category.toUpperCase()}</span>
                                <span>•</span>
                                <span>${project.year}</span>
                            </div>
                        </div>
                    </div>
                    <div class="project-info">
                        <h3 class="project-title">${project.title}</h3>
                        <div class="project-meta">
                            <span>${project.category.toUpperCase()}</span>
                            <span>•</span>
                            <span>${project.year}</span>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
        
        container.innerHTML = projectsHTML;
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        const loadingEl = document.getElementById('loading-state');
        const whiteContainer = document.getElementById('white-container');
        const blackContainer = document.getElementById('black-container');
        
        if (loadingEl) loadingEl.style.display = 'flex';
        if (whiteContainer) whiteContainer.style.opacity = '0';
        if (blackContainer) blackContainer.style.opacity = '0';
        
        // Timeout fallback
        this.loadingTimeout = setTimeout(() => {
            this.handleError('Loading timeout', true);
        }, 10000); // 10 seconds timeout
    }
    
    /**
     * Show content and hide loading
     */
    showContent() {
        const loadingEl = document.getElementById('loading-state');
        const whiteContainer = document.getElementById('white-container');
        const blackContainer = document.getElementById('black-container');
        
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            setTimeout(() => {
                loadingEl.style.display = 'none';
            }, 300);
        }
        
        if (whiteContainer) {
            setTimeout(() => {
                whiteContainer.style.opacity = '1';
            }, 100);
        }
        
        if (blackContainer) {
            setTimeout(() => {
                blackContainer.style.opacity = '1';
            }, 200);
        }
    }
    
    /**
     * Handle errors professionally
     */
    handleError(message, shouldRedirect = false) {
        console.error(`[ProjectLoader] ${message}`);
        
        if (shouldRedirect) {
            // Show error message briefly before redirect
            const loadingEl = document.getElementById('loading-state');
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                        <h2 style="font-family: sans-serif; color: #333; margin-bottom: 10px;">Progetto non trovato</h2>
                        <p style="font-family: sans-serif; color: #666; margin-bottom: 20px;">Verrai reindirizzato alla pagina portfolio...</p>
                    </div>
                `;
            }
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '../portfolio.html';
            }, 2000);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProjectLoader();
    });
} else {
    new ProjectLoader();
}

// Export for debugging
window.__PROJECT_LOADER__ = ProjectLoader;