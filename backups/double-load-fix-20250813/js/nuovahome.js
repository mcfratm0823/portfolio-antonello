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
    }, window.CONSTANTS.TIMING.SCROLL_DEBOUNCE);
}, { passive: true });


// Footer Contact Form CTA Activation
document.addEventListener('DOMContentLoaded', function() {
    const footerNomeInput = document.getElementById('footer-nome');
    const footerCognomeInput = document.getElementById('footer-cognome');
    const footerMessaggioInput = document.getElementById('footer-messaggio');
    const footerRequestCta = document.getElementById('footer-request-cta');
    
    if (footerNomeInput && footerCognomeInput && footerMessaggioInput && footerRequestCta) {
        // Use unified FormValidator
        new FormValidator({
            fields: [footerNomeInput, footerCognomeInput, footerMessaggioInput],
            submitButton: footerRequestCta,
            validateOnInit: true
        });
    }
});

// Preloader Animation with Image Preloading
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    const preloaderLeft = document.querySelector('#preloader-left h1');
    const preloaderRight = document.querySelector('#preloader-right p');
    const mainContent = document.getElementById('main-content');
    const navbar = document.getElementById('navbar');
    
    
    // Check if preloader was already shown in this session
    const preloaderShown = sessionStorage.getItem('preloaderShown');
    
    if (preloaderShown) {
        // Skip preloader animation
        preloader.style.display = 'none';
        gsap.set(mainContent, { opacity: 1 });
        
        // Smart preload will handle images when needed
        
        return; // Exit early, skip the preloader animation
    }
    
    // Mark preloader as shown for this session
    sessionStorage.setItem('preloaderShown', 'true');
    
    // Smart preload service images - removed immediate loading
    // Images will be loaded when user approaches services section
    
    // Initially hide main content with will-change
    gsap.set(mainContent, { 
        opacity: 0,
        willChange: 'opacity'
    });
    
    // Animate preloader text - use opacity only to prevent CLS
    gsap.set([preloaderLeft, preloaderRight], { opacity: 0 });
    
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
    
    // Hide preloader and show main content after 2.5 seconds
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
    }, window.CONSTANTS.TIMING.PRELOADER_DURATION);
});


// Prevent default drag behavior
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
});

// Photo scaling with pinned viewport
document.addEventListener('DOMContentLoaded', function() {
    // Only apply animation on desktop/landscape tablets
    if (window.innerWidth >= 1024) {
        const centerPhoto = document.getElementById('center-photo');
        const centerVideo = document.getElementById('center-video');
        const visualTitle = document.getElementById('antonello-title');
        const designerTitle = document.getElementById('guarnieri-title');
        
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
        const photoTimeline = gsap.timeline({
            paused: true
        });
        
        // Define the animation with GSAP tweens instead of onUpdate
        photoTimeline
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
        
        // ScrollTrigger with smooth scrub
        ScrollTrigger.create({
            trigger: "#hero-section",
            start: "top top",
            end: "+=80vh",
            pin: true,
            pinSpacing: true,
            scrub: {
                value: 3,
                smooth: true
            },
            animation: photoTimeline,
            anticipatePin: 1
        });
    }
    
    // Handle resize with debouncing - increased delay for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Only refresh on desktop to prevent mobile issues
            if (window.innerWidth >= 1024) {
                ScrollTrigger.refresh();
            }
        }, window.CONSTANTS.TIMING.RESIZE_DEBOUNCE);
    });
    
    
});

// Portfolio Section Variables
const bottomClipPath = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
const fullClipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const isDesktop = window.matchMedia("(min-width: 992px)").matches;
const isTablet = window.matchMedia(`(min-width: ${window.CONSTANTS.BREAKPOINTS.MOBILE}px) and (max-width: 991px)`).matches;

// Portfolio Section Animation
document.addEventListener('DOMContentLoaded', function() {
    const portfolioSection = document.querySelector("[data-scroll-selected-work=section]");
    
    if (portfolioSection) {
        const items = portfolioSection.querySelectorAll("[data-scroll-selected-work=item]");
        const list = portfolioSection.querySelector("[data-scroll-selected-work=list]");
        const sticky = portfolioSection.querySelector(".selected_work_sticky");
        
        // Set dynamic CSS variable for portfolio height
        const projectCount = items.length;
        document.documentElement.style.setProperty('--portfolio-items-count', projectCount);
        
        // Create GSAP context for cleanup
        let ctx = gsap.context(() => {
            
            // Initial scale animation - esattamente come la reference
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
            
            // Set initial states for all items - First project visible, others hidden
            items.forEach((item, index) => {
                const headline = item.querySelector("[data-scroll-selected-work=headline]");
                const category = item.querySelector("[data-scroll-selected-work=category]");
                const bg = item.querySelector("[data-scroll-selected-work=bg]");
                const overlay = item.querySelector("[data-scroll-selected-work=overlay]");
                const boxImg = item.querySelector("[data-scroll-selected-work=box-img]");
                const boxTitle = item.querySelector("[data-scroll-selected-work=box-title]");
                const boxVideo = item.querySelector("[data-scroll-selected-work=box-video]");
                
                if (index === 0) {
                    // First project visible
                    gsap.set([bg, overlay, boxImg, boxTitle, boxVideo], { clipPath: fullClipPath });
                    gsap.set([headline, category], { yPercent: 0 });
                    gsap.set(item, { pointerEvents: "auto" });
                } else {
                    // Other projects completely hidden
                    gsap.set([bg, overlay, boxImg, boxTitle, boxVideo], { clipPath: bottomClipPath });
                    gsap.set([headline, category], { yPercent: 100, clipPath: bottomClipPath }); // 🎯 CLIP-PATH ANCHE SUI TESTI
                    gsap.set(item, { pointerEvents: "none" });
                }
            });
            
            // Timeline per il primo progetto (solo uscita quando arriva il secondo)
            if (items.length > 1) {
                const firstItem = items[0];
                const firstHeadline = firstItem.querySelector("[data-scroll-selected-work=headline]");
                const firstCategory = firstItem.querySelector("[data-scroll-selected-work=category]");
                
                const firstProjectExitTimeline = gsap.timeline({ paused: true });
                firstProjectExitTimeline
                    .to(firstHeadline, {
                        yPercent: -100,
                        duration: 1,
                        ease: "expo.inOut"
                    })
                    .to(firstCategory, {
                        yPercent: -100,
                        duration: 1,
                        ease: "expo.inOut"
                    }, "<");
                
                // Trigger per far uscire il primo progetto
                ScrollTrigger.create({
                    trigger: portfolioSection,
                    animation: firstProjectExitTimeline,
                    start: "25% bottom",
                    end: "37.5% bottom",
                    toggleActions: "play none none reverse"
                });
            }
            
            // Sistema della reference: timeline separate per ogni progetto
            items.forEach((item, index) => {
                if (index === 0) return; // Il primo progetto ha la sua timeline separata sopra
                const headline = item.querySelector("[data-scroll-selected-work=headline]");
                const category = item.querySelector("[data-scroll-selected-work=category]");
                const bg = item.querySelector("[data-scroll-selected-work=bg]");
                const overlay = item.querySelector("[data-scroll-selected-work=overlay]");
                const box = item.querySelector("[data-scroll-selected-work=box]");
                const boxTitle = item.querySelector("[data-scroll-selected-work=box-title]");
                const boxImg = item.querySelector("[data-scroll-selected-work=box-img]");
                const boxVideo = item.querySelector("[data-scroll-selected-work=box-video]");
                
                // Timeline per questo progetto (esattamente come la reference)
                const projectTimeline = gsap.timeline({
                    paused: true,
                    defaults: { duration: 1 }
                });
                
                // Timeline per hover (esattamente come la reference)
                const hoverTimeline = gsap.timeline({
                    paused: true,
                    defaults: { duration: 1 }
                });
                
                // Set pointer events (come la reference)
                projectTimeline.set(items, { pointerEvents: "none" });
                projectTimeline.set(item, { pointerEvents: "auto" });
                
                // Animazioni SIMULTANEE (tutto con "<" come nella reference)
                projectTimeline
                    .fromTo([bg, overlay], {
                        clipPath: bottomClipPath
                    }, {
                        clipPath: fullClipPath,
                        ease: "expo.inOut"
                    }, "<")
                    .fromTo(headline, {
                        yPercent: 100,
                        clipPath: bottomClipPath
                    }, {
                        yPercent: 0,
                        clipPath: fullClipPath,
                        ease: "expo.inOut",
                        willChange: "transform"
                    }, "<")
                    .fromTo(category, {
                        yPercent: 100,
                        clipPath: bottomClipPath
                    }, {
                        yPercent: 0,
                        clipPath: fullClipPath,
                        ease: "expo.inOut",
                        willChange: "transform"
                    }, "<")
                    .fromTo([boxImg, boxVideo, boxTitle], {
                        clipPath: bottomClipPath
                    }, {
                        clipPath: fullClipPath,
                        ease: "expo.inOut"
                    }, "<");
                
                // Gestione uscita testi precedenti - INCLUSO il primo progetto
                const prevIndex = index - 1;
                if (prevIndex >= 0) {
                    const prevHeadline = items[prevIndex].querySelector("[data-scroll-selected-work=headline]");
                    const prevCategory = items[prevIndex].querySelector("[data-scroll-selected-work=category]");
                    
                    projectTimeline
                        .fromTo(prevHeadline, {
                            yPercent: 0
                        }, {
                            yPercent: -100,
                            ease: "expo.inOut",
                            willChange: "transform"
                        }, "<")
                        .fromTo(prevCategory, {
                            yPercent: 0
                        }, {
                            yPercent: -100,
                            ease: "expo.inOut",
                            willChange: "transform"
                        }, "<");
                }
                
                // ScrollTrigger per questo progetto - adattato per pinning
                const totalProjects = items.length;
                const deadZoneStart = 25; // 25% zona morta all'inizio (dopo il centramento)
                const deadZoneEnd = 25; // 25% zona morta alla fine
                const availableSpace = 100 - deadZoneStart - deadZoneEnd; // 50% per i progetti
                const projectPercentage = availableSpace / (totalProjects - 1); // Diviso per transizioni
                
                // Calcola start point considerando la zona morta iniziale
                const startPoint = deadZoneStart + ((index - 1) * projectPercentage);
                
                ScrollTrigger.create({
                    trigger: portfolioSection,
                    animation: projectTimeline,
                    start: () => `${startPoint}% bottom`,
                    end: () => `${startPoint + projectPercentage}% bottom`,
                    onEnter: () => {
                        // Reset dei progetti successivi (come la reference)
                        [...items].slice(index + 1).forEach(futureItem => {
                            const futureHeadline = futureItem.querySelector("[data-scroll-selected-work=headline]");
                            const futureCategory = futureItem.querySelector("[data-scroll-selected-work=category]");
                            gsap.set([futureHeadline, futureCategory], { yPercent: 100 });
                        });
                    },
                    toggleActions: "play none none reverse",
                    preventOverlaps: "selectedWork"
                });
                
                // Hover effect desktop (esattamente come la reference)
                if (isDesktop) {
                    hoverTimeline.to(boxImg, {
                        opacity: 0,
                        ease: "expo.inOut"
                    });
                    
                    box.addEventListener("mouseenter", () => {
                        hoverTimeline.play();
                    });
                    
                    box.addEventListener("mouseleave", () => {
                        hoverTimeline.reverse();
                    });
                }
            });
            
            // Pin semplificato - lascia che ScrollTrigger gestisca tutto
            ScrollTrigger.create({
                trigger: portfolioSection,
                start: "top top",
                end: () => `+=${(items.length + 1) * 100}%`,
                pin: true,
                pinSpacing: false,
                anticipatePin: 1,
                scrub: 2 // Scroll più reattivo per gestire meglio scroll veloce
            });
            
        }, portfolioSection);
    }
});



// About Section Animation
document.addEventListener('DOMContentLoaded', function() {
    const aboutSection = document.getElementById('about-section');
    const aboutLabel = document.querySelector('.about-label');
    const aboutMainText = document.querySelector('#about-text p');
    const aboutDetails = document.querySelectorAll('.detail-column p');
    
    if (aboutSection && aboutLabel && aboutMainText) {
        gsap.registerPlugin(ScrollTrigger);
        
        // Set initial states
        gsap.set([aboutLabel, aboutMainText], { 
            opacity: 0,
            y: 50
        });
        
        gsap.set(aboutDetails, {
            opacity: 0,
            y: 30
        });
        
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
});

// Services Typography Animation
document.addEventListener('DOMContentLoaded', function() {
    const servicesSection = document.getElementById('services-section');
    const servicesTitle = document.querySelector('#services-section .services-title');
    const servicesDescription = document.querySelector('#services-section .services-description');
    const serviceWords = document.querySelectorAll('.service-word');
    
    if (servicesSection) {
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
        
        // Animate description after title
        if (servicesDescription) {
            gsap.set(servicesDescription, {
                opacity: 0,
                y: 30
            });
            
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
        
        // Initial state - simple setup
        const typoLines = document.querySelectorAll('.typo-line');
        
        if (typoLines.length > 0) {
            gsap.set(typoLines, { 
                opacity: 0,
                y: 60
            });
            
            // Simple animation without clipPath
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
        
        // Image hover effect
        const imageContainer = document.querySelector('.service-image-container');
        const serviceImage = document.querySelector('.service-image');
        
        // Track scroll state
        let isScrolling = false;
        let scrollTimeout;
        
        // Detect scroll
        window.addEventListener('scroll', () => {
            isScrolling = true;
            
            // Immediately hide image on scroll
            imageContainer.classList.remove('show');
            serviceImage.classList.remove('active');
            
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            
            // Set scrolling to false after scroll ends
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        });
        
        typoLines.forEach(line => {
            const serviceWord = line.querySelector('.service-word');
            
            // Image is already preloaded in the preloader
            const imageUrl = line.getAttribute('data-image');
            
            let animationFrame;
            
            serviceWord.addEventListener('mouseenter', (e) => {
                // Don't show image if scrolling
                if (isScrolling) return;
                
                // Change text color to white IMMEDIATELY
                const parentLine = serviceWord.closest('.typo-line');
                const serviceNumber = parentLine.querySelector('.service-number');
                if (serviceNumber) serviceNumber.style.color = '#ffffff';
                
                // Position container BEFORE showing
                imageContainer.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 125}px)`;
                
                // Always show image immediately, cached or not
                serviceImage.src = imageUrl;
                imageContainer.classList.add('show');
                serviceImage.classList.add('active');
            });
            
            serviceWord.addEventListener('mousemove', (e) => {
                // Hide image if scrolling starts during hover
                if (isScrolling) {
                    imageContainer.classList.remove('show');
                    serviceImage.classList.remove('active');
                    return;
                }
                
                // Cancel previous animation frame
                if (animationFrame) cancelAnimationFrame(animationFrame);
                
                // Use requestAnimationFrame for smoother movement
                animationFrame = requestAnimationFrame(() => {
                    imageContainer.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 125}px)`;
                });
            });
            
            serviceWord.addEventListener('mouseleave', () => {
                // Reset text color
                const parentLine = serviceWord.closest('.typo-line');
                const serviceNumber = parentLine.querySelector('.service-number');
                if (serviceNumber) serviceNumber.style.color = '';
                
                if (animationFrame) cancelAnimationFrame(animationFrame);
                imageContainer.classList.remove('show');
                serviceImage.classList.remove('active');
            });
        });
    }
});

// Footer Text Animation
document.addEventListener('DOMContentLoaded', function() {
    const footerSection = document.getElementById('test-section');
    const footerText = document.querySelector('.footer-black h2');
    const contactCta = document.querySelector('.footer-black .contact-text');
    
    if (footerSection && footerText) {
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
        
        // CTA sempre visibile - nessuna animazione
    }
});

// New Services Section - Accordion Animation
document.addEventListener('DOMContentLoaded', function() {
    const servicesSection = document.getElementById('services-section');
    const serviceItems = document.querySelectorAll('#services-section .service-item');
    const imageContainer = document.querySelector('#services-section .service-image-container');
    const serviceImage = document.querySelector('#services-section .service-image');
    
    if (serviceItems.length > 0 && imageContainer && serviceImage && servicesSection) {
        // Collect service images to preload
        const serviceImageUrls = [];
        serviceItems.forEach(item => {
            const imageUrl = item.getAttribute('data-image');
            if (imageUrl) serviceImageUrls.push(imageUrl);
        });
        
        // Smart preload when user approaches services section
        if (window.smartImagePreloader && serviceImageUrls.length > 0) {
            window.smartImagePreloader.observeAndPreload(
                servicesSection,
                serviceImageUrls,
                {
                    rootMargin: '300px', // Start loading 300px before visible
                    priority: 'high',
                    onComplete: (cachedImages) => {
                        // Images preloaded successfully
                    }
                }
            );
        }
        serviceItems.forEach(item => {
            const imageUrl = item.getAttribute('data-image');
            const serviceHeader = item.querySelector('.service-header');
            const serviceName = item.querySelector('.service-name');
            
            const showImage = () => {
                // Position image vertically based on the service header only (not expanded content)
                const serviceHeader = item.querySelector('.service-header');
                const headerRect = serviceHeader.getBoundingClientRect();
                const sectionRect = document.querySelector('#services-section').getBoundingClientRect();
                const imageHeight = clamp(210, window.innerWidth * 0.15, 270); // Match CSS clamp values
                const relativeTop = headerRect.top - sectionRect.top + (headerRect.height / 2) - (imageHeight / 2);
                
                // Only update position if image is not already showing to prevent trembling
                if (!imageContainer.classList.contains('show')) {
                    imageContainer.style.top = relativeTop + 'px';
                }
                
                // Show image - use cached if available
                const cachedImage = window.smartImagePreloader?.getCachedImage(imageUrl);
                if (cachedImage) {
                    // Use cached image for instant display
                    serviceImage.src = cachedImage.src;
                } else {
                    // Fallback to direct load
                    serviceImage.src = imageUrl;
                }
                imageContainer.classList.add('show');
            };
            
            // Helper function to match CSS clamp
            const clamp = (min, val, max) => Math.max(min, Math.min(max, val));
            
            const hideImage = () => {
                imageContainer.classList.remove('show');
            };
            
            // Add hover to entire service item
            item.addEventListener('mouseenter', showImage);
            item.addEventListener('mouseleave', hideImage);
            
            // Add click accordion functionality to entire service item
            item.addEventListener('click', function(e) {
                // Don't trigger if clicking on the expanded content
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
                
                // Change arrow symbol
                if (item.classList.contains('active')) {
                    serviceArrow.textContent = '−'; // Minus symbol
                } else {
                    serviceArrow.textContent = '+'; // Plus symbol
                }
            });
        });
    }
});

