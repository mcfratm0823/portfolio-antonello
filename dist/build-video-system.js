#!/usr/bin/env node

/**
 * Video System Build Script
 * Ottimizza e prepara il sistema video per la produzione
 */

const fs = require('fs');
const path = require('path');

class VideoSystemBuilder {
    constructor() {
        this.sourceDir = __dirname;
        this.buildDir = path.join(__dirname, 'build');
        this.config = {
            minify: true,
            removeComments: true,
            removeDebugCode: true,
            bundleFiles: false,
            generateSourceMaps: false
        };
    }

    /**
     * Esegue il build completo
     */
    async build(options = {}) {
        this.config = { ...this.config, ...options };
        
        console.log('🚀 Starting Video System Build...');
        console.log('Configuration:', this.config);
        
        try {
            // Prepara directory di build
            await this.prepareBuildDirectory();
            
            // Processa i file
            await this.processFiles();
            
            // Genera configurazione produzione
            await this.generateProductionConfig();
            
            // Genera summary
            await this.generateBuildSummary();
            
            console.log('✅ Build completed successfully!');
            console.log(`📦 Output: ${this.buildDir}`);
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            throw error;
        }
    }

    /**
     * Prepara directory di build
     */
    async prepareBuildDirectory() {
        if (fs.existsSync(this.buildDir)) {
            await this.removeDirectory(this.buildDir);
        }
        
        fs.mkdirSync(this.buildDir, { recursive: true });
        console.log('📁 Build directory prepared');
    }

    /**
     * Processa tutti i file del sistema
     */
    async processFiles() {
        const files = [
            'js/professional-video-controller.js',
            'js/video-integration-manager.js', 
            'js/video-system-bootstrap.js',
            'js/video-system-tests.js'
        ];

        for (const file of files) {
            await this.processFile(file);
        }
    }

    /**
     * Processa un singolo file
     */
    async processFile(relativePath) {
        const sourcePath = path.join(this.sourceDir, relativePath);
        const buildPath = path.join(this.buildDir, relativePath);
        
        if (!fs.existsSync(sourcePath)) {
            console.warn(`⚠️  File not found: ${sourcePath}`);
            return;
        }

        // Leggi contenuto
        let content = fs.readFileSync(sourcePath, 'utf8');
        const originalSize = content.length;

        // Applica ottimizzazioni
        content = await this.optimizeContent(content, relativePath);

        // Assicurati che la directory esista
        const buildDir = path.dirname(buildPath);
        if (!fs.existsSync(buildDir)) {
            fs.mkdirSync(buildDir, { recursive: true });
        }

        // Scrivi file ottimizzato
        fs.writeFileSync(buildPath, content);

        const newSize = content.length;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        console.log(`📄 ${relativePath}: ${originalSize} → ${newSize} bytes (-${reduction}%)`);
    }

    /**
     * Ottimizza contenuto del file
     */
    async optimizeContent(content, filePath) {
        let optimized = content;

        // Rimuovi debug code se richiesto
        if (this.config.removeDebugCode) {
            optimized = this.removeDebugCode(optimized);
        }

        // Rimuovi commenti se richiesto
        if (this.config.removeComments) {
            optimized = this.removeComments(optimized);
        }

        // Minify se richiesto
        if (this.config.minify) {
            optimized = this.minifyCode(optimized);
        }

        return optimized;
    }

    /**
     * Rimuove codice di debug
     */
    removeDebugCode(content) {
        // Rimuovi console.log statements
        content = content.replace(/\s*console\.log\([^)]*\);?\s*/g, '');
        
        // Rimuovi blocchi debug
        content = content.replace(/\/\*\s*DEBUG\s*\*\/[\s\S]*?\/\*\s*END DEBUG\s*\*\//g, '');
        
        // Rimuovi if (debug) blocks
        content = content.replace(/if\s*\(\s*this\.debugMode\s*\)\s*\{[^}]*\}/g, '');
        content = content.replace(/if\s*\(\s*BOOTSTRAP_CONFIG\.debug\s*\)\s*\{[^}]*\}/g, '');
        
        return content;
    }

    /**
     * Rimuove commenti
     */
    removeComments(content) {
        // Rimuovi commenti multi-line
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Rimuovi commenti single-line (ma preserva URLs)
        content = content.replace(/(?<!:)\/\/(?!\/)[^\r\n]*/g, '');
        
        return content;
    }

    /**
     * Minifica il codice (basic)
     */
    minifyCode(content) {
        // Rimuovi whitespace eccessivo
        content = content.replace(/\s+/g, ' ');
        
        // Rimuovi spazi attorno a operatori
        content = content.replace(/\s*([{}();,])\s*/g, '$1');
        
        // Rimuovi linee vuote
        content = content.replace(/\n\s*\n/g, '\n');
        
        return content.trim();
    }

    /**
     * Genera configurazione per produzione
     */
    async generateProductionConfig() {
        const prodConfig = {
            autoInit: true,
            debug: false,
            fallbackMode: false,
            maxRetries: 2,
            enableMetrics: false
        };

        const configContent = `// Auto-generated production configuration
window.VIDEO_SYSTEM_CONFIG = ${JSON.stringify(prodConfig, null, 2)};`;

        const configPath = path.join(this.buildDir, 'video-system-config.prod.js');
        fs.writeFileSync(configPath, configContent);
        
        console.log('⚙️  Production config generated');
    }

    /**
     * Genera summary del build
     */
    async generateBuildSummary() {
        const summary = {
            buildTime: new Date().toISOString(),
            version: '1.0.0',
            config: this.config,
            files: this.getFileList(),
            totalSize: this.calculateTotalSize(),
            installation: {
                steps: [
                    '1. Copy all files from build/ to your project js/ directory',
                    '2. Include scripts in your HTML in this order:',
                    '   - professional-video-controller.js',
                    '   - video-integration-manager.js', 
                    '   - video-system-bootstrap.js',
                    '3. Optional: Include video-system-tests.js for testing',
                    '4. Optional: Use video-system-config.prod.js for production'
                ]
            },
            usage: {
                basic: 'System auto-initializes, no code required',
                api: 'Use VideoSystem.play(), VideoSystem.pause(), etc.',
                debug: 'Set VIDEO_SYSTEM_CONFIG.debug = true',
                testing: 'Run testVideoSystem() in console'
            }
        };

        const summaryPath = path.join(this.buildDir, 'BUILD_SUMMARY.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log('📋 Build summary generated');
        console.log(`📊 Total size: ${summary.totalSize} bytes`);
    }

    /**
     * Ottiene lista file
     */
    getFileList() {
        const files = [];
        
        function walkDir(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walkDir(fullPath);
                } else {
                    const relativePath = path.relative(this.buildDir, fullPath);
                    files.push({
                        path: relativePath,
                        size: stat.size
                    });
                }
            }
        }
        
        if (fs.existsSync(this.buildDir)) {
            walkDir.call(this, this.buildDir);
        }
        
        return files;
    }

    /**
     * Calcola dimensione totale
     */
    calculateTotalSize() {
        const files = this.getFileList();
        return files.reduce((total, file) => total + file.size, 0);
    }

    /**
     * Rimuove directory ricorsivamente
     */
    async removeDirectory(dirPath) {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            
            for (const file of files) {
                const curPath = path.join(dirPath, file);
                
                if (fs.lstatSync(curPath).isDirectory()) {
                    await this.removeDirectory(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }
            
            fs.rmdirSync(dirPath);
        }
    }
}

// Esecuzione se chiamato direttamente
if (require.main === module) {
    const builder = new VideoSystemBuilder();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};
    
    if (args.includes('--no-minify')) options.minify = false;
    if (args.includes('--keep-comments')) options.removeComments = false;
    if (args.includes('--keep-debug')) options.removeDebugCode = false;
    if (args.includes('--bundle')) options.bundleFiles = true;
    
    builder.build(options).catch(error => {
        console.error('Build failed:', error);
        process.exit(1);
    });
}

module.exports = VideoSystemBuilder;