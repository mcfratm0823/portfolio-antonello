// Gestione unificata dei form di contatto

class FormHandler {
    constructor() {
        this.formData = {
            form_title: "CONTATTAMI",
            name_placeholder: "NOME",
            surname_placeholder: "COGNOME",
            message_placeholder: "Scrivi qui la tua richiesta",
            button_text: "CONTATTAMI",
            recipient_email: "antonelloguarnieri6@gmail.com",
            success_message: "Grazie! Il tuo messaggio è stato inviato.",
            error_message: "Ops! Qualcosa è andato storto. Riprova.",
            form_integration: {
                type: "netlify",
                custom_endpoint: ""
            }
        };
    }

    updateFormData(data) {
        if (data) {
            this.formData = data;
        }
    }

    setupFooterForm() {
        const footerForm = document.querySelector('.footer-contact-form');
        if (!footerForm) return;

        // Sostituisci il contenuto con un form reale
        const formHTML = `
            <form name="contact-menu" method="POST" data-netlify="true" netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="contact-menu">
                <input type="hidden" name="bot-field">
                <div class="footer-menu-item">${this.formData.form_title}</div>
                <div class="footer-menu-item">
                    <input type="text" name="nome" id="footer-nome" placeholder="${this.formData.name_placeholder}" required />
                </div>
                <div class="footer-menu-item">
                    <input type="text" name="cognome" id="footer-cognome" placeholder="${this.formData.surname_placeholder}" required />
                </div>
                <div class="footer-menu-item">
                    <textarea name="messaggio" id="footer-messaggio" placeholder="${this.formData.message_placeholder}" rows="3" required></textarea>
                </div>
                <div class="footer-menu-item">
                    <button type="submit" id="footer-request-cta" style="background: none; border: none; cursor: pointer; width: 100%;">
                        <div id="footer-request-text">${this.formData.button_text}</div>
                    </button>
                </div>
            </form>
        `;

        footerForm.innerHTML = formHTML;

        // Applica la validazione del form
        this.setupFormValidation('footer');
        
        // Aggiungi gestione AJAX direttamente al form
        const form = footerForm.querySelector('form[data-netlify="true"]');
        if (form && window.handleFormSubmit) {
            form.addEventListener('submit', window.handleFormSubmit);
            console.log('AJAX handler aggiunto al form del footer');
        }
    }

    setupFormValidation(formType = 'footer') {
        const prefix = formType === 'footer' ? 'footer-' : '';
        const nomeInput = document.getElementById(`${prefix}nome`);
        const cognomeInput = document.getElementById(`${prefix}cognome`);
        const messaggioInput = document.getElementById(`${prefix}messaggio`);
        const requestCta = document.getElementById(`${prefix}request-cta`);

        if (nomeInput && cognomeInput && messaggioInput && requestCta) {
            function checkFormCompletion() {
                const nomeValue = nomeInput.value.trim();
                const cognomeValue = cognomeInput.value.trim();
                const messaggioValue = messaggioInput.value.trim();
                
                if (nomeValue && cognomeValue && messaggioValue) {
                    requestCta.classList.add('active');
                } else {
                    requestCta.classList.remove('active');
                }
            }
            
            nomeInput.addEventListener('input', checkFormCompletion);
            cognomeInput.addEventListener('input', checkFormCompletion);
            messaggioInput.addEventListener('input', checkFormCompletion);
            checkFormCompletion();
        }
    }
}

// Inizializza il form handler
const formHandler = new FormHandler();

// Esporta la funzione per aggiornare i dati del form
window.updateFormData = function(data) {
    formHandler.updateFormData(data);
    // Aggiorna anche navbar se esiste
    if (window.updateNavbarFormData) {
        window.updateNavbarFormData(data);
    }
};

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        formHandler.setupFooterForm();
    });
} else {
    formHandler.setupFooterForm();
}

export { FormHandler, formHandler };