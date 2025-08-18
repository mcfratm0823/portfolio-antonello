/**
 * CMS Module - Modulo refactored per architettura event-driven
 * @class CMSModule
 * @version 2.0.0
 */
class CMSModule {
    constructor() {
        this.pageData = null;
        this.projectsData = null;
        this.filtersData = null;
        this.debug = window.location.search.includes('debug=true');
        this.initialized = false;
        
        // Bind to event bus
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Ascolta richieste di caricamento dati
        window.APP_EVENT_BUS.on('cms:load-page-data', () => this.loadPageData());
        window.APP_EVENT_BUS.on('cms:load-projects', () => this.loadProjects());
        window.APP_EVENT_BUS.on('cms:load-filters', () => this.loadFilters());
    }
    
    /**
     * Initialize the module
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            if (this.debug) {
                // CMSModule already initialized
            }
            return;
        }
        
        // Track initialization
        if (window.trackModuleInit) {
            window.trackModuleInit('CMSModule');
        }
        
        if (this.debug) {
            // CMSModule initializing
        }
        
        try {
            // Determina quale pagina siamo
            const path = window.location.pathname;
            const isHomepage = path === '/' || path === '/index.html' || path.endsWith('/');
            const isPortfolioPage = path.includes('portfolio');
            const isProjectDetailPage = path.includes('project-detail');
            
            // Carica dati appropriati per la pagina
            if (isHomepage) {
                await this.loadHomepageData();
            } else if (isPortfolioPage) {
                // Carica solo se non già caricati
                if (!this.projectsData && !this.filtersData) {
                    await Promise.all([
                        this.loadProjects(),
                        this.loadFilters()
                    ]);
                }
            } else if (isProjectDetailPage) {
                await this.loadProjectDetail();
            }
            
            this.initialized = true;
            
            if (this.debug) {
                // CMSModule initialization complete
            }
            
        } catch (error) {
            // CMSModule initialization failed
            throw error;
        }
    }
    
    /**
     * Load homepage data
     * @private
     */
    async loadHomepageData() {
        try {
            const response = await fetch('/data/homepage.json');
            if (!response.ok) throw new Error('Failed to load homepage data');
            
            const data = await response.json();
            this.pageData = data;
            
            // Update app state
            window.APP_STATE.updateData('homepage', data);
            
            // Emit event
            window.APP_EVENT_BUS.emit('data:loaded', {
                type: 'homepage',
                content: data
            });
            
            // Update DOM
            this.updateHomepageDOM(data);
            
        } catch (error) {
            // CMSModule error loading homepage data
            // Fallback to inline data if available
            this.loadInlinePageData();
        }
    }
    
    /**
     * Load projects data
     * @private
     */
    async loadProjects() {
        try {
            // Prima controlla se ci sono progetti inline nel DOM
            const projectsDataElement = document.getElementById('projects-data');
            if (projectsDataElement?.textContent) {
                const inlineProjects = JSON.parse(projectsDataElement.textContent);
                
                // Filtra progetti con "-" dal titolo
                this.projectsData = inlineProjects
                    .filter(p => p.title && p.title !== '-')
                    .map(p => ({
                        ...p,
                        status: p.status || 'published'
                    }));
                
                if (this.debug) {
                    // CMSModule loaded inline projects
                }
            } else {
                // Carica da file JSON
                const response = await fetch('/data/projects.json');
                if (!response.ok) throw new Error('Failed to load projects');
                
                this.projectsData = await response.json();
            }
            
            // Update app state
            window.APP_STATE.updateData('projects', this.projectsData);
            
            // Emit event
            window.APP_EVENT_BUS.emit('data:loaded', {
                type: 'projects',
                content: this.projectsData
            });
            
            // Renderizza progetti se siamo sulla pagina portfolio
            if (window.location.pathname.includes('portfolio')) {
                this.renderProjects();
            }
            
        } catch (error) {
            // CMSModule error loading projects
            window.APP_EVENT_BUS.emit('data:error', {
                type: 'projects',
                error
            });
        }
    }
    
    /**
     * Load filters data
     * @private
     */
    async loadFilters() {
        try {
            // Controlla filtri inline nel DOM
            const filtersDataElement = document.getElementById('filters-data');
            if (filtersDataElement?.textContent) {
                this.filtersData = JSON.parse(filtersDataElement.textContent);
                
                if (this.debug) {
                    // CMSModule loaded inline filters
                }
            } else {
                // Genera filtri dai progetti
                if (!this.projectsData) {
                    await this.loadProjects();
                }
                
                const categories = [...new Set(this.projectsData.map(p => p.category))];
                this.filtersData = categories.map(cat => ({
                    value: cat,
                    label: this.getCategoryLabel(cat)
                }));
            }
            
            // Update app state
            window.APP_STATE.updateData('filters', this.filtersData);
            
            // Emit event
            window.APP_EVENT_BUS.emit('data:loaded', {
                type: 'filters',
                content: this.filtersData
            });
            
            // Renderizza filtri
            this.renderFilters();
            
        } catch (error) {
            // CMSModule error loading filters
        }
    }
    
    /**
     * Load project detail
     * @private
     */
    async loadProjectDetail() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const projectSlug = urlParams.get('p');
            
            if (!projectSlug) {
                throw new Error('No project slug provided');
            }
            
            // Cerca nei dati inline prima
            const projectDataElement = document.getElementById('project-data');
            if (projectDataElement?.textContent) {
                const projectData = JSON.parse(projectDataElement.textContent);
                
                // Update app state
                window.APP_STATE.updateData('currentProject', projectData);
                
                // Emit event
                window.APP_EVENT_BUS.emit('data:loaded', {
                    type: 'projectDetail',
                    content: projectData
                });
                
                // Update DOM
                this.updateProjectDetailDOM(projectData);
            } else {
                // Fallback: carica da file
                const response = await fetch(`/data/projects/${projectSlug}.json`);
                if (!response.ok) throw new Error('Project not found');
                
                const projectData = await response.json();
                
                window.APP_STATE.updateData('currentProject', projectData);
                window.APP_EVENT_BUS.emit('data:loaded', {
                    type: 'projectDetail',
                    content: projectData
                });
                
                this.updateProjectDetailDOM(projectData);
            }
            
        } catch (error) {
            // CMSModule error loading project detail
            // Redirect to 404 or show error
            window.location.href = '/404.html';
        }
    }
    
    /**
     * Load inline page data (fallback)
     * @private
     */
    loadInlinePageData() {
        const dataElement = document.getElementById('page-data');
        if (dataElement?.textContent) {
            try {
                this.pageData = JSON.parse(dataElement.textContent);
                
                window.APP_STATE.updateData('pageData', this.pageData);
                window.APP_EVENT_BUS.emit('data:loaded', {
                    type: 'pageData',
                    content: this.pageData
                });
                
            } catch (error) {
                // CMSModule error parsing inline page data
            }
        }
    }
    
    /**
     * Update homepage DOM
     * @private
     */
    updateHomepageDOM(data) {
        // Hero section
        if (data.hero) {
            // Video/Image handling
            const centerPhoto = document.getElementById('center-photo');
            const centerVideo = document.getElementById('center-video');
            
            if (data.hero.center_media_type === 'video' && centerVideo) {
                centerVideo.style.display = 'block';
                if (centerPhoto) centerPhoto.style.display = 'none';
                
                const video = centerVideo.querySelector('video source');
                const videoElement = centerVideo.querySelector('video');
                if (video && videoElement && data.hero.center_media) {
                    video.src = data.hero.center_media;
                    videoElement.load();
                    videoElement.play().catch(e => {}); // Autoplay blocked
                }
            } else if (data.hero.center_media_type === 'image' && centerPhoto) {
                centerPhoto.style.display = 'block';
                if (centerVideo) centerVideo.style.display = 'none';
                
                const img = centerPhoto.querySelector('img');
                if (img && data.hero.center_image) {
                    img.src = data.hero.center_image;
                }
            }
        }
        
        // Altri aggiornamenti DOM se necessari
    }
    
    /**
     * Update project detail DOM
     * @private
     */
    updateProjectDetailDOM(project) {
        // Titolo
        const titleElement = document.querySelector('.project-title');
        if (titleElement) titleElement.textContent = project.title;
        
        // Categoria
        const categoryElement = document.querySelector('.project-category');
        if (categoryElement) categoryElement.textContent = project.category;
        
        // Immagini
        const images = document.querySelectorAll('.project-image');
        if (project.images) {
            images.forEach((img, index) => {
                if (project.images[index]) {
                    img.src = project.images[index];
                }
            });
        }
        
        // Testo
        const contentElement = document.querySelector('.project-content');
        if (contentElement && project.content) {
            contentElement.innerHTML = project.content;
        }
    }
    
    /**
     * Render projects
     * @private
     */
    renderProjects() {
        if (!this.projectsData || this.projectsData.length === 0) {
            if (this.debug) {
                // CMSModule no projects to render
            }
            return;
        }
        
        // Usa la funzione globale se disponibile per compatibilità
        if (window.renderProjects) {
            window.renderProjects(this.projectsData);
        } else {
            // Implementazione diretta
            const container = document.getElementById('projects-container');
            if (!container) return;
            
            const projectsHTML = this.projectsData.map((project, index) => {
                const imageUrl = project.thumbnail || project.image || `https://picsum.photos/400/550?random=${project.id}`;
                const projectUrl = project.slug ? `./progetti/project-detail.html?p=${project.slug}` : '#';
                
                return `
                    <div class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-index="${index}" data-title="${project.title}">
                        <a href="${projectUrl}" class="project-link" style="display: block; width: 100%; height: 100%; text-decoration: none; position: relative; z-index: 999;">
                            <div class="project-content" style="width: 100%; height: 100%; position: relative; overflow: hidden; pointer-events: none;">
                                <img src="${imageUrl}" alt="${project.title}" width="400" height="550" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                <div class="desktop-title" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 20px;">
                                    <h3 style="color: white; font-family: Neue; font-size: 1.2rem; font-weight: 600; text-align: center; text-transform: uppercase; margin: 0;">${project.title}</h3>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = projectsHTML;
            
            // Emit event for other modules
            window.APP_EVENT_BUS.emit('projects:rendered', {
                count: this.projectsData.length
            });
        }
    }
    
    /**
     * Render filters
     * @private
     */
    renderFilters() {
        const container = document.getElementById('filters');
        if (!container || !this.filtersData) return;
        
        // Non sovrascrivere se già popolato
        if (container.children.length > 0) {
            // Reinizializza solo gli event listeners
            if (window.initializeFilters) {
                window.initializeFilters();
            }
            return;
        }
        
        let filtersHTML = '<div class="filter-item active" data-filter="all">TUTTI I LAVORI</div>';
        
        this.filtersData.forEach(filter => {
            filtersHTML += `<div class="filter-item" data-filter="${filter.value}">${filter.label}</div>`;
        });
        
        container.innerHTML = filtersHTML;
        
        // Inizializza event listeners
        if (window.initializeFilters) {
            window.initializeFilters();
        }
        
        // Emit event
        window.APP_EVENT_BUS.emit('filters:rendered', {
            count: this.filtersData.length
        });
    }
    
    /**
     * Get category label
     * @private
     */
    getCategoryLabel(category) {
        const categoryMap = {
            'ai': 'CON IA',
            'digital': 'DIGITAL',
            'social': 'SOCIAL',
            'branding': 'BRANDING'
        };
        return categoryMap[category] || category.toUpperCase();
    }
}

// Registra il modulo se il registry è disponibile
if (window.MODULE_REGISTRY) {
    window.MODULE_REGISTRY.register('cms', () => {
        const instance = new CMSModule();
        return instance.initialize().then(() => instance);
    }, {
        priority: 50,
        dependencies: ['constants']
    });
}

// Export
window.CMSModule = CMSModule;