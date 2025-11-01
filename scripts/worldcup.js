// =====================================================================
// WatchTheFall v4.2 - World Cup Interactive Leaderboard
// Full-featured leaderboard with filtering, sorting, and stats
// =====================================================================

(function() {
    'use strict';
    
    let worldCupData = [];
    let currentFilter = 'all';
    let currentSort = 'score';
    
    async function initWorldCup() {
        try {
            const response = await fetch('data/worldcup.json');
            if (!response.ok) throw new Error('Failed to load World Cup data');
            
            worldCupData = await response.json();
            
            displayLeaderboard();
            setupFilters();
            updateStats();
            
            console.log('✅ World Cup initialized:', worldCupData.length, 'creators');
            
        } catch (error) {
            console.error('❌ World Cup initialization failed:', error);
            showError();
        }
    }
    
    function displayLeaderboard() {
        const container = document.getElementById('worldcup-leaderboard');
        if (!container) return;
        
        let filteredData = filterData(worldCupData);
        filteredData = sortData(filteredData);
        
        container.innerHTML = `
            <div class="leaderboard-header">
                <div class="leaderboard-controls">
                    <select id="region-filter" class="filter-select">
                        <option value="all">All Regions</option>
                        <option value="Global">Global</option>
                        <option value="North America">North America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia-Pacific">Asia-Pacific</option>
                        <option value="Global South">Global South</option>
                    </select>
                    <select id="sort-select" class="filter-select">
                        <option value="score">Sort by Score</option>
                        <option value="followers">Sort by Followers</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </div>
            <div class="leaderboard-table">
                <div class="leaderboard-row leaderboard-row-header">
                    <div class="rank"><strong>Rank</strong></div>
                    <div><strong>Creator</strong></div>
                    <div><strong>Followers</strong></div>
                    <div><strong>Score</strong></div>
                </div>
                ${filteredData.map((entry, index) => `
                    <div class="leaderboard-row" data-rank="${index + 1}">
                        <div class="rank">${getRankBadge(index + 1)} ${index + 1}</div>
                        <div class="creator-info">
                            <strong>${entry.name}</strong>
                            <div class="creator-meta">
                                <span class="region-badge">${entry.region || 'Global'}</span>
                                <span class="platform-badge">${entry.platform || 'TikTok'}</span>
                            </div>
                        </div>
                        <div class="followers">${formatNumber(entry.followers)}</div>
                        <div class="score">${formatNumber(entry.score)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    function setupFilters() {
        const regionFilter = document.getElementById('region-filter');
        const sortSelect = document.getElementById('sort-select');
        
        if (regionFilter) {
            regionFilter.value = currentFilter;
            regionFilter.addEventListener('change', (e) => {
                currentFilter = e.target.value;
                displayLeaderboard();
            });
        }
        
        if (sortSelect) {
            sortSelect.value = currentSort;
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                displayLeaderboard();
            });
        }
    }
    
    function filterData(data) {
        if (currentFilter === 'all') return data;
        return data.filter(entry => entry.region === currentFilter);
    }
    
    function sortData(data) {
        const sorted = [...data];
        
        switch(currentSort) {
            case 'score':
                sorted.sort((a, b) => b.score - a.score);
                break;
            case 'followers':
                sorted.sort((a, b) => b.followers - a.followers);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        return sorted;
    }
    
    function updateStats() {
        const statsContainer = document.getElementById('worldcup-stats');
        if (!statsContainer || worldCupData.length === 0) return;
        
        const totalCreators = worldCupData.length;
        const totalFollowers = worldCupData.reduce((sum, entry) => sum + entry.followers, 0);
        const avgScore = worldCupData.reduce((sum, entry) => sum + entry.score, 0) / totalCreators;
        
        statsContainer.innerHTML = `
            <div class="stat-card card">
                <h3>Total Creators</h3>
                <div class="stat-value">${totalCreators}</div>
            </div>
            <div class="stat-card card">
                <h3>Combined Reach</h3>
                <div class="stat-value">${formatNumber(totalFollowers)}</div>
            </div>
            <div class="stat-card card">
                <h3>Average Score</h3>
                <div class="stat-value">${Math.round(avgScore)}</div>
            </div>
        `;
    }
    
    function getRankBadge(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '⭐';
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
    
    function showError() {
        const container = document.getElementById('worldcup-leaderboard');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <p>Unable to load World Cup leaderboard</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
    
    // Expose globally for external use
    window.WTF_WorldCup = {
        init: initWorldCup,
        refresh: displayLeaderboard
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWorldCup);
    } else {
        initWorldCup();
    }
})();
