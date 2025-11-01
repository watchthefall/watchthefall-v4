// =====================================================================
// WatchTheFall v4.2.1 - Version Display Utility
// =====================================================================

(function() {
    'use strict';
    
    const VERSION = 'v4.2.1';
    const BUILD_DATE = '2025-11-01';
    
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
