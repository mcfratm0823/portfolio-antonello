/**
 * Simple Init - Inizializzazione semplificata senza conflitti
 * Questo script coordina tutte le inizializzazioni in modo sicuro
 */
(function() {
    'use strict';
    
    // Flag globale per prevenire doppie inizializzazioni
    if (window.__SIMPLE_INIT_DONE__) {
        console.warn('[SimpleInit] Already initialized');
        return;
    }
    window.__SIMPLE_INIT_DONE__ = true;
    
    // Stato dell'applicazione
    const appState = {
        preloaderShown: false,
        cmsLoaded: false,
        animationsStarted: false
    };
    
    // Funzione principale di inizializzazione
    function initializeApp() {
        console.log('[SimpleInit] Starting application initialization...');
        
        // 1. Inizializza componenti UI di base
        initializeBasicUI();
        
        // 2. Gestisci il preloader
        handlePreloader();
        
        // 3. Dopo il preloader, inizializza il resto
        // Aspetta che il preloader sia completato prima di continuare
        setTimeout(() => {
            if (!appState.animationsStarted) {
                appState.animationsStarted = true;
                initializeAnimations();
                initializeInteractions();
            }
        }, 3000); // Dopo la durata del preloader
    }
    
    // Inizializza UI di base
    function initializeBasicUI() {
        // Navbar
        if (typeof initializeNavbar === 'function') {
            initializeNavbar();
        }
        
        // Custom cursor
        if (typeof initializeGlobalCursor === 'function') {
            initializeGlobalCursor();
        }
        
        // Form handler
        if (window.formHandler && window.formHandler.setupFooterForm) {
            window.formHandler.setupFooterForm();
        }
        
        // Update date
        if (typeof updateDate === 'function') {
            updateDate();
        }
    }
    
    // Gestisce il preloader in modo sicuro
    function handlePreloader() {
        const preloader = document.getElementById('preloader');
        const mainContent = document.getElementById('main-content');
        
        if (!preloader || !mainContent) {
            appState.preloaderShown = true;
            return;
        }
        
        // Controlla se già mostrato
        if (sessionStorage.getItem('preloaderShown') === 'true') {
            preloader.style.display = 'none';
            mainContent.style.opacity = '1';
            appState.preloaderShown = true;
            return;
        }
        
        // Previeni animazioni multiple
        if (appState.preloaderShown) {
            console.warn('[SimpleInit] Preloader already shown, skipping');
            return;
        }
        
        appState.preloaderShown = true;
        sessionStorage.setItem('preloaderShown', 'true');
        
        // Esegui animazione preloader una sola volta
        const preloaderLeft = document.querySelector('#preloader-left h1');
        const preloaderRight = document.querySelector('#preloader-right p');
        
        if (preloaderLeft && preloaderRight) {
            // Initial state
            gsap.set(mainContent, { opacity: 0 });
            gsap.set([preloaderLeft, preloaderRight], { opacity: 0 });
            
            // Simple animation
            gsap.to(preloaderLeft, { opacity: 1, duration: 1, delay: 0.2 });
            gsap.to(preloaderRight, { opacity: 1, duration: 1, delay: 0.4 });
            
            // Hide after delay
            setTimeout(() => {
                gsap.to(mainContent, { opacity: 1, duration: 0.3 });
                gsap.to([preloaderLeft, preloaderRight], { 
                    x: 40, 
                    opacity: 0, 
                    duration: 0.6,
                    onComplete: () => {
                        gsap.to(preloader, {
                            y: '100vh',
                            duration: 1.2,
                            ease: "power3.inOut",
                            onComplete: () => {
                                preloader.style.display = 'none';
                                const navbar = document.getElementById('navbar');
                                if (navbar) navbar.classList.add('visible');
                            }
                        });
                    }
                });
            }, 2500);
        }
    }
    
    // Inizializza animazioni principali
    function initializeAnimations() {
        console.log('[SimpleInit] Initializing animations...');
        
        // Hero scaling animation
        if (window.innerWidth >= 1024) {
            initializeHeroAnimation();
        }
        
        // Portfolio section
        initializePortfolioSection();
        
        // About section
        initializeAboutSection();
        
        // Services section
        initializeServicesSection();
        
        // Footer animation
        initializeFooterAnimation();
    }
    
    // Inizializza interazioni
    function initializeInteractions() {
        // Services accordion
        initializeServicesAccordion();
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Prevent image drag
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', e => e.preventDefault());
        });
    }
    
    // Hero animation
    function initializeHeroAnimation() {
        const centerPhoto = document.getElementById('center-photo');
        const centerVideo = document.getElementById('center-video');
        const visualTitle = document.getElementById('antonello-title');
        const designerTitle = document.getElementById('guarnieri-title');
        
        if (!centerPhoto && !centerVideo) return;
        
        const photoTimeline = gsap.timeline({ paused: true });
        
        photoTimeline
            .to([centerPhoto, centerVideo], {
                width: window.innerWidth,
                height: window.innerHeight,
                duration: 1,
                ease: "power3.inOut"
            }, 0)
            .to(visualTitle, { x: "15vw", duration: 1, ease: "power3.inOut" }, 0)
            .to(designerTitle, { x: "-15vw", duration: 1, ease: "power3.inOut" }, 0);
        
        ScrollTrigger.create({
            trigger: "#hero-section",
            start: "top top",
            end: "+=80vh",
            pin: true,
            pinSpacing: true,
            scrub: 3,
            animation: photoTimeline
        });
    }
    
    // Portfolio section (simplified)
    function initializePortfolioSection() {
        const section = document.querySelector("[data-scroll-selected-work=section]");
        if (!section) return;
        
        const items = section.querySelectorAll("[data-scroll-selected-work=item]");
        const list = section.querySelector("[data-scroll-selected-work=list]");
        
        if (!items.length) return;
        
        // Initial scale
        ScrollTrigger.create({
            trigger: section,
            start: "top 75%",
            end: "top top",
            scrub: 1,
            animation: gsap.timeline().to(list, { scale: 0.85, duration: 1 })
        });
        
        // Pin section
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => `+=${(items.length + 1) * 100}%`,
            pin: true,
            pinSpacing: false
        });
    }
    
    // About section
    function initializeAboutSection() {
        const section = document.getElementById('about-section');
        if (!section) return;
        
        const elements = {
            label: section.querySelector('.about-label'),
            text: section.querySelector('#about-text p'),
            details: section.querySelectorAll('.detail-column p')
        };
        
        if (!elements.label || !elements.text) return;
        
        gsap.set([elements.label, elements.text], { opacity: 0, y: 50 });
        gsap.set(elements.details, { opacity: 0, y: 30 });
        
        ScrollTrigger.create({
            trigger: section,
            start: "top 75%",
            onEnter: () => {
                gsap.to(elements.label, { opacity: 1, y: 0, duration: 0.8 });
                gsap.to(elements.text, { opacity: 1, y: 0, duration: 1, delay: 0.2 });
                gsap.to(elements.details, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, delay: 0.4 });
            }
        });
    }
    
    // Services section
    function initializeServicesSection() {
        const section = document.getElementById('services-section');
        if (!section) return;
        
        const title = section.querySelector('.services-title');
        const description = section.querySelector('.services-description');
        
        if (title) {
            gsap.set(title, { opacity: 0, y: 50 });
            ScrollTrigger.create({
                trigger: section,
                start: "top 80%",
                onEnter: () => gsap.to(title, { opacity: 1, y: 0, duration: 1.2 })
            });
        }
        
        if (description) {
            gsap.set(description, { opacity: 0, y: 30 });
            ScrollTrigger.create({
                trigger: section,
                start: "top 80%",
                onEnter: () => gsap.to(description, { opacity: 1, y: 0, duration: 1, delay: 0.3 })
            });
        }
    }
    
    // Footer animation
    function initializeFooterAnimation() {
        const section = document.getElementById('test-section');
        const text = section?.querySelector('.footer-black h2');
        
        if (!text) return;
        
        // Split text for animation
        const words = text.innerHTML.split('<br>');
        text.innerHTML = '';
        
        words.forEach(word => {
            const div = document.createElement('div');
            div.style.overflow = 'hidden';
            div.style.lineHeight = '1';
            
            word.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.transform = 'translateY(100%)';
                span.classList.add('footer-char');
                div.appendChild(span);
            });
            
            text.appendChild(div);
        });
        
        ScrollTrigger.create({
            trigger: section,
            start: "top 60%",
            onEnter: () => {
                gsap.to('.footer-char', {
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.03
                });
            }
        });
    }
    
    // Services accordion
    function initializeServicesAccordion() {
        const items = document.querySelectorAll('.service-item');
        
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.service-content') && !e.target.closest('.service-header')) {
                    return;
                }
                
                const arrow = this.querySelector('.service-arrow');
                
                // Close others
                items.forEach(other => {
                    if (other !== this) {
                        other.classList.remove('active');
                        const otherArrow = other.querySelector('.service-arrow');
                        if (otherArrow) otherArrow.textContent = '+';
                    }
                });
                
                // Toggle current
                this.classList.toggle('active');
                if (arrow) {
                    arrow.textContent = this.classList.contains('active') ? '−' : '+';
                }
            });
        });
    }
    
    // Inizializza quando DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
    // Esporta per debug
    window.__SIMPLE_INIT__ = {
        state: appState,
        reinit: initializeApp
    };
})();