// Gestione unificata dei form di contatto

class FormHandler {
    constructor() {
        this.formData = {
            form_title: "CONTATTAMI",
            name_placeholder: "NOME",
            surname_placeholder: "COGNOME",
            email_placeholder: "EMAIL",
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
                .footer-contact-form {
                    width: 100%;
                    max-width: 600px;
                }
                
                .footer-contact-form form {
                    width: 100%;
                }
                
                .footer-contact-form .footer-menu-item {
                    width: 100%;
                }
                
                .footer-menu-item {
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    font-weight: 400;
                    line-height: normal;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.07vw;
                    margin-bottom: 1vw;
                    transition: color 0s;
                }
                
                .footer-menu-item:last-child {
                    margin-top: 0;
                    margin-bottom: 0;
                }
                
                /* Titolo del form sempre bianco */
                .footer-form-title {
                    color: #fff !important;
                }
                
                .footer-form-title:hover {
                    color: #fff !important;
                }
                
                /* Hover solo per gli altri elementi */
                .footer-menu-item:not(.footer-form-title):hover {
                    color: #fff !important;
                    transition: none !important;
                }
                
                /* Stili per input e textarea nel footer */
                .footer-contact-form .footer-menu-item input,
                .footer-contact-form .footer-menu-item textarea {
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
                    width: 100% !important;
                    max-width: 100% !important;
                    padding: 0;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
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
                
                /* Rimuovi stili autocomplete del browser */
                .footer-contact-form input:-webkit-autofill,
                .footer-contact-form input:-webkit-autofill:hover, 
                .footer-contact-form input:-webkit-autofill:focus,
                .footer-contact-form textarea:-webkit-autofill,
                .footer-contact-form textarea:-webkit-autofill:hover,
                .footer-contact-form textarea:-webkit-autofill:focus {
                    -webkit-text-fill-color: #fff !important;
                    -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
                    box-shadow: 0 0 0px 1000px transparent inset !important;
                    background-color: transparent !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                
                .footer-menu-item textarea {
                    text-transform: none;
                    letter-spacing: normal;
                    resize: none;
                    min-height: 1.5em;
                    height: auto;
                    overflow: hidden;
                    padding-top: 0.1em;
                    padding-bottom: 0.1em;
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

        // Fix XSS: Crea form con DOM manipulation sicuro
        const form = document.createElement('form');
        form.name = 'contact-menu';
        form.method = 'POST';
        form.setAttribute('data-netlify', 'true');
        form.setAttribute('netlify-honeypot', 'bot-field');
        
        // Hidden inputs
        const formNameInput = document.createElement('input');
        formNameInput.type = 'hidden';
        formNameInput.name = 'form-name';
        formNameInput.value = 'contact-menu';
        form.appendChild(formNameInput);
        
        const botField = document.createElement('input');
        botField.type = 'hidden';
        botField.name = 'bot-field';
        form.appendChild(botField);
        
        // Form title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'footer-menu-item footer-form-title';
        titleDiv.textContent = this.formData.form_title; // textContent è sicuro
        form.appendChild(titleDiv);
        
        // Nome input
        const nomeDiv = document.createElement('div');
        nomeDiv.className = 'footer-menu-item';
        const nomeInput = document.createElement('input');
        nomeInput.type = 'text';
        nomeInput.name = 'nome';
        nomeInput.id = 'footer-nome';
        nomeInput.placeholder = this.formData.name_placeholder; // setAttribute è sicuro
        nomeInput.required = true;
        nomeDiv.appendChild(nomeInput);
        form.appendChild(nomeDiv);
        
        // Cognome input
        const cognomeDiv = document.createElement('div');
        cognomeDiv.className = 'footer-menu-item';
        const cognomeInput = document.createElement('input');
        cognomeInput.type = 'text';
        cognomeInput.name = 'cognome';
        cognomeInput.id = 'footer-cognome';
        cognomeInput.placeholder = this.formData.surname_placeholder;
        cognomeInput.required = true;
        cognomeDiv.appendChild(cognomeInput);
        form.appendChild(cognomeDiv);
        
        // Email input
        const emailDiv = document.createElement('div');
        emailDiv.className = 'footer-menu-item';
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.id = 'footer-email';
        emailInput.placeholder = this.formData.email_placeholder;
        emailInput.required = true;
        emailDiv.appendChild(emailInput);
        form.appendChild(emailDiv);
        
        // Messaggio textarea
        const messaggioDiv = document.createElement('div');
        messaggioDiv.className = 'footer-menu-item';
        const messaggioTextarea = document.createElement('textarea');
        messaggioTextarea.name = 'messaggio';
        messaggioTextarea.id = 'footer-messaggio';
        messaggioTextarea.placeholder = this.formData.message_placeholder;
        messaggioTextarea.required = true;
        messaggioDiv.appendChild(messaggioTextarea);
        form.appendChild(messaggioDiv);
        
        // Submit button
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'footer-menu-item';
        const button = document.createElement('button');
        button.type = 'submit';
        button.id = 'footer-request-cta';
        button.style.cssText = 'background: none; border: none; cursor: pointer; width: 100%;';
        const buttonText = document.createElement('div');
        buttonText.id = 'footer-request-text';
        buttonText.textContent = this.formData.button_text; // textContent è sicuro
        button.appendChild(buttonText);
        buttonDiv.appendChild(button);
        form.appendChild(buttonDiv);
        
        // Pulisci e aggiungi il form
        footerForm.textContent = ''; // Pulisci contenuto esistente
        footerForm.appendChild(form);

        // Applica la validazione del form
        this.setupFormValidation('footer');
        
        // Aggiungi gestione AJAX direttamente al form
        const ajaxForm = footerForm.querySelector('form[data-netlify="true"]');
        if (ajaxForm && window.handleFormSubmit) {
            ajaxForm.addEventListener('submit', window.handleFormSubmit);
            // AJAX handler aggiunto al form del footer
        }
    }

    setupFormValidation(formType = 'footer') {
        const prefix = formType === 'footer' ? 'footer-' : '';
        const nomeInput = document.getElementById(`${prefix}nome`);
        const cognomeInput = document.getElementById(`${prefix}cognome`);
        const emailInput = document.getElementById(`${prefix}email`);
        const messaggioInput = document.getElementById(`${prefix}messaggio`);
        const requestCta = document.getElementById(`${prefix}request-cta`);

        if (nomeInput && cognomeInput && emailInput && messaggioInput && requestCta) {
            function checkFormCompletion() {
                const nomeValue = nomeInput.value.trim();
                const cognomeValue = cognomeInput.value.trim();
                const emailValue = emailInput.value.trim();
                const messaggioValue = messaggioInput.value.trim();
                
                if (nomeValue && cognomeValue && emailValue && messaggioValue) {
                    requestCta.classList.add('active');
                } else {
                    requestCta.classList.remove('active');
                }
            }
            
            nomeInput.addEventListener('input', checkFormCompletion);
            cognomeInput.addEventListener('input', checkFormCompletion);
            emailInput.addEventListener('input', checkFormCompletion);
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

// Inizializza quando il DOM è pronto - con controllo duplicazione
if (!window.__FORM_HANDLER_INITIALIZED__) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.__FORM_HANDLER_INITIALIZED__) {
                window.__FORM_HANDLER_INITIALIZED__ = true;
                formHandler.setupFooterForm();
            }
        });
    } else {
        window.__FORM_HANDLER_INITIALIZED__ = true;
        formHandler.setupFooterForm();
    }
}

export { FormHandler, formHandler };