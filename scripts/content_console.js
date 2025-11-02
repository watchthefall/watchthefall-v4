// =====================================================================
// WatchTheFall v4.5.1 - Subpage Content Console
// Auto-detects region, loads YouTube/X/Threads embeds
// =====================================================================

(function() {
    'use strict';
    
    let regionData = {
        youtube: [],
        x: [],
        threads: []
    };
    
    const PLATFORM_CONFIG = {
        youtube: {
            name: 'YouTube',
            icon: '▶️',
            limit: 5,
            color: '#ff0000'
        },
        x: {
            name: 'X',
            icon: '𝕏',
            limit: 3,
            color: '#1da1f2'
        },
        threads: {
            name: 'Threads',
            icon: '🧵',
            limit: 3,
            color: '#000000'
        }
    };
    
    // Auto-detect region from page URL
    function detectRegion() {
        const path = window.location.pathname;
        
        // Extract region from path (e.g., /regional/pages/scotland.html → scotland)
        const match = path.match(/\/([^\/]+)\.html$/);
        if (match) {
            const page = match[1].toLowerCase();
            
            // Map page names to region keys
            const regionMap = {
                'scotland': 'scotland',
                'britain-directory': 'britain',
                'usamerica': 'usamerica',
                'usa': 'usamerica',
                'europe-directory': 'europe',
                'ai': 'ai',
                'ai-directory': 'ai',
                'global-directory': 'global'
            };
            
            return regionMap[page] || 'global';
        }
        
        return 'global';
    }
    
    async function loadContentConsole() {
        const container = document.getElementById('content-console');
        if (!container) return;
        
        const region = detectRegion();
        
        // Determine path depth (ai.html is at root, scotland.html is in regional/pages/)
        const isRootPage = !window.location.pathname.includes('/regional/');
        const dataPath = isRootPage ? 'data/' : '../../data/';
        
        try {
            // Load all three datasets in parallel
            const [youtubeData, xData, threadsData] = await Promise.all([
                fetch(dataPath + 'youtube.json').then(r => r.ok ? r.json() : {}),
                fetch(dataPath + 'x.json').then(r => r.ok ? r.json() : {}),
                fetch(dataPath + 'threads.json').then(r => r.ok ? r.json() : {})
            ]);
            
            // Extract region-specific content
            regionData.youtube = (youtubeData[region] || []).slice(0, PLATFORM_CONFIG.youtube.limit);
            regionData.x = (xData[region] || []).slice(0, PLATFORM_CONFIG.x.limit);
            regionData.threads = (threadsData[region] || []).slice(0, PLATFORM_CONFIG.threads.limit);
            
            // Count active platforms
            const activePlatforms = [];
            if (regionData.youtube.length > 0) activePlatforms.push('YouTube');
            if (regionData.x.length > 0) activePlatforms.push('X');
            if (regionData.threads.length > 0) activePlatforms.push('Threads');
            
            console.log(`✅ Content Console Loaded | Region: ${region} | Platforms: ${activePlatforms.join(', ')}`);
            
            // Render the console
            renderContentConsole(container, region);
            
            // Initialize lazy loading
            initLazyLoad();
            
        } catch (error) {
            console.error('❌ Error loading content console:', error);
            showErrorState(container);
        }
    }
    
    function renderContentConsole(container, region) {
        const hasContent = regionData.youtube.length > 0 || regionData.x.length > 0 || regionData.threads.length > 0;
        
        if (!hasContent) {
            container.innerHTML = `
                <div class="console-empty">
                    <p>No content available for this region yet.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="console-header">
                <h2 class="console-title">Extended Content</h2>
                <p class="console-subtitle">Deep dives, analysis, and raw footage from ${capitalize(region)}</p>
            </div>
            <div class="console-content">
        `;
        
        // YouTube Section
        if (regionData.youtube.length > 0) {
            html += renderPlatformSection('youtube', regionData.youtube);
        }
        
        // X Section
        if (regionData.x.length > 0) {
            html += renderPlatformSection('x', regionData.x);
        }
        
        // Threads Section
        if (regionData.threads.length > 0) {
            html += renderPlatformSection('threads', regionData.threads);
        }
        
        html += `</div>`;
        
        container.innerHTML = html;
    }
    
    function renderPlatformSection(platform, items) {
        const config = PLATFORM_CONFIG[platform];
        
        let html = `
            <div class="console-section" data-platform="${platform}">
                <div class="section-header">
                    <span class="section-icon">${config.icon}</span>
                    <h3 class="section-title">${config.name}</h3>
                </div>
                <div class="section-slider">
        `;
        
        items.forEach((item, index) => {
            if (platform === 'youtube') {
                html += createYouTubeBox(item, index < 2); // Preload first 2
            } else if (platform === 'x') {
                html += createXBox(item, index < 1); // Preload first 1
            } else if (platform === 'threads') {
                html += createThreadsBox(item, index < 1); // Preload first 1
            }
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    function createYouTubeBox(item, preload = false) {
        if (preload) {
            return `
                <div class="console-box youtube-box">
                    <iframe 
                        src="${item.url}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        loading="lazy">
                    </iframe>
                    <div class="box-info">
                        <h4>${item.title || 'Video'}</h4>
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="console-box lazy-box" data-url="${item.url}" data-platform="youtube" data-title="${item.title}" data-description="${item.description || ''}">
                    <div class="box-placeholder">
                        <span class="placeholder-icon">▶️</span>
                        <button class="load-btn">Load Video</button>
                    </div>
                </div>
            `;
        }
    }
    
    function createXBox(item, preload = false) {
        if (preload) {
            return `
                <div class="console-box x-box">
                    <blockquote class="twitter-tweet">
                        <a href="${item.url}"></a>
                    </blockquote>
                    ${item.caption ? `<div class="box-caption">${item.caption}</div>` : ''}
                </div>
            `;
        } else {
            return `
                <div class="console-box lazy-box" data-url="${item.url}" data-platform="x" data-caption="${item.caption || ''}">
                    <div class="box-placeholder">
                        <span class="placeholder-icon">𝕏</span>
                        <button class="load-btn">Load Post</button>
                    </div>
                </div>
            `;
        }
    }
    
    function createThreadsBox(item, preload = false) {
        if (preload) {
            return `
                <div class="console-box threads-box">
                    <blockquote class="threads-embed">
                        <a href="${item.url}">${item.caption || 'View on Threads'}</a>
                    </blockquote>
                    ${item.caption ? `<div class="box-caption">${item.caption}</div>` : ''}
                </div>
            `;
        } else {
            return `
                <div class="console-box lazy-box" data-url="${item.url}" data-platform="threads" data-caption="${item.caption || ''}">
                    <div class="box-placeholder">
                        <span class="placeholder-icon">🧵</span>
                        <button class="load-btn">Load Thread</button>
                    </div>
                </div>
            `;
        }
    }
    
    function initLazyLoad() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const box = entry.target;
                    loadBox(box);
                    observer.unobserve(box);
                }
            });
        }, {
            rootMargin: '150px'
        });
        
        // Observe all lazy boxes
        document.querySelectorAll('.lazy-box').forEach(box => {
            observer.observe(box);
            
            // Also add click handler for manual load
            const btn = box.querySelector('.load-btn');
            if (btn) {
                btn.addEventListener('click', () => loadBox(box));
            }
        });
        
        // Load embed scripts
        loadEmbedScripts();
    }
    
    function loadBox(box) {
        if (box.classList.contains('loaded')) return;
        
        const url = box.dataset.url;
        const platform = box.dataset.platform;
        
        if (platform === 'youtube') {
            const title = box.dataset.title;
            const description = box.dataset.description;
            box.innerHTML = `
                <iframe 
                    src="${url}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
                <div class="box-info">
                    <h4>${title || 'Video'}</h4>
                    ${description ? `<p>${description}</p>` : ''}
                </div>
            `;
            box.classList.add('youtube-box');
        } else if (platform === 'x') {
            const caption = box.dataset.caption;
            box.innerHTML = `
                <blockquote class="twitter-tweet">
                    <a href="${url}"></a>
                </blockquote>
                ${caption ? `<div class="box-caption">${caption}</div>` : ''}
            `;
            box.classList.add('x-box');
            
            // Reload Twitter widget
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load(box);
            }
        } else if (platform === 'threads') {
            const caption = box.dataset.caption;
            box.innerHTML = `
                <blockquote class="threads-embed">
                    <a href="${url}">${caption || 'View on Threads'}</a>
                </blockquote>
                ${caption ? `<div class="box-caption">${caption}</div>` : ''}
            `;
            box.classList.add('threads-box');
        }
        
        box.classList.add('loaded');
        box.classList.remove('lazy-box');
    }
    
    function loadEmbedScripts() {
        // Load Twitter widgets script
        if (!document.querySelector('script[src*="twitter.com/widgets.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            script.charset = 'utf-8';
            document.body.appendChild(script);
        }
        
        // Threads doesn't have official embed script yet - using direct links
    }
    
    function showErrorState(container) {
        container.innerHTML = `
            <div class="console-error">
                <p>Unable to load content console.</p>
            </div>
        `;
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContentConsole);
    } else {
        loadContentConsole();
    }
})();
