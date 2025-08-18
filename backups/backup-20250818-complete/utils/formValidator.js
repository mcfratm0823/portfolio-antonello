/**
 * @typedef {Object} FormValidatorConfig
 * @property {HTMLInputElement[]|HTMLTextAreaElement[]} fields - Array di elementi form da validare
 * @property {HTMLElement} submitButton - Bottone submit/CTA da attivare/disattivare
 * @property {string} [activeClass='active'] - Classe CSS per stato attivo
 * @property {boolean} [validateOnInit=true] - Se validare immediatamente al caricamento
 * @property {function(boolean): void} [onValidate] - Callback chiamata ad ogni validazione
 */

/**
 * FormValidator - Unified form validation utility
 * Handles form validation for contact forms across the site
 * @class
 */
class FormValidator {
    /**
     * Crea una nuova istanza di FormValidator
     * @param {FormValidatorConfig} config - Configurazione del validator
     * @throws {Error} Se mancano campi obbligatori nella configurazione
     */
    constructor(config) {
        /** @type {HTMLInputElement[]|HTMLTextAreaElement[]} */
        this.fields = config.fields;
        
        /** @type {HTMLElement} */
        this.submitButton = config.submitButton;
        
        /** @type {string} */
        this.activeClass = config.activeClass || 'active';
        
        /** @type {boolean} */
        this.validateOnInit = config.validateOnInit !== false;
        
        /** @type {function(boolean): void|null} */
        this.onValidate = config.onValidate || null;
        
        this.init();
    }
    
    /**
     * Inizializza il validator aggiungendo event listeners
     * @private
     * @returns {void}
     */
    init() {
        // Validate required elements exist
        if (!this.fields || !this.fields.length || !this.submitButton) {
            return;
        }
        
        // Bind validation to each field
        this.fields.forEach(field => {
            if (field) {
                field.addEventListener('input', () => this.validate());
            }
        });
        
        // Initial validation check
        if (this.validateOnInit) {
            this.validate();
        }
    }
    
    /**
     * Valida tutti i campi e aggiorna lo stato del bottone
     * @returns {boolean} true se tutti i campi sono validi
     */
    validate() {
        // Check if all fields have non-empty trimmed values
        const allFieldsFilled = this.fields.every(field => 
            field && field.value && field.value.trim() !== ''
        );
        
        // Update button state
        if (allFieldsFilled) {
            this.submitButton.classList.add(this.activeClass);
        } else {
            this.submitButton.classList.remove(this.activeClass);
        }
        
        // Call optional callback
        if (this.onValidate) {
            this.onValidate(allFieldsFilled);
        }
        
        return allFieldsFilled;
    }
    
    /**
     * Controlla se il form è attualmente valido
     * @returns {boolean} true se tutti i campi sono compilati
     */
    isValid() {
        return this.fields.every(field => 
            field && field.value && field.value.trim() !== ''
        );
    }
    
    /**
     * Resetta tutti i campi del form e rivalida
     * @returns {void}
     */
    reset() {
        this.fields.forEach(field => {
            if (field) {
                field.value = '';
            }
        });
        this.validate();
    }
}

// Export for ES6 modules
export { FormValidator };

// Also make available globally for backward compatibility
window.FormValidator = FormValidator;