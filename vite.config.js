import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Trova tutti i file HTML nella root
const htmlFiles = readdirSync('.').filter(file => file.endsWith('.html'));

// Crea l'oggetto input per Rollup
const input = htmlFiles.reduce((acc, file) => {
  const name = file.replace('.html', '');
  acc[name] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: input
    },
    // Ottimizzazioni
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Asset handling
    assetsInlineLimit: 4096, // 4kb
    chunkSizeWarningLimit: 1000
  },
  // Server di sviluppo
  server: {
    port: 5173,
    open: true
  }
});