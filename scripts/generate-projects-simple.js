/**
 * Simple Template Generator - Browser Compatible
 * Run this in the browser console to generate all project templates
 */

// Project template generator function
function generateProjectTemplate(projectSlug, projectData, relatedProjects) {
    const relatedProjectsHTML = relatedProjects.map((project, index) => `
                    <div class="project-slide" data-index="${index}">
                        <a href="./${project.slug}.html" class="project-link">
                            <div class="project-preview">
                                <img src="${project.thumbnail}" alt="${project.title}" loading="lazy" width="1200" height="600">
                                <div class="project-title-overlay">
                                    <h3>${project.title.toUpperCase()}</h3>
                                    <div class="project-meta">
                                        <span>${project.category.toUpperCase()}</span>
                                        <span>•</span>
                                        <span>${project.year}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="project-info">
                                <h3 class="project-title">${project.title.toUpperCase()}</h3>
                                <div class="project-meta">
                                    <span>${project.category.toUpperCase()}</span>
                                    <span>•</span>
                                    <span>${project.year}</span>
                                </div>
                            </div>
                        </a>
                    </div>`).join('');

    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectData.title} - ANTONELLO GUARNIERI ® VISUAL DESIGNER</title>
    
    <!-- Global styles -->
    <link href="../css/global-cursor.css" rel="stylesheet">
    <link href="./project-detail.css" rel="stylesheet">
    
    <!-- Check for ES6 module support -->
    <script>
        // Feature detection for ES6 modules
        function supportsModules() {
            const script = document.createElement('script');
            return 'noModule' in script;
        }
        
        window.USING_MODULES = supportsModules();
    </script>
</head>
<body>
    <!-- Custom Cursor -->
    <div id="custom-cursor" class="custom-cursor">
        <div class="cursor-inner"></div>
    </div>
    
    <!-- Form nascosto per Netlify Forms -->
    <form name="contact-menu" method="POST" data-netlify="true" netlify-honeypot="bot-field" style="display: none;">
        <input type="text" name="nome" />
        <input type="text" name="cognome" />
        <input type="email" name="email" />
        <textarea name="messaggio"></textarea>
    </form>

    <!-- WHITE CONTAINER - Contenuto Bianco -->
    <div id="white-container">
        <!-- Main Content -->
        <main id="main-content">
            
            <!-- Header Section -->
            <section id="project-header">
                <h1 id="project-title">${projectData.title.toUpperCase()}</h1>
                <div id="project-meta">
                    <span>${projectData.category.toUpperCase()}</span>
                    <span>${projectData.year}</span>
                    <span>${projectData.client}</span>
                </div>
            </section>

            <!-- Project Description Block -->
            <section id="project-description">
                <div class="description-block">
                    <span class="description-label">${projectData.content.concept.label}</span>
                    <p class="description-text">
                        ${projectData.content.concept.text}
                    </p>
                </div>
            </section>

            <!-- Hero Image -->
            <section id="hero-section">
                <div id="hero-image">
                    <img src="${projectData.hero_image}" alt="${projectData.title} Hero" width="1200" height="600" fetchpriority="high" decoding="async">
                </div>
            </section>

            <!-- Second Project Description Block -->
            <section id="second-project-description">
                <div class="description-block">
                    <span class="description-label">${projectData.content.approach.label}</span>
                    <p class="description-text">
                        ${projectData.content.approach.text}
                    </p>
                </div>
            </section>

            <!-- Static Gallery -->
            <section id="static-gallery">
                <div class="gallery-horizontal-pair">
                    <div class="gallery-item">
                        <img src="${projectData.gallery_images[0]}" alt="${projectData.title} Gallery 1" loading="lazy" width="1200" height="800">
                    </div>
                    <div class="gallery-item">
                        <img src="${projectData.gallery_images[1]}" alt="${projectData.title} Gallery 2" loading="lazy" width="1200" height="800">
                    </div>
                </div>
            </section>

        </main>
    </div>

    
    <!-- BLACK CONTAINER - Contenuto Nero -->
    <div id="black-container">
        <!-- Left Info - Fixed Element Outside Gallery -->
        <div id="left-info">
            <div id="bottom-text-container">
                <div id="description">
                    <p>CREO ESPERIENZE DIGITALI CHIARE E UTILI, UNENDO DESIGN CURATO,<br>SVILUPPO CON AI E GESTIONE ATTENTA DEI PROGETTI PER<br>TRASFORMARE OGNI IDEA IN RISULTATI CONCRETI.</p>
                </div>
                <div id="right-info">
                    <p>ANTONELLOGUARNIERI.NET</p>
                    <p>ANTONELLOGUARNIERI6@GMAIL.COM</p>
                </div>
            </div>
        </div>
        
        <!-- Kinetic Gallery Section -->
        <section id="kinetic-gallery" data-bg-color="#000">
            
            <!-- Fixed Morphing Title -->
            <div class="morphing-title" id="morphing-title"></div>
            
            <div class="gallery-stream">
                    
                    <div class="gallery-intro">
                        <h2 class="intro-text">Altri<br>progetti</h2>
                    </div>
                    
                    ${relatedProjectsHTML}
                    
                    <!-- Final CTA -->
                    <div class="gallery-cta">
                        <a href="../portfolio.html" class="cta-content">
                            <h3 class="cta-title">Vedi tutti<br>i progetti</h3>
                        </a>
                    </div>
                    
            </div>
        </section>
    </div>

    <!-- External Dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    
    <!-- Module-based loading (modern browsers) -->
    <script type="module">
        import '../config/constants.js';
        import '../utils/formValidator.js';
        import '../js/navbar.js';
        import '../js/global-cursor.js';
        import './project-detail.js';
    </script>
    
    <!-- Fallback for browsers without module support -->
    <script nomodule src="../config/constants.js"></script>
    <script nomodule src="../utils/formValidator.js"></script>
    <script nomodule src="../js/global-cursor.js"></script>
    <script nomodule src="../js/navbar.js"></script>
    <script nomodule src="./project-detail.js"></script>
</body>
</html>`;
}

// Function to get related projects
function getRelatedProjects(currentSlug, allProjects, limit = 4) {
    const currentProject = allProjects.find(p => p.slug === currentSlug);
    
    return allProjects
        .filter(p => p.slug !== currentSlug)
        .filter(p => p.category === currentProject.category || p.featured)
        .slice(0, limit);
}

