/**
 * Floating Posters Background System
 * Creates ambient floating poster images similar to video background
 * Posters drift slowly across the screen with varying speeds and opacities
 */

(function() {
    'use strict';

    const POSTER_COUNT = 12; // Number of floating posters
    const MIN_DURATION = 40; // Minimum animation duration (seconds)
    const MAX_DURATION = 80; // Maximum animation duration (seconds)
    const MIN_OPACITY = 0.03;
    const MAX_OPACITY = 0.12;
    const MIN_SIZE = 200; // pixels
    const MAX_SIZE = 400; // pixels

    let postersData = null;
    let allPosterPaths = [];

    /**
     * Load posters data
     */
    async function loadPostersData() {
        try {
            const response = await fetch('data/posters.json');
            if (!response.ok) throw new Error('Failed to load posters');
            postersData = await response.json();
            
            // Flatten all poster paths into single array
            Object.values(postersData.regions).forEach(regionPosters => {
                regionPosters.forEach(poster => {
                    allPosterPaths.push(poster.path);
                });
            });
            
            return true;
        } catch (error) {
            console.error('Error loading floating posters:', error);
            return false;
        }
    }

    /**
     * Get random value between min and max
     */
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Get random item from array
     */
    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Create a single floating poster element
     */
    function createFloatingPoster(index) {
        const poster = document.createElement('div');
        poster.className = 'floating-poster';
        poster.style.cssText = `
            position: absolute;
            width: ${random(MIN_SIZE, MAX_SIZE)}px;
            opacity: ${random(MIN_OPACITY, MAX_OPACITY)};
            animation-duration: ${random(MIN_DURATION, MAX_DURATION)}s;
            animation-delay: ${random(0, 10)}s;
            top: ${random(-20, 120)}%;
            left: ${random(-20, 120)}%;
        `;

        const img = document.createElement('img');
        img.src = randomItem(allPosterPaths);
        img.style.cssText = `
            width: 100%;
            height: auto;
            filter: grayscale(40%) blur(1px);
            transform: rotate(${random(-15, 15)}deg);
        `;
        img.loading = 'lazy';

        poster.appendChild(img);
        return poster;
    }

    /**
     * Initialize floating posters background
     */
    async function init() {
        const container = document.getElementById('floating-posters');
        if (!container) return;

        const loaded = await loadPostersData();
        if (!loaded || allPosterPaths.length === 0) {
            console.warn('No posters available for floating background');
            return;
        }

        // Create multiple floating posters
        for (let i = 0; i < POSTER_COUNT; i++) {
            const poster = createFloatingPoster(i);
            container.appendChild(poster);
        }
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
