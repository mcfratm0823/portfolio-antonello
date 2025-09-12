/**
 * Portfolio Static Data - Professional Implementation
 * Uses centralized data layer for consistency and maintainability
 * @author Senior Developer  
 * @version 2.0.0
 */

// Import project data from centralized data layer  
import { getAllProjects, getProjectsByCategory } from './projects-data.js';

// Professional filter configuration
const STATIC_FILTERS = [
    { name: "ALL", value: "all" },
    { name: "DIGITAL", value: "digital" },
    { name: "BRAND", value: "brand" },
    { name: "WEB", value: "web" },
    { name: "PRINT", value: "print" }
];

/**
 * Professional Portfolio Initializer
 */
class PortfolioInitializer {
    constructor() {
        this.initialized = false;
        this.projects = [];
        this.currentFilter = 'all';
        
        this.init();
    }
    
    /**
     * Initialize portfolio system
     */
    async init() {
        if (this.initialized) {
            return;
        }
        
        try {
            // Load projects from centralized data
            this.projects = getAllProjects();
            
            // Initialize filters
            this.initializeFilters();
            
            // Load and render projects
            this.renderProjects();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('Portfolio initialization failed:', error);
        }
    }
    
    /**
     * Initialize filter system
     */
    initializeFilters() {
        const filtersContainer = document.getElementById('filters');
        if (!filtersContainer) return;
        
        const filtersHTML = STATIC_FILTERS.map((filter, index) => 
            `<div class="filter-item ${index === 0 ? 'active' : ''}" data-filter="${filter.value}">${filter.name}</div>`
        ).join('');
        
        filtersContainer.innerHTML = filtersHTML;
        
        // Add event listeners
        this.attachFilterListeners();
    }
    
    /**
     * Attach filter event listeners
     */
    attachFilterListeners() {
        const filters = document.querySelectorAll('.filter-item');
        
        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                // Update active state
                filters.forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter projects
                const filterValue = e.target.dataset.filter;
                this.filterProjects(filterValue);
            });
        });
    }
    
    /**
     * Filter projects by category
     */
    filterProjects(category) {
        this.currentFilter = category;
        
        try {
            const filteredProjects = getProjectsByCategory(category);
            this.renderProjects(filteredProjects);
        } catch (error) {
            // PortfolioInitializer filter error
        }
    }
    
    /**
     * Render projects using existing portfolio system
     */
    renderProjects(projectsToRender = null) {
        const projects = projectsToRender || this.projects;
        
        // Use existing renderProjects function if available
        if (window.renderProjects && typeof window.renderProjects === 'function') {
            // Convert data format to match existing expectations
            const formattedProjects = projects.map(project => ({
                id: project.id,
                title: project.title,
                slug: project.slug,
                category: project.category,
                thumbnail: project.thumbnail,
                year: project.year,
                featured: project.featured
            }));
            
            window.renderProjects(formattedProjects);
        } else {
            // PortfolioInitializer renderProjects function not available
        }
    }
}

/**
 * Initialize portfolio - handles both DOM ready and already loaded cases
 */
function initializePortfolio() {
    const isPortfolioPage = window.location.pathname.includes('portfolio') || 
                           document.getElementById('projects-container');
    
    if (isPortfolioPage && !window.__PORTFOLIO_INITIALIZER__) {
        console.log('Initializing portfolio...');
        window.__PORTFOLIO_INITIALIZER__ = new PortfolioInitializer();
    }
}

// Handle both cases: DOM already ready or still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    // DOM is already ready, initialize immediately
    initializePortfolio();
}

// Export for debugging and external access
export { STATIC_FILTERS, PortfolioInitializer };