// =====================================================================
// WatchTheFall — Regional Social Links
// Reads data-region-id from <body>, fetches accounts.json,
// renders social buttons for confirmed non-null platforms.
// Retired accounts are hidden. No buttons rendered if no links exist.
// =====================================================================

(function () {
    'use strict';

    const PLATFORMS = [
        { key: 'instagram', label: 'Instagram', icon: '📸' },
        { key: 'tiktok',    label: 'TikTok',    icon: '📱' },
        { key: 'x',         label: 'X',          icon: '𝕏'  },
        { key: 'youtube',   label: 'YouTube',    icon: '▶'  },
    ];

    // Path from regional/pages/*.html to data/accounts.json
    const ACCOUNTS_URL = '../../data/accounts.json';

    async function renderSocialLinks() {
        const container = document.getElementById('regional-social-links');
        if (!container) return;

        const regionId = document.body.dataset.regionId;
        if (!regionId) {
            hideSocialSection(container);
            return;
        }

        try {
            const res = await fetch(ACCOUNTS_URL);
            if (!res.ok) throw new Error('accounts.json fetch failed');

            const data = await res.json();
            const account = (data.accounts || []).find(a => a.id === regionId);

            // Hide section if no account found or account is retired/planned with no links
            if (!account || account.status === 'retired') {
                hideSocialSection(container);
                return;
            }

            const buttons = PLATFORMS
                .filter(p => account[p.key + '_url'] && account[p.key])
                .map(p => {
                    const url    = account[p.key + '_url'];
                    const handle = account[p.key];
                    return `<a href="${url}"
                               class="regional-social-btn"
                               target="_blank"
                               rel="noopener noreferrer"
                               aria-label="${escapeHtml(account.display_name)} on ${p.label}">
                        <span class="regional-social-icon" aria-hidden="true">${p.icon}</span>
                        <span class="regional-social-text">
                            <span class="regional-social-platform">${p.label}</span>
                            <span class="regional-social-handle">${escapeHtml(handle)}</span>
                        </span>
                    </a>`;
                });

            if (buttons.length === 0) {
                hideSocialSection(container);
                return;
            }

            container.innerHTML = buttons.join('');

        } catch (err) {
            console.warn('[WTF] Could not load regional social links:', err);
            hideSocialSection(container);
        }
    }

    function hideSocialSection(container) {
        const section = container.closest('.regional-social');
        if (section) section.style.display = 'none';
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderSocialLinks);
    } else {
        renderSocialLinks();
    }
})();
