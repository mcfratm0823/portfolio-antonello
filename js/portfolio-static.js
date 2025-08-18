// Progetti hardcoded dal CMS
const STATIC_PROJECTS = [
    {
        id: 1,
        title: "Cafè 124",
        slug: "cafe-124",
        category: "digital",
        thumbnail: "https://picsum.photos/1200/600?random=201",
        year: "2024",
        featured: false,
        order: 9
    },
    {
        id: 2,
        title: "PROGETTO DUE",
        slug: "progetto-due",
        category: "brand",
        thumbnail: "https://picsum.photos/1200/600?random=301",
        year: "2024",
        featured: false,
        order: 2
    },
    {
        id: 3,
        title: "PROGETTO TRE",
        slug: "progetto-tre",
        category: "web",
        thumbnail: "https://picsum.photos/1200/600?random=401",
        year: "2024",
        featured: false,
        order: 8
    },
    {
        id: 4,
        title: "PROGETTO QUATTRO",
        slug: "progetto-quattro",
        category: "print",
        thumbnail: "https://picsum.photos/1200/600?random=501",
        year: "2024",
        featured: false,
        order: 5
    },
    {
        id: 5,
        title: "PROGETTO CINQUE",
        slug: "progetto-cinque",
        category: "digital",
        thumbnail: "https://picsum.photos/1200/600?random=601",
        year: "2024",
        featured: true,
        order: 1
    },
    {
        id: 6,
        title: "PROGETTO SEI",
        slug: "progetto-sei",
        category: "brand",
        thumbnail: "https://picsum.photos/1200/600?random=701",
        year: "2024",
        featured: false,
        order: 6
    },
    {
        id: 7,
        title: "PROGETTO SETTE",
        slug: "progetto-sette",
        category: "web",
        thumbnail: "https://picsum.photos/1200/600?random=801",
        year: "2024",
        featured: true,
        order: 7
    },
    {
        id: 8,
        title: "PROGETTO OTTO",
        slug: "progetto-otto",
        category: "print",
        thumbnail: "https://picsum.photos/1200/600?random=901",
        year: "2024",
        featured: true,
        order: 4
    },
    {
        id: 9,
        title: "PROGETTO NOVE",
        slug: "progetto-nove",
        category: "digital",
        thumbnail: "https://picsum.photos/1200/600?random=1001",
        year: "2024",
        featured: false,
        order: 3
    }
];

// Filtri hardcoded
const STATIC_FILTERS = [
    { name: "ALL", value: "all" },
    { name: "DIGITAL", value: "digital" },
    { name: "BRAND", value: "brand" },
    { name: "WEB", value: "web" },
    { name: "PRINT", value: "print" }
];

// Carica i progetti statici quando la pagina è pronta
document.addEventListener('DOMContentLoaded', function() {
    const isPortfolioPage = window.location.pathname.includes('portfolio');
    
    if (isPortfolioPage) {
        // Carica i filtri
        const filtersContainer = document.getElementById('filters');
        if (filtersContainer) {
            filtersContainer.innerHTML = STATIC_FILTERS.map((filter, index) => 
                `<div class="filter-item ${index === 0 ? 'active' : ''}" data-filter="${filter.value}">${filter.name}</div>`
            ).join('');
            
            // Inizializza i filtri
            if (window.initializeFilters) {
                window.initializeFilters();
            }
        }
        
        // Ordina i progetti per order
        const sortedProjects = [...STATIC_PROJECTS].sort((a, b) => a.order - b.order);
        
        // Carica i progetti
        if (window.renderProjects) {
            window.renderProjects(sortedProjects);
        }
    }
});