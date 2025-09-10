// Carica i dati del progetto dal parametro URL
async function loadProjectData() {
    try {
        // Ottieni il parametro 'p' dall'URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectSlug = urlParams.get('p');
        
        if (!projectSlug) {
            console.error('Nessun progetto specificato');
            window.location.href = '../portfolio.html';
            return;
        }
        
        // Carica i dati del progetto
        const timestamp = new Date().getTime();
        const response = await fetch(`../data/${projectSlug}.json?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error('Progetto non trovato');
        }
        
        const projectData = await response.json();
        
        // Aggiorna il DOM con i dati del progetto
        updateProjectPage(projectData);
        
    } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
        // Redirect al portfolio in caso di errore
        setTimeout(() => {
            window.location.href = '../portfolio.html';
        }, 2000);
    }
}

// Aggiorna la pagina con i dati del progetto
function updateProjectPage(data) {
    // Titolo e meta
    document.title = `${data.title} - ANTONELLO GUARNIERI ® VISUAL DESIGNER`;
    
    // Header
    const projectTitle = document.getElementById('project-title');
    if (projectTitle) projectTitle.textContent = data.title;
    
    const projectMeta = document.getElementById('project-meta');
    if (projectMeta) {
        // Fix XSS: Usa DOM sicuro per contenuto dinamico
        projectMeta.textContent = ''; // Pulisci contenuto esistente
        
        const categorySpan = document.createElement('span');
        categorySpan.textContent = data.category;
        projectMeta.appendChild(categorySpan);
        
        const yearSpan = document.createElement('span');
        yearSpan.textContent = data.year;
        projectMeta.appendChild(yearSpan);
        
        const clientSpan = document.createElement('span');
        clientSpan.textContent = data.client;
        projectMeta.appendChild(clientSpan);
    }
    
    // Info block
    const infoBlock = document.querySelector('#project-description .description-text');
    if (infoBlock && data.info_block) {
        infoBlock.textContent = data.info_block.text;
    }
    
    // Hero image
    const heroImg = document.querySelector('#hero-image img');
    if (heroImg && data.hero_image) {
        heroImg.src = data.hero_image;
        heroImg.alt = data.title;
    }
    
    // Approach block
    const approachBlock = document.querySelector('#second-project-description .description-text');
    if (approachBlock && data.approach_block) {
        approachBlock.textContent = data.approach_block.text;
    }
    
    // Gallery pair
    if (data.gallery_pair) {
        const galleryImages = document.querySelectorAll('#static-gallery .gallery-item img');
        galleryImages.forEach((img, index) => {
            if (data.gallery_pair[index]) {
                img.src = data.gallery_pair[index].image;
                img.alt = data.gallery_pair[index].caption || `${data.title} - Immagine ${index + 1}`;
            }
        });
    }
    
    // Carica altri progetti correlati se necessario
    loadRelatedProjects(data.related_projects);
}

// Carica i progetti correlati
async function loadRelatedProjects(relatedIds) {
    if (!relatedIds || relatedIds.length === 0) return;
    
    try {
        // Carica la lista progetti
        const timestamp = new Date().getTime();
        const response = await fetch(`../data/projects.json?t=${timestamp}`);
        const projectsData = await response.json();
        
        // Filtra i progetti correlati
        const relatedProjects = projectsData.projects.filter(p => 
            relatedIds.includes(p.id) && relatedIds.indexOf(p.id) < 4
        );
        
        // Aggiorna i project slides nella gallery cinetica
        const projectSlides = document.querySelectorAll('.project-slide');
        relatedProjects.forEach((project, index) => {
            if (projectSlides[index]) {
                updateProjectSlide(projectSlides[index], project);
            }
        });
        
    } catch (error) {
        console.error('Errore nel caricamento progetti correlati:', error);
    }
}

// Aggiorna un singolo slide progetto
function updateProjectSlide(slide, project) {
    const link = slide.querySelector('.project-link');
    if (link) {
        link.href = `./project-detail.html?p=${project.slug}`;
    }
    
    const img = slide.querySelector('.project-preview img');
    if (img) {
        img.src = project.thumbnail;
        img.alt = project.title;
    }
    
    const titles = slide.querySelectorAll('.project-title, .project-title-overlay h3');
    titles.forEach(title => {
        title.textContent = project.title;
    });
    
    const metas = slide.querySelectorAll('.project-meta');
    metas.forEach(meta => {
        // Fix XSS: Usa DOM sicuro per contenuto dinamico
        meta.textContent = ''; // Pulisci contenuto esistente
        
        const categorySpan = document.createElement('span');
        categorySpan.textContent = project.category.toUpperCase();
        meta.appendChild(categorySpan);
        
        const bulletSpan = document.createElement('span');
        bulletSpan.textContent = '•';
        meta.appendChild(bulletSpan);
        
        const yearSpan = document.createElement('span');
        yearSpan.textContent = project.year;
        meta.appendChild(yearSpan);
    });
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjectData);
} else {
    loadProjectData();
}

// Esporta per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadProjectData,
        updateProjectPage,
        loadRelatedProjects
    };
}