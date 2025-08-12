// Carica i dati dal CMS e aggiorna la pagina corrente
async function loadCMSData() {
    try {
        // Carica i dati con cache busting
        const timestamp = new Date().getTime();
        const isPortfolioPage = window.location.pathname.includes('portfolio');
        
        // Carica sempre navigation e form data
        const promises = [
            fetch(`./data/navigation.json?t=${timestamp}`),
            fetch(`./data/contact-form.json?t=${timestamp}`)
        ];
        
        // Aggiungi dati specifici per pagina
        if (isPortfolioPage) {
            promises.push(fetch(`./data/portfolio-page.json?t=${timestamp}`));
        } else {
            promises.push(fetch(`./data/homepage.json?t=${timestamp}`));
        }
        
        const responses = await Promise.all(promises);
        const navData = await responses[0].json();
        const formData = await responses[1].json();
        const pageData = await responses[2].json();
        
        // Aggiorna i dati di navigazione se disponibili
        if (window.updateNavigationData && navData) {
            window.updateNavigationData(navData);
        }
        
        // Aggiorna i dati del form se disponibili
        if (window.updateFormData && formData) {
            window.updateFormData(formData);
        }
        
        // Se navbar ha una funzione separata per il form, aggiornala anche lì
        if (window.updateNavbarFormData && formData) {
            window.updateNavbarFormData(formData);
        }
        
        // Se siamo sulla pagina portfolio, aggiorna il titolo e i filtri
        if (isPortfolioPage && pageData) {
            updateElement('#portfolio-title', pageData.main_title);
            
            // Aggiorna i filtri
            const filtersContainer = document.getElementById('filters');
            if (filtersContainer && pageData.filters) {
                filtersContainer.innerHTML = pageData.filters.map((filter, index) => 
                    `<div class="filter-item ${index === 0 ? 'active' : ''}" data-filter="${filter.value}">${filter.name}</div>`
                ).join('');
                
                // Riattacca gli event listener per i filtri
                if (window.initializeFilters) {
                    window.initializeFilters();
                }
            }
            
            // Carica i progetti
            loadProjects();
        }
        
        // Se siamo sulla homepage, aggiorna i contenuti homepage
        if (!isPortfolioPage && pageData.hero) {
            console.log('Tagline originale:', pageData.hero.tagline);
            updateElement('#antonello-title h1', pageData.hero.title_left);
            updateElement('#guarnieri-title h1', pageData.hero.title_right);
            updateElement('#left-text p', pageData.hero.name_text);
            updateElement('#right-text p', pageData.hero.tagline);
            
            // Gestisci media centrale (video o immagine)
            const centerPhoto = document.querySelector('#center-photo');
            const centerVideo = document.querySelector('#center-video');
            
            if (pageData.hero.center_media_type === 'video' && centerVideo) {
                centerVideo.style.display = 'block';
                if (centerPhoto) centerPhoto.style.display = 'none';
                const video = centerVideo.querySelector('video source');
                if (video) video.src = pageData.hero.center_media;
            } else if (centerPhoto) {
                centerPhoto.style.display = 'block';
                if (centerVideo) centerVideo.style.display = 'none';
                const img = centerPhoto.querySelector('img');
                if (img) img.src = pageData.hero.center_media;
            }
        }
        
        // Aggiorna About Section
        if (!isPortfolioPage && pageData.about) {
            updateElement('.about-label', pageData.about.label);
            updateElement('#about-text p', pageData.about.main_text);
            const columns = document.querySelectorAll('.detail-column p');
            if (columns[0]) columns[0].textContent = pageData.about.column1;
            if (columns[1]) columns[1].textContent = pageData.about.column2;
        }
        
        // Aggiorna Services Section
        if (!isPortfolioPage && pageData.services) {
            updateElement('.services-title', pageData.services.title);
            updateElement('.services-description p', pageData.services.description);
            
            // Aggiorna lista servizi
            const serviceItems = document.querySelectorAll('.service-item');
            pageData.services.list.forEach((service, index) => {
                if (serviceItems[index]) {
                    const item = serviceItems[index];
                    item.dataset.image = service.image;
                    item.querySelector('.service-name').textContent = service.name;
                    item.querySelector('.service-content p').textContent = service.description;
                }
            });
        }
        
        // Aggiorna Portfolio Section
        if (!isPortfolioPage && pageData.portfolio && pageData.portfolio.projects) {
            const workItems = document.querySelectorAll('.selected_work_item');
            pageData.portfolio.projects.forEach((project, index) => {
                if (workItems[index]) {
                    const item = workItems[index];
                    item.querySelector('.selected_work_name').textContent = project.name;
                    item.querySelector('.selected_work_category').textContent = project.category;
                    item.querySelector('.selected_work_box_image').src = project.box_image;
                    item.querySelector('.selected_work_img').src = project.bg_image;
                }
            });
        }
        
        // Aggiorna Footer
        if (!isPortfolioPage && pageData.footer) {
            updateElement('#test-section h2', pageData.footer.title);
            
            // Usa i dati del form centralizzato se disponibili
            if (formData) {
                updateElement('.footer-menu-item:first-child', formData.form_title);
                updateElement('#footer-nome', formData.name_placeholder, 'placeholder');
                updateElement('#footer-cognome', formData.surname_placeholder, 'placeholder');
                updateElement('#footer-messaggio', formData.message_placeholder, 'placeholder');
                updateElement('#footer-request-text', formData.button_text);
                
                const emailLink = document.querySelector('.footer-menu-item a[href^="mailto"]');
                if (emailLink) emailLink.href = `mailto:${formData.recipient_email}`;
            }
            
            const footerLinks = document.querySelectorAll('.footer-contact-link');
            if (footerLinks[0]) {
                footerLinks[0].href = `mailto:${pageData.footer.bottom_email}`;
                footerLinks[0].textContent = pageData.footer.bottom_email;
            }
            if (footerLinks[1]) {
                footerLinks[1].href = `tel:${pageData.footer.bottom_phone}`;
                footerLinks[1].textContent = pageData.footer.bottom_phone;
            }
        }
        
    } catch (error) {
        console.error('Errore nel caricamento dei dati CMS:', error);
    }
}

// Funzione helper per aggiornare elementi
function updateElement(selector, value, attribute = 'textContent') {
    const element = document.querySelector(selector);
    if (element && value) {
        if (attribute === 'textContent') {
            // Processa markdown semplice: **bold** e *italic*
            let html = value
                .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')  // **text** → <b>text</b>
                .replace(/\*(.+?)\*/g, '<em>$1</em>')    // *text* → <em>text</em>
                .replace(/\n/g, '<br>');                 // newlines → <br>
            console.log('HTML processato:', html);
            element.innerHTML = html;
        } else {
            element[attribute] = value;
        }
    }
}

// Carica i progetti dal CMS
async function loadProjects() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`./data/projects.json?t=${timestamp}`);
        const data = await response.json();
        
        if (data && data.projects && window.renderProjects) {
            // Filtra progetti vuoti o malformati per sicurezza
            const validProjects = data.projects.filter(project => {
                // Validazione rigorosa dello slug
                const isValidSlug = project.slug && 
                                  project.slug !== '-' && 
                                  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug);
                
                // Validazione completa del progetto
                return project.title && 
                       project.title !== '-' && 
                       isValidSlug &&
                       project.id &&
                       project.category;
            });
            
            console.log(`Progetti validi: ${validProjects.length} su ${data.projects.length}`);
            window.renderProjects(validProjects);
        }
    } catch (error) {
        console.error('Errore nel caricamento dei progetti:', error);
    }
}

// Carica i dati quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
    loadCMSData();
}