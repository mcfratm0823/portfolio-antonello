/**
 * Portfolio Navigation Fix
 * Fixes the issue where clicking on Cafè 124 redirects to Generali
 * 
 * The problem occurs because the portfolio animation system sets pointer-events
 * incorrectly, making the wrong project clickable at certain scroll positions.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Debug function to check current pointer-events state
    function debugPortfolioPointerEvents() {
        const items = document.querySelectorAll('[data-scroll-selected-work="item"]');
        console.log('=== Portfolio Pointer Events Debug ===');
        
        items.forEach((item, index) => {
            const projectName = item.querySelector('.selected_work_name')?.textContent || 'Unknown';
            const link = item.querySelector('.selected_work_box_link');
            const href = link?.getAttribute('href') || 'No link';
            const pointerEvents = window.getComputedStyle(item).pointerEvents;
            const isClickable = pointerEvents !== 'none';
            
            console.log(`Project ${index}: ${projectName}`);
            console.log(`  - Link: ${href}`);
            console.log(`  - Pointer Events: ${pointerEvents}`);
            console.log(`  - Clickable: ${isClickable}`);
            console.log('---');
        });
    }
    
    // Fix function to ensure correct project is clickable
    function fixPortfolioNavigation() {
        const portfolioSection = document.querySelector('[data-scroll-selected-work="section"]');
        if (!portfolioSection) return;
        
        const items = portfolioSection.querySelectorAll('[data-scroll-selected-work="item"]');
        if (!items.length) return;
        
        // Create a MutationObserver to watch for pointer-events changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    
                    // Check if multiple items have pointer-events: auto
                    const clickableItems = Array.from(items).filter(item => {
                        const style = window.getComputedStyle(item);
                        return style.pointerEvents !== 'none';
                    });
                    
                    // If more than one item is clickable, we have a problem
                    if (clickableItems.length > 1) {
                        console.warn('Multiple portfolio items are clickable! Fixing...');
                        
                        // Reset all items to pointer-events: none
                        items.forEach(item => {
                            item.style.pointerEvents = 'none';
                        });
                        
                        // Find which item should actually be visible based on scroll position
                        const scrollProgress = window.scrollY - portfolioSection.offsetTop;
                        const sectionHeight = portfolioSection.offsetHeight;
                        const itemHeight = sectionHeight / items.length;
                        const activeIndex = Math.max(0, Math.min(items.length - 1, 
                            Math.floor(scrollProgress / itemHeight)));
                        
                        // Make only the active item clickable
                        if (items[activeIndex]) {
                            items[activeIndex].style.pointerEvents = 'auto';
                        }
                    }
                }
            });
        });
        
        // Observe each portfolio item for changes
        items.forEach(item => {
            observer.observe(item, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        });
        
        // Also add scroll listener for additional safety
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                // Check current state after scroll ends
                const clickableItems = Array.from(items).filter(item => {
                    const style = window.getComputedStyle(item);
                    return style.pointerEvents !== 'none';
                });
                
                if (clickableItems.length === 0) {
                    // No items are clickable, make the first one clickable
                    items[0].style.pointerEvents = 'auto';
                }
            }, 150);
        });
        
        // Initial fix - ensure first item is clickable
        items.forEach((item, index) => {
            if (index === 0) {
                item.style.pointerEvents = 'auto';
            } else {
                item.style.pointerEvents = 'none';
            }
        });
    }
    
    // Run the fix after a short delay to ensure GSAP animations are initialized
    setTimeout(function() {
        fixPortfolioNavigation();
        
        // Debug current state
        if (window.location.search.includes('debug=true')) {
            debugPortfolioPointerEvents();
            
            // Add debug button
            const debugButton = document.createElement('button');
            debugButton.textContent = 'Debug Portfolio';
            debugButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px; background: black; color: white; border: none; cursor: pointer;';
            debugButton.onclick = debugPortfolioPointerEvents;
            document.body.appendChild(debugButton);
        }
    }, 1000);
    
    // Also add direct click handlers as a fallback
    const portfolioLinks = document.querySelectorAll('.selected_work_box_link');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            console.log('Portfolio link clicked:', href);
            
            // Check if the parent item has pointer-events: none
            const parentItem = this.closest('[data-scroll-selected-work="item"]');
            if (parentItem) {
                const pointerEvents = window.getComputedStyle(parentItem).pointerEvents;
                if (pointerEvents === 'none') {
                    console.warn('Click on disabled portfolio item prevented');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
            
            // Log navigation for debugging
            console.log('Navigating to:', href);
        });
    });
});

// Export for debugging
window.portfolioNavigationDebug = {
    checkPointerEvents: function() {
        const items = document.querySelectorAll('[data-scroll-selected-work="item"]');
        items.forEach((item, index) => {
            const projectName = item.querySelector('.selected_work_name')?.textContent || 'Unknown';
            const pointerEvents = window.getComputedStyle(item).pointerEvents;
            console.log(`${index}: ${projectName} - pointer-events: ${pointerEvents}`);
        });
    },
    
    fixNavigation: function() {
        const items = document.querySelectorAll('[data-scroll-selected-work="item"]');
        items.forEach((item, index) => {
            item.style.pointerEvents = index === 0 ? 'auto' : 'none';
        });
        console.log('Portfolio navigation fixed - only first item is clickable');
    }
};