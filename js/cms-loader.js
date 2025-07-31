// Carica i dati dal CMS e aggiorna la homepage
async function loadCMSData() {
    try {
        // Carica i dati della homepage
        const response = await fetch('/_data/homepage.json');
        const data = await response.json();
        
        // Aggiorna Hero Section
        if (data.hero) {
            updateElement('#antonello-title h1', data.hero.title_left);
            updateElement('#guarnieri-title h1', data.hero.title_right);
            updateElement('#left-text p', data.hero.name_text);
            updateElement('#right-text p', data.hero.tagline);
            
            // Gestisci media centrale (video o immagine)
            const centerPhoto = document.querySelector('#center-photo');
            const centerVideo = document.querySelector('#center-video');
            
            if (data.hero.center_media_type === 'video' && centerVideo) {
                centerVideo.style.display = 'block';
                if (centerPhoto) centerPhoto.style.display = 'none';
                const video = centerVideo.querySelector('video source');
                if (video) video.src = data.hero.center_media;
            } else if (centerPhoto) {
                centerPhoto.style.display = 'block';
                if (centerVideo) centerVideo.style.display = 'none';
                const img = centerPhoto.querySelector('img');
                if (img) img.src = data.hero.center_media;
            }
        }
        
        // Aggiorna About Section
        if (data.about) {
            updateElement('.about-label', data.about.label);
            updateElement('#about-text p', data.about.main_text);
            const columns = document.querySelectorAll('.detail-column p');
            if (columns[0]) columns[0].textContent = data.about.column1;
            if (columns[1]) columns[1].textContent = data.about.column2;
        }
        
        // Aggiorna Services Section
        if (data.services) {
            updateElement('.services-title', data.services.title);
            updateElement('.services-description p', data.services.description);
            
            // Aggiorna lista servizi
            const serviceItems = document.querySelectorAll('.service-item');
            data.services.list.forEach((service, index) => {
                if (serviceItems[index]) {
                    const item = serviceItems[index];
                    item.dataset.image = service.image;
                    item.querySelector('.service-name').textContent = service.name;
                    item.querySelector('.service-content p').textContent = service.description;
                }
            });
        }
        
        // Aggiorna Portfolio Section
        if (data.portfolio && data.portfolio.projects) {
            const workItems = document.querySelectorAll('.selected_work_item');
            data.portfolio.projects.forEach((project, index) => {
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
        if (data.footer) {
            updateElement('#test-section h2', data.footer.title);
            updateElement('.footer-menu-item:first-child', data.footer.form_title);
            updateElement('#footer-nome', data.footer.name_placeholder, 'placeholder');
            updateElement('#footer-cognome', data.footer.surname_placeholder, 'placeholder');
            updateElement('#footer-messaggio', data.footer.message_placeholder, 'placeholder');
            updateElement('#footer-request-text', data.footer.button_text);
            
            const emailLink = document.querySelector('.footer-menu-item a[href^="mailto"]');
            if (emailLink) emailLink.href = `mailto:${data.footer.email_link}`;
            
            const footerLinks = document.querySelectorAll('.footer-contact-link');
            if (footerLinks[0]) {
                footerLinks[0].href = `mailto:${data.footer.bottom_email}`;
                footerLinks[0].textContent = data.footer.bottom_email;
            }
            if (footerLinks[1]) {
                footerLinks[1].href = `tel:${data.footer.bottom_phone}`;
                footerLinks[1].textContent = data.footer.bottom_phone;
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
            element.innerHTML = value.replace(/\n/g, '<br>');
        } else {
            element[attribute] = value;
        }
    }
}

// Carica i dati quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
    loadCMSData();
}