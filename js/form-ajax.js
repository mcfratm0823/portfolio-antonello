// Gestione AJAX per i form Netlify

function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('handleFormSubmit chiamato per:', e.target.getAttribute('name'));
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Disabilita il bottone durante l'invio
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
    }
    
    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
    .then(() => {
        // Successo - mostra il messaggio personalizzato
        if (window.navbarInstance && window.navbarInstance.showSuccessMessage) {
            window.navbarInstance.showSuccessMessage();
        }
        
        // Reset del form
        form.reset();
        
        // Riabilita il bottone
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    })
    .catch((error) => {
        console.error('Errore:', error);
        alert('Si è verificato un errore. Riprova.');
        
        // Riabilita il bottone
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    });
}

// Applica a tutti i form Netlify
function initializeFormAjax() {
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    forms.forEach(form => {
        // Rimuovi listener esistenti per evitare duplicati
        form.removeEventListener('submit', handleFormSubmit);
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form AJAX inizializzato per:', form.getAttribute('name'));
    });
}

// Usa delegazione eventi per catturare tutti i submit, anche futuri
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.hasAttribute('data-netlify')) {
        console.log('Intercettato submit del form:', form.getAttribute('name'));
        handleFormSubmit(e);
    }
}, true); // Usa capture phase

// Inizializza form esistenti quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormAjax);
} else {
    initializeFormAjax();
}

// Re-inizializza quando i form vengono creati dinamicamente
window.addEventListener('formCreated', () => {
    console.log('Evento formCreated ricevuto');
    setTimeout(initializeFormAjax, 100);
});

// Rendi handleFormSubmit disponibile globalmente
window.handleFormSubmit = handleFormSubmit;

export { handleFormSubmit, initializeFormAjax };