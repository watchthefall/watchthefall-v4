// =====================================================================
// WatchTheFall v4 - Multi-Platform Content Slider with Ad Slots
// =====================================================================

(function() {
    'use strict';
    
    let currentPlatform = 'tiktok';
    let contentData = null;
    
    const PLATFORMS = {
        tiktok: { name: 'TikTok', icon: '📱', color: '#fe2c55' },
        youtube: { name: 'YouTube', icon: '▶️', color: '#ff0000' },
        instagram: { name: 'Instagram', icon: '📷', color: '#e4405f' },
        x: { name: 'X', icon: '𝕏', color: '#1da1f2' },
        facebook: { name: 'Facebook', icon: '👥', color: '#1877f2' }
    };
    
    async function loadContentData() {
        try {
            const response = await fetch('data/tiktoks.json');
            if (!response.ok) throw new Error('Failed to load content data');
            
            contentData = await response.json();
            console.log('✅ Multi-platform content data loaded');
            
            renderPlatformToggle();
            renderContentSlider();
            
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
        const slider = document.getElementById('content-slider');
        if (!slider || !contentData) return;
        
        const platformContent = contentData.content || [];
        
        // Create 15 boxes: 13 content + 2 ads at positions 6 and 13
        slider.innerHTML = platformContent.map((item, index) => {
            if (item.type === 'ad') {
                return createAdBox(item);
            } else {
                return createContentBox(item, currentPlatform);
            }
        }).join('');
        
        // Load TikTok embed script if needed
        if (currentPlatform === 'tiktok' && platformContent.some(i => i.type === 'video')) {
            loadTikTokEmbed();
        }
    }
    
    function createContentBox(item, platform) {
        if (!item.url) {
            return createPlaceholderBox(platform);
        }
        
        switch(platform) {
            case 'tiktok':
                return createTikTokEmbed(item.url);
            case 'youtube':
                return createYouTubeEmbed(item.url);
            case 'instagram':
                return createInstagramEmbed(item.url);
            case 'x':
                return createXEmbed(item.url);
            case 'facebook':
                return createFacebookEmbed(item.url);
            default:
                return createPlaceholderBox(platform);
        }
    }
    
    function createTikTokEmbed(url) {
        const videoId = url.match(/video\/(\d+)/)?.[1];
        return `
            <div class="content-box tiktok-box">
                <blockquote class="tiktok-embed" 
                    cite="${url}" 
                    data-video-id="${videoId}"
                    style="max-width: 100%; min-width: 100%;">
                    <section>
                        <a target="_blank" href="${url}">View on TikTok</a>
                    </section>
                </blockquote>
            </div>
        `;
    }
    
    function createYouTubeEmbed(url) {
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]+)/)?.[1];
        return `
            <div class="content-box youtube-box">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    function createInstagramEmbed(url) {
        return `
            <div class="content-box instagram-box">
                <blockquote class="instagram-media" 
                    data-instgrm-permalink="${url}"
                    data-instgrm-version="14">
                </blockquote>
            </div>
        `;
    }
    
    function createXEmbed(url) {
        return `
            <div class="content-box x-box">
                <blockquote class="twitter-tweet">
                    <a href="${url}"></a>
                </blockquote>
            </div>
        `;
    }
    
    function createFacebookEmbed(url) {
        return `
            <div class="content-box facebook-box">
                <iframe 
                    src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
            </div>
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
    
    function createAdBox(item) {
        return `
            <div class="content-box ad-box">
                <div class="ad-placeholder">
                    <span class="ad-label">ADVERTISEMENT</span>
                    <div class="ad-content">
                        <p>Ad Space</p>
                        <span class="ad-dimensions">300x600</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    function loadTikTokEmbed() {
        if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Reload embeds if script already exists
            if (window.tiktokEmbed) {
                window.tiktokEmbed.lib.render(document.querySelectorAll('.tiktok-embed'));
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
