/**
 * Portfolio Static Data - Professional Implementation
 * Uses centralized data layer for consistency and maintainability
 * @author Senior Developer  
 * @version 2.0.0
 */

console.log('[Portfolio-Static] Script loaded');

// Import project data from centralized data layer  
console.log('[Portfolio-Static] Importing projects data...');
import { getAllProjects, getProjectsByCategory } from './projects-data.js?v=4';

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
        console.log('[PortfolioInitializer] Constructor called');
        this.initialized = false;
        this.projects = [];
        this.currentFilter = 'all';
        
        console.log('[PortfolioInitializer] Starting init...');
        this.init();
    }
    
    /**
     * Initialize portfolio system
     */
    async init() {
        console.log('[PortfolioInitializer] Init called, initialized:', this.initialized);
        
        if (this.initialized) {
            console.log('[PortfolioInitializer] Already initialized, skipping');
            return;
        }
        
        try {
            console.log('[PortfolioInitializer] Loading projects from data layer...');
            
            // Load projects from centralized data
            this.projects = getAllProjects();
            console.log('[PortfolioInitializer] Projects loaded:', this.projects.length);
            console.log('[PortfolioInitializer] Sample project:', this.projects[0]?.title);
            
            // Initialize filters
            console.log('[PortfolioInitializer] Initializing filters...');
            this.initializeFilters();
            
            // Load and render projects
            console.log('[PortfolioInitializer] Rendering projects...');
            this.renderProjects();
            
            this.initialized = true;
            console.log('[PortfolioInitializer] ✅ Successfully initialized');
            
        } catch (error) {
            console.error('[PortfolioInitializer] ❌ Failed to initialize:', error);
            console.error('[PortfolioInitializer] Error stack:', error.stack);
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
 * Initialize when DOM is ready and we're on portfolio page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Portfolio-Static] DOMContentLoaded fired');
    const isPortfolioPage = window.location.pathname.includes('portfolio');
    console.log('[Portfolio-Static] Is portfolio page:', isPortfolioPage, 'path:', window.location.pathname);
    
    if (isPortfolioPage) {
        console.log('[Portfolio-Static] Creating PortfolioInitializer instance...');
        // Initialize professional portfolio system
        window.__PORTFOLIO_INITIALIZER__ = new PortfolioInitializer();
        console.log('[Portfolio-Static] Instance created and assigned to window');
    } else {
        console.log('[Portfolio-Static] Not portfolio page, skipping');
    }
});

// Export for debugging and external access
export { STATIC_FILTERS, PortfolioInitializer };