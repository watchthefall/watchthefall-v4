/**
 * WatchTheFall Poster Gallery System
 * Loads regional poster data and renders:
 * 1. Rotating Poster Strip (auto-rotates every 5-8s with glitch effects)
 * 2. Dynamic Poster Gallery (masonry grid, region-filtered)
 */

(function() {
    'use strict';

    let postersData = null;
    let currentRegion = 'GLOBAL';
    let rotatorInterval = null;
    let currentRotatorIndex = 0;

    const ROTATOR_DURATION = 6000; // 6 seconds between rotations

    /**
     * Load posters.json data
     */
    async function loadPostersData() {
        try {
            const response = await fetch('data/posters.json');
            if (!response.ok) throw new Error('Failed to load posters data');
            postersData = await response.json();
            return postersData;
        } catch (error) {
            console.error('Error loading posters:', error);
            // Fallback empty data
            return {
                regions: {
                    GLOBAL: [],
                    France: [],
                    Scotland: [],
                    USA: [],
                    Germany: [],
                    Australia: [],
                    Britain: [],
                    Europe: []
                }
            };
        }
    }

    /**
     * Initialize theme selector
     */
    function initThemeSelector() {
        const selector = document.getElementById('theme-selector');
        if (!selector || !postersData) return;

        const regions = Object.keys(postersData.regions).sort();
        
        selector.innerHTML = regions.map(region => {
            const count = postersData.regions[region]?.length || 0;
            const active = region === currentRegion ? 'active' : '';
            return `
                <button class="theme-btn ${active}" data-region="${region}">
                    ${region} <span class="theme-count">(${count})</span>
                </button>
            `;
        }).join('');

        // Add click handlers
        selector.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const region = btn.dataset.region;
                switchRegion(region);
            });
        });
    }

    /**
     * Switch to a different region
     */
    function switchRegion(region) {
        if (region === currentRegion) return;
        
        currentRegion = region;
        
        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.region === region);
        });

        // Re-render gallery and restart rotator
        renderGallery();
        startRotator();
    }

    /**
     * Render rotating poster strip
     */
    function renderRotator() {
        const rotator = document.getElementById('poster-rotator');
        if (!rotator || !postersData) return;

        const posters = postersData.regions[currentRegion] || [];
        
        if (posters.length === 0) {
            rotator.innerHTML = '<p style="text-align:center; opacity:0.5;">No posters available for this region</p>';
            return;
        }

        currentRotatorIndex = 0;
        
        rotator.innerHTML = `
            <div class="rotator-container">
                <div class="rotator-image-wrapper">
                    <img 
                        id="rotator-img" 
                        src="${posters[0].path}" 
                        alt="Poster ${currentRotatorIndex + 1}"
                        class="rotator-image"
                    />
                    <div class="rotator-overlay"></div>
                </div>
                <div class="rotator-controls">
                    <span class="rotator-counter">1 / ${posters.length}</span>
                    <span class="rotator-region">${currentRegion}</span>
                </div>
            </div>
        `;
    }

    /**
     * Start automatic rotation
     */
    function startRotator() {
        // Clear existing interval
        if (rotatorInterval) {
            clearInterval(rotatorInterval);
        }

        renderRotator();

        const posters = postersData.regions[currentRegion] || [];
        if (posters.length <= 1) return; // No rotation needed

        rotatorInterval = setInterval(() => {
            currentRotatorIndex = (currentRotatorIndex + 1) % posters.length;
            
            const img = document.getElementById('rotator-img');
            const counter = document.querySelector('.rotator-counter');
            
            if (img && posters[currentRotatorIndex]) {
                // Add glitch effect
                img.classList.add('glitch-transition');
                
                setTimeout(() => {
                    img.src = posters[currentRotatorIndex].path;
                    img.alt = `Poster ${currentRotatorIndex + 1}`;
                    if (counter) {
                        counter.textContent = `${currentRotatorIndex + 1} / ${posters.length}`;
                    }
                    
                    setTimeout(() => {
                        img.classList.remove('glitch-transition');
                    }, 300);
                }, 150);
            }
        }, ROTATOR_DURATION);
    }

    /**
     * Render dynamic poster gallery
     */
    function renderGallery() {
        const gallery = document.getElementById('poster-gallery');
        if (!gallery || !postersData) return;

        const posters = postersData.regions[currentRegion] || [];
        
        if (posters.length === 0) {
            gallery.innerHTML = '<p style="text-align:center; opacity:0.5; padding:2rem;">No posters found for this region</p>';
            return;
        }

        gallery.innerHTML = `
            <div class="gallery-grid">
                ${posters.map((poster, idx) => `
                    <div class="gallery-item" data-index="${idx}">
                        <img 
                            src="${poster.path}" 
                            alt="${poster.file}"
                            class="gallery-image"
                            loading="lazy"
                        />
                        <div class="gallery-overlay">
                            <span class="gallery-filename">${poster.file}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers for fullscreen view
        gallery.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) openFullscreen(img.src, item.dataset.index);
            });
        });
    }

    /**
     * Open poster in fullscreen modal
     */
    function openFullscreen(src, index) {
        const modal = document.createElement('div');
        modal.className = 'poster-fullscreen-modal';
        modal.innerHTML = `
            <div class="fullscreen-backdrop"></div>
            <div class="fullscreen-content">
                <button class="fullscreen-close" aria-label="Close">×</button>
                <img src="${src}" alt="Poster ${parseInt(index) + 1}" class="fullscreen-image" />
            </div>
        `;

        document.body.appendChild(modal);
        document.body.classList.add('modal-open');

        // Close handlers
        const close = () => {
            document.body.removeChild(modal);
            document.body.classList.remove('modal-open');
        };

        modal.querySelector('.fullscreen-close').addEventListener('click', close);
        modal.querySelector('.fullscreen-backdrop').addEventListener('click', close);
        
        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Initialize gallery system
     */
    async function init() {
        await loadPostersData();
        initThemeSelector();
        renderGallery();
        startRotator();
    }

    // Auto-initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (rotatorInterval) {
            clearInterval(rotatorInterval);
        }
    });

    /**
     * FUTURE-READY PLACEHOLDERS
     * Do NOT implement yet - reserved for future features
     */

    /**
     * Enable poster download functionality
     * TODO: Add download buttons to gallery items
     * TODO: Implement batch download for entire regions
     */
    function enablePosterDownloads() {
        // Placeholder - not implemented
        console.log('Download functionality: Coming soon');
    }

    /**
     * Integrate with Printify for poster products
     * TODO: Fetch Printify product IDs for posters
     * TODO: Add "Order Print" buttons to gallery
     * TODO: Link to shop with pre-selected poster designs
     */
    function integratePrintifyPosterProducts() {
        // Placeholder - not implemented
        console.log('Printify integration: Coming soon');
    }

})();
