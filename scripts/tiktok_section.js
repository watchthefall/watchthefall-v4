// =====================================================================
// WatchTheFall v4 - TikTok 5-Pack Section (No Autoplay)
// =====================================================================

(function() {
    'use strict';
    
    async function loadTikToks() {
        const grid = document.getElementById('tiktok-grid');
        if (!grid) return;
        
        try {
            const response = await fetch('data/tiktoks.json');
            if (!response.ok) throw new Error('Failed to load TikToks');
            
            const tiktoks = await response.json();
            
            // Take first 5 TikToks
            const featured = tiktoks.slice(0, 5);
            
            grid.innerHTML = featured.map(tiktok => `
                <div class="tiktok-embed">
                    <blockquote class="tiktok-embed" 
                        cite="${tiktok.url}" 
                        data-video-id="${tiktok.id}">
                        <section>
                            <a target="_blank" href="${tiktok.url}">
                                View on TikTok
                            </a>
                        </section>
                    </blockquote>
                </div>
            `).join('');
            
            // Load TikTok embed script (no autoplay)
            if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://www.tiktok.com/embed.js';
                script.async = true;
                document.body.appendChild(script);
            }
            
            console.log('✅ TikTok 5-pack loaded:', featured.length, 'videos');
            
        } catch (error) {
            console.error('❌ Error loading TikToks:', error);
            grid.innerHTML = `
                <div class="error-state">
                    <p>Unable to load TikTok content</p>
                </div>
            `;
        }
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadTikToks);
    } else {
        loadTikToks();
    }
})();
