// =====================================================================
// WatchTheFall v4.6 - Content Hub with Cross-Network Instagram Shuffle
// TikTok: 10 slots (8 videos + ads at 6,9) | Instagram: shuffled regional reels
// =====================================================================

(function() {
    'use strict';

    let currentPlatform = 'instagram';
    let contentData = null;
    let observer = null;

    // All regional Instagram libraries — new ones auto-join the shuffle
    const REGIONAL_LIBRARIES = [
        'data/scotlandwtf_library.json',
        'data/germanywtf_library.json',
        'data/netherlandswtf_library.json',
        'data/spainwtf_library.json',
        'data/waleswtf_library.json',
        'data/swedenwtf_library.json',
        'data/britainwtf_library.json',
        'data/australiawtf_library.json',
    ];

    const AD_POSITIONS = [6, 9];

    const PLATFORMS = {
        tiktok: { name: 'TikTok', icon: '📱', color: '#fe2c55' },
        instagram: { name: 'Network Mix', icon: '📷', color: '#e4405f' }
    };
    
    async function loadContentData() {
        try {
            const response = await fetch('data/content_feeds.json');
            if (!response.ok) throw new Error('Failed to load content data');
            
            contentData = await response.json();
            console.log('✅ Content Hub Loaded | Platform: TikTok | Slots: 10 | Lazy Mode: Active');
            
            renderPlatformToggle();
            renderContentSlider();
            initLazyLoad();
            
        } catch (error) {
            console.error('❌ Error loading content:', error);
            showErrorState();
        }
    }
    
    function renderPlatformToggle() {
        const toggleContainer = document.getElementById('platform-toggle');
        if (!toggleContainer) return;
        
        toggleContainer.innerHTML = Object.entries(PLATFORMS).map(([key, platform]) => `
            <button 
                class="platform-btn ${key === currentPlatform ? 'active' : ''}" 
                data-platform="${key}"
                style="--platform-color: ${platform.color}"
                aria-label="Switch to ${platform.name}">
                <span class="platform-icon">${platform.icon}</span>
                <span class="platform-name">${platform.name}</span>
            </button>
        `).join('');
        
        // Add click handlers
        toggleContainer.querySelectorAll('.platform-btn').forEach(btn => {
            btn.addEventListener('click', () => switchPlatform(btn.dataset.platform));
        });
    }
    
    function switchPlatform(platform) {
        if (platform === currentPlatform) return;
        
        currentPlatform = platform;
        
        // Update active state
        document.querySelectorAll('.platform-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.platform === platform);
        });
        
        // Re-render content
        renderContentSlider();
        
        console.log(`🔄 Switched to ${PLATFORMS[platform].name}`);
    }
    
    function renderContentSlider() {
        if (currentPlatform === 'instagram') {
            renderInstagramShuffle();
            return;
        }

        const slider = document.getElementById('content-slider');
        if (!slider || !contentData) return;

        const platformData = contentData[currentPlatform];
        if (!platformData) {
            slider.innerHTML = '<div class="error-state"><p>No content available</p></div>';
            return;
        }

        const videos = platformData.videos || platformData.reels || [];
        const adPositions = platformData.ad_positions || [];

        // Create 10 slots: 8 videos + 2 ads at positions 6 and 9
        const boxes = [];
        let videoIndex = 0;

        for (let pos = 1; pos <= 10; pos++) {
            if (adPositions.includes(pos)) {
                boxes.push(createAdBox(pos));
            } else if (videoIndex < videos.length) {
                boxes.push(createContentBox(videos[videoIndex], currentPlatform, false));
                videoIndex++;
            } else {
                boxes.push(createPlaceholderBox(currentPlatform));
            }
        }

        slider.innerHTML = boxes.join('');
        initLazyLoad();
    }

    async function renderInstagramShuffle() {
        const slider = document.getElementById('content-slider');
        if (!slider) return;

        slider.innerHTML = `
            <div class="content-box placeholder-box" style="--platform-color:#e4405f;grid-column:1/-1;min-height:80px;display:flex;align-items:center;justify-content:center;">
                <div class="placeholder-content">
                    <span class="placeholder-icon">📷</span>
                    <p class="placeholder-text">Shuffling reels from across the network…</p>
                </div>
            </div>`;

        // Fetch all regional libraries in parallel
        const results = await Promise.allSettled(
            REGIONAL_LIBRARIES.map(url => fetch(url).then(r => r.json()))
        );

        let allReels = [];
        results.forEach(r => {
            if (r.status === 'fulfilled' && Array.isArray(r.value.featured)) {
                allReels = allReels.concat(r.value.featured);
            }
        });

        // Fisher-Yates shuffle
        for (let i = allReels.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allReels[i], allReels[j]] = [allReels[j], allReels[i]];
        }

        const boxes = [];
        let reelIndex = 0;

        for (let pos = 1; pos <= 10; pos++) {
            if (AD_POSITIONS.includes(pos)) {
                boxes.push(createAdBox(pos));
            } else if (reelIndex < allReels.length) {
                boxes.push(createReelIframeBox(allReels[reelIndex++]));
            } else {
                boxes.push(createPlaceholderBox('instagram'));
            }
        }

        slider.innerHTML = boxes.join('');

        // Inject reshuffle button above slider
        const reshuffleId = 'ig-reshuffle-btn';
        if (!document.getElementById(reshuffleId)) {
            const btn = document.createElement('button');
            btn.id = reshuffleId;
            btn.className = 'platform-btn';
            btn.style.cssText = 'margin:0 auto 1rem;display:block;--platform-color:#e4405f;';
            btn.innerHTML = '<span class="platform-icon">🔀</span><span class="platform-name">Reshuffle</span>';
            btn.addEventListener('click', renderInstagramShuffle);
            slider.parentNode.insertBefore(btn, slider);
        }

        console.log(`✅ Instagram Network Mix | ${allReels.length} reels from ${results.filter(r => r.status === 'fulfilled').length} regions`);
    }

    function createReelIframeBox(url) {
        const id = (url.match(/\/reel\/([^/?#]+)/) || [])[1];
        if (!id) return createPlaceholderBox('instagram');
        return `
            <div class="content-box instagram-box">
                <iframe
                    src="https://www.instagram.com/reel/${id}/embed/"
                    scrolling="no"
                    allowtransparency="true"
                    allowfullscreen="true"
                    frameborder="0"
                    loading="lazy"
                    style="width:100%;min-height:480px;border:none;border-radius:8px;">
                </iframe>
            </div>
        `;
    }
    
    function createContentBox(item, platform, preload = false) {
        if (!item || !item.url) {
            return createPlaceholderBox(platform);
        }
        
        const platformInfo = PLATFORMS[platform];
        
        if (preload) {
            // Preload first 3 embeds immediately
            switch(platform) {
                case 'tiktok':
                    return createTikTokEmbed(item.url);
                case 'instagram':
                    return createInstagramEmbed(item.url);
                default:
                    return createPlaceholderBox(platform);
            }
        } else {
            // Lazy-load others with placeholder
            return `
                <div class="content-box lazy-embed" data-url="${item.url}" data-platform="${platform}">
                    <div class="embed-placeholder">
                        <span class="placeholder-icon">${platformInfo.icon}</span>
                        <p class="placeholder-text">Loading ${platformInfo.name}...</p>
                        <button class="view-post-btn" onclick="this.parentElement.parentElement.classList.add('force-load')">View Post</button>
                    </div>
                </div>
            `;
        }
    }
    
    function createTikTokEmbed(url) {
        return `
            <div class="content-box tiktok-box">
                ${createTikTokEmbedContent(url)}
            </div>
        `;
    }
    
    function createTikTokEmbedContent(url) {
        const videoId = url.match(/video\/(\d+)/)?.[1];
        return `
            <blockquote class="tiktok-embed" 
                cite="${url}" 
                data-video-id="${videoId}"
                style="max-width: 100%; min-width: 100%;">
                <section>
                    <a target="_blank" href="${url}">View on TikTok</a>
                </section>
            </blockquote>
        `;
    }
    

    
    function createInstagramEmbed(url) {
        return `
            <div class="content-box instagram-box">
                ${createInstagramEmbedContent(url)}
            </div>
        `;
    }
    
    function createInstagramEmbedContent(url) {
        return `
            <blockquote class="instagram-media" 
                data-instgrm-permalink="${url}"
                data-instgrm-version="14">
            </blockquote>
        `;
    }
    

    
    function createPlaceholderBox(platform) {
        const platformInfo = PLATFORMS[platform];
        return `
            <div class="content-box placeholder-box" style="--platform-color: ${platformInfo.color}">
                <div class="placeholder-content">
                    <span class="placeholder-icon">${platformInfo.icon}</span>
                    <p class="placeholder-text">${platformInfo.name} content<br/>coming soon</p>
                </div>
            </div>
        `;
    }
    
    function createAdBox(position) {
        return `
            <a href="https://qoder.com/referral?referral_code=ZnT4mhAIRJYHD7JEVAI57wueJw0yr2qS" target="_blank" class="content-box ad-box" style="text-decoration: none; display: block;">
                <div class="ad-placeholder">
                    <span class="ad-label">SPONSORED</span>
                    <div class="ad-content">
                        <p>💻 Try Qoder AI</p>
                        <span class="ad-dimensions">Next-Gen Code Editor</span>
                    </div>
                </div>
            </a>
        `;
    }
    
    function initLazyLoad() {
        // Disconnect previous observer if exists
        if (observer) {
            observer.disconnect();
        }
        
        // Create IntersectionObserver for lazy loading
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const box = entry.target;
                    const url = box.dataset.url;
                    const platform = box.dataset.platform;
                    
                    if (url && platform && !box.classList.contains('loaded')) {
                        // Load the embed
                        if (platform === 'tiktok') {
                            box.innerHTML = createTikTokEmbedContent(url);
                            loadTikTokEmbed();
                        } else if (platform === 'instagram') {
                            box.innerHTML = createInstagramEmbedContent(url);
                            loadInstagramEmbed();
                        }
                        
                        box.classList.add('loaded');
                        observer.unobserve(box);
                    }
                }
            });
        }, {
            rootMargin: '100px' // Start loading 100px before entering viewport
        });
        
        // Observe all lazy-embed boxes
        document.querySelectorAll('.lazy-embed:not(.force-load)').forEach(box => {
            observer.observe(box);
        });
        
        // Force-load boxes that were clicked
        document.querySelectorAll('.lazy-embed.force-load').forEach(box => {
            const url = box.dataset.url;
            const platform = box.dataset.platform;
            
            if (url && platform && !box.classList.contains('loaded')) {
                if (platform === 'tiktok') {
                    box.innerHTML = createTikTokEmbedContent(url);
                    loadTikTokEmbed();
                } else if (platform === 'instagram') {
                    box.innerHTML = createInstagramEmbedContent(url);
                    loadInstagramEmbed();
                }
                
                box.classList.add('loaded');
            }
        });
    }
    
    function loadTikTokEmbed() {
        if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Reload embeds if script already exists
            if (window.tiktokEmbed && window.tiktokEmbed.lib) {
                setTimeout(() => {
                    window.tiktokEmbed.lib.render(document.querySelectorAll('.tiktok-embed'));
                }, 100);
            }
        }
    }
    
    function loadInstagramEmbed() {
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        } else {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }
    }
    
    function showErrorState() {
        const slider = document.getElementById('content-slider');
        if (slider) {
            slider.innerHTML = `
                <div class="error-state">
                    <p>Unable to load content</p>
                </div>
            `;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContentData);
    } else {
        loadContentData();
    }
})();
