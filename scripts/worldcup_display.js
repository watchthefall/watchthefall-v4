// =====================================================================
// WatchTheFall v4 - World Cup Leaderboard Display
// =====================================================================

(function() {
    'use strict';
    
    let currentMetric = 'points'; // 'points' or 'followers'
    let leaderboardData = [];
    
    async function loadLeaderboard() {
        const container = document.getElementById('worldcup-leaderboard');
        if (!container) return;
        
        try {
            const response = await fetch('data/worldcup.json');
            if (!response.ok) throw new Error('Failed to load leaderboard');
            
            const data = await response.json();
            leaderboardData = data.regions;
            
            renderLeaderboard();
            
            console.log('✅ World Cup leaderboard loaded:', leaderboardData.length, 'entries');
            
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
    
    function renderLeaderboard() {
        const container = document.getElementById('worldcup-leaderboard');
        if (!container || !leaderboardData.length) return;
        
        // Calculate followers and sort
        const enriched = leaderboardData.map(entry => {
            const totalFollowers = (entry.followers.tiktok || 0) + 
                                  (entry.followers.instagram || 0) + 
                                  (entry.followers.youtube || 0) + 
                                  (entry.followers.x || 0);
            return { ...entry, totalFollowers };
        });
        
        // Sort based on current metric
        const sorted = currentMetric === 'points'
            ? enriched.sort((a, b) => b.points - a.points)
            : enriched.sort((a, b) => b.totalFollowers - a.totalFollowers);
        
        // Display top 10
        const top10 = sorted.slice(0, 10);
        
        const metricLabel = currentMetric === 'points' ? 'Points' : 'Followers';
        
        container.innerHTML = `
            <div class="leaderboard-header leaderboard-row">
                <div class="rank"><strong>Rank</strong></div>
                <div><strong>Hub</strong></div>
                <div><strong>${metricLabel}</strong></div>
                <div><strong>Change</strong></div>
            </div>
            <div style="display: flex; justify-content: flex-end; padding: 0.5rem 1rem; gap: 0.5rem;">
                <label for="metric-toggle" style="opacity: 0.7; font-size: 0.875rem;">View:</label>
                <select id="metric-toggle" class="metric-selector">
                    <option value="points" ${currentMetric === 'points' ? 'selected' : ''}>Points</option>
                    <option value="followers" ${currentMetric === 'followers' ? 'selected' : ''}>Followers</option>
                </select>
            </div>
            ${top10.map((entry, index) => {
                const value = currentMetric === 'points' 
                    ? entry.points.toFixed(1)
                    : formatNumber(entry.totalFollowers);
                    
                // Calculate change (for now, show as delta from previous)
                const change = currentMetric === 'points'
                    ? calculatePointsChange(entry)
                    : calculateFollowersChange(entry);
                    
                return `
                    <div class="leaderboard-row">
                        <div class="rank">${getRankEmoji(index + 1)} ${index + 1}</div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <img src="${entry.logo}" alt="${entry.region}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;" onerror="this.style.display='none'">
                                <div>
                                    <strong>${entry.region}</strong>
                                    <div style="font-size: 0.875rem; opacity: 0.7;">${entry.tagline}</div>
                                </div>
                            </div>
                        </div>
                        <div style="color: var(--color-gold); font-weight: 600;">${value}</div>
                        <div>${getDeltaDisplay(change)}</div>
                    </div>
                `;
            }).join('')}
        `;
        
        // Attach change event to toggle
        const toggle = document.getElementById('metric-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                currentMetric = e.target.value;
                renderLeaderboard();
            });
        }
    }
    
    function calculatePointsChange(entry) {
        // Calculate change based on previous data (placeholder for now)
        return 0;
    }
    
    function calculateFollowersChange(entry) {
        const current = (entry.followers.tiktok || 0) + 
                       (entry.followers.instagram || 0) + 
                       (entry.followers.youtube || 0) + 
                       (entry.followers.x || 0);
        const previous = (entry.previous.tiktok || 0) + 
                        (entry.previous.instagram || 0) + 
                        (entry.previous.youtube || 0) + 
                        (entry.previous.x || 0);
        return current - previous;
    }
    
    function getDeltaDisplay(delta) {
        if (delta > 0) {
            return `<span style="color: #4ade80;">▲ ${formatNumber(delta)}</span>`;
        } else if (delta < 0) {
            return `<span style="color: #f87171;">▼ ${formatNumber(Math.abs(delta))}</span>`;
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
        // Round to avoid floating point precision issues
        const rounded = Math.round(num);
        if (rounded >= 1000000) {
            return (rounded / 1000000).toFixed(1) + 'M';
        }
        if (rounded >= 1000) {
            return (rounded / 1000).toFixed(1) + 'K';
        }
        return rounded.toString();
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLeaderboard);
    } else {
        loadLeaderboard();
    }
})();
