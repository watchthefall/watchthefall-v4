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
        tiktok: {
            name: 'TikTok',
            icon: '📱',
            limit: 10, // 8 videos + 2 ads
            contentCount: 8,
            adPositions: [6, 9],
            color: '#fe2c55'
        },
        instagram: {
            name: 'Instagram',
            icon: '📷',
            limit: 10, // 8 reels + 2 ads
            contentCount: 8,
            adPositions: [6, 9],
            color: '#e4405f'
        },
        youtube: {
            name: 'YouTube',
            icon: '▶️',
            limit: 5,
            contentCount: 5,
            adPositions: [],
            color: '#ff0000'
        },
        x: {
            name: 'X',
            icon: '𝕏',
            limit: 3,
            contentCount: 3,
            adPositions: [],
            color: '#1da1f2'
        },
        threads: {
            name: 'Threads',
            icon: '🧵',
            limit: 3,
            contentCount: 3,
            adPositions: [],
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
            // Load all datasets in parallel
            const [contentFeedsData, youtubeData, xData, threadsData] = await Promise.all([
                fetch(dataPath + 'content_feeds.json').then(r => r.ok ? r.json() : {}),
                fetch(dataPath + 'youtube.json').then(r => r.ok ? r.json() : {}),
                fetch(dataPath + 'x.json').then(r => r.ok ? r.json() : {}),
                fetch(dataPath + 'threads.json').then(r => r.ok ? r.json() : {})
            ]);
            
            // Extract region-specific content for TikTok and Instagram
            regionData.tiktok = (contentFeedsData.tiktok?.regional?.[region] || []).slice(0, 8);
            regionData.instagram = (contentFeedsData.instagram?.regional?.[region] || []).slice(0, 8);
            
            // Extract region-specific content for YouTube, X, Threads
            regionData.youtube = (youtubeData[region] || []).slice(0, PLATFORM_CONFIG.youtube.limit);
            regionData.x = (xData[region] || []).slice(0, PLATFORM_CONFIG.x.limit);
            regionData.threads = (threadsData[region] || []).slice(0, PLATFORM_CONFIG.threads.limit);
            
            // Count active platforms
            const activePlatforms = [];
            if (regionData.tiktok.length > 0) activePlatforms.push('TikTok');
            if (regionData.instagram.length > 0) activePlatforms.push('Instagram');
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
        const hasContent = regionData.tiktok.length > 0 || regionData.instagram.length > 0 || 
                          regionData.youtube.length > 0 || regionData.x.length > 0 || regionData.threads.length > 0;
        
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
        
        // TikTok Section (FIRST - 10 boxes: 8 videos + 2 ads)
        if (regionData.tiktok.length > 0) {
            html += renderPlatformSection('tiktok', regionData.tiktok);
        }
        
        // Instagram Section (SECOND - 10 boxes: 8 reels + 2 ads)
        if (regionData.instagram.length > 0) {
            html += renderPlatformSection('instagram', regionData.instagram);
        }
        
        // YouTube Section (5 videos)
        if (regionData.youtube.length > 0) {
            html += renderPlatformSection('youtube', regionData.youtube);
        }
        
        // X Section (3 posts)
        if (regionData.x.length > 0) {
            html += renderPlatformSection('x', regionData.x);
        }
        
        // Threads Section (3 posts)
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
        
        // For TikTok and Instagram: 10 boxes (8 content + 2 ads)
        if (platform === 'tiktok' || platform === 'instagram') {
            let videoIndex = 0;
            for (let pos = 1; pos <= 10; pos++) {
                if (config.adPositions.includes(pos)) {
                    html += createAdBox(pos);
                } else if (videoIndex < items.length) {
                    if (platform === 'tiktok') {
                        html += createTikTokBox(items[videoIndex], videoIndex < 3); // Preload first 3
                    } else {
                        html += createInstagramBox(items[videoIndex], videoIndex < 3);
                    }
                    videoIndex++;
                } else {
                    html += createPlaceholderBox(platform);
                }
            }
        } else {
            // For YouTube, X, Threads: just render items
            items.forEach((item, index) => {
                if (platform === 'youtube') {
                    html += createYouTubeBox(item, index < 2); // Preload first 2
                } else if (platform === 'x') {
                    html += createXBox(item, index < 1); // Preload first 1
                } else if (platform === 'threads') {
                    html += createThreadsBox(item, index < 1); // Preload first 1
                }
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    function createTikTokBox(item, preload = false) {
        if (preload) {
            return `
                <div class="console-box tiktok-box">
                    <blockquote class="tiktok-embed" cite="${item.url}" data-video-id="${extractTikTokId(item.url)}">
                        <section>
                            <a target="_blank" title="TikTok" href="${item.url}">View on TikTok</a>
                        </section>
                    </blockquote>
                </div>
            `;
        } else {
            return `
                <div class="console-box lazy-box" data-url="${item.url}" data-platform="tiktok">
                    <div class="box-placeholder">
                        <span class="placeholder-icon">📱</span>
                        <button class="load-btn">Load TikTok</button>
                    </div>
                </div>
            `;
        }
    }
    
    function createInstagramBox(item, preload = false) {
        if (preload) {
            return `
                <div class="console-box instagram-box">
                    <blockquote class="instagram-media" data-instgrm-permalink="${item.url}" data-instgrm-version="14">
                        <a href="${item.url}" target="_blank">View on Instagram</a>
                    </blockquote>
                </div>
            `;
        } else {
            return `
                <div class="console-box lazy-box" data-url="${item.url}" data-platform="instagram">
                    <div class="box-placeholder">
                        <span class="placeholder-icon">📷</span>
                        <button class="load-btn">Load Instagram</button>
                    </div>
                </div>
            `;
        }
    }
    
    function createAdBox(position) {
        return `
            <div class="console-box ad-box">
                <div class="ad-content">
                    <span class="ad-icon">📰</span>
                    <p class="ad-text">Ad Slot ${position}</p>
                    <p class="ad-subtext">Support WatchTheFall</p>
                </div>
            </div>
        `;
    }
    
    function createPlaceholderBox(platform) {
        const config = PLATFORM_CONFIG[platform];
        return `
            <div class="console-box placeholder-box">
                <div class="box-placeholder">
                    <span class="placeholder-icon">${config.icon}</span>
                    <p class="placeholder-text">Coming Soon</p>
                </div>
            </div>
        `;
    }
    
    function extractTikTokId(url) {
        const match = url.match(/video\/(\d+)/);
        return match ? match[1] : '';
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
        
        if (platform === 'tiktok') {
            const videoId = extractTikTokId(url);
            box.innerHTML = `
                <blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}">
                    <section>
                        <a target="_blank" title="TikTok" href="${url}">View on TikTok</a>
                    </section>
                </blockquote>
            `;
            box.classList.add('tiktok-box');
            loadTikTokEmbed();
        } else if (platform === 'instagram') {
            box.innerHTML = `
                <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14">
                    <a href="${url}" target="_blank">View on Instagram</a>
                </blockquote>
            `;
            box.classList.add('instagram-box');
            loadInstagramEmbed();
        } else if (platform === 'youtube') {
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
        // Load TikTok embed script
        if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
            const tiktokScript = document.createElement('script');
            tiktokScript.src = 'https://www.tiktok.com/embed.js';
            tiktokScript.async = true;
            document.body.appendChild(tiktokScript);
        }
        
        // Load Instagram embed script
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const instaScript = document.createElement('script');
            instaScript.src = 'https://www.instagram.com/embed.js';
            instaScript.async = true;
            document.body.appendChild(instaScript);
        }
        
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
    
    function loadTikTokEmbed() {
        if (window.tiktokEmbed && window.tiktokEmbed.lib) {
            window.tiktokEmbed.lib.render();
        }
    }
    
    function loadInstagramEmbed() {
        if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
        }
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
