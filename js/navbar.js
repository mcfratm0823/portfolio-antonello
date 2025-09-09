// Navbar Component - Shared across all pages

// Import FormValidator if available
let FormValidator;
if (typeof window !== 'undefined' && window.FormValidator) {
    FormValidator = window.FormValidator;
}

// Singleton instance
let navbarInstance = null;

class Navbar {
    constructor() {
        // Track mouse position globally
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        
        // Calculate the correct path to assets based on current location
        const pathDepth = window.location.pathname.split('/').filter(p => p).length - 1;
        this.assetPath = pathDepth > 0 ? '../'.repeat(pathDepth) : './';
        
        // Arrays to store event listeners and timeouts for cleanup
        this.eventListeners = [];
        this.timeouts = [];
        this.animationFrames = [];
        
        // Store references to DOM elements that need cleanup
        this.menuOverlay = null;
        this.mouseThrottleTimer = null;
        this.formValidatorInstance = null;
        
        // Store navigation data
        this.navigationData = {
            logo: { text: "0823®", link: "index.html" },
            menu_trigger: { text: "IV.V.MMXXIII", show_arrow: true },
            menu_overlay: {
                close_text: "CHIUDI",
                footer_description: "CREO ESPERIENZE DIGITALI CHIARE E UTILI, UNENDO DESIGN CURATO,\nSVILUPPO CON AI E GESTIONE ATTENTA DEI PROGETTI PER\nTRASFORMARE OGNI IDEA IN RISULTATI CONCRETI.",
                footer_website: "ANTONELLOGUARNIERI.NET",
                footer_email: "ANTONELLOGUARNIERI6@GMAIL.COM",
                main_menu: [
                    { name: "INDEX.HTML", link: "index.html", order: 1 },
                    { name: "LAVORI", link: "portfolio.html", order: 2 }
                ]
            }
        };
        
        // Store form data
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
        
        // Throttled mouse tracking for better performance
        const mouseMoveHandler = (e) => {
            // Update immediately for current values
            this.currentMouseX = e.clientX;
            this.currentMouseY = e.clientY;
            
            // Throttle any expensive operations
            if (!this.mouseThrottleTimer) {
                this.mouseThrottleTimer = setTimeout(() => {
                    this.mouseThrottleTimer = null;
                    // Any expensive mouse-related operations would go here
                }, 16); // ~60fps
            }
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        this.eventListeners.push({ element: document, event: 'mousemove', handler: mouseMoveHandler });
        
        this.navbarHTML = `
            <nav id="navbar">
                <div class="navbar-logo">
                    <span>${this.navigationData.logo.text}</span>
                </div>
                <div class="navbar-menu" id="menu-trigger">
                    <span>${this.navigationData.menu_trigger.text}${this.navigationData.menu_trigger.show_arrow ? ` <img src="${this.assetPath}img/arrow.svg" alt="" class="navbar-arrow">` : ''}</span>
                </div>
            </nav>
        `;
        
        this.navbarCSS = `
                /* Navbar Styles */
                #navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 80px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 clamp(2rem, 4vw, 6rem);
                    z-index: 999;
                    background: transparent;
                    mix-blend-mode: exclusion;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    /* Prevent layout shift */
                    contain: layout style;
                    transform: translateZ(0);
                }

                #navbar.visible {
                    opacity: 1;
                }

                .navbar-logo {
                    cursor: pointer;
                }

                .navbar-logo span {
                    font-family: Neue;
                    font-size: clamp(1.2rem, 2vw, 1.8rem);
                    font-weight: 600;
                    color: #ffffff;
                    text-transform: uppercase;
                    letter-spacing: 0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .navbar-menu span {
                    font-family: Neue;
                    font-size: clamp(0.6rem, 0.8vw, 0.75rem);
                    font-weight: 400;
                    color: #ffffff;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .navbar-arrow {
                    width: clamp(14px, 1.4vw, 18px);
                    height: clamp(14px, 1.4vw, 18px);
                    display: inline-block;
                    vertical-align: middle;
                    transition: transform 0.3s ease;
                    filter: invert(1);
                }

                /* Menu Overlay Styles */
                .menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 9999;
                    background: transparent;
                    pointer-events: none;
                    overflow: hidden;
                }

                .menu-overlay.active {
                    pointer-events: auto;
                }

                /* Black background that slides up */
                .menu-overlay::before {
                    content: '';
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    z-index: -1;
                    transform: translateY(100%);
                    transform-origin: bottom;
                    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .menu-overlay.active::before {
                    transform: translateY(0);
                }

                /* Close Button */
                #close-menu {
                    position: fixed !important;
                    top: 0 !important;
                    right: clamp(2rem, 4vw, 6rem) !important;
                    left: auto !important;
                    height: clamp(60px, 5.5vw, 80px);
                    display: flex;
                    align-items: center;
                    z-index: 1000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateY(-1.5vw);
                }

                .menu-overlay.active #close-menu {
                    opacity: 1;
                    transform: translateY(0);
                    transition-delay: 0.4s;
                }

                #close-menu span {
                    font-family: Neue;
                    font-size: clamp(0.6rem, 0.8vw, 0.75rem);
                    font-weight: 400;
                    color: #ffffff;
                    display: inline-flex;
                    align-items: center;
                    transition: opacity 0.3s ease;
                    opacity: 1;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    margin-right: clamp(1.5rem, 2vw, 2.5rem);
                    line-height: 1;
                    padding-top: 0.15vw;
                }

                #close-menu:hover span {
                    opacity: 1;
                }

                /* Main Menu Container */
                #menu-container {
                    display: flex;
                    width: 100vw;
                    height: 100vh;
                    align-items: stretch;
                    background: transparent;
                    color: #fff;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    transform: translateY(20px);
                }

                .menu-overlay.active #menu-container {
                    opacity: 1;
                    transform: translateY(0);
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transition-delay: 0.3s;
                }

                /* Initial state for elements */
                .menu-item {
                    opacity: 0;
                    transform: translateY(1.5vw);
                }

                .menu-overlay.active .menu-item {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                                transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .menu-overlay.active .menu-item:nth-child(1) { transition-delay: 0.4s; }
                .menu-overlay.active .menu-item:nth-child(2) { transition-delay: 0.5s; }
                .menu-overlay.active .menu-item:nth-child(3) { transition-delay: 0.6s; }
                .menu-overlay.active .menu-item:nth-child(4) { transition-delay: 0.7s; }
                .menu-overlay.active .menu-item:nth-child(5) { transition-delay: 0.8s; }

                .menu-title {
                    opacity: 0;
                    transform: translateY(3vw);
                }

                .menu-overlay.active .menu-title {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                                transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .menu-overlay.active .menu-title:nth-child(1) { transition-delay: 0.5s; }
                .menu-overlay.active .menu-title:nth-child(2) { transition-delay: 0.6s; }
                .menu-overlay.active .menu-title:nth-child(3) { transition-delay: 0.7s; }
                .menu-overlay.active .menu-title:nth-child(4) { transition-delay: 0.8s; }

                .menu-overlay #left-info {
                    opacity: 0;
                    transform: translateY(30px);
                }

                .menu-overlay.active #left-info {
                    opacity: 1;
                    transform: translateY(0);
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transition-delay: 0.7s;
                }

                /* Left Side - Menu Items */
                #left-side {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 4vw;
                }
                
                #menu-contact-form {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 100%;
                }

                #left-menu {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: flex-start;
                    width: 100%;
                    max-width: 400px;
                }

                .menu-item {
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
                    width: 100%;
                }

                .menu-item:last-child {
                    margin-top: 0;
                    margin-bottom: 0;
                }

                .menu-item:first-child {
                    font-size: clamp(12px, 0.9vw, 16px);
                    color: #fff;
                }

                .menu-item:hover {
                    color: #fff !important;
                    transition: none !important;
                }

                /* Form Input Styling */
                .menu-item input {
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
                    position: relative;
                    cursor: text;
                }

                .menu-item input::placeholder {
                    color: #474747;
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    font-weight: 400;
                    line-height: normal;
                    text-transform: uppercase;
                    letter-spacing: 0.07vw;
                    opacity: 1;
                }

                .menu-item input:focus {
                    color: #474747;
                }

                .menu-item input:not(:placeholder-shown) {
                    color: #fff;
                }
                
                /* Rimuovi stili autocomplete del browser */
                #menu-overlay input:-webkit-autofill,
                #menu-overlay input:-webkit-autofill:hover, 
                #menu-overlay input:-webkit-autofill:focus,
                #menu-overlay textarea:-webkit-autofill,
                #menu-overlay textarea:-webkit-autofill:hover,
                #menu-overlay textarea:-webkit-autofill:focus {
                    -webkit-text-fill-color: #fff !important;
                    -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
                    box-shadow: 0 0 0px 1000px transparent inset !important;
                    background-color: transparent !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                /* Textarea styling */
                .menu-item textarea {
                    background: transparent;
                    border: none;
                    color: #474747;
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    font-weight: 400;
                    line-height: normal;
                    text-transform: none;
                    letter-spacing: normal;
                    outline: none;
                    width: 100%;
                    padding: 0;
                    padding-top: 0.1em;
                    padding-bottom: 0.1em;
                    transition: all 0.3s ease;
                    position: relative;
                    resize: none;
                    min-height: 1.5em;
                    height: auto;
                    overflow: hidden;
                    cursor: text;
                }

                .menu-item textarea::placeholder {
                    color: #474747;
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    font-weight: 400;
                    line-height: normal;
                    text-transform: none;
                    letter-spacing: normal;
                    opacity: 1;
                }

                .menu-item textarea:focus {
                    color: #474747;
                }

                .menu-item textarea:not(:placeholder-shown) {
                    color: #fff;
                }

                /* Request CTA */
                #request-cta {
                    font-family: Neue;
                    font-size: clamp(12px, 0.9vw, 16px);
                    text-transform: uppercase;
                    background: transparent;
                    cursor: pointer;
                    color: #474747;
                    position: relative;
                    display: inline-block;
                    opacity: 1;
                    pointer-events: none;
                }

                #request-cta.active {
                    color: white;
                    pointer-events: auto;
                }

                #request-text {
                    opacity: 1;
                    color: #474747;
                    white-space: nowrap;
                    transition: all .5s ease;
                }

                #request-cta.active #request-text {
                    color: white;
                }

                .menu-item a {
                    text-decoration: none;
                    color: inherit;
                }

                /* Left Info - Bottom Left */
                #left-info {
                    position: fixed !important;
                    bottom: 0.5vw !important;
                    top: auto !important;
                    left: 10px;
                    right: 40vw !important;
                    z-index: 100;
                    width: calc(60vw - 20px);
                }

                #bottom-text-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    width: 100%;
                    max-width: calc(60vw - 20px);
                }

                #description p {
                    font-family: Neue;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 11px;
                    color: #ffffff;
                    margin: 0;
                }

                #right-info p {
                    font-family: Neue;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 11px;
                    color: #ffffff;
                    margin: 0;
                    text-align: right;
                }

                #right-info p:first-child {
                    margin-top: -35px;
                    margin-bottom: 13px;
                }

                /* Right Side - Navigation */
                #right-side {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4vw;
                }

                #right-menu {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: center;
                    padding-right: 4vw;
                }

                .menu-title {
                    font-family: Neue;
                    font-size: 9vw;
                    font-weight: 400;
                    color: #474747;
                    text-transform: uppercase;
                    margin-bottom: 2vw;
                    letter-spacing: -0.02em;
                    text-align: right;
                    cursor: pointer;
                    transition: color 0s;
                    text-decoration: none;
                    display: block;
                }

                .menu-title:hover {
                    color: #fff !important;
                    transition: none !important;
                }

                /* Custom cursor handled by global-cursor.css */

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    
                    #navbar {
                        padding: 0 1.5rem;
                    }
                    
                    .navbar-logo span {
                        font-size: 1.2rem;
                    }
                    
                    .navbar-menu span {
                        font-size: 0.6rem;
                    }

                    #close-menu {
                        right: 0 !important;
                        padding-right: 0.5rem;
                    }
                    
                    #close-menu span {
                        font-size: 0.6rem;
                    }

                    #menu-container {
                        flex-direction: column;
                        height: 100vh;
                        overflow-y: auto;
                        padding: 6vw;
                    }
                    
                    /* Hide desktop layout */
                    #left-side, #right-side {
                        width: 100%;
                        padding: 0;
                        position: static;
                        flex: none;
                    }
                    
                    /* Reorder main containers for mobile */
                    #left-side {
                        order: 2;
                    }
                    
                    #right-side {
                        order: 1;
                    }
                    
                    /* 1. Navigation Links */
                    #right-menu {
                        order: 1;
                        width: 100%;
                        align-items: flex-start;
                        padding: 0;
                        margin-bottom: 8vw;
                        margin-top: 10vh;
                    }
                    
                    .menu-title {
                        font-size: 12vw;
                        margin-bottom: 3vw;
                        text-align: left;
                    }
                    
                    /* 2. Form */
                    #left-menu {
                        order: 2;
                        width: 100%;
                        margin-bottom: 0;
                        position: absolute;
                        top: 50%;
                        left: 0;
                        right: 0;
                        transform: translateY(-50%);
                        padding: 0 6vw;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    
                    .menu-item {
                        font-size: 4vw;
                        margin-bottom: 4vw;
                    }
                    
                    /* 3. Info sections */
                    #left-info {
                        position: fixed !important;
                        bottom: 16vh !important;
                        left: 6vw !important;
                        right: 6vw !important;
                        width: auto !important;
                        margin: 0 !important;
                        order: 3;
                    }

                    #bottom-text-container {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 5vh;
                        max-width: none;
                        width: 100%;
                    }

                    #description p {
                        font-size: 2.5vw;
                        line-height: 1.4;
                        text-align: left;
                    }
                    
                    #right-info p {
                        font-size: 2.5vw;
                        line-height: 1.4;
                        text-align: left;
                    }

                    #right-info p:first-child {
                        margin-top: 0;
                        margin-bottom: 2vw;
                    }
                }
        `;
    }

    updateNavigationData(data) {
        if (data) {
            this.navigationData = data;
            this.updateNavbarHTML();
        }
    }
    
    updateFormData(data) {
        if (data) {
            this.formData = data;
            // Se il menu overlay è già aperto, aggiorna i campi del form
            this.updateFormFields();
        }
    }
    
    updateFormFields() {
        // Aggiorna i placeholder e i testi del form se esistono
        const nomeInput = document.getElementById('nome');
        const cognomeInput = document.getElementById('cognome');
        const emailInput = document.getElementById('email');
        const messaggioInput = document.getElementById('messaggio');
        const formTitle = document.querySelector('#left-menu .menu-item:first-child');
        const requestText = document.getElementById('request-text');
        const emailLink = document.querySelector('#left-menu a[href^="mailto"]');
        
        if (nomeInput) nomeInput.placeholder = this.formData.name_placeholder;
        if (cognomeInput) cognomeInput.placeholder = this.formData.surname_placeholder;
        if (emailInput) emailInput.placeholder = this.formData.email_placeholder;
        if (messaggioInput) messaggioInput.placeholder = this.formData.message_placeholder;
        if (formTitle) formTitle.textContent = this.formData.form_title;
        if (requestText) requestText.textContent = this.formData.button_text;
        if (emailLink) emailLink.href = `mailto:${this.formData.recipient_email}`;
    }
    
    updateNavbarHTML() {
        // Update navbar HTML with new data
        this.navbarHTML = `
            <nav id="navbar">
                <div class="navbar-logo">
                    <span>${this.navigationData.logo.text}</span>
                </div>
                <div class="navbar-menu" id="menu-trigger">
                    <span>${this.navigationData.menu_trigger.text}${this.navigationData.menu_trigger.show_arrow ? ` <img src="${this.assetPath}img/arrow.svg" alt="" class="navbar-arrow">` : ''}</span>
                </div>
            </nav>
        `;
        
        // Update existing navbar if present
        const existingNavbar = document.getElementById('navbar');
        if (existingNavbar) {
            existingNavbar.querySelector('.navbar-logo span').textContent = this.navigationData.logo.text;
            const menuTriggerSpan = existingNavbar.querySelector('.navbar-menu span');
            if (menuTriggerSpan) {
                // Fix XSS: Usa DOM manipulation per menu trigger
                menuTriggerSpan.textContent = this.navigationData.menu_trigger.text;
                
                if (this.navigationData.menu_trigger.show_arrow) {
                    const arrowImg = document.createElement('img');
                    arrowImg.src = `${this.assetPath}img/arrow.svg`;
                    arrowImg.alt = '';
                    arrowImg.className = 'navbar-arrow';
                    menuTriggerSpan.appendChild(document.createTextNode(' ')); // Spazio
                    menuTriggerSpan.appendChild(arrowImg);
                }
            }
        }
    }

    init() {
        // Prevent double initialization
        if (this.initialized) {
            // Navbar already initialized
            return;
        }
        this.initialized = true;
        
        // Insert CSS if not already present
        if (!document.getElementById('navbar-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'navbar-styles';
            styleElement.type = 'text/css';
            
            // Ensure head exists
            const head = document.head || document.getElementsByTagName('head')[0];
            
            // Fix XSS: Usa metodo sicuro per inserire CSS
            try {
                // Metodo moderno e sicuro
                styleElement.textContent = this.navbarCSS;
            } catch (e) {
                // Fallback per browser vecchi
                if (styleElement.styleSheet) {
                    styleElement.styleSheet.cssText = this.navbarCSS;
                } else {
                    styleElement.appendChild(document.createTextNode(this.navbarCSS));
                }
            }
            
            head.appendChild(styleElement);
        }

        // Insert navbar HTML only if not already present
        if (!document.getElementById('navbar')) {
            document.body.insertAdjacentHTML('afterbegin', this.navbarHTML);
        }

        // Initialize navbar functionality
        this.setupEventListeners();
        
        // Show navbar after a short delay
        setTimeout(() => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.add('visible');
            }
        }, 100);
    }

    setupEventListeners() {
        // Menu trigger - open overlay menu
        const menuTrigger = document.getElementById('menu-trigger');
        if (menuTrigger) {
            const menuClickHandler = () => {
                this.openMenuOverlay();
            };
            menuTrigger.addEventListener('click', menuClickHandler);
            this.eventListeners.push({ element: menuTrigger, event: 'click', handler: menuClickHandler });
        }

        // Logo click - go to homepage
        const logoElement = document.querySelector('.navbar-logo');
        if (logoElement) {
            const logoClickHandler = () => {
                window.location.href = this.assetPath + 'index.html';
            };
            logoElement.addEventListener('click', logoClickHandler);
            this.eventListeners.push({ element: logoElement, event: 'click', handler: logoClickHandler });
        }
    }
    
    openMenuOverlay() {
        // Create menu overlay if it doesn't exist
        if (!document.getElementById('menu-overlay')) {
            this.createMenuOverlay();
        }
        
        // Show menu with animation
        const menuOverlay = document.getElementById('menu-overlay');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    createMenuOverlay() {
        // Process markdown in footer description
        let footerDescription = this.navigationData.menu_overlay.footer_description;
        if (footerDescription) {
            footerDescription = footerDescription
                .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        }
        
        // Sort menu items by order
        const sortedMenu = [...this.navigationData.menu_overlay.main_menu].sort((a, b) => a.order - b.order);
        
        // Generate menu items HTML
        const menuItemsHTML = sortedMenu.map(item => 
            `<a href="${this.assetPath}${item.link}" class="menu-title">${item.name}</a>`
        ).join('\n');
        
        // Fix XSS: Crea menu overlay con DOM manipulation sicuro
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'menu-overlay';
        menuOverlay.className = 'menu-overlay';
        
        // Close Button
        const closeMenu = document.createElement('div');
        closeMenu.id = 'close-menu';
        const closeSpan = document.createElement('span');
        closeSpan.textContent = this.navigationData.menu_overlay.close_text;
        closeMenu.appendChild(closeSpan);
        menuOverlay.appendChild(closeMenu);
        
        // Main Menu Container
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        
        // Left Side
        const leftSide = document.createElement('div');
        leftSide.id = 'left-side';
        
        // Form
        const form = document.createElement('form');
        form.name = 'contact-menu';
        form.method = 'POST';
        form.setAttribute('data-netlify', 'true');
        form.setAttribute('netlify-honeypot', 'bot-field');
        form.id = 'menu-contact-form';
        
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
        
        // Left Menu
        const leftMenu = document.createElement('div');
        leftMenu.id = 'left-menu';
        
        // Form Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'menu-item';
        titleDiv.textContent = this.formData.form_title;
        leftMenu.appendChild(titleDiv);
        
        // Nome input
        const nomeDiv = document.createElement('div');
        nomeDiv.className = 'menu-item';
        const nomeInput = document.createElement('input');
        nomeInput.type = 'text';
        nomeInput.name = 'nome';
        nomeInput.id = 'nome';
        nomeInput.placeholder = this.formData.name_placeholder;
        nomeDiv.appendChild(nomeInput);
        leftMenu.appendChild(nomeDiv);
        
        // Cognome input
        const cognomeDiv = document.createElement('div');
        cognomeDiv.className = 'menu-item';
        const cognomeInput = document.createElement('input');
        cognomeInput.type = 'text';
        cognomeInput.name = 'cognome';
        cognomeInput.id = 'cognome';
        cognomeInput.placeholder = this.formData.surname_placeholder;
        cognomeDiv.appendChild(cognomeInput);
        leftMenu.appendChild(cognomeDiv);
        
        // Email input
        const emailDiv = document.createElement('div');
        emailDiv.className = 'menu-item';
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.id = 'email';
        emailInput.placeholder = this.formData.email_placeholder;
        emailDiv.appendChild(emailInput);
        leftMenu.appendChild(emailDiv);
        
        // Messaggio textarea
        const messaggioDiv = document.createElement('div');
        messaggioDiv.className = 'menu-item';
        const messaggioTextarea = document.createElement('textarea');
        messaggioTextarea.name = 'messaggio';
        messaggioTextarea.id = 'messaggio';
        messaggioTextarea.placeholder = this.formData.message_placeholder;
        messaggioDiv.appendChild(messaggioTextarea);
        leftMenu.appendChild(messaggioDiv);
        
        // Submit button
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'menu-item';
        const button = document.createElement('button');
        button.type = 'submit';
        button.id = 'request-cta';
        button.style.cssText = 'background: none; border: none; cursor: pointer; width: 100%; text-align: left;';
        const buttonText = document.createElement('div');
        buttonText.id = 'request-text';
        buttonText.textContent = this.formData.button_text;
        button.appendChild(buttonText);
        buttonDiv.appendChild(button);
        leftMenu.appendChild(buttonDiv);
        
        form.appendChild(leftMenu);
        leftSide.appendChild(form);
        
        // Bottom Left Info
        const leftInfo = document.createElement('div');
        leftInfo.id = 'left-info';
        
        const bottomTextContainer = document.createElement('div');
        bottomTextContainer.id = 'bottom-text-container';
        
        const description = document.createElement('div');
        description.id = 'description';
        const descP = document.createElement('p');
        descP.textContent = footerDescription; // Usa textContent per sicurezza
        description.appendChild(descP);
        bottomTextContainer.appendChild(description);
        
        const rightInfo = document.createElement('div');
        rightInfo.id = 'right-info';
        const websiteP = document.createElement('p');
        websiteP.textContent = this.navigationData.menu_overlay.footer_website;
        rightInfo.appendChild(websiteP);
        const emailP = document.createElement('p');
        emailP.textContent = this.navigationData.menu_overlay.footer_email;
        rightInfo.appendChild(emailP);
        bottomTextContainer.appendChild(rightInfo);
        
        leftInfo.appendChild(bottomTextContainer);
        leftSide.appendChild(leftInfo);
        menuContainer.appendChild(leftSide);
        
        // Right Side - Navigation
        const rightSide = document.createElement('div');
        rightSide.id = 'right-side';
        const rightMenu = document.createElement('div');
        rightMenu.id = 'right-menu';
        
        // Per il menu HTML, usa safeHTML se disponibile
        if (window.safeHTML) {
            rightMenu.innerHTML = window.safeHTML(menuItemsHTML, 'navbar-menu-items');
        } else {
            // Fallback temporaneo
            rightMenu.innerHTML = menuItemsHTML;
        }
        
        rightSide.appendChild(rightMenu);
        menuContainer.appendChild(rightSide);
        
        menuOverlay.appendChild(menuContainer);
        document.body.appendChild(menuOverlay);
        
        // Store reference
        this.menuOverlay = menuOverlay;
        
        // Setup close button
        const closeBtn = document.getElementById('close-menu');
        if (closeBtn) {
            const closeHandler = () => {
                this.closeMenuOverlay();
            };
            closeBtn.addEventListener('click', closeHandler);
            this.eventListeners.push({ element: closeBtn, event: 'click', handler: closeHandler });
        }
        
        // Setup form functionality
        this.setupMenuForm();
        
        // Aggiungi gestione AJAX direttamente al form
        const formSetupTimeout = setTimeout(() => {
            const form = document.getElementById('menu-contact-form');
            if (form && window.handleFormSubmit) {
                form.addEventListener('submit', window.handleFormSubmit);
                this.eventListeners.push({ element: form, event: 'submit', handler: window.handleFormSubmit });
            }
        }, 100);
        this.timeouts.push(formSetupTimeout);
    }
    
    closeMenuOverlay() {
        const menuOverlay = document.getElementById('menu-overlay');
        if (menuOverlay) {
            // Remove immediately without animation
            menuOverlay.remove();
            document.body.style.overflow = ''; // Restore scrolling
            this.menuOverlay = null;
        }
    }
    
    getFormActionHTML() {
        // Genera HTML in base al tipo di integrazione
        if (this.formData.form_integration.type === 'netlify') {
            return `
                <form name="contact-menu" method="POST" data-netlify="true" netlify-honeypot="bot-field" style="display: inline;">
                    <input type="hidden" name="form-name" value="contact-menu">
                    <input type="hidden" name="bot-field">
                    <input type="hidden" name="nome" id="hidden-nome">
                    <input type="hidden" name="cognome" id="hidden-cognome">
                    <input type="hidden" name="email" id="hidden-email">
                    <input type="hidden" name="messaggio" id="hidden-messaggio">
                    <button type="submit" id="request-cta" style="background: none; border: none; cursor: pointer; width: 100%; text-align: left;">
                        <div id="request-text">${this.formData.button_text}</div>
                    </button>
                </form>
            `;
        } else if (this.formData.form_integration.type === 'formspree') {
            return `
                <form action="https://formspree.io/f/${this.formData.recipient_email}" method="POST" style="display: inline;">
                    <input type="hidden" name="nome" id="hidden-nome">
                    <input type="hidden" name="cognome" id="hidden-cognome">
                    <input type="hidden" name="messaggio" id="hidden-messaggio">
                    <button type="submit" id="request-cta" style="background: none; border: none; cursor: pointer; width: 100%; text-align: left;">
                        <div id="request-text">${this.formData.button_text}</div>
                    </button>
                </form>
            `;
        } else {
            // Default: mailto link
            return `
                <a href="mailto:${this.formData.recipient_email}" target="_blank">
                    <div id="request-cta">
                        <div id="request-text">${this.formData.button_text}</div>
                    </div>
                </a>
            `;
        }
    }

    setupMenuForm() {
        const nomeInput = document.getElementById('nome');
        const cognomeInput = document.getElementById('cognome');
        const emailInput = document.getElementById('email');
        const messaggioInput = document.getElementById('messaggio');
        const requestCta = document.getElementById('request-cta');
        
        if (nomeInput && cognomeInput && emailInput && messaggioInput && requestCta) {
            
            // Use unified FormValidator if available
            if (typeof FormValidator !== 'undefined') {
                this.formValidatorInstance = new FormValidator({
                    fields: [nomeInput, cognomeInput, emailInput, messaggioInput],
                    submitButton: requestCta,
                    validateOnInit: false // Menu starts empty, no need for initial check
                });
            } else {
                // Fallback: simple form validation without FormValidator
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
                
                // Store event listeners for cleanup
                this.eventListeners.push({ element: nomeInput, event: 'input', handler: checkFormCompletion });
                this.eventListeners.push({ element: cognomeInput, event: 'input', handler: checkFormCompletion });
                this.eventListeners.push({ element: emailInput, event: 'input', handler: checkFormCompletion });
                this.eventListeners.push({ element: messaggioInput, event: 'input', handler: checkFormCompletion });
                
                checkFormCompletion();
            }
        }
    }
    
    showSuccessMessage() {
        // Chiudi il menu se è aperto
        const menuOverlay = document.getElementById('menu-overlay');
        if (menuOverlay) {
            this.closeMenuOverlay();
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
        
        // Fix XSS: Crea contenuto messaggio di successo in modo sicuro
        const h2 = document.createElement('h2');
        h2.style.cssText = 'font-family: Neue; font-size: 3rem; margin: 0 0 1rem 0; font-weight: 400; letter-spacing: -0.02em;';
        h2.textContent = this.formData.success_message;
        
        const p = document.createElement('p');
        p.style.cssText = 'font-family: Neue; font-size: 1rem; opacity: 0.7; margin: 0;';
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
        const fadeTimeout = setTimeout(() => {
            overlay.style.opacity = '0';
            successDiv.style.transform = 'scale(0.9)';
            const removeTimeout = setTimeout(() => overlay.remove(), 300);
            this.timeouts.push(removeTimeout);
        }, 5000);
        
        this.timeouts.push(fadeTimeout);
    }
    
    /**
     * Destroy method for cleanup
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Clear all timeouts
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
        
        // Cancel animation frames
        this.animationFrames.forEach(frame => cancelAnimationFrame(frame));
        this.animationFrames = [];
        
        // Clear mouse throttle timer
        if (this.mouseThrottleTimer) {
            clearTimeout(this.mouseThrottleTimer);
            this.mouseThrottleTimer = null;
        }
        
        // Remove menu overlay if exists
        if (this.menuOverlay) {
            this.menuOverlay.remove();
            this.menuOverlay = null;
        }
        
        // Destroy FormValidator if exists
        if (this.formValidatorInstance && typeof this.formValidatorInstance.destroy === 'function') {
            this.formValidatorInstance.destroy();
        }
        this.formValidatorInstance = null;
        
        // Clear global references
        if (window.navbarInstance === this) {
            window.navbarInstance = null;
        }
        
        navbarInstance = null;
    }
}

// Auto-initialize navbar when DOM is ready (Singleton pattern)

function initializeNavbar() {
    if (!navbarInstance) {
        navbarInstance = new Navbar();
        navbarInstance.init();
        // Rendi navbarInstance disponibile globalmente
        window.navbarInstance = navbarInstance;
        
        // Register with LifecycleManager if available
        if (typeof window !== 'undefined' && window.lifecycleManager) {
            window.lifecycleManager.register('navbar', navbarInstance, () => {
                navbarInstance.destroy();
            });
        }
    } else {
    }
}

// Global function to update navigation data from CMS
window.updateNavigationData = function(data) {
    if (navbarInstance) {
        navbarInstance.updateNavigationData(data);
    }
};

// Global function to update form data from CMS
window.updateFormData = function(data) {
    if (navbarInstance) {
        navbarInstance.updateFormData(data);
    }
};

// Export for ES6 modules
export { Navbar, initializeNavbar };

// Initialize for backward compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavbar);
} else {
    // DOM is already loaded
    initializeNavbar();
}

// Controlla se il form è stato inviato con successo
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('form-success') === 'true') {
        // Aspetta che navbar sia inizializzato
        setTimeout(() => {
            if (navbarInstance && navbarInstance.showSuccessMessage) {
                navbarInstance.showSuccessMessage();
            }
            // Rimuovi il parametro dall'URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 100);
    }
}