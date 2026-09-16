/**
 * WTF Records — Music App
 * All releases: WatchTheFall / WTF Records.
 * No artist personas. Discovery via type, region, genre, mood.
 * v2.1 — September 2026
 */
(function () {
    'use strict';

    const DATA_URL = 'data/wtfrecords.json';
    const BRAND = 'WatchTheFall';
    const LABEL = 'WTF Records';

    // ── STATE ──────────────────────────────────────────────────
    let catalogue = [];
    let playlists = {};
    let queue = [];
    let queueIndex = -1;
    let activeFilter = 'all';   // all | originals | regional | + genre string
    let searchQuery = '';
    let audio = new Audio();
    let isPlaying = false;

    // ── LOAD ───────────────────────────────────────────────────
    async function loadData() {
        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error('Failed to load');
            return await res.json();
        } catch (e) {
            console.error('WTF Records:', e);
            return { tracks: [], playlists: {} };
        }
    }

    function fmtTime(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    // ── FILTER ─────────────────────────────────────────────────
    function filteredTracks() {
        return catalogue.filter(t => {
            let matchFilter = true;
            if (activeFilter === 'originals') matchFilter = t.type === 'original';
            else if (activeFilter === 'regional') matchFilter = t.type === 'regional';
            else if (activeFilter !== 'all') {
                // genre filter
                matchFilter = (t.genres || []).includes(activeFilter) ||
                              (t.moods || []).includes(activeFilter);
            }

            const q = searchQuery.toLowerCase();
            const matchSearch = !q
                || t.title.toLowerCase().includes(q)
                || (t.region || '').toLowerCase().includes(q)
                || (t.genres || []).some(g => g.toLowerCase().includes(q))
                || (t.moods || []).some(m => m.toLowerCase().includes(q));

            return matchFilter && matchSearch;
        });
    }

    // ── NAV TABS ───────────────────────────────────────────────
    // Collect distinct genres across catalogue for extra filter tabs
    function extraGenres() {
        const set = new Set();
        catalogue.forEach(t => (t.genres || []).forEach(g => {
            if (g !== 'anthem') set.add(g); // anthem covered by "regional"
        }));
        return Array.from(set).sort();
    }

    function renderNav() {
        const wrap = document.getElementById('rec-tag-filters');
        if (!wrap) return;

        const fixed = [
            { id: 'all', label: 'ALL' },
            { id: 'regional', label: 'REGIONAL' },
            { id: 'originals', label: 'ORIGINALS' },
        ];
        const genres = extraGenres().map(g => ({ id: g, label: g.toUpperCase() }));
        const tabs = [...fixed, ...genres];

        wrap.innerHTML = tabs.map(tab => `
            <button class="rec-tag-btn${tab.id === activeFilter ? ' active' : ''}" data-filter="${tab.id}">
                ${tab.label}
            </button>
        `).join('');

        wrap.querySelectorAll('.rec-tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.dataset.filter;
                renderNav();
                renderGrid();
            });
        });
    }

    // ── FEATURED ───────────────────────────────────────────────
    function renderFeatured() {
        const wrap = document.getElementById('rec-featured');
        if (!wrap) return;
        const track = catalogue.find(t => t.featured) || catalogue[0];
        if (!track) { wrap.innerHTML = ''; return; }

        const meta = [
            ...(track.genres || []),
            ...(track.moods || [])
        ].map(m => `<span class="rec-tag">${m.toUpperCase()}</span>`).join('');

        const canPlay = !!track.audio;
        const hasSuno = !!track.suno_url;

        wrap.innerHTML = `
            <div class="rec-featured-card" data-id="${track.id}">
                <img class="rec-featured-artwork"
                     src="${track.artwork || 'assets/logos/wtf-records-logo.png'}"
                     alt="${track.title}"
                     onerror="this.src='assets/logos/wtf-records-logo.png'">
                <div class="rec-featured-info">
                    <h2 class="rec-featured-title">${track.title}</h2>
                    <p class="rec-featured-artist">${BRAND} · ${LABEL}</p>
                    <div class="rec-featured-tags">${meta}</div>
                    <div class="rec-featured-actions">
                        ${canPlay
                            ? `<button class="rec-play-btn" data-id="${track.id}">▶ PLAY</button>`
                            : hasSuno
                                ? `<a href="${track.suno_url}" target="_blank" rel="noopener" class="rec-btn">▶ PLAY ON SUNO</a>`
                                : `<span class="rec-btn" style="opacity:.5;cursor:default">COMING SOON</span>`
                        }
                        ${track.release_status === 'available'
                            ? `<span class="rec-price-badge">49p</span>`
                            : ''}
                        ${hasSuno
                            ? `<a href="${track.suno_url}" class="rec-suno-link" target="_blank" rel="noopener">↗ Suno</a>`
                            : ''}
                    </div>
                    ${track.description
                        ? `<p style="margin-top:10px;font-size:.75rem;color:#888;line-height:1.5">${track.description}</p>`
                        : ''}
                </div>
            </div>
        `;

        wrap.querySelectorAll('.rec-play-btn[data-id]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                playTrackById(btn.dataset.id);
            });
        });
    }

    // ── GRID ───────────────────────────────────────────────────
    function renderGrid() {
        const grid = document.getElementById('rec-grid');
        if (!grid) return;
        const tracks = filteredTracks();

        if (tracks.length === 0) {
            grid.innerHTML = '<div class="rec-empty">No tracks found.</div>';
            return;
        }

        grid.innerHTML = tracks.map(t => {
            const available = t.release_status === 'available';
            const hasAudio = !!t.audio;
            const hasEmbed = !!t.embed_url;
            const hasSuno = !!t.suno_url;
            // A track is "playable" if it has local audio or a Suno embed
            const playable = hasAudio || hasEmbed;
            const playing = queue[queueIndex]?.id === t.id && isPlaying;
            const chips = [...(t.genres || []), ...(t.moods || [])]
                .slice(0, 2)
                .map(m => `<span class="rec-tag">${m.toUpperCase()}</span>`)
                .join('');
            const regionBadge = t.region
                ? `<span class="rec-tag" style="border-color:#333">${t.region.toUpperCase()}</span>`
                : '';

            const sunoLabel = hasEmbed && !hasAudio ? '<span style="font-size:.55rem;color:var(--rec-muted);letter-spacing:.05em">via Suno</span>' : '';
            return `
                <div class="rec-track-card${!available && !playable ? ' coming-soon' : ''}${playing ? ' playing' : ''}"
                     data-id="${t.id}"
                     data-available="${available}"
                     data-suno="${t.suno_url || ''}">
                    <div class="rec-track-artwork-wrap">
                        <img class="rec-track-artwork"
                             src="${t.artwork || 'assets/logos/wtf-records-logo.png'}"
                             alt="${t.title}"
                             onerror="this.src='assets/logos/wtf-records-logo.png'">
                        ${playable
                            ? '<div class="rec-track-overlay"><div class="rec-track-play-icon">▶</div></div>'
                            : ''}
                        ${!playable && !hasSuno
                            ? '<span class="rec-coming-soon-badge">Coming Soon</span>'
                            : ''}
                        ${playing
                            ? '<span class="rec-coming-soon-badge" style="background:var(--rec-accent);color:#fff;border-color:var(--rec-accent)">♪ Playing</span>'
                            : ''}
                    </div>
                    <div class="rec-track-body">
                        <p class="rec-track-title">${t.title}</p>
                        <p class="rec-track-artist">${BRAND}</p>
                        <div class="rec-track-footer">
                            <div class="rec-track-tags">${regionBadge}${chips}</div>
                            <span class="rec-track-price">${available ? '49p' : ''} ${sunoLabel}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.rec-track-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const track = catalogue.find(t => t.id === id);
                if (!track) return;
                if (track.audio || track.embed_url) {
                    playTrackById(id);
                } else if (track.suno_url) {
                    window.open(track.suno_url, '_blank', 'noopener');
                }
            });
        });
    }

    // ── PLAYLISTS ──────────────────────────────────────────────
    function renderPlaylists() {
        const wrap = document.getElementById('rec-playlists');
        if (!wrap) return;

        wrap.innerHTML = Object.entries(playlists).map(([key, pl]) => `
            <div class="rec-playlist-card" data-playlist="${key}">
                <div class="rec-playlist-icon">${pl.icon || '▶'}</div>
                <p class="rec-playlist-title">${pl.title}</p>
                <p class="rec-playlist-desc">${pl.description}</p>
                <span class="rec-playlist-count">${(pl.tracks || []).length} tracks</span>
            </div>
        `).join('');

        wrap.querySelectorAll('.rec-playlist-card').forEach(card => {
            card.addEventListener('click', () => {
                const pl = playlists[card.dataset.playlist];
                if (!pl) return;
                const tracks = (pl.tracks || [])
                    .map(id => catalogue.find(t => t.id === id))
                    .filter(t => t && t.audio);
                if (tracks.length === 0) return;
                queue = tracks;
                queueIndex = 0;
                playFromQueue();
            });
        });
    }

    // ── EMBED PANEL ────────────────────────────────────────────
    function showEmbedPanel(track) {
        let panel = document.getElementById('wtf-embed-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'wtf-embed-panel';
            panel.style.cssText = `
                position:fixed; bottom:0; left:0; right:0; z-index:10000;
                background:#0d0d0d; border-top:1px solid #222;
                display:flex; flex-direction:column;
            `;
            document.body.appendChild(panel);
        }

        panel.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #222;">
                <span style="font-family:'Courier New',monospace;font-size:0.7rem;letter-spacing:0.1em;color:#888;text-transform:uppercase;">
                    ${track.title} — WatchTheFall
                </span>
                <button onclick="document.getElementById('wtf-embed-panel').remove()"
                        style="background:none;border:none;color:#888;cursor:pointer;font-size:1.1rem;padding:0 4px;">✕</button>
            </div>
            <iframe
                src="${track.embed_url}"
                width="100%" height="152"
                style="border:none;display:block;"
                allow="autoplay"
                loading="lazy">
            </iframe>
        `;

        // Update player bar to show track info (non-interactive for embed tracks)
        const player = document.getElementById('wtf-player');
        if (player) {
            player.classList.remove('active'); // hide native player bar while embed is open
        }
    }

    // ── PLAYER ─────────────────────────────────────────────────
    function playTrackById(id) {
        const track = catalogue.find(t => t.id === id);
        if (!track) return;

        // If track has local audio, use native player
        if (track.audio) {
            const playable = filteredTracks().filter(t => t.audio);
            const idx = playable.findIndex(t => t.id === id);
            queue = playable;
            queueIndex = idx >= 0 ? idx : 0;
            // Remove embed panel if open
            document.getElementById('wtf-embed-panel')?.remove();
            playFromQueue();
            return;
        }

        // If track has embed_url, show Suno embed panel
        if (track.embed_url) {
            audio.pause();
            isPlaying = false;
            showEmbedPanel(track);
            renderGrid();
            return;
        }

        // Fallback: open Suno in new tab
        if (track.suno_url) {
            window.open(track.suno_url, '_blank', 'noopener');
        }
    }

    function playFromQueue() {
        if (!queue.length || queueIndex < 0) return;
        const track = queue[queueIndex];
        if (!track?.audio) return;
        audio.pause();
        audio.src = track.audio;
        audio.load();
        audio.play().catch(e => console.warn('Audio:', e));
        isPlaying = true;
        updatePlayerUI(track);
        renderGrid();
    }

    function updatePlayerUI(track) {
        const player = document.getElementById('wtf-player');
        if (!player) return;
        player.classList.add('active');

        const get = id => document.getElementById(id);
        const art = get('player-artwork');
        const title = get('player-title');
        const artist = get('player-artist');
        const ppBtn = get('player-playpause');
        const sunoLink = get('player-suno-link');

        if (art) art.src = track.artwork || 'assets/logos/wtf-records-logo.png';
        if (title) title.textContent = track.title;
        if (artist) artist.textContent = BRAND;
        if (ppBtn) ppBtn.textContent = '⏸';
        if (sunoLink) {
            if (track.suno_url) {
                sunoLink.href = track.suno_url;
                sunoLink.style.display = 'inline-flex';
            } else {
                sunoLink.style.display = 'none';
            }
        }
        document.title = `▶ ${track.title} — ${LABEL}`;
    }

    function setupPlayerControls() {
        const get = id => document.getElementById(id);

        get('player-playpause')?.addEventListener('click', () => {
            if (audio.paused) { audio.play(); isPlaying = true; }
            else { audio.pause(); isPlaying = false; }
        });

        get('player-prev')?.addEventListener('click', () => {
            if (queueIndex > 0) { queueIndex--; playFromQueue(); }
        });

        get('player-next')?.addEventListener('click', () => {
            if (queueIndex < queue.length - 1) { queueIndex++; playFromQueue(); }
        });

        get('player-progress-bar')?.addEventListener('click', e => {
            const bar = get('player-progress-bar');
            const rect = bar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = pct * audio.duration;
        });

        audio.addEventListener('timeupdate', () => {
            const elapsed = get('player-elapsed');
            const fill = get('player-progress-fill');
            if (elapsed) elapsed.textContent = fmtTime(audio.currentTime);
            if (fill && audio.duration) {
                fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            const dur = get('player-duration');
            if (dur) dur.textContent = fmtTime(audio.duration);
        });

        audio.addEventListener('play', () => {
            const btn = get('player-playpause');
            if (btn) btn.textContent = '⏸';
            isPlaying = true;
        });

        audio.addEventListener('pause', () => {
            const btn = get('player-playpause');
            if (btn) btn.textContent = '▶';
            isPlaying = false;
        });

        audio.addEventListener('ended', () => {
            if (queueIndex < queue.length - 1) {
                queueIndex++;
                playFromQueue();
            } else {
                isPlaying = false;
                document.title = `${LABEL} — Music for a world on fire`;
            }
        });
    }

    function setupRadio() {
        document.getElementById('btn-wtf-radio')?.addEventListener('click', () => {
            const playable = catalogue.filter(t => t.audio);
            if (!playable.length) return;
            queue = [...playable].sort(() => Math.random() - 0.5);
            queueIndex = 0;
            playFromQueue();
        });
    }

    function setupSearch() {
        let debounce;
        document.getElementById('rec-search')?.addEventListener('input', e => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                searchQuery = e.target.value.trim();
                renderGrid();
            }, 200);
        });
    }

    // ── INIT ───────────────────────────────────────────────────
    async function init() {
        const data = await loadData();
        catalogue = data.tracks || [];
        playlists = data.playlists || {};

        renderFeatured();
        renderNav();
        renderGrid();
        renderPlaylists();
        setupPlayerControls();
        setupRadio();
        setupSearch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
