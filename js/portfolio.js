// Import dependencies for ES6 module support
// When loaded as module, these will be available
// When loaded as script, they'll use global variables

// Custom cursor handled by global-cursor.js

/**
 * Project Stack Management - Circular rotation of project cards
 * @class ProjectStack
 */
class ProjectStack {
    /**
     * Creates an instance of ProjectStack
     * @constructor
     */
    constructor() {
        /** @type {NodeListOf<HTMLElement>} Project card elements */
        this.projects = document.querySelectorAll('.project-card');
        
        /** @type {string[]} Available positions in the circular layout */
        this.circlePositions = [
            'position-center',    // 0
            'position-top',       // 1
            'circle-top-1',       // 2
            'circle-top-2',       // 3
            'circle-top-3',       // 4
            'circle-bottom-3',    // 5
            'circle-bottom-2',    // 6
            'circle-bottom-1',    // 7
            'position-bottom'     // 8
        ];
        
        /** @type {number} Current rotation offset */
        this.currentOffset = 0;
        
        /** @type {boolean} Flag to prevent rotation during animation */
        this.isRotating = false;
        
        this.init();
    }

    /**
     * Initialize the stack system
     * @returns {void}
     */
    init() {
        // Only initialize circular rotation on desktop
        if (window.innerWidth > window.CONSTANTS.BREAKPOINTS.MOBILE) {
            this.positionProjects();
            this.addEventListeners();
        }
    }

    /**
     * Position projects in circular layout
     * @returns {void}
     */
    positionProjects() {
        this.projects.forEach((project, index) => {
            // Rimuovi tutte le classi di posizione
            project.classList.remove('position-top', 'position-center', 'position-bottom', 
                                    'circle-top-1', 'circle-top-2', 'circle-top-3',
                                    'circle-bottom-1', 'circle-bottom-2', 'circle-bottom-3');
            
            // Calcola la posizione nel cerchio
            const circleIndex = (index + this.currentOffset) % this.circlePositions.length;
            const positionClass = this.circlePositions[circleIndex];
            
            project.classList.add(positionClass);
        });
    }

    /**
     * Rotate stack clockwise
     * @returns {void}
     */
    rotateDown() {
        if (this.isRotating) return;
        this.isRotating = true;
        
        // Rotazione in senso orario
        this.currentOffset = (this.currentOffset + 1) % this.circlePositions.length;
        this.positionProjects();
        
        setTimeout(() => {
            this.isRotating = false;
        }, 800); // Tempo della transizione CSS
    }

    /**
     * Rotate stack counter-clockwise
     * @returns {void}
     */
    rotateUp() {
        if (this.isRotating) return;
        this.isRotating = true;
        
        // Rotazione in senso antiorario
        this.currentOffset = (this.currentOffset - 1 + this.circlePositions.length) % this.circlePositions.length;
        this.positionProjects();
        
        setTimeout(() => {
            this.isRotating = false;
        }, 800); // Tempo della transizione CSS
    }

    /**
     * Add event listeners for interaction
     * @returns {void}
     */
    addEventListeners() {
        // Skip all event listeners on mobile/tablet
        if (window.innerWidth <= window.CONSTANTS.BREAKPOINTS.MOBILE) {
            return;
        }
        
        // Controllo ultra-rigoroso per eliminare doppio scroll
        let isScrollBlocked = false;
        
        /**
         * Handle wheel events
         * @param {WheelEvent} e - The wheel event
         * @returns {boolean} Always returns false to prevent default
         */
        const handleWheel = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            // Blocco totale durante rotazione o già in esecuzione
            if (isScrollBlocked || this.isRotating) {
                return false;
            }
            
            // Blocca immediatamente per 1.5 secondi
            isScrollBlocked = true;
            
            setTimeout(() => {
                isScrollBlocked = false;
            }, 1500);
            
            if (e.deltaY > 0) {
                this.rotateDown();
            } else {
                this.rotateUp();
            }
            
            return false;
        };
        
        // Use only the standard 'wheel' event - it's supported by all modern browsers
        // Remove redundant listeners for better performance
        document.addEventListener('wheel', handleWheel, { passive: false });

        // Touch navigation
        let startY = 0;
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const diffY = startY - endY;
            const threshold = 50;
            
            if (Math.abs(diffY) > threshold) {
                if (diffY > 0) {
                    // Swipe verso l'alto = rotazione oraria
                    this.rotateDown();
                } else {
                    // Swipe verso il basso = rotazione antioraria
                    this.rotateUp();
                }
            }
        });
    }
}

/**
 * Filter System for project categories
 * @class FilterSystem
 */
class FilterSystem {
    /**
     * Creates an instance of FilterSystem
     * @constructor
     */
    constructor() {
        /** @type {NodeListOf<HTMLElement>} Filter button elements */
        this.filters = document.querySelectorAll('.filter-item');
        
        /** @type {NodeListOf<HTMLElement>} Project card elements */
        this.projects = document.querySelectorAll('.project-card');
        
        this.init();
    }

    /**
     * Initialize the filter system
     * @returns {void}
     */
    init() {
        this.addEventListeners();
    }

    /**
     * Add event listeners to filter buttons
     * @returns {void}
     */
    addEventListeners() {
        this.filters.forEach(filter => {
            filter.addEventListener('click', () => {
                this.handleFilterClick(filter);
            });
        });
    }

    /**
     * Handle filter button click
     * @param {HTMLElement} activeFilter - The clicked filter element
     * @returns {void}
     */
    handleFilterClick(activeFilter) {
        this.filters.forEach(filter => {
            filter.classList.remove('active');
        });
        
        activeFilter.classList.add('active');
        
        const filterValue = activeFilter.dataset.filter;
        this.filterProjects(filterValue);
    }

    /**
     * Filter projects by category
     * @param {string} filter - The filter category to apply
     * @returns {void}
     */
    filterProjects(filter) {
        this.projects.forEach(project => {
            const category = project.dataset.category;
            
            if (filter === 'all' || category === filter) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        });
    }
}

/**
 * Update the current date display
 * @returns {void}
 */
function updateDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear()).slice(-2);
        dateElement.textContent = `${day}/${month}/${year}`;
    }
}

/**
 * Portfolio Configuration - Easy CMS switching
 * @type {boolean}
 */
const USE_CMS = false; // Set to true to enable CMS integration

/**
 * CMS Configuration object for future integration
 * @typedef {Object} CMSConfig
 * @property {boolean} enabled - Whether CMS is enabled
 * @property {Object} endpoints - API endpoints
 * @property {string} endpoints.projects - Projects API endpoint
 * @property {string} endpoints.categories - Categories API endpoint
 * @property {string} endpoints.media - Media API endpoint
 * @property {Object} authentication - Auth configuration
 * @property {string} authentication.type - Auth type
 * @property {?string} authentication.token - Auth token
 * @property {Object} cache - Cache configuration
 * @property {boolean} cache.enabled - Whether cache is enabled
 * @property {number} cache.duration - Cache duration in ms
 */
/** @type {CMSConfig} */
const CMS_CONFIG = {
    enabled: USE_CMS,
    endpoints: {
        projects: '/api/projects', // Future endpoint for fetching projects
        categories: '/api/categories', // Future endpoint for categories
        media: '/api/media' // Future endpoint for media assets
    },
    authentication: {
        type: 'bearer', // Future auth type
        token: null // Future auth token
    },
    cache: {
        enabled: true,
        duration: 3600000 // 1 hour in milliseconds
    }
};

/**
 * Portfolio Data Source Interface
 * @abstract
 * @class PortfolioDataSource
 */
class PortfolioDataSource {
    /**
     * Get projects from data source
     * @abstract
     * @returns {Promise<Array<Object>>} Promise resolving to array of projects
     * @throws {Error} Must be implemented by subclass
     */
    async getProjects() {
        throw new Error('Method must be implemented by subclass');
    }
    
    /**
     * Get categories from data source
     * @abstract
     * @returns {Promise<Array<string>>} Promise resolving to array of categories
     * @throws {Error} Must be implemented by subclass
     */
    async getCategories() {
        throw new Error('Method must be implemented by subclass');
    }
}

/**
 * Static Data Source Implementation
 * @class StaticDataSource
 * @extends PortfolioDataSource
 */
class StaticDataSource extends PortfolioDataSource {
    /**
     * Creates an instance of StaticDataSource
     * @constructor
     */
    constructor() {
        super();
        
        /** @type {Array<{id: number, title: string, category: string, image: string, status: string}>} Static project data */
        this.staticProjects = [
            {
                id: 1,
                title: "AI Fashion Designer",
                category: "ai",
                image: "https://picsum.photos/600/400?random=11",
                status: "published"
            },
            {
                id: 2,
                title: "Digital Marketing Dashboard",
                category: "digital",
                image: "https://picsum.photos/600/400?random=12",
                status: "published"
            },
            {
                id: 3,
                title: "Social Media Campaign",
                category: "social",
                image: "https://picsum.photos/600/400?random=13",
                status: "published"
            },
            {
                id: 4,
                title: "Brand Identity System",
                category: "branding",
                image: "https://picsum.photos/600/400?random=14",
                status: "published"
            },
            {
                id: 5,
                title: "AI Content Generator",
                category: "ai",
                image: "https://picsum.photos/600/400?random=15",
                status: "published"
            },
            {
                id: 6,
                title: "E-commerce Platform",
                category: "digital",
                image: "https://picsum.photos/600/400?random=16",
                status: "published"
            },
            {
                id: 7,
                title: "Influencer Network",
                category: "social",
                image: "https://picsum.photos/600/400?random=17",
                status: "published"
            },
            {
                id: 8,
                title: "Corporate Rebranding",
                category: "branding",
                image: "https://picsum.photos/600/400?random=18",
                status: "published"
            },
            {
                id: 9,
                title: "Machine Learning Tool",
                category: "ai",
                image: "https://picsum.photos/600/400?random=19",
                status: "published"
            }
        ];
    }
    
    /**
     * Get projects from static data
     * @override
     * @returns {Promise<Array<Object>>} Promise resolving to array of projects
     */
    async getProjects() {
        // Simulate async behavior for consistency with future CMS
        return Promise.resolve(this.staticProjects);
    }
    
    /**
     * Get categories from static data
     * @override
     * @returns {Promise<Array<string>>} Promise resolving to array of categories
     */
    async getCategories() {
        // Extract unique categories from projects
        const categories = [...new Set(this.staticProjects.map(project => project.category))];
        return Promise.resolve(categories);
    }
}

/**
 * CMS Data Source Implementation (for future use)
 * @class CMSDataSource
 * @extends PortfolioDataSource
 */
class CMSDataSource extends PortfolioDataSource {
    /**
     * Creates an instance of CMSDataSource
     * @constructor
     * @param {CMSConfig} config - CMS configuration object
     */
    constructor(config) {
        super();
        /** @type {CMSConfig} */
        this.config = config;
    }
    
    /**
     * Get projects from CMS
     * @override
     * @returns {Promise<Array<Object>>} Promise resolving to array of projects
     * @throws {Error} If fetch fails
     */
    async getProjects() {
        // Future implementation: Fetch from CMS
        try {
            const response = await fetch(this.config.endpoints.projects, {
                headers: {
                    'Authorization': `Bearer ${this.config.authentication.token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching projects from CMS:', error);
            throw error;
        }
    }
    
    /**
     * Get categories from CMS
     * @override
     * @returns {Promise<Array<string>>} Promise resolving to array of categories
     * @throws {Error} If fetch fails
     */
    async getCategories() {
        // Future implementation: Fetch from CMS
        try {
            const response = await fetch(this.config.endpoints.categories, {
                headers: {
                    'Authorization': `Bearer ${this.config.authentication.token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories from CMS:', error);
            throw error;
        }
    }
}

/**
 * Main Portfolio Class - Refactored for modularity
 * @class StaticPortfolio
 */
class StaticPortfolio {
    /**
     * Creates an instance of StaticPortfolio
     * @constructor
     */
    constructor() {
        /** @type {?HTMLElement} Projects container element */
        this.projectsContainer = document.getElementById('projects-container');
        
        /** @type {?HTMLElement} Loading message element */
        this.loadingMessage = document.getElementById('loading-message');
        
        /** @type {?ProjectStack} Project stack instance */
        this.projectStack = null;
        
        /** @type {?FilterSystem} Filter system instance */
        this.filterSystem = null;
        
        // Initialize data source based on configuration
        this.dataSource = this.initializeDataSource();
        
        // Load projects
        this.loadProjects();
    }
    
    /**
     * Initialize the appropriate data source
     * @returns {PortfolioDataSource} Data source instance
     */
    initializeDataSource() {
        if (CMS_CONFIG.enabled) {
            // Future: Use CMS data source
            return new CMSDataSource(CMS_CONFIG);
        } else {
            // Current: Use static data source
            return new StaticDataSource();
        }
    }
    
    /**
     * Load projects from data source
     * @async
     * @returns {Promise<void>}
     */
    async loadProjects() {
        try {
            // Show loading state
            this.showLoading();
            
            // Fetch projects from data source
            const projects = await this.dataSource.getProjects();
            
            if (projects && projects.length > 0) {
                // Generate filters based on projects
                await this.generateFilters(projects);
                
                // Render projects
                this.renderProjects(projects);
            } else {
                this.showNoProjects();
            }
        } catch (error) {
            // Usa error handler globale se disponibile
            if (window.errorHandler) {
                window.errorHandler.handle(error, {
                    component: 'PortfolioManager',
                    action: 'loadProjects',
                    critical: true
                });
            }
            
            this.showError('Impossibile caricare i progetti. Riprova più tardi.');
        }
    }
    
    /**
     * Show loading state
     * @returns {void}
     */
    showLoading() {
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'block';
            this.loadingMessage.innerHTML = '<p>Caricamento progetti...</p>';
        }
    }
    
    /**
     * Generate filter buttons based on categories
     * @async
     * @param {Array<Object>} projects - Array of project objects
     * @returns {Promise<void>}
     */
    async generateFilters(projects) {
        try {
            // Get categories from data source for future flexibility
            const categories = await this.dataSource.getCategories();
            
            // Find filters container
            const filtersContainer = document.getElementById('filters');
            
            if (!filtersContainer) {
                console.warn('Filters container not found');
                return;
            }
            
            // Create filters HTML
            let filtersHTML = '<div class="filter-item active" data-filter="all">TUTTI I LAVORI</div>';
            
            categories.forEach(category => {
                const label = this.getCategoryLabel(category);
                filtersHTML += `<div class="filter-item" data-filter="${category}">${label}</div>`;
            });
            
            // Update filters in DOM
            filtersContainer.innerHTML = filtersHTML;
        } catch (error) {
            console.error('Error generating filters:', error);
        }
    }
    
    /**
     * Render projects in the DOM
     * @param {Array<Object>} projects - Array of project objects
     * @returns {void}
     */
    renderProjects(projects) {
        // Clear loading message
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'none';
        }
        
        // Generate HTML for each project
        const projectsHTML = projects.map((project, index) => {
            const placeholderData = this.getPlaceholderData(index);
            const randomId = Math.floor(Math.random() * 1000) + 1;
            
            return `
                <div class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-index="${index}" data-title="${project.title}">
                    <div class="project-content" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
                        <img src="https://picsum.photos/400/550?random=${randomId}" alt="${project.title}" width="400" height="550" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                        <div class="desktop-title" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 20px;">
                            <h3 style="color: white; font-family: Neue; font-size: 1.2rem; font-weight: 600; text-align: center; text-transform: uppercase; margin: 0;">${project.title}</h3>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Insert projects into container
        if (this.projectsContainer) {
            this.projectsContainer.innerHTML = projectsHTML;
        }
        
        // Initialize stack and filter system after projects are loaded
        this.initializeComponents();
    }
    
    /**
     * Get placeholder data for project styling
     * @param {number} index - Project index
     * @returns {{class: string}} Placeholder data object
     */
    getPlaceholderData(index) {
        const placeholders = [
            { class: 'minimal' },
            { class: 'tech' },
            { class: 'colorful' },
            { class: 'dark' },
            { class: 'gradient' }
        ];
        
        return placeholders[index % placeholders.length];
    }
    
    /**
     * Show no projects message
     * @returns {void}
     */
    showNoProjects() {
        if (this.loadingMessage) {
            this.loadingMessage.innerHTML = '<p>Nessun progetto trovato.</p>';
        }
    }
    
    /**
     * Show error message
     * @param {string} [message='Errore nel caricamento progetti'] - Error message to display
     * @returns {void}
     */
    showError(message = 'Errore nel caricamento progetti') {
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'block';
            this.loadingMessage.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                ">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto 16px; opacity: 0.5;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p style="margin-bottom: 16px; color: #333;">${message}</p>
                    <button onclick="location.reload()" style="
                        padding: 8px 24px;
                        background: #000;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Ricarica</button>
                </div>
            `;
        }
    }
    
    /**
     * Get display label for category
     * @param {string} category - Category identifier
     * @returns {string} Display label
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
    
    /**
     * Initialize portfolio components after projects are loaded
     * @returns {void}
     */
    initializeComponents() {
        // Use requestAnimationFrame for better timing than setTimeout
        requestAnimationFrame(() => {
            this.projectStack = new ProjectStack();
            this.filterSystem = new FilterSystem();
            
            // Add mobile class if needed
            if (window.innerWidth <= window.CONSTANTS.BREAKPOINTS.MOBILE) {
                document.body.classList.add('mobile-view');
            }
        });
    }
}


// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Static Portfolio
    const staticPortfolio = new StaticPortfolio();
    
    updateDate();
    
    // Enable scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'visible';
        document.documentElement.style.overflow = 'visible';
    }
    
    // Initialize CLS Optimizer for portfolio page
    if (window.CLSOptimizer) {
        window.CLSOptimizer.init();
    }
    
    // Smooth scrolling for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Prevent default drag behavior on images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
    });
});

// Export for ES6 module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProjectStack,
        FilterSystem,
        StaticPortfolio,
        PortfolioDataSource,
        StaticDataSource,
        CMSDataSource,
        updateDate
    };
}