/**
 * Professional Template Generator
 * Generates individual project files from master template
 * @author Senior Developer
 * @version 1.0.0
 */

import { PROJECTS_DATA, getAllProjects } from '../js/projects-data.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Template Generator Class
 */
class TemplateGenerator {
    constructor() {
        this.templatePath = join(__dirname, '../progetti/backup-progetti-interni.html');
        this.outputDir = join(__dirname, '../progetti/');
        this.masterTemplate = null;
    }

    /**
     * Load master template
     */
    loadMasterTemplate() {
        try {
            this.masterTemplate = readFileSync(this.templatePath, 'utf8');
        } catch (error) {
            console.error('❌ Failed to load master template:', error);
            throw error;
        }
    }

    /**
     * Generate related projects HTML for a specific project
     */
    generateRelatedProjectsHTML(currentProjectSlug) {
        const allProjects = getAllProjects();
        const currentProject = PROJECTS_DATA[currentProjectSlug];
        
        // Get 4 related projects (exclude current)
        const relatedProjects = allProjects
            .filter(project => project.slug !== currentProjectSlug)
            .filter(project => project.category === currentProject.category || project.featured)
            .slice(0, 4);

        // If less than 4, fill with other projects
        if (relatedProjects.length < 4) {
            const additionalProjects = allProjects
                .filter(project => project.slug !== currentProjectSlug)
                .filter(project => !relatedProjects.includes(project))
                .slice(0, 4 - relatedProjects.length);
            
            relatedProjects.push(...additionalProjects);
        }

        return relatedProjects.map((project, index) => `
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
    }

    /**
     * Generate individual project file
     */
    generateProjectFile(projectSlug, projectData) {
        if (!this.masterTemplate) {
            throw new Error('Master template not loaded');
        }

        let html = this.masterTemplate;

        // Replace title and meta
        html = html.replace('<title>Cafè 124 - ANTONELLO GUARNIERI ® VISUAL DESIGNER</title>', 
                           `<title>${projectData.title} - ANTONELLO GUARNIERI ® VISUAL DESIGNER</title>`);

        // Replace project header
        html = html.replace('<h1 id="project-title">CAFÈ 124</h1>', 
                           `<h1 id="project-title">${projectData.title.toUpperCase()}</h1>`);
        
        html = html.replace('<span>DIGITAL</span>\n                    <span>2024</span>\n                    <span>IDENTITÀ VISIVA</span>', 
                           `<span>${projectData.category.toUpperCase()}</span>\n                    <span>${projectData.year}</span>\n                    <span>${projectData.client}</span>`);

        // Replace concept block
        html = html.replace(/(CAFÈ 124 RAPPRESENTA L'ESSENZA.*?CAFFÈ ITALIANO\.)/s, 
                           projectData.content.concept.text);

        // Replace approach block
        html = html.replace(/(L'APPROCCIO CREATIVO.*?QUALITÀ E PASSIONE\.)/s, 
                           projectData.content.approach.text);

        // Replace images
        html = html.replace('https://picsum.photos/1200/600?random=201', projectData.hero_image);
        html = html.replace(`alt="Cafè 124 Hero"`, `alt="${projectData.title} Hero"`);
        html = html.replace('https://picsum.photos/1200/800?random=202', projectData.gallery_images[0]);
        html = html.replace(`alt="Cafè 124 Branding"`, `alt="${projectData.title} Gallery 1"`);
        html = html.replace('https://picsum.photos/1200/800?random=203', projectData.gallery_images[1]);
        html = html.replace(`alt="Cafè 124 Applications"`, `alt="${projectData.title} Gallery 2"`);

        // Replace related projects section
        const relatedProjectsHTML = this.generateRelatedProjectsHTML(projectSlug);
        const relatedProjectsRegex = /(<div class="project-slide" data-index="0">.*?<\/div>\s*){4}/s;
        html = html.replace(relatedProjectsRegex, relatedProjectsHTML);

        return html;
    }

    /**
     * Generate all project files
     */
    generateAllProjects() {

        this.loadMasterTemplate();

        const allProjects = getAllProjects();
        let successCount = 0;

        allProjects.forEach(project => {
            try {
                const projectData = PROJECTS_DATA[project.slug];
                const html = this.generateProjectFile(project.slug, projectData);
                
                const outputPath = join(this.outputDir, `${project.slug}.html`);
                writeFileSync(outputPath, html, 'utf8');
                
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to generate ${project.slug}.html:`, error);
            }
        });

    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new TemplateGenerator();
    generator.generateAllProjects();
}

export default TemplateGenerator;