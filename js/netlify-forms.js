/**
 * Netlify Forms Handler - Sistema semplificato per form Netlify
 * Gestisce sia il form del footer che eventuali altri form
 */

class NetlifyFormsHandler {
    constructor() {
        this.debug = window.location.search.includes('debug=true');
        this.isSubmitting = false;
        this.init();
    }
    
    init() {
        // Gestisci il form del footer esistente
        this.setupFooterForm();
        
        // Gestisci eventuali altri form con data-netlify
        this.setupNetlifyForms();
        
        if (this.debug) {
            console.log('NetlifyFormsHandler initialized');
        }
    }
    
    setupFooterForm() {
        const footerButton = document.getElementById('footer-request-cta');
        
        if (footerButton) {
            footerButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFooterSubmit();
            });
            
            // Setup validation per footer form
            this.setupFooterValidation();
        }
    }
    
    setupFooterValidation() {
        const inputs = [
            document.getElementById('footer-nome'),
            document.getElementById('footer-cognome'),
            document.getElementById('footer-email'),
            document.getElementById('footer-messaggio')
        ].filter(input => input !== null);
        
        const button = document.getElementById('footer-request-cta');
        
        if (inputs.length > 0 && button) {
            const checkCompletion = () => {
                const allFilled = inputs.every(input => input.value.trim() !== '');
                
                if (allFilled) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            };
            
            inputs.forEach(input => {
                input.addEventListener('input', checkCompletion);
            });
            
            checkCompletion();
        }
    }
    
    handleFooterSubmit() {
        if (this.isSubmitting) return;
        
        const nome = document.getElementById('footer-nome')?.value?.trim();
        const cognome = document.getElementById('footer-cognome')?.value?.trim();
        const email = document.getElementById('footer-email')?.value?.trim();
        const messaggio = document.getElementById('footer-messaggio')?.value?.trim();
        
        // Validazione campi obbligatori
        if (!nome || !cognome || !email || !messaggio) {
            this.showMessage('Per favore compila tutti i campi', 'error');
            return;
        }
        
        // Validazione email
        if (!this.isValidEmail(email)) {
            this.showMessage('Inserisci un indirizzo email valido', 'error');
            return;
        }
        
        this.submitToNetlify('contact-footer', {
            nome,
            cognome,
            email,
            messaggio
        });
    }
    
    setupNetlifyForms() {
        const forms = document.querySelectorAll('form[data-netlify="true"]');
        
        forms.forEach(form => {
            // Skip hidden forms
            if (form.style.display === 'none') return;
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    }
    
    handleFormSubmit(form) {
        if (this.isSubmitting) return;
        
        const formData = new FormData(form);
        const formName = form.getAttribute('name') || 'contact';
        
        // Converti FormData in oggetto
        const data = {};
        formData.forEach((value, key) => {
            if (key !== 'bot-field') { // Skip honeypot
                data[key] = value;
            }
        });
        
        this.submitToNetlify(formName, data);
    }
    
    submitToNetlify(formName, data) {
        if (this.isSubmitting) return;
        
        this.isSubmitting = true;
        this.showLoading(true);
        
        // Crea form temporaneo per il submit
        const tempForm = document.createElement('form');
        tempForm.method = 'POST';
        tempForm.action = '/success.html';
        tempForm.setAttribute('data-netlify', 'true');
        tempForm.style.display = 'none';
        
        // Aggiungi form-name
        const formNameInput = document.createElement('input');
        formNameInput.type = 'hidden';
        formNameInput.name = 'form-name';
        formNameInput.value = formName;
        tempForm.appendChild(formNameInput);
        
        // Aggiungi honeypot
        const honeypot = document.createElement('input');
        honeypot.type = 'hidden';
        honeypot.name = 'bot-field';
        tempForm.appendChild(honeypot);
        
        // Aggiungi tutti i dati
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                tempForm.appendChild(input);
            }
        });
        
        // Analytics/tracking se disponibile
        if (window.gtag) {
            window.gtag('event', 'form_submit', {
                form_name: formName,
                success: true
            });
        }
        
        if (this.debug) {
            console.log('Submitting to Netlify:', formName, data);
        }
        
        // Aggiungi al DOM e submit
        document.body.appendChild(tempForm);
        tempForm.submit();
    }
    
    resetForm(formName) {
        if (formName === 'contact-footer') {
            // Reset footer form
            const fields = ['footer-nome', 'footer-cognome', 'footer-email', 'footer-messaggio'];
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = '';
            });
            
            // Reset button state
            const button = document.getElementById('footer-request-cta');
            if (button) button.classList.remove('active');
        } else {
            // Reset other forms
            const form = document.querySelector(`form[name="${formName}"]`);
            if (form && form.style.display !== 'none') {
                form.reset();
            }
        }
    }
    
    showLoading(show) {
        const buttons = [
            document.getElementById('footer-request-cta'),
            ...document.querySelectorAll('form[data-netlify="true"] button[type="submit"]')
        ].filter(Boolean);
        
        buttons.forEach(button => {
            if (show) {
                button.style.opacity = '0.5';
                button.style.pointerEvents = 'none';
                button.setAttribute('aria-busy', 'true');
                
                // Cambia testo se possibile
                const textElement = button.querySelector('#footer-request-text') || button;
                if (textElement && !textElement.dataset.originalText) {
                    textElement.dataset.originalText = textElement.textContent;
                    textElement.textContent = 'INVIO IN CORSO...';
                }
            } else {
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
                button.removeAttribute('aria-busy');
                
                // Ripristina testo
                const textElement = button.querySelector('#footer-request-text') || button;
                if (textElement && textElement.dataset.originalText) {
                    textElement.textContent = textElement.dataset.originalText;
                    delete textElement.dataset.originalText;
                }
            }
        });
    }
    
    showMessage(message, type) {
        // Sistema di notifica semplice
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 16px 24px;
            border-radius: 4px;
            font-family: Neue, sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Mostra animazione
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Rimuovi dopo 5 secondi
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NetlifyFormsHandler();
    });
} else {
    new NetlifyFormsHandler();
}

// Export per ES6 modules
export { NetlifyFormsHandler };