/**
 * Homepage Module - Gestione animazioni e funzionalità homepage
 * @class HomepageModule
 * @version 2.0.0
 */
class HomepageModule {
    constructor() {
        this.initialized = false;
        this.debug = window.location.search.includes('debug=true');
        this.animations = {
            preloader: null,
            hero: null,
            portfolio: null,
            about: null,
            services: null,
            footer: null
        };
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Ascolta caricamento dati homepage
        window.APP_EVENT_BUS.on('data:loaded', (data) => {
            if (data.type === 'homepage') {
                this.handleHomepageData(data.content);
            }
        });
        
        // Ascolta resize per aggiornare animazioni
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, window.CONSTANTS?.TIMING?.RESIZE_DEBOUNCE || 300);
        });
    }
    
    /**
     * Initialize the module
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            if (this.debug) {
            }
            return;
        }
        
        // Track initialization
        if (window.trackModuleInit) {
            window.trackModuleInit('HomepageModule');
        }
        
        if (this.debug) {
        }
        
        try {
            // Verifica che siamo sulla homepage
            const path = window.location.pathname;
            const isHomepage = path === '/' || path === '/index.html' || path.endsWith('/');
            
            if (!isHomepage) {
                if (this.debug) {
                }
                return;
            }
            
            // Setup animazioni in ordine
            await this.setupPreloader();
            await this.setupHeroAnimation();
            await this.setupPortfolioAnimation();
            await this.setupAboutAnimation();
            await this.setupServicesAnimation();
            await this.setupFooterAnimation();
            await this.setupFormValidation();
            
            this.initialized = true;
            
            if (this.debug) {
            }
            
            // Emit event
            window.APP_EVENT_BUS.emit('homepage:initialized');
            
        } catch (error) {
            console.error('[HomepageModule] Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Setup preloader animation
     * @private
     */
    async setupPreloader() {
        const preloader = document.getElementById('preloader');
        const mainContent = document.getElementById('main-content');
        
        if (!preloader || !mainContent) return;
        
        // Check if preloader was already shown
        const preloaderShown = sessionStorage.getItem('preloaderShown');
        
        if (preloaderShown) {
            // Skip animation
            preloader.style.display = 'none';
            gsap.set(mainContent, { opacity: 1 });
            
            // Update state
            window.APP_STATE.set('ui.preloaderShown', true);
            return;
        }
        
        // Mark preloader as shown
        sessionStorage.setItem('preloaderShown', 'true');
        window.APP_STATE.set('ui.preloaderShown', true);
        
        // Animate preloader
        const preloaderLeft = document.querySelector('#preloader-left h1');
        const preloaderRight = document.querySelector('#preloader-right p');
        
        // Initial state
        gsap.set(mainContent, { opacity: 0, willChange: 'opacity' });
        gsap.set([preloaderLeft, preloaderRight], { opacity: 0 });
        
        // Create animation timeline
        this.animations.preloader = gsap.timeline({
            onComplete: () => {
                preloader.style.display = 'none';
                
                // Show navbar
                const navbar = document.getElementById('navbar');
                if (navbar) {
                    navbar.classList.add('visible');
                }
                
                // Emit event
                window.APP_EVENT_BUS.emit('preloader:complete');
            }
        });
        
        // Add animations
        this.animations.preloader
            .to(preloaderLeft, {
                opacity: 1,
                duration: 1.0,
                ease: "power3.out",
                delay: 0.2
            })
            .to(preloaderRight, {
                opacity: 1,
                duration: 1.0,
                ease: "power3.out"
            }, "-=0.6")
            .to(mainContent, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            }, "+=1.5")
            .to([preloaderLeft, preloaderRight], {
                x: '40px',
                opacity: 0,
                duration: 0.6,
                ease: "power2.in"
            })
            .to(preloader, {
                y: '100vh',
                duration: 1.2,
                ease: "power3.inOut"
            }, "-=0.3");
    }
    
    /**
     * Setup hero animation
     * @private
     */
    async setupHeroAnimation() {
        // Solo su desktop
        if (window.innerWidth < 1024) return;
        
        const centerPhoto = document.getElementById('center-photo');
        const centerVideo = document.getElementById('center-video');
        const visualTitle = document.getElementById('antonello-title');
        const designerTitle = document.getElementById('guarnieri-title');
        
        if (!centerPhoto && !centerVideo) return;
        
        // Register ScrollTrigger if not already
        if (!gsap.plugins.scrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        // Calculate dimensions
        const getFullScreenDimensions = () => ({
            width: window.innerWidth,
            height: window.innerHeight
        });
        
        // Create timeline
        this.animations.hero = gsap.timeline({ paused: true });
        
        // Add animations
        this.animations.hero
            .to(centerPhoto, {
                width: getFullScreenDimensions().width,
                height: getFullScreenDimensions().height,
                duration: 1,
                ease: "power3.inOut"
            }, 0)
            .to(centerVideo, {
                width: getFullScreenDimensions().width,
                height: getFullScreenDimensions().height,
                duration: 1,
                ease: "power3.inOut"
            }, 0)
            .to(visualTitle, {
                x: "15vw",
                duration: 1,
                ease: "power3.inOut"
            }, 0)
            .to(designerTitle, {
                x: "-15vw",
                duration: 1,
                ease: "power3.inOut"
            }, 0);
        
        // Create ScrollTrigger
        ScrollTrigger.create({
            trigger: "#hero-section",
            start: "top top",
            end: "+=80vh",
            pin: true,
            pinSpacing: true,
            scrub: { value: 3, smooth: true },
            animation: this.animations.hero,
            anticipatePin: 1
        });
    }
    
    /**
     * Setup portfolio animation
     * @private
     */
    async setupPortfolioAnimation() {
        const portfolioSection = document.querySelector("[data-scroll-selected-work=section]");
        if (!portfolioSection) return;
        
        const items = portfolioSection.querySelectorAll("[data-scroll-selected-work=item]");
        const list = portfolioSection.querySelector("[data-scroll-selected-work=list]");
        
        if (!items.length) return;
        
        // Set dynamic CSS variable
        document.documentElement.style.setProperty('--portfolio-items-count', items.length);
        
        // Create GSAP context
        const ctx = gsap.context(() => {
            // Initial scale animation
            const scaleTimeline = gsap.timeline();
            ScrollTrigger.create({
                trigger: portfolioSection,
                animation: scaleTimeline,
                start: "top 75%",
                end: "top top",
                scrub: 1
            });
            
            scaleTimeline.to(list, {
                scale: 0.85,
                duration: 1
            });
            
            // Setup project animations
            this.setupProjectAnimations(items, portfolioSection);
            
            // Pin section
            ScrollTrigger.create({
                trigger: portfolioSection,
                start: "top top",
                end: () => `+=${(items.length + 1) * 100}%`,
                pin: true,
                pinSpacing: false,
                anticipatePin: 1,
                scrub: 2
            });
            
        }, portfolioSection);
        
        // Store context for cleanup
        this.animations.portfolio = ctx;
    }
    
    /**
     * Setup individual project animations
     * @private
     */
    setupProjectAnimations(items, portfolioSection) {
        const isDesktop = window.matchMedia("(min-width: 992px)").matches;
        
        // Set initial states
        items.forEach((item, index) => {
            const elements = this.getProjectElements(item);
            
            if (index === 0) {
                // First project visible
                gsap.set([elements.bg, elements.overlay, elements.boxImg, elements.boxTitle, elements.boxVideo], 
                    { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
                gsap.set([elements.headline, elements.category], { yPercent: 0 });
                gsap.set(item, { pointerEvents: "auto" });
            } else {
                // Others hidden
                gsap.set([elements.bg, elements.overlay, elements.boxImg, elements.boxTitle, elements.boxVideo], 
                    { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });
                gsap.set([elements.headline, elements.category], 
                    { yPercent: 100, clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });
                gsap.set(item, { pointerEvents: "none" });
            }
        });
        
        // Create animations for each project
        items.forEach((item, index) => {
            if (index === 0) {
                // First project exit animation
                if (items.length > 1) {
                    this.createFirstProjectExit(items[0], portfolioSection);
                }
                return;
            }
            
            // Create project timeline
            this.createProjectTimeline(item, index, items, portfolioSection, isDesktop);
        });
    }
    
    /**
     * Get project elements
     * @private
     */
    getProjectElements(item) {
        return {
            headline: item.querySelector("[data-scroll-selected-work=headline]"),
            category: item.querySelector("[data-scroll-selected-work=category]"),
            bg: item.querySelector("[data-scroll-selected-work=bg]"),
            overlay: item.querySelector("[data-scroll-selected-work=overlay]"),
            box: item.querySelector("[data-scroll-selected-work=box]"),
            boxTitle: item.querySelector("[data-scroll-selected-work=box-title]"),
            boxImg: item.querySelector("[data-scroll-selected-work=box-img]"),
            boxVideo: item.querySelector("[data-scroll-selected-work=box-video]")
        };
    }
    
    /**
     * Create first project exit animation
     * @private
     */
    createFirstProjectExit(item, portfolioSection) {
        const elements = this.getProjectElements(item);
        
        const exitTimeline = gsap.timeline({ paused: true });
        exitTimeline
            .to(elements.headline, {
                yPercent: -100,
                duration: 1,
                ease: "expo.inOut"
            })
            .to(elements.category, {
                yPercent: -100,
                duration: 1,
                ease: "expo.inOut"
            }, "<");
        
        ScrollTrigger.create({
            trigger: portfolioSection,
            animation: exitTimeline,
            start: "25% bottom",
            end: "37.5% bottom",
            toggleActions: "play none none reverse"
        });
    }
    
    /**
     * Create project timeline
     * @private
     */
    createProjectTimeline(item, index, items, portfolioSection, isDesktop) {
        const elements = this.getProjectElements(item);
        const prevElements = this.getProjectElements(items[index - 1]);
        
        const timeline = gsap.timeline({
            paused: true,
            defaults: { duration: 1 }
        });
        
        // Set pointer events
        timeline.set(items, { pointerEvents: "none" });
        timeline.set(item, { pointerEvents: "auto" });
        
        // Animate current project in
        const clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        timeline
            .fromTo([elements.bg, elements.overlay], 
                { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
                { clipPath, ease: "expo.inOut" }, "<")
            .fromTo(elements.headline,
                { yPercent: 100, clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
                { yPercent: 0, clipPath, ease: "expo.inOut", willChange: "transform" }, "<")
            .fromTo(elements.category,
                { yPercent: 100, clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
                { yPercent: 0, clipPath, ease: "expo.inOut", willChange: "transform" }, "<")
            .fromTo([elements.boxImg, elements.boxVideo, elements.boxTitle],
                { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
                { clipPath, ease: "expo.inOut" }, "<");
        
        // Animate previous project out
        if (prevElements.headline && prevElements.category) {
            timeline
                .fromTo(prevElements.headline,
                    { yPercent: 0 },
                    { yPercent: -100, ease: "expo.inOut", willChange: "transform" }, "<")
                .fromTo(prevElements.category,
                    { yPercent: 0 },
                    { yPercent: -100, ease: "expo.inOut", willChange: "transform" }, "<");
        }
        
        // Create ScrollTrigger
        const totalProjects = items.length;
        const availableSpace = 50; // 50% for projects
        const projectPercentage = availableSpace / (totalProjects - 1);
        const startPoint = 25 + ((index - 1) * projectPercentage);
        
        ScrollTrigger.create({
            trigger: portfolioSection,
            animation: timeline,
            start: () => `${startPoint}% bottom`,
            end: () => `${startPoint + projectPercentage}% bottom`,
            toggleActions: "play none none reverse",
            preventOverlaps: "selectedWork"
        });
        
        // Setup hover effect for desktop
        if (isDesktop && elements.box && elements.boxImg) {
            this.setupProjectHover(elements);
        }
    }
    
    /**
     * Setup project hover effect
     * @private
     */
    setupProjectHover(elements) {
        const hoverTimeline = gsap.timeline({ paused: true });
        hoverTimeline.to(elements.boxImg, {
            opacity: 0,
            duration: 1,
            ease: "expo.inOut"
        });
        
        elements.box.addEventListener("mouseenter", () => hoverTimeline.play());
        elements.box.addEventListener("mouseleave", () => hoverTimeline.reverse());
    }
    
    /**
     * Setup about animation
     * @private
     */
    async setupAboutAnimation() {
        const aboutSection = document.getElementById('about-section');
        if (!aboutSection) return;
        
        const elements = {
            label: document.querySelector('.about-label'),
            mainText: document.querySelector('#about-text p'),
            details: document.querySelectorAll('.detail-column p')
        };
        
        if (!elements.label || !elements.mainText) return;
        
        // Set initial states
        gsap.set([elements.label, elements.mainText], { opacity: 0, y: 50 });
        gsap.set(elements.details, { opacity: 0, y: 30 });
        
        // Create timeline
        this.animations.about = gsap.timeline({
            scrollTrigger: {
                trigger: aboutSection,
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        });
        
        // Add animations
        this.animations.about
            .to(elements.label, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
            .to(elements.mainText, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.4")
            .to(elements.details, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.2 }, "-=0.6");
    }
    
    /**
     * Setup services animation
     * @private
     */
    async setupServicesAnimation() {
        const servicesSection = document.getElementById('services-section');
        if (!servicesSection) return;
        
        // Title animation
        const servicesTitle = servicesSection.querySelector('.services-title');
        const servicesDescription = servicesSection.querySelector('.services-description');
        
        if (servicesTitle) {
            gsap.set(servicesTitle, { opacity: 0, y: 50, clipPath: "inset(100% 0% 0% 0%)" });
            gsap.to(servicesTitle, {
                opacity: 1,
                y: 0,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: servicesSection,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        }
        
        if (servicesDescription) {
            gsap.set(servicesDescription, { opacity: 0, y: 30 });
            gsap.to(servicesDescription, {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 0.3,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: servicesSection,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        }
        
        // Typography animation
        const typoLines = servicesSection.querySelectorAll('.typo-line');
        if (typoLines.length > 0) {
            gsap.set(typoLines, { opacity: 0, y: 60 });
            gsap.to(typoLines, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                stagger: 0.2,
                scrollTrigger: {
                    trigger: servicesSection,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            });
        }
        
        // Services accordion
        await this.setupServicesAccordion();
        
        // Services hover images
        await this.setupServicesHoverImages();
    }
    
    /**
     * Setup services accordion
     * @private
     */
    async setupServicesAccordion() {
        const serviceItems = document.querySelectorAll('#services-section .service-item');
        if (!serviceItems.length) return;
        
        serviceItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking expanded content
                if (e.target.closest('.service-content') && !e.target.closest('.service-header')) {
                    return;
                }
                
                e.stopPropagation();
                
                const serviceArrow = item.querySelector('.service-arrow');
                
                // Close all others
                serviceItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherArrow = otherItem.querySelector('.service-arrow');
                        if (otherArrow) otherArrow.textContent = '+';
                    }
                });
                
                // Toggle current
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    serviceArrow.textContent = '−';
                } else {
                    serviceArrow.textContent = '+';
                }
                
                // Emit event
                window.APP_EVENT_BUS.emit('service:toggled', {
                    service: item.dataset.service,
                    active: item.classList.contains('active')
                });
            });
        });
    }
    
    /**
     * Setup services hover images
     * @private
     */
    async setupServicesHoverImages() {
        const imageContainer = document.querySelector('.service-image-container');
        const serviceImage = document.querySelector('.service-image');
        const typoLines = document.querySelectorAll('.typo-line');
        
        if (!imageContainer || !serviceImage || !typoLines.length) return;
        
        // Track scroll state
        let isScrolling = false;
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            isScrolling = true;
            imageContainer.classList.remove('show');
            serviceImage.classList.remove('active');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        });
        
        typoLines.forEach(line => {
            const serviceWord = line.querySelector('.service-word');
            if (!serviceWord) return;
            
            const imageUrl = line.getAttribute('data-image');
            let animationFrame;
            
            serviceWord.addEventListener('mouseenter', (e) => {
                if (isScrolling) return;
                
                // Change text color
                const serviceNumber = line.querySelector('.service-number');
                if (serviceNumber) serviceNumber.style.color = '#ffffff';
                
                // Position and show image
                imageContainer.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 125}px)`;
                serviceImage.src = imageUrl;
                imageContainer.classList.add('show');
                serviceImage.classList.add('active');
            });
            
            serviceWord.addEventListener('mousemove', (e) => {
                if (isScrolling) {
                    imageContainer.classList.remove('show');
                    serviceImage.classList.remove('active');
                    return;
                }
                
                if (animationFrame) cancelAnimationFrame(animationFrame);
                animationFrame = requestAnimationFrame(() => {
                    imageContainer.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 125}px)`;
                });
            });
            
            serviceWord.addEventListener('mouseleave', () => {
                const serviceNumber = line.querySelector('.service-number');
                if (serviceNumber) serviceNumber.style.color = '';
                
                if (animationFrame) cancelAnimationFrame(animationFrame);
                imageContainer.classList.remove('show');
                serviceImage.classList.remove('active');
            });
        });
    }
    
    /**
     * Setup footer animation
     * @private
     */
    async setupFooterAnimation() {
        const footerSection = document.getElementById('test-section');
        const footerText = document.querySelector('.footer-black h2');
        
        if (!footerSection || !footerText) return;
        
        // Split text for animation
        const textContent = footerText.innerHTML;
        const words = textContent.split('<br>');
        
        footerText.innerHTML = '';
        
        words.forEach(word => {
            const wordSpan = document.createElement('div');
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.lineHeight = '1';
            
            const chars = word.split('');
            chars.forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char === ' ' ? '\u00A0' : char;
                charSpan.style.display = 'inline-block';
                charSpan.style.transform = 'translateY(100%)';
                charSpan.classList.add('footer-char');
                wordSpan.appendChild(charSpan);
            });
            
            footerText.appendChild(wordSpan);
        });
        
        // Create animation
        this.animations.footer = gsap.timeline({
            scrollTrigger: {
                trigger: footerSection,
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        });
        
        this.animations.footer.to('.footer-char', {
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.03
        });
    }
    
    /**
     * Setup form validation
     * @private
     */
    async setupFormValidation() {
        const footerNomeInput = document.getElementById('footer-nome');
        const footerCognomeInput = document.getElementById('footer-cognome');
        const footerMessaggioInput = document.getElementById('footer-messaggio');
        const footerRequestCta = document.getElementById('footer-request-cta');
        
        if (!footerNomeInput || !footerCognomeInput || !footerMessaggioInput || !footerRequestCta) return;
        
        // Use unified FormValidator if available
        if (window.FormValidator) {
            new window.FormValidator({
                fields: [footerNomeInput, footerCognomeInput, footerMessaggioInput],
                submitButton: footerRequestCta,
                validateOnInit: true
            });
        }
    }
    
    /**
     * Handle homepage data update
     * @private
     */
    handleHomepageData(data) {
        if (!data || !data.hero) return;
        
        // Update hero media
        const centerPhoto = document.getElementById('center-photo');
        const centerVideo = document.getElementById('center-video');
        
        if (data.hero.center_media_type === 'video' && centerVideo) {
            centerVideo.style.display = 'block';
            if (centerPhoto) centerPhoto.style.display = 'none';
            
            const video = centerVideo.querySelector('video source');
            const videoElement = centerVideo.querySelector('video');
            if (video && videoElement && data.hero.center_media) {
                video.src = data.hero.center_media;
                videoElement.load();
            }
        } else if (data.hero.center_media_type === 'image' && centerPhoto) {
            centerPhoto.style.display = 'block';
            if (centerVideo) centerVideo.style.display = 'none';
            
            const img = centerPhoto.querySelector('img');
            if (img && data.hero.center_image) {
                img.src = data.hero.center_image;
            }
        }
    }
    
    /**
     * Handle window resize
     * @private
     */
    handleResize() {
        // Update hero animation on desktop only
        if (window.innerWidth >= 1024) {
            ScrollTrigger.refresh();
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Kill all animations
        Object.values(this.animations).forEach(anim => {
            if (anim && anim.kill) anim.kill();
        });
        
        // Kill ScrollTriggers
        ScrollTrigger.getAll().forEach(st => st.kill());
        
        this.initialized = false;
    }
}

// Registra il modulo se il registry è disponibile
if (window.MODULE_REGISTRY) {
    window.MODULE_REGISTRY.register('homepage', () => {
        const instance = new HomepageModule();
        return instance.initialize().then(() => instance);
    }, {
        priority: 40,
        dependencies: ['cms']
    });
}

// Export
window.HomepageModule = HomepageModule;