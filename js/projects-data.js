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
        thumbnail: './img/portfolio-preview/cafe-124.jpg',
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
        
        thumbnail: './img/portfolio-preview/GA4G_HP.jpg',
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
        
        thumbnail: './img/portfolio-preview/audi.jpg',
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
    
    'curasept': {
        id: 4,
        title: 'Curasept',
        slug: 'curasept',
        category: 'brand',
        year: '2024',
        client: 'PHARMA BRANDING',
        featured: false,
        order: 4,
        
        thumbnail: './img/portfolio-preview/Curasept.jpg',
        hero_image: 'https://picsum.photos/1200/600?random=501',
        gallery_images: [
            'https://picsum.photos/1200/800?random=502',
            'https://picsum.photos/1200/800?random=503'
        ],
        
        content: {
            concept: {
                label: '(PHARMA INNOVATION)',
                text: 'UN PROGETTO DI REBRANDING PER CURASEPT CHE MODERNIZZA L\'IDENTITÀ DEL MARCHIO LEADER NELL\'IGIENE ORALE PROFESSIONALE. ABBIAMO SVILUPPATO UN LINGUAGGIO VISIVO CHE COMUNICA EFFICACIA CLINICA E INNOVAZIONE SCIENTIFICA, MANTENENDO LA FIDUCIA CONSOLIDATA NEL SETTORE FARMACEUTICO.'
            },
            approach: {
                label: '(SCIENTIFIC APPROACH)',
                text: 'L\'APPROCCIO SI È BASATO SU UNA RICERCA APPROFONDITA DEL MERCATO FARMACEUTICO E DELLE ESIGENZE DEI PROFESSIONISTI SANITARI. ABBIAMO CREATO UN SISTEMA VISIVO CHE BILANCIA RIGORE SCIENTIFICO E ACCESSIBILITÀ, POSIZIONANDO CURASEPT COME RIFERIMENTO NELL\'INNOVAZIONE DELL\'IGIENE ORALE.'
            }
        }
    },
    
    'gpf': {
        id: 5,
        title: 'GPF',
        slug: 'gpf',
        category: 'digital',
        year: '2024',
        client: 'FINTECH PLATFORM',
        featured: true,
        order: 5,
        
        thumbnail: './img/portfolio-preview/gpf.jpg',
        hero_image: 'https://picsum.photos/1200/600?random=601',
        gallery_images: [
            'https://picsum.photos/1200/800?random=602',
            'https://picsum.photos/1200/800?random=603'
        ],
        
        content: {
            concept: {
                label: '(FINTECH INNOVATION)',
                text: 'UNA PIATTAFORMA DIGITALE CHE RIVOLUZIONA L\'APPROCCIO AI SERVIZI FINANZIARI. ABBIAMO PROGETTATO UN\'ESPERIENZA UTENTE CHE SEMPLIFICA LA COMPLESSITÀ DEL SETTORE FINANZIARIO, CREANDO UN TOUCHPOINT DIGITALE CHE COMUNICA PROFESSIONALITÀ, SICUREZZA E INNOVAZIONE TECNOLOGICA.'
            },
            approach: {
                label: '(SECURITY FIRST)',
                text: 'L\'ARCHITETTURA DELL\'INFORMAZIONE È STATA SVILUPPATA SEGUENDO I PIÙ ALTI STANDARD DI SICUREZZA E COMPLIANCE DEL SETTORE FINTECH. OGNI ELEMENTO DELL\'INTERFACCIA È STATO PROGETTATO PER GARANTIRE TRASPARENZA, TRUST E FACILITÀ D\'USO NELLE OPERAZIONI FINANZIARIE DIGITALI.'
            }
        }
    },
    
    'mediaset': {
        id: 6,
        title: 'Mediaset',
        slug: 'mediaset',
        category: 'brand',
        year: '2024',
        client: 'MEDIA & ENTERTAINMENT',
        featured: false,
        order: 6,
        
        thumbnail: './img/portfolio-preview/Mediaset.jpg',
        hero_image: 'https://picsum.photos/1200/600?random=701',
        gallery_images: [
            'https://picsum.photos/1200/800?random=702',
            'https://picsum.photos/1200/800?random=703'
        ],
        
        content: {
            concept: {
                label: '(MEDIA EVOLUTION)',
                text: 'UN PROGETTO DI EVOLUZIONE VISIVA PER IL GRUPPO MEDIASET CHE RIFLETTE LA TRASFORMAZIONE DEL PANORAMA MEDIATICO CONTEMPORANEO. ABBIAMO SVILUPPATO UN SISTEMA DI COMUNICAZIONE CHE ABBRACCIA L\'ERA DIGITALE MANTENENDO LA LEADERSHIP NEL SETTORE DELL\'INTRATTENIMENTO ITALIANO.'
            },
            approach: {
                label: '(OMNICHANNEL STRATEGY)',
                text: 'L\'APPROCCIO STRATEGICO HA CONSIDERATO LA COMPLESSITÀ DELL\'ECOSISTEMA MEDIASET, DALLA TELEVISIONE TRADIZIONALE ALLE PIATTAFORME DIGITALI. ABBIAMO CREATO UN LINGUAGGIO VISIVO FLESSIBILE CHE SI ADATTA AI DIVERSI TOUCHPOINT, GARANTENDO COERENZA E RICONOSCIBILITÀ CROSS-PLATFORM.'
            }
        }
    },
    
    'intrum': {
        id: 7,
        title: 'Intrum',
        slug: 'intrum',
        category: 'web',
        year: '2024',
        client: 'FINANCIAL SERVICES',
        featured: true,
        order: 7,
        
        thumbnail: './img/portfolio-preview/Intrum.jpg',
        hero_image: 'https://picsum.photos/1200/600?random=801',
        gallery_images: [
            'https://picsum.photos/1200/800?random=802',
            'https://picsum.photos/1200/800?random=803'
        ],
        
        content: {
            concept: {
                label: '(TRUST & TRANSPARENCY)',
                text: 'UNA PIATTAFORMA WEB CHE RIDEFINISCE LA COMUNICAZIONE NEI SERVIZI FINANZIARI SPECIALIZZATI. ABBIAMO PROGETTATO UN\'ESPERIENZA DIGITALE CHE COMUNICA PROFESSIONALITÀ E TRASPARENZA, TRASFORMANDO LA PERCEZIONE DEL SETTORE ATTRAVERSO UN DESIGN CENTRATO SULL\'UTENTE E SULLA CHIAREZZA INFORMATIVA.'
            },
            approach: {
                label: '(HUMAN-CENTERED)',
                text: 'L\'APPROCCIO PROGETTUALE HA POSTO AL CENTRO LE ESIGENZE UMANE, SVILUPPANDO SOLUZIONI CHE SEMPLIFICANO PROCESSI COMPLESSI. ATTRAVERSO RESEARCH APPROFONDITA E TEST UTENTE, ABBIAMO CREATO UN\'INTERFACCIA CHE FACILITA LA COMPRENSIONE E AUMENTA LA FIDUCIA NEGLI SERVIZI FINANZIARI SPECIALIZZATI.'
            }
        }
    },
    
    'gas-sales': {
        id: 8,
        title: 'Gas Sales',
        slug: 'gas-sales',
        category: 'brand',
        year: '2024',
        client: 'SPORTS BRANDING',
        featured: true,
        order: 8,
        
        thumbnail: './img/portfolio-preview/gas sales.jpg',
        hero_image: 'https://picsum.photos/1200/600?random=901',
        gallery_images: [
            'https://picsum.photos/1200/800?random=902',
            'https://picsum.photos/1200/800?random=903'
        ],
        
        content: {
            concept: {
                label: '(SPORTS IDENTITY)',
                text: 'UN PROGETTO DI BRAND IDENTITY PER GAS SALES CHE CATTURA L\'ENERGIA E LA DINAMICITÀ DEL MONDO SPORTIVO. ABBIAMO SVILUPPATO UN LINGUAGGIO VISIVO CHE COMUNICA PASSIONE, PERFORMANCE E SPIRITO DI SQUADRA, CREANDO UN\'IDENTITÀ CHE RISUONA CON GLI ATLETI E I TIFOSI.'
            },
            approach: {
                label: '(PERFORMANCE DRIVEN)',
                text: 'L\'APPROCCIO CREATIVO SI È ISPIRATO AI VALORI DELLO SPORT: DETERMINAZIONE, ECCELLENZA E TEAM SPIRIT. ABBIAMO CREATO UN SISTEMA VISIVO VERSATILE CHE FUNZIONA SU TUTTI I TOUCHPOINT SPORTIVI, DALLE DIVISE ALLE COMUNICAZIONI DIGITALI, MANTENENDO SEMPRE ALTA L\'ENERGIA DEL BRAND.'
            }
        }
    },
    
    'mipharm': {
        id: 9,
        title: 'Mipharm',
        slug: 'mipharm',
        category: 'digital',
        year: '2024',
        client: 'PHARMA INNOVATION',
        featured: false,
        order: 9,
        
        thumbnail: './img/portfolio-preview/Mipharm.jpg',
        hero_image: 'https://picsum.photos/1200/600?random=1001',
        gallery_images: [
            'https://picsum.photos/1200/800?random=1002',
            'https://picsum.photos/1200/800?random=1003'
        ],
        
        content: {
            concept: {
                label: '(PHARMA DIGITAL)',
                text: 'UN PROGETTO DI TRASFORMAZIONE DIGITALE PER MIPHARM CHE MODERNIZZA L\'APPROCCIO ALLA COMUNICAZIONE FARMACEUTICA. ABBIAMO SVILUPPATO SOLUZIONI DIGITALI CHE CONIUGANO RIGORE SCIENTIFICO E ACCESSIBILITÀ, CREANDO TOUCHPOINT INNOVATIVI PER PROFESSIONISTI SANITARI E PAZIENTI.'
            },
            approach: {
                label: '(REGULATORY COMPLIANCE)',
                text: 'L\'APPROCCIO PROGETTUALE HA CONSIDERATO TUTTE LE NORMATIVE DEL SETTORE FARMACEUTICO, SVILUPPANDO SOLUZIONI DIGITALI COMPLIANT E USER-FRIENDLY. ATTRAVERSO UNA METODOLOGIA RIGOROSA, ABBIAMO GARANTITO ACCURATEZZA DELLE INFORMAZIONI MEDICHE E OTTIMIZZATO L\'ESPERIENZA UTENTE NEL RISPETTO DELLE LINEE GUIDA REGOLATORIE.'
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