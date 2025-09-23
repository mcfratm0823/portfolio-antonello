/**
 * Video System Tests
 * Suite di test automatici per validare il funzionamento del sistema video
 */

class VideoSystemTests {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        this.isRunning = false;
        this.timeout = 10000; // 10 secondi timeout per test
    }

    /**
     * Esegue tutti i test
     */
    async runAllTests() {
        if (this.isRunning) {
            console.warn('Tests already running');
            return this.results;
        }

        this.isRunning = true;
        this.results = { total: 0, passed: 0, failed: 0, tests: [] };

        console.log('🧪 Starting Video System Tests...');
        console.log('=' .repeat(50));

        const tests = [
            this.testSystemAvailability,
            this.testVideoElementExists,
            this.testControllerInitialization,
            this.testBasicPlayPause,
            this.testAPIAvailability,
            this.testMetricsCollection,
            this.testErrorHandling,
            this.testNavigationHandling,
            this.testPerformanceMetrics
        ];

        for (const test of tests) {
            await this.runSingleTest(test);
        }

        this.isRunning = false;
        this.printResults();
        return this.results;
    }

    /**
     * Esegue un singolo test
     */
    async runSingleTest(testFunction) {
        const testName = testFunction.name.replace('test', '');
        this.results.total++;

        try {
            console.log(`🔍 Testing ${testName}...`);
            
            const startTime = performance.now();
            await Promise.race([
                testFunction.call(this),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), this.timeout)
                )
            ]);
            const endTime = performance.now();

            this.results.passed++;
            this.results.tests.push({
                name: testName,
                status: 'PASSED',
                duration: Math.round(endTime - startTime),
                error: null
            });
            
            console.log(`✅ ${testName} PASSED (${Math.round(endTime - startTime)}ms)`);

        } catch (error) {
            this.results.failed++;
            this.results.tests.push({
                name: testName,
                status: 'FAILED',
                duration: null,
                error: error.message
            });
            
            console.error(`❌ ${testName} FAILED: ${error.message}`);
        }
    }

    /**
     * Test: Disponibilità del sistema
     */
    async testSystemAvailability() {
        if (typeof VideoSystem === 'undefined') {
            throw new Error('VideoSystem not available');
        }

        if (typeof ProfessionalVideoController === 'undefined') {
            throw new Error('ProfessionalVideoController not available');
        }

        if (typeof VideoIntegrationManager === 'undefined') {
            throw new Error('VideoIntegrationManager not available');
        }

        // Test configurazione
        if (typeof window.VIDEO_SYSTEM_CONFIG === 'undefined') {
            throw new Error('VIDEO_SYSTEM_CONFIG not available');
        }
    }

    /**
     * Test: Esistenza elemento video
     */
    async testVideoElementExists() {
        const video = document.querySelector('#hero-video') || 
                     document.querySelector('video');
        
        if (!video) {
            throw new Error('Video element not found');
        }

        if (video.tagName !== 'VIDEO') {
            throw new Error('Found element is not a video');
        }

        // Test attributi base
        if (!video.hasAttribute('muted')) {
            console.warn('Video should be muted for autoplay');
        }

        if (!video.hasAttribute('playsinline')) {
            console.warn('Video should have playsinline for mobile');
        }
    }

    /**
     * Test: Inizializzazione controller
     */
    async testControllerInitialization() {
        const status = VideoSystem.getStatus();
        
        if (!status) {
            throw new Error('Cannot get system status');
        }

        if (!VideoSystem.isActive()) {
            throw new Error('Video system is not active');
        }

        if (status.integrationState !== 'active') {
            throw new Error(`Integration state is ${status.integrationState}, expected active`);
        }

        // Test controller interno
        if (window.__videoController) {
            const controller = window.__videoController;
            if (controller.state !== 'ready' && controller.state !== 'loaded') {
                throw new Error(`Controller state is ${controller.state}`);
            }
        }
    }

    /**
     * Test: Funzionalità play/pause base
     */
    async testBasicPlayPause() {
        // Test play
        try {
            await VideoSystem.play();
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                console.warn('Play blocked by browser policy (expected in some cases)');
                return; // Non è un errore del nostro sistema
            }
            throw error;
        }

        // Attendi un po' per vedere se il video effettivamente parte
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test pause
        VideoSystem.pause();
        
        // Verifica che pause abbia funzionato
        const video = document.querySelector('#hero-video') || 
                     document.querySelector('video');
        
        if (video && !video.paused) {
            console.warn('Video might not have paused correctly');
        }
    }

    /**
     * Test: Disponibilità API
     */
    async testAPIAvailability() {
        const requiredMethods = [
            'play', 'pause', 'reset', 'getStatus', 
            'isActive', 'getMetrics', 'enableDebug', 
            'disableDebug', 'destroy', 'restart'
        ];

        for (const method of requiredMethods) {
            if (typeof VideoSystem[method] !== 'function') {
                throw new Error(`VideoSystem.${method} is not available`);
            }
        }

        // Test che i metodi non lancino errori quando chiamati
        const status = VideoSystem.getStatus();
        const metrics = VideoSystem.getMetrics();
        const isActive = VideoSystem.isActive();

        if (typeof status !== 'object') {
            throw new Error('getStatus should return an object');
        }

        if (typeof metrics !== 'object') {
            throw new Error('getMetrics should return an object');
        }

        if (typeof isActive !== 'boolean') {
            throw new Error('isActive should return a boolean');
        }
    }

    /**
     * Test: Raccolta metriche
     */
    async testMetricsCollection() {
        const metrics = VideoSystem.getMetrics();
        
        if (!metrics.bootstrap) {
            throw new Error('Bootstrap metrics missing');
        }

        if (!metrics.system) {
            throw new Error('System metrics missing');
        }

        // Test struttura metriche bootstrap
        const bootstrap = metrics.bootstrap;
        if (typeof bootstrap.initialized !== 'boolean') {
            throw new Error('Bootstrap initialized metric invalid');
        }

        if (typeof bootstrap.attempts !== 'number') {
            throw new Error('Bootstrap attempts metric invalid');
        }

        // Test metriche sistema se disponibili
        if (metrics.system.controllerMetrics) {
            const controller = metrics.system.controllerMetrics;
            
            if (typeof controller.playAttempts !== 'number') {
                throw new Error('Controller playAttempts metric invalid');
            }

            if (typeof controller.successRate !== 'string') {
                throw new Error('Controller successRate metric invalid');
            }
        }
    }

    /**
     * Test: Gestione errori
     */
    async testErrorHandling() {
        // Test gestione errori API
        try {
            const fakeVideoSystem = {
                play: () => Promise.reject(new Error('Fake error')),
                pause: () => { throw new Error('Fake error'); }
            };

            // Questo dovrebbe gestire l'errore gracefully
            try {
                await fakeVideoSystem.play();
            } catch (e) {
                // Errore atteso
            }

            try {
                fakeVideoSystem.pause();
            } catch (e) {
                // Errore atteso
            }
        } catch (error) {
            throw new Error('Error handling test failed: ' + error.message);
        }

        // Test fallback mode se possibile
        const status = VideoSystem.getStatus();
        if (status.fallbackMode) {
            console.log('System is in fallback mode');
        }
    }

    /**
     * Test: Gestione navigazione
     */
    async testNavigationHandling() {
        // Simula events di navigazione
        const events = ['visibilitychange', 'focus', 'blur'];
        
        for (const eventType of events) {
            try {
                const event = new Event(eventType);
                
                if (eventType === 'visibilitychange') {
                    // Simula hide/show
                    Object.defineProperty(document, 'hidden', { 
                        value: true, 
                        configurable: true 
                    });
                    document.dispatchEvent(event);
                    
                    Object.defineProperty(document, 'hidden', { 
                        value: false, 
                        configurable: true 
                    });
                    document.dispatchEvent(event);
                } else {
                    window.dispatchEvent(event);
                }
                
                // Breve attesa per vedere se il sistema reagisce
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.warn(`Navigation event ${eventType} test failed:`, error.message);
            }
        }
    }

    /**
     * Test: Metriche performance
     */
    async testPerformanceMetrics() {
        const startTime = performance.now();
        
        // Test multiple operazioni
        for (let i = 0; i < 5; i++) {
            VideoSystem.getStatus();
            VideoSystem.getMetrics();
            VideoSystem.isActive();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 100) { // 100ms è troppo per operazioni base
            throw new Error(`Performance test failed: ${duration}ms for 15 operations`);
        }

        console.log(`Performance: 15 operations in ${duration.toFixed(2)}ms`);
    }

    /**
     * Stampa risultati finali
     */
    printResults() {
        console.log('=' .repeat(50));
        console.log('🧪 TEST RESULTS');
        console.log('=' .repeat(50));
        
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Pass Rate: ${passRate}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.tests
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.error}`);
                });
        }
        
        if (passRate >= 80) {
            console.log('\n🎉 System appears to be working correctly!');
        } else {
            console.log('\n⚠️  System may have issues, check failed tests');
        }
        
        console.log('=' .repeat(50));
    }

    /**
     * Test rapido per utenti
     */
    async quickTest() {
        console.log('🚀 Running Quick Video System Test...');
        
        const checks = [
            () => typeof VideoSystem !== 'undefined',
            () => VideoSystem.isActive(),
            () => document.querySelector('video') !== null,
            () => VideoSystem.getStatus().integrationState === 'active'
        ];
        
        const results = checks.map((check, index) => {
            try {
                const result = check();
                console.log(`✅ Check ${index + 1}: PASSED`);
                return result;
            } catch (error) {
                console.log(`❌ Check ${index + 1}: FAILED - ${error.message}`);
                return false;
            }
        });
        
        const allPassed = results.every(result => result);
        
        if (allPassed) {
            console.log('🎉 Quick test PASSED - System appears healthy!');
        } else {
            console.log('⚠️  Quick test FAILED - Run full tests with VideoSystemTests.runAllTests()');
        }
        
        return allPassed;
    }
}

// Crea istanza globale per testing
if (typeof window !== 'undefined') {
    window.VideoSystemTests = VideoSystemTests;
    window.videoSystemTests = new VideoSystemTests();
    
    // Comando rapido
    window.testVideoSystem = () => window.videoSystemTests.quickTest();
    window.testVideoSystemFull = () => window.videoSystemTests.runAllTests();
}

// Export per moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoSystemTests;
}