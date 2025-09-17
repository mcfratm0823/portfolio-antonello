/**
 * Homepage Animations
 * Gestisce le animazioni FOUT per la homepage
 */

// Funzione per animare gli elementi della homepage
function animateHomepageElements() {
    // Attendi che GSAP sia disponibile
    if (typeof gsap === 'undefined' || !window.gsap) {
        setTimeout(animateHomepageElements, 100);
        return;
    }
    
    // Seleziona gli elementi da animare nella homepage
    const heroTitle = document.querySelector('#antonello-title h2');
    const heroSubtitle = document.querySelector('#guarnieri-title h2');
    const leftText = document.querySelector('#left-text p');
    const rightText = document.querySelector('#right-text p');
    const aboutText = document.querySelector('#about-text p');
    const servicesTitle = document.querySelector('.services-title');
    
    // Timeline per animazioni coordinate
    const tl = gsap.timeline({
        defaults: {
            ease: "power3.out"
        }
    });
    
    // Anima elementi hero
    if (heroTitle) {
        gsap.set(heroTitle, { opacity: 0, y: 50 });
        tl.to(heroTitle, { opacity: 1, y: 0, duration: 1 }, 0.2);
    }
    
    if (heroSubtitle) {
        gsap.set(heroSubtitle, { opacity: 0, y: 50 });
        tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 1 }, 0.3);
    }
    
    if (leftText) {
        gsap.set(leftText, { opacity: 0, x: -30 });
        tl.to(leftText, { opacity: 1, x: 0, duration: 0.8 }, 0.4);
    }
    
    if (rightText) {
        gsap.set(rightText, { opacity: 0, x: 30 });
        tl.to(rightText, { opacity: 1, x: 0, duration: 0.8 }, 0.4);
    }
    
    // Anima sezione about con ScrollTrigger
    if (aboutText && window.ScrollTrigger) {
        gsap.set(aboutText, { opacity: 0, y: 30 });
        gsap.to(aboutText, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: aboutText,
                start: "top 80%",
                once: true
            }
        });
    }
    
    // Anima titolo servizi
    if (servicesTitle && window.ScrollTrigger) {
        gsap.set(servicesTitle, { opacity: 0, scale: 0.95 });
        gsap.to(servicesTitle, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: servicesTitle,
                start: "top 80%",
                once: true
            }
        });
    }
    
    // Anima i progetti nel portfolio della homepage
    const portfolioTitle = document.querySelector('#portfolio h2');
    if (portfolioTitle && window.ScrollTrigger) {
        gsap.set(portfolioTitle, { opacity: 0, y: 40 });
        gsap.to(portfolioTitle, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: portfolioTitle,
                start: "top 80%",
                once: true
            }
        });
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateHomepageElements);
} else {
    // DOM già caricato
    animateHomepageElements();
}

// Esporta per uso in altri moduli
export { animateHomepageElements };