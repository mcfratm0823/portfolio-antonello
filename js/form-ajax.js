// Gestione AJAX per i form Netlify

function handleFormSubmit(e) {
    e.preventDefault();
    
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
    // Aspetta un attimo per essere sicuri che i form siano stati creati
    setTimeout(() => {
        const forms = document.querySelectorAll('form[data-netlify="true"]');
        forms.forEach(form => {
            form.removeEventListener('submit', handleFormSubmit); // Rimuovi listener esistenti
            form.addEventListener('submit', handleFormSubmit);
        });
    }, 500);
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormAjax);
} else {
    initializeFormAjax();
}

// Re-inizializza quando i form vengono creati dinamicamente
window.addEventListener('formCreated', initializeFormAjax);

export { handleFormSubmit, initializeFormAjax };