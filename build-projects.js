import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lista progetti da copiare
const projects = [
  'audi.html',
  'cafe-124.html', 
  'curasept.html',
  'gas-sales.html',
  'generali.html',
  'gpf.html',
  'intrum.html',
  'mediaset.html',
  'mipharm.html'
];

// Crea directory se non esiste
const distProgettiDir = resolve(__dirname, 'dist/progetti');
if (!existsSync(distProgettiDir)) {
  mkdirSync(distProgettiDir, { recursive: true });
}

// Copia ogni progetto
projects.forEach(project => {
  const src = resolve(__dirname, 'progetti', project);
  const dest = resolve(distProgettiDir, project);
  copyFileSync(src, dest);
  console.log(`Copiato: ${project}`);
});

// Copia anche i file JS necessari
const jsFiles = ['project-loader.js', 'professional-project-loader.js'];
jsFiles.forEach(file => {
  const src = resolve(__dirname, 'progetti', file);
  const dest = resolve(distProgettiDir, file);
  copyFileSync(src, dest);
  console.log(`Copiato: ${file}`);
});