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
        
        // Aggiungi CSS per uniformare spaziature con il menu
        if (!document.getElementById('footer-form-styles')) {
            const style = document.createElement('style');
            style.id = 'footer-form-styles';
            style.textContent = `
                .footer-menu-item {
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    font-weight: 400;
                    line-height: normal;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.07vw;
                    margin-bottom: 1vw;
                    cursor: default;
                    transition: color 0s;
                }
                
                .footer-menu-item:last-child {
                    margin-top: 0;
                    margin-bottom: 0;
                }
                
                .footer-menu-item:first-child {
                    font-size: clamp(12px, 0.9vw, 16px);
                    color: #fff;
                }
                
                .footer-menu-item:hover {
                    color: #fff !important;
                    transition: none !important;
                }
                
                /* Stili per input e textarea nel footer */
                .footer-menu-item input,
                .footer-menu-item textarea {
                    background: transparent;
                    border: none;
                    color: #474747;
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    font-weight: 400;
                    line-height: normal;
                    text-transform: uppercase;
                    letter-spacing: 0.07vw;
                    outline: none;
                    width: 100%;
                    padding: 0;
                    transition: all 0.3s ease;
                }
                
                .footer-menu-item input::placeholder {
                    color: #474747;
                    opacity: 1;
                }
                
                .footer-menu-item textarea::placeholder {
                    color: #474747;
                    opacity: 1;
                }
                
                .footer-menu-item input:focus,
                .footer-menu-item textarea:focus {
                    color: #474747;
                }
                
                .footer-menu-item input:not(:placeholder-shown),
                .footer-menu-item textarea:not(:placeholder-shown) {
                    color: #fff;
                }
                
                .footer-menu-item textarea {
                    text-transform: none;
                    letter-spacing: normal;
                    resize: none;
                    min-height: 1.5em;
                    height: 1.5em;
                    overflow: hidden;
                    white-space: nowrap;
                    padding-top: 0.1em;
                    padding-bottom: 0.1em;
                    text-indent: -0.5em;
                    padding-left: 0.5em;
                }
                
                #footer-request-cta {
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    text-transform: uppercase;
                    background: transparent;
                    cursor: pointer;
                    color: #474747;
                    display: inline-block;
                    opacity: 1;
                    pointer-events: none;
                }
                
                #footer-request-cta.active {
                    color: white;
                    pointer-events: auto;
                }
                
                #footer-request-text {
                    opacity: 1;
                    color: inherit;
                    white-space: nowrap;
                    transition: all .5s ease;
                }
            `;
            document.head.appendChild(style);
        }

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
                    <textarea name="messaggio" id="footer-messaggio" placeholder="${this.formData.message_placeholder}" rows="1" required></textarea>
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