// =====================================================================
// WatchTheFall v4 - World Cup Leaderboard Display
// =====================================================================

(function() {
    'use strict';
    
    async function loadLeaderboard() {
        const container = document.getElementById('worldcup-leaderboard');
        if (!container) return;
        
        try {
            const response = await fetch('data/worldcup.json');
            if (!response.ok) throw new Error('Failed to load leaderboard');
            
            const data = await response.json();
            
            // Sort by points descending
            const sorted = data.sort((a, b) => b.points - a.points);
            
            // Display top 10
            const top10 = sorted.slice(0, 10);
            
            container.innerHTML = `
                <div class="leaderboard-header leaderboard-row">
                    <div class="rank"><strong>Rank</strong></div>
                    <div><strong>Hub</strong></div>
                    <div><strong>Points</strong></div>
                    <div><strong>Change</strong></div>
                </div>
                ${top10.map((entry, index) => `
                    <div class="leaderboard-row">
                        <div class="rank">${getRankEmoji(index + 1)} ${index + 1}</div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <img src="${entry.logo}" alt="${entry.name}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;" onerror="this.style.display='none'">
                                <div>
                                    <strong>${entry.name}</strong>
                                    <div style="font-size: 0.875rem; opacity: 0.7;">${entry.tagline}</div>
                                </div>
                            </div>
                        </div>
                        <div style="color: var(--color-gold); font-weight: 600;">${entry.points}</div>
                        <div>${getDeltaDisplay(entry.delta)}</div>
                    </div>
                `).join('')}
            `;
            
            console.log('✅ World Cup leaderboard loaded:', top10.length, 'entries');
            
        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);
            container.innerHTML = `
                <div class="error-state">
                    <p>Unable to load leaderboard data</p>
                    <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem;">Please try refreshing the page</p>
                </div>
            `;
        }
    }
    
    function getDeltaDisplay(delta) {
        if (delta > 0) {
            return `<span style="color: #4ade80;">▲ ${delta}</span>`;
        } else if (delta < 0) {
            return `<span style="color: #f87171;">▼ ${Math.abs(delta)}</span>`;
        } else {
            return `<span style="opacity: 0.5;">—</span>`;
        }
    }
    
    function getRankEmoji(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    }
    
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLeaderboard);
    } else {
        loadLeaderboard();
    }
})();
