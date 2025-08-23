/**
 * NuovaHome Refactored - Versione ottimizzata senza DOMContentLoaded multipli
 * Tutte le inizializzazioni sono consolidate in un unico punto
 */

// Import dependencies for ES6 module support
// When loaded as module, these will be available
// When loaded as script, they'll use global variables

// Performance optimization - detect scrolling
let scrollTimeout;
window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
    }, window.CONSTANTS?.TIMING?.SCROLL_DEBOUNCE || 250);
}, { passive: true });

// Prevent default drag behavior
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

/**
 * Main initialization class for homepage
 */
class NuovaHomeInitializer {
    constructor() {
        this.initialized = false;
        this.debug = window.location.search.includes('debug=true');
    }
    
    /**
     * Initialize all homepage features
     */
    async initialize() {
        if (this.initialized) {
            if (this.debug) {} // NuovaHome already initialized
            return;
        }
        
        this.initialized = true;
        
        if (this.debug) {} // NuovaHome starting initialization
        
        // Track module init if available
        if (window.trackModuleInit) {
            window.trackModuleInit('NuovaHome');
        }
        
        // Initialize video control before preloader
        this.initHeroVideo();
        
        // Initialize all features
        this.initFooterForm();
        this.initPreloader();
        this.initPhotoScaling();
        this.initPortfolioSection();
        this.initAboutSection();
        this.initServicesSection();
        this.initFooterAnimation();
        this.initServicesAccordion();
        
        if (this.debug) {} // NuovaHome initialization complete
    }
    
    /**
     * Initialize hero video and prevent autoplay
     */
    initHeroVideo() {
        const heroVideo = document.getElementById('hero-video');
        if (!heroVideo) return;
        
        // Block video completely until needed
        heroVideo.style.display = 'none';
        heroVideo.pause();
        
        // Force video to load first frame
        heroVideo.load();
        
        // When metadata is loaded, ensure we're at frame 0
        heroVideo.addEventListener('loadedmetadata', () => {
            heroVideo.currentTime = 0;
            heroVideo.pause();
        }, { once: true });
        
        // Store reference for later
        this.heroVideo = heroVideo;
    }
    
    /**
     * Start hero video playback
     */
    startHeroVideo() {
        if (!this.heroVideo) return;
        
        // Force complete reload before showing
        const src = this.heroVideo.currentSrc;
        this.heroVideo.src = '';
        this.heroVideo.load();
        this.heroVideo.src = src;
        
        // Wait for video to be ready after reload
        this.heroVideo.addEventListener('loadeddata', () => {
            // Now show and play
            this.heroVideo.style.display = 'block';
            this.heroVideo.currentTime = 0;
            this.heroVideo.play().catch(err => {
                if (this.debug) console.warn('Video autoplay blocked:', err);
            });
        }, { once: true });
    }
    
    /**
     * Initialize footer contact form
     */
    initFooterForm() {
        const footerNomeInput = document.getElementById('footer-nome');
        const footerCognomeInput = document.getElementById('footer-cognome');
        const footerMessaggioInput = document.getElementById('footer-messaggio');
        const footerRequestCta = document.getElementById('footer-request-cta');
        
        if (footerNomeInput && footerCognomeInput && footerMessaggioInput && footerRequestCta && window.FormValidator) {
            new FormValidator({
                fields: [footerNomeInput, footerCognomeInput, footerMessaggioInput],
                submitButton: footerRequestCta,
                validateOnInit: true
            });
        }
    }
    
    /**
     * Initialize preloader animation
     */
    initPreloader() {
        const preloader = document.getElementById('preloader');
        const preloaderLeft = document.querySelector('#preloader-left h1');
        const preloaderRight = document.querySelector('#preloader-right p');
        const mainContent = document.getElementById('main-content');
        const heroVideo = document.getElementById('hero-video');
        
        if (!preloader || !mainContent) return;
        
        // Check if preloader was already shown
        const preloaderShown = sessionStorage.getItem('preloaderShown');
        
        if (preloaderShown) {
            // Skip preloader animation
            preloader.style.display = 'none';
            gsap.set(mainContent, { opacity: 1 });
            
            // Start video immediately when skipping preloader
            this.startHeroVideo();
            
            // Show navbar
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.add('visible');
            }
            
            return;
        }
        
        // Mark preloader as shown
        sessionStorage.setItem('preloaderShown', 'true');
        
        // Calcola quanto tempo del video corrisponde al preloader
        const preloaderDuration = window.CONSTANTS?.TIMING?.PRELOADER_DURATION || 2500;
        
        // Il video parte comunque con il timer di initHeroVideo
        
        // Initial state
        gsap.set(mainContent, { opacity: 0, willChange: 'opacity' });
        gsap.set([preloaderLeft, preloaderRight], { opacity: 0 });
        
        // Animate preloader text
        gsap.to(preloaderLeft, {
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.2
        });
        
        gsap.to(preloaderRight, {
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.4
        });
        
        // Hide preloader and show main content after delay
        setTimeout(() => {
            // Show main content first
            gsap.to(mainContent, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });
            
            // Move texts to the right first
            gsap.to([preloaderLeft, preloaderRight], {
                x: '40px',
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
                onComplete: () => {
                    // Start video right before preloader slides down
                    this.startHeroVideo();
                    
                    // Then slide preloader down to reveal white content
                    gsap.to(preloader, {
                        y: '100vh',
                        duration: 1.2,
                        ease: "power3.inOut",
                        onComplete: () => {
                            preloader.style.display = 'none';
                            // Show navbar after preloader
                            const navbar = document.getElementById('navbar');
                            if (navbar) {
                                navbar.classList.add('visible');
                            }
                        }
                    });
                }
            });
        }, window.CONSTANTS?.TIMING?.PRELOADER_DURATION || 2500);
    }
    
    /**
     * Initialize photo scaling animation
     */
    initPhotoScaling() {
        // Only apply animation on desktop/landscape tablets
        if (window.innerWidth < 1024) return;
        
        const centerVideo = document.getElementById('center-video');
        const visualTitle = document.getElementById('antonello-title');
        const designerTitle = document.getElementById('guarnieri-title');
        
        if (!centerVideo) return;
        
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Calculate dimensions needed for full viewport coverage
        function getFullScreenDimensions() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        
        // Create timeline for photo animation
        const photoTimeline = gsap.timeline({ paused: true });
        
        // Define the animation - only for video now
        photoTimeline
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
        
        // ScrollTrigger with smooth scrub
        ScrollTrigger.create({
            trigger: "#hero-section",
            start: "top top",
            end: "+=80vh",
            pin: true,
            pinSpacing: true,
            scrub: { value: 3, smooth: true },
            animation: photoTimeline,
            anticipatePin: 1
        });
        
        // Handle resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth >= 1024) {
                    ScrollTrigger.refresh();
                }
            }, window.CONSTANTS?.TIMING?.RESIZE_DEBOUNCE || 300);
        });
    }
    
    /**
     * Initialize portfolio section
     */
    initPortfolioSection() {
        const portfolioSection = document.querySelector("[data-scroll-selected-work=section]");
        if (!portfolioSection) return;
        
        const items = portfolioSection.querySelectorAll("[data-scroll-selected-work=item]");
        const list = portfolioSection.querySelector("[data-scroll-selected-work=list]");
        const sticky = portfolioSection.querySelector(".selected_work_sticky");
        
        if (!items.length) return;
        
        // Set dynamic CSS variable for portfolio height
        const projectCount = items.length;
        document.documentElement.style.setProperty('--portfolio-items-count', projectCount);
        
        // Create GSAP context for cleanup
        let ctx = gsap.context(() => {
            this.setupPortfolioAnimations(portfolioSection, items, list);
        }, portfolioSection);
    }
    
    /**
     * Setup portfolio animations
     */
    setupPortfolioAnimations(portfolioSection, items, list) {
        const bottomClipPath = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        const fullClipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        const isDesktop = window.matchMedia("(min-width: 992px)").matches;
        
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
        
        // Set initial states
        portfolioSection.classList.add("is-visible");
        
        // Initialize all items
        items.forEach((item, index) => {
            const elements = this.getPortfolioElements(item);
            
            if (index === 0) {
                // First project visible
                gsap.set([elements.bg, elements.overlay, elements.boxImg, elements.boxTitle, elements.boxVideo], 
                    { clipPath: fullClipPath });
                gsap.set([elements.headline, elements.category], { yPercent: 0 });
                gsap.set(item, { pointerEvents: "auto" });
            } else {
                // Other projects hidden
                gsap.set([elements.bg, elements.overlay, elements.boxImg, elements.boxTitle, elements.boxVideo], 
                    { clipPath: bottomClipPath });
                gsap.set([elements.headline, elements.category], 
                    { yPercent: 100, clipPath: bottomClipPath });
                gsap.set(item, { pointerEvents: "none" });
            }
        });
        
        // Setup individual project animations
        this.setupProjectAnimations(items, portfolioSection, isDesktop);
        
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
    }
    
    /**
     * Get portfolio elements
     */
    getPortfolioElements(item) {
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
     * Setup individual project animations
     */
    setupProjectAnimations(items, portfolioSection, isDesktop) {
        // First project exit animation
        if (items.length > 1) {
            const firstItem = items[0];
            const elements = this.getPortfolioElements(firstItem);
            
            const firstProjectExitTimeline = gsap.timeline({ paused: true });
            firstProjectExitTimeline
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
                animation: firstProjectExitTimeline,
                start: "25% bottom",
                end: "37.5% bottom",
                toggleActions: "play none none reverse"
            });
        }
        
        // Animations for other projects
        items.forEach((item, index) => {
            if (index === 0) return;
            
            const elements = this.getPortfolioElements(item);
            const prevElements = this.getPortfolioElements(items[index - 1]);
            
            // Create timeline for this project
            const projectTimeline = gsap.timeline({
                paused: true,
                defaults: { duration: 1 }
            });
            
            // Set pointer events
            projectTimeline.set(items, { pointerEvents: "none" });
            projectTimeline.set(item, { pointerEvents: "auto" });
            
            // Animate current project in
            projectTimeline
                .fromTo([elements.bg, elements.overlay], {
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                }, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.inOut"
                }, "<")
                .fromTo(elements.headline, {
                    yPercent: 100,
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                }, {
                    yPercent: 0,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.inOut",
                    willChange: "transform"
                }, "<")
                .fromTo(elements.category, {
                    yPercent: 100,
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                }, {
                    yPercent: 0,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.inOut",
                    willChange: "transform"
                }, "<")
                .fromTo([elements.boxImg, elements.boxVideo, elements.boxTitle], {
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                }, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.inOut"
                }, "<");
            
            // Animate previous project out
            if (prevElements.headline && prevElements.category) {
                projectTimeline
                    .fromTo(prevElements.headline, {
                        yPercent: 0
                    }, {
                        yPercent: -100,
                        ease: "expo.inOut",
                        willChange: "transform"
                    }, "<")
                    .fromTo(prevElements.category, {
                        yPercent: 0
                    }, {
                        yPercent: -100,
                        ease: "expo.inOut",
                        willChange: "transform"
                    }, "<");
            }
            
            // Calculate scroll positions
            const totalProjects = items.length;
            const deadZoneStart = 25;
            const deadZoneEnd = 25;
            const availableSpace = 100 - deadZoneStart - deadZoneEnd;
            const projectPercentage = availableSpace / (totalProjects - 1);
            const startPoint = deadZoneStart + ((index - 1) * projectPercentage);
            
            ScrollTrigger.create({
                trigger: portfolioSection,
                animation: projectTimeline,
                start: () => `${startPoint}% bottom`,
                end: () => `${startPoint + projectPercentage}% bottom`,
                onEnter: () => {
                    // Reset future projects
                    [...items].slice(index + 1).forEach(futureItem => {
                        const futureElements = this.getPortfolioElements(futureItem);
                        gsap.set([futureElements.headline, futureElements.category], { yPercent: 100 });
                    });
                },
                toggleActions: "play none none reverse",
                preventOverlaps: "selectedWork"
            });
            
            // Hover effect desktop - DISABLED
            // if (isDesktop && elements.box && elements.boxImg) {
            //     const hoverTimeline = gsap.timeline({ paused: true });
            //     hoverTimeline.to(elements.boxImg, {
            //         opacity: 0,
            //         ease: "expo.inOut"
            //     });
            //     
            //     elements.box.addEventListener("mouseenter", () => hoverTimeline.play());
            //     elements.box.addEventListener("mouseleave", () => hoverTimeline.reverse());
            // }
        });
    }
    
    /**
     * Initialize about section
     */
    initAboutSection() {
        const aboutSection = document.getElementById('about-section');
        const aboutLabel = document.querySelector('.about-label');
        const aboutMainText = document.querySelector('#about-text p');
        const aboutDetails = document.querySelectorAll('.detail-column p');
        
        if (!aboutSection || !aboutLabel || !aboutMainText) return;
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Set initial states
        gsap.set([aboutLabel, aboutMainText], { opacity: 0, y: 50 });
        gsap.set(aboutDetails, { opacity: 0, y: 30 });
        
        // Create timeline
        const aboutTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: aboutSection,
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        });
        
        // Animate elements in sequence
        aboutTimeline
            .to(aboutLabel, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
            })
            .to(aboutMainText, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            }, "-=0.4")
            .to(aboutDetails, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.2
            }, "-=0.6");
    }
    
    /**
     * Initialize services section
     */
    initServicesSection() {
        const servicesSection = document.getElementById('services-section');
        const servicesTitle = document.querySelector('#services-section .services-title');
        const servicesDescription = document.querySelector('#services-section .services-description');
        const serviceWords = document.querySelectorAll('.service-word');
        
        if (!servicesSection) return;
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Animate Services title
        if (servicesTitle) {
            gsap.set(servicesTitle, {
                opacity: 0,
                y: 50,
                clipPath: "inset(100% 0% 0% 0%)"
            });
            
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
        
        // Animate description
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
        const typoLines = document.querySelectorAll('.typo-line');
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
        
        // Setup hover images
        this.setupServicesHoverImages();
    }
    
    /**
     * Setup services hover images
     */
    setupServicesHoverImages() {
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
                
                const parentLine = serviceWord.closest('.typo-line');
                const serviceNumber = parentLine.querySelector('.service-number');
                if (serviceNumber) serviceNumber.style.color = '#ffffff';
                
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
                const parentLine = serviceWord.closest('.typo-line');
                const serviceNumber = parentLine.querySelector('.service-number');
                if (serviceNumber) serviceNumber.style.color = '';
                
                if (animationFrame) cancelAnimationFrame(animationFrame);
                imageContainer.classList.remove('show');
                serviceImage.classList.remove('active');
            });
        });
    }
    
    /**
     * Initialize footer animation
     */
    initFooterAnimation() {
        const footerSection = document.getElementById('test-section');
        const footerText = document.querySelector('.footer-black h2');
        const contactCta = document.querySelector('.footer-black .contact-text');
        
        if (!footerSection || !footerText) return;
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Split text into characters for animation
        const textContent = footerText.innerHTML;
        const words = textContent.split('<br>');
        
        // Clear original content
        footerText.innerHTML = '';
        
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('div');
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.lineHeight = '1';
            
            const chars = word.split('');
            chars.forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char === ' ' ? '\u00A0' : char;
                charSpan.style.display = 'inline-block';
                charSpan.style.transform = 'translateY(100%)';
                charSpan.classList.add('footer-char');
                wordSpan.appendChild(charSpan);
            });
            
            footerText.appendChild(wordSpan);
        });
        
        // Animate characters
        gsap.timeline({
            scrollTrigger: {
                trigger: footerSection,
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        })
        .to('.footer-char', {
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.03
        });
    }
    
    /**
     * Initialize services accordion
     */
    initServicesAccordion() {
        const servicesSection = document.getElementById('services-section');
        const serviceItems = document.querySelectorAll('#services-section .service-item');
        const imageContainer = document.querySelector('#services-section .service-image-container');
        const serviceImage = document.querySelector('#services-section .service-image');
        
        if (!serviceItems.length || !imageContainer || !serviceImage || !servicesSection) return;
        
        // Preload service images when approaching section
        const serviceImageUrls = [];
        serviceItems.forEach(item => {
            const imageUrl = item.getAttribute('data-image');
            if (imageUrl) serviceImageUrls.push(imageUrl);
        });
        
        if (window.smartImagePreloader && serviceImageUrls.length > 0) {
            window.smartImagePreloader.observeAndPreload(
                servicesSection,
                serviceImageUrls,
                {
                    rootMargin: '300px',
                    priority: 'high'
                }
            );
        }
        
        // Setup accordion functionality
        serviceItems.forEach(item => {
            const imageUrl = item.getAttribute('data-image');
            
            const showImage = () => {
                const serviceHeader = item.querySelector('.service-header');
                const headerRect = serviceHeader.getBoundingClientRect();
                const sectionRect = servicesSection.getBoundingClientRect();
                const imageHeight = this.clamp(210, window.innerWidth * 0.15, 270);
                const relativeTop = headerRect.top - sectionRect.top + (headerRect.height / 2) - (imageHeight / 2);
                
                console.log('Showing image for:', item.querySelector('.service-name').textContent, 'URL:', imageUrl);
                
                if (!imageContainer.classList.contains('show')) {
                    imageContainer.style.top = relativeTop + 'px';
                }
                
                // Force image change by clearing src first
                if (serviceImage.src !== imageUrl) {
                    serviceImage.src = '';
                    setTimeout(() => {
                        const cachedImage = window.smartImagePreloader?.getCachedImage(imageUrl);
                        if (cachedImage) {
                            serviceImage.src = cachedImage.src;
                        } else {
                            serviceImage.src = imageUrl;
                        }
                    }, 10);
                }
                imageContainer.classList.add('show');
            };
            
            const hideImage = () => {
                imageContainer.classList.remove('show');
            };
            
            // Add hover to entire service item
            item.addEventListener('mouseenter', showImage);
            item.addEventListener('mouseleave', hideImage);
            
            // Add click accordion functionality
            item.addEventListener('click', (e) => {
                if (e.target.closest('.service-content') && !e.target.closest('.service-header')) {
                    return;
                }
                
                e.stopPropagation();
                
                const serviceArrow = item.querySelector('.service-arrow');
                
                // Close all other accordions
                serviceItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherArrow = otherItem.querySelector('.service-arrow');
                        if (otherArrow) otherArrow.textContent = '+';
                    }
                });
                
                // Toggle current accordion
                item.classList.toggle('active');
                
                if (item.classList.contains('active')) {
                    serviceArrow.textContent = '−';
                } else {
                    serviceArrow.textContent = '+';
                }
            });
        });
    }
    
    /**
     * Helper function to match CSS clamp
     */
    clamp(min, val, max) {
        return Math.max(min, Math.min(max, val));
    }
}

// Wrap in IIFE to allow return
(() => {
    // Prevent multiple initializations with global flag
    if (window.__nuovaHomeInitialized) {
        console.warn('NuovaHome already initialized, skipping...');
        return;
    }
    window.__nuovaHomeInitialized = true;

    // Create and export initializer
    const nuovaHomeInitializer = new NuovaHomeInitializer();

    // Register with module registry if available
    if (window.MODULE_REGISTRY) {
        window.MODULE_REGISTRY.register('nuovaHome', async () => {
            await nuovaHomeInitializer.initialize();
            return nuovaHomeInitializer;
        }, {
            priority: 30,
            dependencies: ['constants']
        });
    } else {
        // Fallback for standalone use ONLY if no module registry
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                nuovaHomeInitializer.initialize();
            });
        } else {
            nuovaHomeInitializer.initialize();
        }
    }

    // Export for modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NuovaHomeInitializer;
    }
    
    // Make available globally
    window.nuovaHomeInitializer = nuovaHomeInitializer;
})();