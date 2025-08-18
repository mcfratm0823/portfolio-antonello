/**
 * Projects Data Layer - Single Source of Truth
 * Professional data structure for all projects
 * @author Senior Developer
 * @version 1.0.0
 */

export const PROJECTS_DATA = {
    'cafe-124': {
        // Meta Information
        id: 1,
        title: 'Cafè 124',
        slug: 'cafe-124',
        category: 'digital',
        year: '2024',
        client: 'IDENTITÀ VISIVA',
        featured: true,
        order: 1,
        
        // Visual Assets
        thumbnail: 'https://picsum.photos/1200/600?random=201',
        hero_image: 'https://picsum.photos/1200/600?random=201',
        gallery_images: [
            'https://picsum.photos/1200/800?random=202',
            'https://picsum.photos/1200/800?random=203'
        ],
        
        // Content Blocks
        content: {
            concept: {
                label: '(CONCEPT)',
                text: 'CAFÈ 124 RAPPRESENTA L\'ESSENZA DELL\'ESPERIENZA CAFFÈ MODERNA, DOVE TRADIZIONE E INNOVAZIONE SI INCONTRANO. IL PROGETTO HA SVILUPPATO UN\'IDENTITÀ VISIVA COMPLETA CHE CATTURA LO SPIRITO CONTEMPORANEO DEL BRAND, MANTENENDO UN LEGAME AUTENTICO CON LA CULTURA DEL CAFFÈ ITALIANO.'
            },
            approach: {
                label: '(DESIGN APPROACH)',
                text: 'L\'APPROCCIO CREATIVO SI È CONCENTRATO SULLA CREAZIONE DI UN SISTEMA VISIVO COERENTE E RICONOSCIBILE. ATTRAVERSO UNA PALETTE CROMATICA CALDA E ACCOGLIENTE, TIPOGRAFIE CONTEMPORANEE E ELEMENTI GRAFICI DISTINTIVI, ABBIAMO COSTRUITO UN\'IDENTITÀ CHE COMUNICA QUALITÀ E PASSIONE.'
            }
        }
    },
    
    'generali': {
        id: 2,
        title: 'Generali',
        slug: 'generali',
        category: 'brand',
        year: '2024',
        client: 'CORPORATE IDENTITY',
        featured: false,
        order: 2,
        
        thumbnail: 'https://picsum.photos/1200/600?random=301',
        hero_image: 'https://picsum.photos/1200/600?random=301',
        gallery_images: [
            'https://picsum.photos/1200/800?random=302',
            'https://picsum.photos/1200/800?random=303'
        ],
        
        content: {
            concept: {
                label: '(CORPORATE VISION)',
                text: 'UN PROGETTO DI IDENTITÀ CORPORATE PER IL GRUPPO GENERALI CHE RIDEFINISCE I CODICI COMUNICATIVI DELL\'ASSICURAZIONE MODERNA. ATTRAVERSO UN LINGUAGGIO VISIVO CONTEMPORANEO E RASSICURANTE, ABBIAMO CREATO UN SISTEMA CHE COMUNICA FIDUCIA, SOLIDITÀ E INNOVAZIONE NEL SETTORE ASSICURATIVO.'
            },
            approach: {
                label: '(BRAND STRATEGY)',
                text: 'L\'APPROCCIO STRATEGICO SI È FOCALIZZATO SULLA CREAZIONE DI UNA COMUNICAZIONE CHE BILANCIA TRADIZIONE E MODERNITÀ. ATTRAVERSO UNA RICERCA APPROFONDITA DEL MERCATO E DEL TARGET, ABBIAMO SVILUPPATO UN SISTEMA VISIVO CHE POSIZIONA GENERALI COME LEADER INNOVATIVO NEL PANORAMA ASSICURATIVO ITALIANO.'
            }
        }
    },
    
    'audi': {
        id: 3,
        title: 'Audi',
        slug: 'audi',
        category: 'web',
        year: '2024',
        client: 'AUTOMOTIVE DIGITAL',
        featured: false,
        order: 3,
        
        thumbnail: 'https://picsum.photos/1200/600?random=401',
        hero_image: 'https://picsum.photos/1200/600?random=401',
        gallery_images: [
            'https://picsum.photos/1200/800?random=402',
            'https://picsum.photos/1200/800?random=403'
        ],
        
        content: {
            concept: {
                label: '(PREMIUM DIGITAL)',
                text: 'UN\'ESPERIENZA DIGITALE ALL\'ALTEZZA DEL DNA PREMIUM AUDI. ABBIAMO PROGETTATO UNA PIATTAFORMA WEB CHE INCARNA I VALORI DI INNOVAZIONE, QUALITÀ E PRESTAZIONI DEL MARCHIO, CREANDO UN TOUCHPOINT DIGITALE CHE RIFLETTE L\'ECCELLENZA AUTOMOTIVE TEDESCA IN OGNI PIXEL.'
            },
            approach: {
                label: '(PERFORMANCE DRIVEN)',
                text: 'SEGUENDO LA FILOSOFIA "VORSPRUNG DURCH TECHNIK", ABBIAMO SVILUPPATO UNA SOLUZIONE TECNOLOGICA ALL\'AVANGUARDIA. L\'ARCHITETTURA È STATA PROGETTATA PER GARANTIRE PERFORMANCE ECCELLENTI, VELOCITÀ DI CARICAMENTO OTTIMALE E UN\'ESPERIENZA UTENTE CHE RISPECCHIA GLI STANDARD DI QUALITÀ AUDI.'
            }
        }
    },
    
    'progetto-quattro': {
        id: 4,
        title: 'PROGETTO QUATTRO',
        slug: 'progetto-quattro',
        category: 'print',
        year: '2024',
        client: 'EDITORIAL DESIGN',
        featured: false,
        order: 4,
        
        thumbnail: 'https://picsum.photos/1200/600?random=501',
        hero_image: 'https://picsum.photos/1200/600?random=501',
        gallery_images: [
            'https://picsum.photos/1200/800?random=502',
            'https://picsum.photos/1200/800?random=503'
        ],
        
        content: {
            concept: {
                label: '(EDITORIAL CONCEPT)',
                text: 'UN PROGETTO EDITORIALE CHE SFIDA LE CONVENZIONI DEL DESIGN TRADIZIONALE. ABBIAMO CREATO UN LINGUAGGIO VISIVO DISTINTIVO CHE BILANCIA LEGGIBILITÀ E IMPATTO ESTETICO, TRASFORMANDO OGNI PAGINA IN UN\'ESPERIENZA COINVOLGENTE.'
            },
            approach: {
                label: '(DESIGN PROCESS)',
                text: 'ATTRAVERSO UNA METODOLOGIA SPERIMENTALE E ITERATIVA, ABBIAMO ESPLORATO NUOVE POSSIBILITÀ TIPOGRAFICHE E COMPOSITIVI. OGNI ELEMENTO È STATO CALIBRATO PER CREARE RITMO VISIVO E GUIDARE IL LETTORE ATTRAVERSO UNA NARRATIVA COESA.'
            }
        }
    },
    
    'progetto-cinque': {
        id: 5,
        title: 'PROGETTO CINQUE',
        slug: 'progetto-cinque',
        category: 'digital',
        year: '2024',
        client: 'APP MOBILE',
        featured: true,
        order: 5,
        
        thumbnail: 'https://picsum.photos/1200/600?random=601',
        hero_image: 'https://picsum.photos/1200/600?random=601',
        gallery_images: [
            'https://picsum.photos/1200/800?random=602',
            'https://picsum.photos/1200/800?random=603'
        ],
        
        content: {
            concept: {
                label: '(MOBILE FIRST)',
                text: 'UN\'APPLICAZIONE MOBILE CHE RIDEFINISCE L\'INTERAZIONE UTENTE NEL SETTORE. ABBIAMO PROGETTATO UN\'ESPERIENZA FLUIDA E INTUITIVA CHE SFRUTTA AL MASSIMO LE POTENZIALITÀ NATIVE DEL DISPOSITIVO, CREANDO ENGAGEMENT E RETENTION ECCEZIONALI.'
            },
            approach: {
                label: '(NATIVE APPROACH)',
                text: 'SEGUENDO I PRINCIPI DEL DESIGN SYSTEM E DELL\'ACCESSIBILITÀ, ABBIAMO SVILUPPATO UN\'INTERFACCIA CHE SI ADATTA PERFETTAMENTE AGLI STANDARD PLATFORM. OGNI MICRO-INTERAZIONE È STATA STUDIATA PER GARANTIRE FLUIDITÀ E NATURALEZZA D\'USO.'
            }
        }
    },
    
    'progetto-sei': {
        id: 6,
        title: 'PROGETTO SEI',
        slug: 'progetto-sei',
        category: 'brand',
        year: '2024',
        client: 'LUXURY BRAND',
        featured: false,
        order: 6,
        
        thumbnail: 'https://picsum.photos/1200/600?random=701',
        hero_image: 'https://picsum.photos/1200/600?random=701',
        gallery_images: [
            'https://picsum.photos/1200/800?random=702',
            'https://picsum.photos/1200/800?random=703'
        ],
        
        content: {
            concept: {
                label: '(LUXURY POSITIONING)',
                text: 'UN BRAND IDENTITY CHE COMUNICA ESCLUSIVITÀ E RAFFINATEZZA ATTRAVERSO UN LINGUAGGIO VISIVO SOFISTICATO. ABBIAMO CREATO UN SISTEMA CHE ELEVA LA PERCEZIONE DEL BRAND, POSIZIONANDOLO NEL SEGMENTO LUXURY CON AUTENTICITÀ E PRESTIGIO.'
            },
            approach: {
                label: '(PREMIUM EXECUTION)',
                text: 'OGNI DETTAGLIO È STATO CURATO CON ATTENZIONE MANIACALE, DALLA SELEZIONE TIPOGRAFICA ALLE FINITURE SPECIALI. L\'APPROCCIO OLISTICO GARANTISCE COERENZA E IMPACT ACROSS ALL TOUCHPOINTS, CREANDO UN\'ESPERIENZA BRAND MEMORABILE E DESIDERABILE.'
            }
        }
    },
    
    'progetto-sette': {
        id: 7,
        title: 'PROGETTO SETTE',
        slug: 'progetto-sette',
        category: 'web',
        year: '2024',
        client: 'E-COMMERCE',
        featured: true,
        order: 7,
        
        thumbnail: 'https://picsum.photos/1200/600?random=801',
        hero_image: 'https://picsum.photos/1200/600?random=801',
        gallery_images: [
            'https://picsum.photos/1200/800?random=802',
            'https://picsum.photos/1200/800?random=803'
        ],
        
        content: {
            concept: {
                label: '(CONVERSION FOCUSED)',
                text: 'UNA PIATTAFORMA E-COMMERCE PROGETTATA PER MASSIMIZZARE LE CONVERSIONI ATTRAVERSO UX OTTIMIZZATA E PERCORSI UTENTE STUDIATI. ABBIAMO INTEGRATO PSICOLOGIA DEL CONSUMO E DESIGN PERSUASIVO PER CREARE UN FUNNEL DI VENDITA EFFICACE E COINVOLGENTE.'
            },
            approach: {
                label: '(DATA DRIVEN)',
                text: 'UTILIZZANDO ANALYTICS AVANZATI E A/B TESTING, ABBIAMO OTTIMIZZATO OGNI ELEMENTO DELL\'INTERFACCIA. L\'APPROCCIO DATA-DRIVEN HA PERMESSO DI INCREMENTARE IL TASSO DI CONVERSIONE DEL 340% E RIDURRE IL BOUNCE RATE DEL 65%.'
            }
        }
    },
    
    'progetto-otto': {
        id: 8,
        title: 'PROGETTO OTTO',
        slug: 'progetto-otto',
        category: 'print',
        year: '2024',
        client: 'CORPORATE IDENTITY',
        featured: true,
        order: 8,
        
        thumbnail: 'https://picsum.photos/1200/600?random=901',
        hero_image: 'https://picsum.photos/1200/600?random=901',
        gallery_images: [
            'https://picsum.photos/1200/800?random=902',
            'https://picsum.photos/1200/800?random=903'
        ],
        
        content: {
            concept: {
                label: '(CORPORATE VISION)',
                text: 'UN SISTEMA DI IDENTITÀ CORPORATE CHE RIFLETTE I VALORI AZIENDALI ATTRAVERSO UN DESIGN AUTOREVOLE E PROFESSIONALE. ABBIAMO SVILUPPATO UNA COMUNICAZIONE VISIVA CHE ISPIRA FIDUCIA E CREDIBILITÀ, POSIZIONANDO L\'AZIENDA COME LEADER DEL SETTORE.'
            },
            approach: {
                label: '(SYSTEMATIC DESIGN)',
                text: 'ATTRAVERSO UN DESIGN SYSTEM COMPLETO E SCALABILE, ABBIAMO GARANTITO COERENZA ACROSS ALL TOUCHPOINTS AZIENDALI. DALLE BUSINESS CARD ALLE PRESENTAZIONI, OGNI ELEMENTO CONTRIBUISCE A RAFFORZARE IL POSIZIONAMENTO E LA RICONOSCIBILITÀ DEL BRAND.'
            }
        }
    },
    
    'progetto-nove': {
        id: 9,
        title: 'PROGETTO NOVE',
        slug: 'progetto-nove',
        category: 'digital',
        year: '2024',
        client: 'STARTUP TECH',
        featured: false,
        order: 9,
        
        thumbnail: 'https://picsum.photos/1200/600?random=1001',
        hero_image: 'https://picsum.photos/1200/600?random=1001',
        gallery_images: [
            'https://picsum.photos/1200/800?random=1002',
            'https://picsum.photos/1200/800?random=1003'
        ],
        
        content: {
            concept: {
                label: '(DISRUPTIVE INNOVATION)',
                text: 'UN PROGETTO CHE ABBRACCIA L\'INNOVAZIONE DISRUPTIVE NEL SETTORE TECH. ABBIAMO CREATO UN\'IDENTITÀ VISIVA CHE COMUNICA CUTTING-EDGE TECHNOLOGY E FORWARD-THINKING, POSIZIONANDO LA STARTUP COME PIONEER NEL PROPRIO SETTORE DI RIFERIMENTO.'
            },
            approach: {
                label: '(AGILE DESIGN)',
                text: 'UTILIZZANDO METODOLOGIE AGILE E DESIGN THINKING, ABBIAMO SVILUPPATO SOLUZIONI CREATIVE CHE SI ADATTANO RAPIDAMENTE AI CAMBIAMENTI DEL MERCATO. L\'APPROCCIO ITERATIVO HA PERMESSO DI VALIDARE CONCEPT E OTTIMIZZARE PERFORMANCE IN TEMPO REALE.'
            }
        }
    }
};

/**
 * Get project data by slug
 * @param {string} slug - Project slug
 * @returns {Object|null} Project data or null if not found
 */
export function getProject(slug) {
    return PROJECTS_DATA[slug] || null;
}

/**
 * Get all projects as array, sorted by order
 * @returns {Array} Array of all projects
 */
export function getAllProjects() {
    return Object.values(PROJECTS_DATA).sort((a, b) => a.order - b.order);
}

/**
 * Get projects by category
 * @param {string} category - Category filter
 * @returns {Array} Filtered projects
 */
export function getProjectsByCategory(category) {
    if (category === 'all') return getAllProjects();
    return getAllProjects().filter(project => project.category === category);
}

/**
 * Get related projects (excluding current)
 * @param {string} currentSlug - Current project slug
 * @param {number} limit - Maximum number of related projects
 * @returns {Array} Related projects
 */
export function getRelatedProjects(currentSlug, limit = 4) {
    const currentProject = getProject(currentSlug);
    if (!currentProject) return [];
    
    return getAllProjects()
        .filter(project => project.slug !== currentSlug)
        .filter(project => project.category === currentProject.category || project.featured)
        .slice(0, limit);
}