
// Event Listener Cleanup System
const eventListeners = [];

// Helper function to add event listeners that can be cleaned up
function addCleanupListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    eventListeners.push({ target, event, handler, options });
}

// Store ScrollTrigger instances
const scrollTriggers = [];

// Cleanup function to remove all event listeners and animations
function cleanupAllListeners() {
    // Remove all event listeners
    eventListeners.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
    });
    eventListeners.length = 0;
    
    // Kill all ScrollTrigger instances
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(st => st.kill());
    }
    
    // Kill all GSAP animations
    if (typeof gsap !== 'undefined') {
        gsap.killTweensOf("*");
    }
}

// Clean up when page is unloaded
window.addEventListener('beforeunload', cleanupAllListeners);
window.addEventListener('pagehide', cleanupAllListeners);

// Enhanced Lazy Loading with fade-in effect
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is fully ready and GSAP animations have initialized
    setTimeout(() => {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        // Special handling for horizontal scroll images
        const horizontalImages = document.querySelectorAll('.gallery-stream img[loading="lazy"]');
        const regularImages = Array.from(lazyImages).filter(img => !img.closest('.gallery-stream'));
        
        // Force initial visibility for static gallery images
        const staticGalleryImages = document.querySelectorAll('#static-gallery img');
        staticGalleryImages.forEach(img => {
            // Ensure images are visible
            img.style.opacity = '0';
            img.style.visibility = 'visible';
            img.style.display = 'block';
        });
        
        if ('IntersectionObserver' in window) {
        // Observer for regular images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add fade-in class when image loads
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease-in-out';
                    
                    // Check if image is already loaded
                    if (img.complete && img.naturalHeight !== 0) {
                        img.style.opacity = '1';
                    } else {
                        img.addEventListener('load', function() {
                            img.style.opacity = '1';
                        }, { once: true });
                    }
                    
                    // Handle image loading errors
                    img.addEventListener('error', function() {
                        img.style.opacity = '0.3';
                        img.alt = 'Immagine non disponibile';
                    }, { once: true });
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px', // Start loading 50px before image enters viewport
            threshold: 0.01 // Trigger when 1% of image is visible
        });
        
        // Observe regular images
        regularImages.forEach(img => imageObserver.observe(img));
        
        // Special observer for horizontal scroll images with larger margin
        if (horizontalImages.length > 0) {
            const horizontalObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Add fade-in class when image loads
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.5s ease-in-out';
                        
                        img.addEventListener('load', function() {
                            img.style.opacity = '1';
                        }, { once: true });
                        
                        // Handle image loading errors
                        img.addEventListener('error', function() {
                            img.style.opacity = '0.3';
                            img.alt = 'Immagine non disponibile';
                        }, { once: true });
                        
                        // Stop observing this image
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '200px', // Larger margin for horizontal scroll
                threshold: 0.01
            });
            
            horizontalImages.forEach(img => horizontalObserver.observe(img));
        }
    }
    }, 100);
});

// Safari-compatible scroll handling
document.addEventListener('DOMContentLoaded', function() {
    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Only apply scroll prevention on non-Safari browsers
    if (!isSafari) {
        // Block scroll up only when at the very top
        const wheelHandler = function(event) {
            if (window.scrollY === 0 && event.deltaY < 0) {
                event.preventDefault();
            }
        };
        addCleanupListener(document, 'wheel', wheelHandler, { passive: false });
        
        // Block touch scroll up only when at the very top
        let touchStartY = 0;
        const touchStartHandler = function(e) {
            touchStartY = e.touches[0].clientY;
        };
        addCleanupListener(document, 'touchstart', touchStartHandler, { passive: true });
        
        const touchMoveHandler = function(e) {
            if (window.scrollY === 0) {
                const touchY = e.touches[0].clientY;
                const touchDelta = touchStartY - touchY;
                
                // If swiping up when at top, prevent it
                if (touchDelta < 0) {
                    e.preventDefault();
                }
            }
        };
        addCleanupListener(document, 'touchmove', touchMoveHandler, { passive: false });
    }
});

// Contact Form CTA Activation Logic
document.addEventListener('DOMContentLoaded', function() {
    const nomeInput = document.getElementById('nome');
    const cognomeInput = document.getElementById('cognome');
    const messaggioInput = document.getElementById('messaggio');
    const requestCta = document.getElementById('request-cta');
    
    if (nomeInput && cognomeInput && messaggioInput && requestCta) {
        function checkFormCompletion() {
            const nomeValue = nomeInput.value.trim();
            const cognomeValue = cognomeInput.value.trim();
            const messaggioValue = messaggioInput.value.trim();
            
            if (nomeValue && cognomeValue && messaggioValue) {
                // All fields filled - activate CTA
                requestCta.classList.add('active');
            } else {
                // Not all filled - deactivate CTA
                requestCta.classList.remove('active');
            }
        }
        
        // Check on input events
        addCleanupListener(nomeInput, 'input', checkFormCompletion);
        addCleanupListener(cognomeInput, 'input', checkFormCompletion);
        addCleanupListener(messaggioInput, 'input', checkFormCompletion);
        
        // Initial check
        checkFormCompletion();
    }
});


// Animate main project title and meta on page load
document.addEventListener('DOMContentLoaded', function() {
    const projectTitle = document.getElementById('project-title');
    const projectMeta = document.getElementById('project-meta');
    
    if (projectTitle) {
        // Set initial state for title
        gsap.set(projectTitle, { y: 80, opacity: 0 });
        
        // Animate title with smooth easing
        gsap.to(projectTitle, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.1
        });
    }
    
    if (projectMeta) {
        // Set initial state for meta
        gsap.set(projectMeta, { y: 30, opacity: 0 });
        
        // Animate meta slightly after title
        gsap.to(projectMeta, {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.4
        });
    }
});

// Minimal description text animation - SEMPLICE senza ScrollTrigger
document.addEventListener('DOMContentLoaded', function() {
    const descriptionTexts = document.querySelectorAll('.description-text');
    
    // Animazione semplice senza ScrollTrigger
    descriptionTexts.forEach(descriptionText => {
        // Rendi visibile immediatamente
        gsap.set(descriptionText, { opacity: 1, y: 0 });
    });
});

// Prevent default drag behavior on images - Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    // Delay to ensure all images are in DOM
    setTimeout(() => {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', e => e.preventDefault());
        });
    }, 100);
});

// Effetto Sipario - Il bianco si alza sopra il nero con scroll continuo
document.addEventListener('DOMContentLoaded', function() {
    // Skip curtain effect on mobile
    if (window.innerWidth <= 768) {
        return;
    }
    
    const whiteContainer = document.getElementById('white-container');
    const staticGallery = document.getElementById('static-gallery');
    
    if (whiteContainer && staticGallery) {
        
        // Crea un elemento spacer per mantenere l'altezza del documento
        const spacer = document.createElement('div');
        spacer.id = 'scroll-spacer';
        document.body.appendChild(spacer);
        
        function updateSpacerHeight() {
            // Lo spacer ha l'altezza dell'effetto (3x container) per mantenere lo scroll
            const containerHeight = whiteContainer.offsetHeight;
            const effectDuration = containerHeight * 3;
            spacer.style.height = `${effectDuration}px`;
            spacer.style.background = 'transparent';
            spacer.style.pointerEvents = 'none';
        }
        
        // Listener di scroll con throttling per performance mobile
        let ticking = false;
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(handleScrollWithRAF);
                ticking = true;
            }
        }
        
        function handleScrollWithRAF() {
            ticking = false;
            handleScroll();
        }
        
        function handleScroll() {
            // Posizione di scroll attuale - compatibile con tutti i browser
            const scrollY = window.pageYOffset || window.scrollY;
            
            // Trova la posizione dell'elemento trigger (gallery statica)
            const galleryRect = staticGallery.getBoundingClientRect();
            const galleryTopFromDocument = scrollY + galleryRect.top;
            const galleryBottomFromDocument = galleryTopFromDocument + galleryRect.height;
            
            // PUNTO DI TRIGGER MIGLIORATO: Inizia l'effetto quando la gallery statica è visibile
            const triggerPoint = Math.max(0, galleryBottomFromDocument - window.innerHeight);
            
            // Calcola l'altezza totale del container bianco
            const containerHeight = whiteContainer.offsetHeight;
            
            // Rallenta l'effetto: usa 3x l'altezza del container per la durata dello scroll
            const effectDuration = containerHeight * 3;
            
            // Punto finale: quando il bianco deve essere completamente alzato
            const endPoint = triggerPoint + effectDuration;
            
            
            if (scrollY >= triggerPoint && scrollY <= endPoint) {
                // Siamo nella zona dell'effetto sipario
                const scrolledIntoEffect = scrollY - triggerPoint;
                const progress = scrolledIntoEffect / effectDuration;
                const moveDistance = progress * containerHeight;
                
                // Applica il movimento - il bianco si alza
                whiteContainer.style.transform = `translateY(-${moveDistance}px)`;
                
                if (progress >= 0.95) {
                    // Attiva horizontal-content quando sipario è quasi completo
                    activateHorizontalContent();
                }
                
                // ATTIVAZIONE ANTICIPATA: Controlla se la gallery nera è visibile
                const blackContainer = document.getElementById('black-container');
                if (blackContainer) {
                    const blackRect = blackContainer.getBoundingClientRect();
                    // Se la gallery nera è visibile nella viewport
                    if (blackRect.top <= window.innerHeight && blackRect.bottom >= 0) {
                        activateHorizontalContent();
                    }
                }
                
            } else if (scrollY < triggerPoint) {
                // Prima del trigger - bianco in posizione normale
                whiteContainer.style.transform = `translateY(0px)`;
                
                // Reset horizontal-content se torniamo all'inizio
                if (horizontalContentActive) {
                    horizontalContentActive = false;
                    
                    // Rimuovi classe per ripristinare colore CTA
                    document.body.classList.remove('in-gallery');
                    
                    const galleryStream = document.querySelector('.gallery-stream');
                    if (galleryStream) {
                        galleryStream.style.setProperty('transform', 'translateX(0px)', 'important');
                    }
                }
                
            } else {
                // Dopo l'effetto - bianco completamente alzato
                whiteContainer.style.transform = `translateY(-${containerHeight}px)`;
                
                // Assicurati che horizontal-content sia attivo
                activateHorizontalContent();
                
                // ATTIVAZIONE ANTICIPATA: Controlla se la gallery nera è visibile
                const blackContainer = document.getElementById('black-container');
                if (blackContainer) {
                    const blackRect = blackContainer.getBoundingClientRect();
                    // Se la gallery nera è visibile nella viewport
                    if (blackRect.top <= window.innerHeight && blackRect.bottom >= 0) {
                        activateHorizontalContent();
                    }
                }
            }
            
            ticking = false;
        }
        
        addCleanupListener(window, 'scroll', requestTick, { passive: true });
        
        // Aggiorna spacer su resize
        addCleanupListener(window, 'resize', updateSpacerHeight);
        
        // Inizializza
        updateSpacerHeight();
        handleScroll();
        
    }
});

// Horizontal-Content Implementation
let horizontalContentActive = false;

function activateHorizontalContent() {
    if (horizontalContentActive) return;
    
    // Skip on mobile
    if (window.innerWidth <= 768) return;
    
    horizontalContentActive = true;
    
    // Aggiungi classe per cambiare colore CTA
    document.body.classList.add('in-gallery');
    
    // Attiva direttamente lo scroll orizzontale
    // Il black container è position fixed quindi è sempre visibile
    
    // DELAY per permettere al DOM di stabilizzarsi dopo il sipario
    setTimeout(() => {
        initializeHorizontalScroll();
    }, 100);
}

function initializeHorizontalScroll() {
    const galleryStream = document.querySelector('.gallery-stream');
    const blackContainer = document.getElementById('black-container');
    
    if (!galleryStream || !blackContainer) {
        console.error('❌ Elementi non trovati:', { galleryStream, blackContainer });
        return;
    }
    
    // Calcola dimensioni CORRETTE per lo scroll orizzontale
    // gallery-stream ha width: 500vw nel CSS
    const viewportWidth = window.innerWidth;
    const streamWidth = viewportWidth * 5; // 500vw = 5 * 100vw
    const containerWidth = viewportWidth; // 100vw
    
    // Calcola la distanza per centrare la CTA finale
    // Intro: 70vw, 4 slides da 80vw ciascuna + 1 CTA da 80vw = 70 + 320 + 80 = 470vw totali
    // La CTA inizia a 390vw e finisce a 470vw, quindi il suo centro è a 430vw
    // Per centrare la CTA nella viewport, il centro (430vw) deve essere al centro dello schermo (50vw)
    // Quindi scrollDistance = 430vw - 50vw = 380vw
    const scrollDistance = viewportWidth * 3.8; // 380vw per centrare perfettamente la CTA
    
    
    // Crea spacer per lo scroll orizzontale (ESTESO per coprire tutto il range necessario)
    const horizontalSpacer = document.createElement('div');
    horizontalSpacer.id = 'horizontal-spacer';
    horizontalSpacer.style.height = `${viewportWidth * 3.8}px`; // 3.8 viewport heights per match scroll distance
    horizontalSpacer.style.background = 'transparent';
    horizontalSpacer.style.pointerEvents = 'none';
    document.body.appendChild(horizontalSpacer);
    
    // Trova il punto di inizio dello scroll orizzontale
    const whiteContainer = document.getElementById('white-container');
    const currentScrollY = window.pageYOffset || window.scrollY;
    const whiteContainerHeight = whiteContainer ? whiteContainer.offsetHeight : viewportWidth;
    
    // IMPORTANTE: Inizia lo scroll orizzontale IMMEDIATAMENTE dopo il sipario
    const gapAfterCurtain = 0; // ZERO gap - attivazione immediata
    const startHorizontalOffset = whiteContainerHeight + gapAfterCurtain; // NON considerare currentScrollY
    
    
    // Listener per scroll orizzontale
    let horizontalTicking = false;
    
    function handleHorizontalScroll() {
        if (horizontalTicking) return;
        
        horizontalTicking = true;
        requestAnimationFrame(() => {
            const scrollY = window.pageYOffset || window.scrollY;
            
            // Calcola quando iniziare lo scroll orizzontale (dopo che il sipario è completato)
            const startHorizontal = startHorizontalOffset;
            const endHorizontal = startHorizontal + (viewportWidth * 3.8); // Range che corrisponde allo scroll distance
            
            
            // LOGICA SEMPLIFICATA: Calcola sempre dove dovrebbe essere la gallery
            if (scrollY < startHorizontal) {
                // Prima dello scroll orizzontale
                galleryStream.style.setProperty('transform', 'translateX(0px)', 'important');
                
            } else if (scrollY >= startHorizontal && scrollY <= endHorizontal) {
                // Siamo nella zona di scroll orizzontale
                const progress = (scrollY - startHorizontal) / (viewportWidth * 3.8); // Range che corrisponde allo spacer
                const translateX = -progress * scrollDistance;
                
                
                // Applica movimento orizzontale con !important
                galleryStream.style.setProperty('transform', `translateX(${translateX}px)`, 'important');
                
            } else {
                // Dopo lo scroll orizzontale - gallery completamente scrollata
                galleryStream.style.setProperty('transform', `translateX(-${scrollDistance}px)`, 'important');
            }
            
            horizontalTicking = false;
        });
    }
    
    addCleanupListener(window, 'scroll', handleHorizontalScroll, { passive: true });
    
    
    // NESSUN RESET - Il listener calcola la posizione corretta fin dall'inizio
    
    // CHIAMATA MANUALE IMMEDIATA del listener per calcolare posizione corretta
    handleHorizontalScroll();
}

