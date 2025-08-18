#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory dei dati
const dataDir = path.join(__dirname, '..', 'data');

// Leggi tutti i file progetto-*.json
const projectFiles = fs.readdirSync(dataDir)
    .filter(file => file.startsWith('progetto-') && file.endsWith('.json'));

// Crea l'array dei progetti
const projects = [];

projectFiles.forEach((file, index) => {
    try {
        const filePath = path.join(dataDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Estrai solo i dati necessari per la lista
        if (data.slug && data.slug !== '-' && data.title && data.title !== '-') {
            projects.push({
                id: data.id || index + 1,
                title: data.title,
                slug: data.slug,
                category: (data.category || 'DIGITAL').toLowerCase(),
                thumbnail: data.thumbnail || data.hero_image || `https://picsum.photos/600/400?random=${100 + index}`,
                year: data.year || '2024',
                featured: data.featured !== undefined ? data.featured : (index % 3 === 0),
                order: data.order || index + 1
            });
        }
    } catch (error) {
        console.error(`Errore leggendo ${file}:`, error.message);
    }
});

// Ordina per ID
projects.sort((a, b) => a.id - b.id);

// Scrivi il file projects.json
const outputPath = path.join(dataDir, 'projects.json');
fs.writeFileSync(outputPath, JSON.stringify({ projects }, null, 2));

console.log(`✅ Generato projects.json con ${projects.length} progetti`);
console.log('Progetti inclusi:', projects.map(p => p.title).join(', '));