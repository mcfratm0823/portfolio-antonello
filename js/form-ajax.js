// Gestione AJAX per i form Netlify

function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle form submit
    
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
        // Form sent successfully
        
        // Successo - mostra il messaggio personalizzato
        if (window.navbarInstance && window.navbarInstance.showSuccessMessage) {
            // Calling showSuccessMessage from navbarInstance
            window.navbarInstance.showSuccessMessage();
        } else {
            // navbarInstance not available, creating direct message
            // Fallback: crea il messaggio direttamente
            showSuccessMessageDirect();
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
        // Error occurred
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
        // Form AJAX initialized
    });
}

// Usa delegazione eventi per catturare tutti i submit, anche futuri
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.hasAttribute('data-netlify')) {
        // Form submit intercepted
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
    // formCreated event received
    setTimeout(initializeFormAjax, 100);
});

// Funzione di fallback per mostrare il messaggio di successo
function showSuccessMessageDirect() {
    // Chiudi il menu se è aperto
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.remove();
        document.body.style.overflow = '';
    }
    
    // Crea overlay scuro
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Crea messaggio
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: transparent;
        color: #fff;
        padding: 3rem;
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;
    
    // Fix XSS: Usa DOM sicuro invece di innerHTML per contenuto statico
    const h2 = document.createElement('h2');
    h2.style.cssText = "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 3rem; margin: 0 0 1rem 0; font-weight: 400; letter-spacing: -0.02em;";
    h2.textContent = 'Grazie! Il tuo messaggio è stato inviato.';
    
    const p = document.createElement('p');
    p.style.cssText = "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 1rem; opacity: 0.7; margin: 0;";
    p.textContent = 'Ti risponderò al più presto';
    
    successDiv.appendChild(h2);
    successDiv.appendChild(p);
    
    overlay.appendChild(successDiv);
    document.body.appendChild(overlay);
    
    // Animazione entrata
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        successDiv.style.transform = 'scale(1)';
    });
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        overlay.style.opacity = '0';
        successDiv.style.transform = 'scale(0.9)';
        setTimeout(() => overlay.remove(), 300);
    }, 5000);
}

// Rendi handleFormSubmit disponibile globalmente
window.handleFormSubmit = handleFormSubmit;

export { handleFormSubmit, initializeFormAjax };