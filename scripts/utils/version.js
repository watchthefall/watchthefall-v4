// =====================================================================
// WatchTheFall v4.5.0 - Version Display Utility
// =====================================================================

(function() {
    'use strict';
    
    const VERSION = 'v4.5.1';
    const BUILD_DATE = '2025-11-02';
    
    function displayVersion() {
        const versionElement = document.getElementById('version-info');
        if (versionElement) {
            versionElement.textContent = `${VERSION} • Built ${BUILD_DATE}`;
        }
    }
    
    // Display version when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', displayVersion);
    } else {
        displayVersion();
    }
    
    // Expose version to global scope
    window.WTF_VERSION = VERSION;
    
    console.log(`🚀 WatchTheFall ${VERSION} loaded`);
})();

// =====================================================================
// Shared Regional Stats Loader
// =====================================================================

(function() {
    'use strict';

    // Ensure global namespace
    window.WTF = window.WTF || {};

    // Shared stats loader for regional pages
    window.WTF.loadRegionStats = async function(regionKey, options = {}) {
        const {
            totalFollowersId = 'total-followers-stat',
            growthId = 'growth-stat',
            weeklyContentId = 'weekly-content-stat',
            growthBase = 900,
            weeklyContentBase = 25,
            growthVariance = 800,
            contentVariance = 10
        } = options;

        const formatCompact = (n) => {
            const v = Number(n || 0);
            if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
            if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
            return v.toString();
        };

        try {
            const url = window.location.pathname.includes('/regional/') ? '../../data/worldcup.json' : 'data/worldcup.json';
            const res = await fetch(url, { cache: 'no-store' });
            const json = await res.json();
            const regions = Array.isArray(json) ? json : (Array.isArray(json.regions) ? json.regions : []);
            const hub = regions.find(e => e.region === regionKey);

            if (hub) {
                const totalFollowers =
                    Number(hub.followers?.tiktok || 0) +
                    Number(hub.followers?.instagram || 0);

                const totalEl = document.getElementById(totalFollowersId);
                if (totalEl) totalEl.textContent = formatCompact(totalFollowers);
            }

            // Growth
            const variance = Math.floor(Math.random() * growthVariance) - Math.floor(growthVariance / 2);
            const weeklyGrowth = Math.max(0, growthBase + variance);
            const growthEl = document.getElementById(growthId);
            if (growthEl) {
                growthEl.textContent = '+' + (weeklyGrowth >= 1000 ? (weeklyGrowth / 1000).toFixed(1) + 'K' : weeklyGrowth);
            }

            // Weekly content
            const contentVar = Math.floor(Math.random() * contentVariance) - Math.floor(contentVariance / 2);
            const weeklyContent = Math.max(0, weeklyContentBase + contentVar);
            const contentEl = document.getElementById(weeklyContentId);
            if (contentEl) contentEl.textContent = weeklyContent + '+';

        } catch (err) {
            const totalEl = document.getElementById(totalFollowersId);
            if (totalEl) totalEl.textContent = '0';
            console.error('Failed to load region stats:', err);
        }
    };
})();
