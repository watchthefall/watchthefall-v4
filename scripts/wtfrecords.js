(function() {
    'use strict';

    const DATA_URL = 'data/wtfrecords.json';
    let ageVerified = sessionStorage.getItem('wtf_age_verified') === 'true';

    function getFallback() {
        return {
            artists: {
                jamai_g: { name: 'JamAi G', bio: 'AI-bent lyricism.', tracks: [] },
                elaira: { name: 'Elaira Valesis', bio: 'Ethereal resistance.', tracks: [] },
                skyea: { name: 'Skyea Caelix', bio: 'Starborne echoes.', tracks: [] },
                watchthefall: { name: 'WatchTheFall', bio: 'Anthems of collapse.', tracks: [] }
            },
            tracks: {},
            listen: { spotify: "#", youtube: "#", suno: "https://suno.com/@wtfrecords" }
        };
    }

    async function loadData() {
        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error('Failed to load records data');
            return res.json();
        } catch (e) {
            console.error('❌ Records data error:', e);
            return getFallback();
        }
    }

    function showAgeGate(callback) {
        const modal = document.getElementById('age-gate-modal');
        const yesBtn = document.getElementById('age-confirm-yes');
        const noBtn = document.getElementById('age-confirm-no');
        
        modal.setAttribute('aria-hidden', 'false');
        
        yesBtn.onclick = () => {
            ageVerified = true;
            sessionStorage.setItem('wtf_age_verified', 'true');
            modal.setAttribute('aria-hidden', 'true');
            callback();
        };
        
        noBtn.onclick = () => {
            modal.setAttribute('aria-hidden', 'true');
            alert('Age-restricted content will remain hidden.');
        };
    }

    function renderReleases(data) {
        const grid = document.getElementById('records-releases');
        if (!grid) return;
        const tracks = Object.entries(data.tracks || {});
        
        if (tracks.length === 0) {
            grid.innerHTML = '<p style="opacity:.7">No releases yet. Add tracks to data/wtfrecords.json.</p>';
            return;
        }

        grid.innerHTML = tracks.map(([id, t]) => {
            const isRestricted = t.age_restricted === true;
            const canShow = !isRestricted || ageVerified;

            if (isRestricted && !ageVerified) {
                return `
                    <div class="record-card age-restricted" data-track-id="${id}">
                        <div class="record-info">
                            <h3 class="record-title">${t.title || 'Untitled'} <span style="opacity:0.6;font-size:0.85rem;">(18+)</span></h3>
                            <p class="record-desc" style="opacity:0.7;">Age-restricted content. Verify to view.</p>
                            <button class="btn btn-primary age-verify-btn" data-track-id="${id}">Verify Age (18+)</button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="record-card" data-track-id="${id}">
                    <div class="record-info">
                        <h3 class="record-title">${t.title || 'Untitled'}</h3>
                        ${t.description ? `<p class="record-desc">${t.description}</p>` : ''}
                        <div class="record-actions">
                            ${t.suno_url ? `<a href="${t.suno_url}" class="btn btn-secondary" target="_blank" rel="noopener">Play on Suno</a>` : ''}
                            ${t.download_mp3 ? `<a href="${t.download_mp3}" class="btn btn-primary" download>Download MP3</a>` : ''}
                        </div>
                    </div>
                    ${t.embed_html ? `<div class="record-embed">${t.embed_html}</div>` : ''}
                </div>
            `;
        }).join('');

        // Attach age gate listeners
        grid.querySelectorAll('.age-verify-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showAgeGate(() => renderReleases(data));
            });
        });
    }

    function renderArtists(data) {
        const grid = document.getElementById('artist-universe');
        if (!grid) return;
        const artists = data.artists || {};
        grid.innerHTML = Object.entries(artists).map(([key, a]) => {
            const trackItems = (a.tracks || [])
                .map(id => data.tracks?.[id])
                .filter(Boolean)
                .map(t => `<li>${t.title || 'Untitled'}</li>`)
                .join('');
            return `
                <div class="artist-card">
                    <div class="artist-portrait"></div>
                    <div class="artist-info">
                        <h3 class="artist-name">${a.name || key}</h3>
                        ${a.bio ? `<p class="artist-bio">${a.bio}</p>` : ''}
                        <ul class="artist-tracks">${trackItems}</ul>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderListen(data) {
        const row = document.getElementById('listen-everywhere');
        if (!row) return;
        const l = data.listen || {};
        row.innerHTML = `
            <a class="listen-btn btn" href="${l.spotify || '#'}" target="_blank" rel="noopener">Spotify</a>
            <a class="listen-btn btn" href="${l.youtube || '#'}" target="_blank" rel="noopener">YouTube</a>
            <a class="listen-btn btn" href="${l.suno || 'https://suno.com/@wtfrecords'}" target="_blank" rel="noopener">Suno</a>
        `;
    }

    function initForm() {
        const form = document.getElementById('records-email-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]')?.value || '';
            if (!email) return;
            alert('Thanks! We will be in touch.');
            form.reset();
        });
    }

    async function init() {
        const data = await loadData();
        renderReleases(data);
        renderArtists(data);
        renderListen(data);
        initForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
