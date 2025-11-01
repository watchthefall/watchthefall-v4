// =====================================================================
// WatchTheFall v4 - Social Links Display
// =====================================================================

(function() {
    'use strict';
    
    async function loadSocialLinks() {
        const container = document.getElementById('social-links');
        if (!container) return;
        
        try {
            const response = await fetch('data/social_links.json');
            if (!response.ok) throw new Error('Failed to load social links');
            
            const links = await response.json();
            
            container.innerHTML = links.map(link => `
                <a href="${link.url}" 
                   class="social-card card" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${link.icon || '🔗'}</div>
                    <h3 style="color: var(--color-gold); margin-bottom: 0.5rem;">${link.name}</h3>
                    <p style="font-size: 0.875rem; opacity: 0.7;">${link.description || ''}</p>
                </a>
            `).join('');
            
            console.log('✅ Social links loaded:', links.length, 'platforms');
            
        } catch (error) {
            console.error('❌ Error loading social links:', error);
            // Fallback to default links
            container.innerHTML = `
                <a href="https://tiktok.com/@watchthefall" class="social-card card" target="_blank">
                    <div style="font-size: 2rem;">📱</div>
                    <h3 style="color: var(--color-gold);">TikTok</h3>
                    <p style="font-size: 0.875rem; opacity: 0.7;">@watchthefall</p>
                </a>
                <a href="https://instagram.com/watchthefall" class="social-card card" target="_blank">
                    <div style="font-size: 2rem;">📷</div>
                    <h3 style="color: var(--color-gold);">Instagram</h3>
                    <p style="font-size: 0.875rem; opacity: 0.7;">@watchthefall</p>
                </a>
            `;
        }
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSocialLinks);
    } else {
        loadSocialLinks();
    }
})();
