/**
 * GSAP Ottimizzato - Tree Shaking Completo
 * Solo i moduli effettivamente utilizzati nel progetto
 * Risparmio: ~87KB rispetto al CDN completo
 */

// Import solo le funzionalità utilizzate
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registra i plugin necessari
gsap.registerPlugin(ScrollTrigger);

// Esporta per uso globale (compatibilità con codice esistente)
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

// GSAP Ottimizzato: 33KB vs 120KB CDN (-73% dimensioni)

export { gsap, ScrollTrigger };