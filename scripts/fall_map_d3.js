/**
 * WatchTheFall D3 Geographic Map — fall_map_d3.js
 * Uses D3 v7 + TopoJSON. Natural Earth projection. Zoom-invariant node markers.
 * Cluster zoom for geographically tight groups. Mobile touch support via D3 zoom.
 */
(function () {
    'use strict';

    /* ── Config ─────────────────────────────────────────────────── */
    const DATA_URL  = 'data/fall_map_d3.json';
    const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    const ZOOM_MIN  = 1;
    const ZOOM_MAX  = 14;

    // Node radius by role
    function nodeR(d) {
        if (d.isClusterParent) return 22;
        if (d.status === 'live') return 19;
        return 16;
    }

    /* ── State ───────────────────────────────────────────────────── */
    let nodes    = [];
    let clusters = [];
    let selected = null;
    let currentK = 1;

    /* ── DOM ─────────────────────────────────────────────────────── */
    const container = document.getElementById('wtf-d3-container');
    const panel     = document.getElementById('wtf-d3-panel');
    const countEl   = document.getElementById('wtf-d3-count');
    if (!container || !panel) return;

    /* ── Dimensions (fixed viewBox — SVG scales via CSS) ─────────── */
    const VW = 960;
    const VH = 520;

    /* ── SVG skeleton ────────────────────────────────────────────── */
    const svg = d3.select(container).append('svg')
        .attr('viewBox', `0 0 ${VW} ${VH}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('class', 'wtf-d3-svg')
        .attr('role', 'img')
        .attr('aria-label', 'WatchTheFall Interactive Network Map');

    const defs = svg.append('defs');

    // Ocean background
    svg.append('rect')
        .attr('width', VW).attr('height', VH)
        .attr('class', 'wtf-ocean');

    // Shared circular clip (objectBoundingBox — always a perfect circle on any image size)
    defs.append('clipPath')
        .attr('id', 'wtf-logo-clip')
        .attr('clipPathUnits', 'objectBoundingBox')
        .append('circle')
        .attr('cx', 0.5).attr('cy', 0.5).attr('r', 0.5);

    // Filter: glow for active nodes
    const glow = defs.append('filter').attr('id', 'wtf-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 4).attr('result', 'blur');
    glow.append('feMerge').selectAll('feMergeNode')
        .data(['blur', 'SourceGraphic']).join('feMergeNode')
        .attr('in', d => d);

    // Groups — order matters for z-index
    const mapGroup  = svg.append('g').attr('class', 'wtf-map-group');
    const nodeGroup = svg.append('g').attr('class', 'wtf-node-group');

    /* ── Projection ──────────────────────────────────────────────── */
    const projection = d3.geoNaturalEarth1()
        .scale(VW / 1.95 / Math.PI)
        .translate([VW / 2, VH / 2]);

    const pathGen = d3.geoPath().projection(projection);

    function project(d) {
        return projection([d.lng, d.lat]);
    }

    /* ── Zoom ────────────────────────────────────────────────────── */
    const zoomBehavior = d3.zoom()
        .scaleExtent([ZOOM_MIN, ZOOM_MAX])
        .on('zoom', onZoom);

    function onZoom(event) {
        const t = event.transform;
        currentK = t.k;
        mapGroup.attr('transform', t);
        repositionNodes(t);
    }

    function repositionNodes(t) {
        nodeGroup.selectAll('.wtf-node')
            .attr('transform', d => {
                const [x, y] = project(d);
                return `translate(${t.x + t.k * x},${t.y + t.k * y}) scale(${1 / t.k})`;
            });
    }

    svg.call(zoomBehavior);

    // Click on map background = deselect
    svg.on('click', (event) => {
        if (event.target === svg.node() || event.target.classList.contains('country') ||
            event.target.classList.contains('wtf-ocean') || event.target.classList.contains('map-sphere')) {
            deselect();
        }
    });

    /* ── Zoom to cluster (geographic) ────────────────────────────── */
    function zoomToNodes(targetNodes) {
        if (!targetNodes || targetNodes.length < 2) return;
        const pts = targetNodes.map(project);
        const xs  = pts.map(p => p[0]);
        const ys  = pts.map(p => p[1]);

        const pad = 60; // px padding in viewBox space
        const x0 = Math.min(...xs) - pad;
        const x1 = Math.max(...xs) + pad;
        const y0 = Math.min(...ys) - pad;
        const y1 = Math.max(...ys) + pad;

        const k = Math.min(
            VW / (x1 - x0),
            VH / (y1 - y0),
            ZOOM_MAX
        ) * 0.88;

        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;

        svg.transition().duration(750).ease(d3.easeCubicInOut).call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(VW / 2, VH / 2).scale(k).translate(-cx, -cy)
        );
    }

    function resetZoom() {
        svg.transition().duration(600).ease(d3.easeCubicInOut)
            .call(zoomBehavior.transform, d3.zoomIdentity);
    }

    /* ── World rendering ─────────────────────────────────────────── */
    function renderWorld(worldRaw) {
        const countries = topojson.feature(worldRaw, worldRaw.objects.countries);
        const borders   = topojson.mesh(worldRaw, worldRaw.objects.countries, (a, b) => a !== b);
        const outline   = topojson.mesh(worldRaw, worldRaw.objects.countries, (a, b) => a === b);

        // Sphere outline (gives a subtle edge glow)
        mapGroup.append('path')
            .datum({ type: 'Sphere' })
            .attr('class', 'map-sphere')
            .attr('d', pathGen);

        // Graticule (subtle grid)
        mapGroup.append('path')
            .datum(d3.geoGraticule().step([30, 30])())
            .attr('class', 'map-graticule')
            .attr('d', pathGen);

        // Country fills
        mapGroup.selectAll('path.country')
            .data(countries.features)
            .join('path')
            .attr('class', 'country')
            .attr('d', pathGen);

        // Internal borders
        mapGroup.append('path')
            .datum(borders)
            .attr('class', 'map-borders')
            .attr('d', pathGen);

        // Outer coastline
        mapGroup.append('path')
            .datum(outline)
            .attr('class', 'map-outline')
            .attr('d', pathGen);
    }

    /* ── Node rendering ──────────────────────────────────────────── */
    function renderNodes() {
        const nodeEls = nodeGroup.selectAll('.wtf-node')
            .data(nodes)
            .join('g')
            .attr('class', d => [
                'wtf-node',
                `status-${d.status}`,
                d.isClusterParent ? 'is-cluster-parent' : '',
                d.status === 'live' ? 'is-live' : ''
            ].filter(Boolean).join(' '))
            .attr('data-id', d => d.id)
            .attr('transform', d => {
                const [x, y] = project(d);
                return `translate(${x},${y})`;
            })
            .attr('tabindex', 0)
            .attr('role', 'button')
            .attr('aria-label', d => `${d.label} — ${d.philosophyTitle}`)
            .on('click', (event, d) => { event.stopPropagation(); handleNodeClick(d); })
            .on('keydown', (event, d) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleNodeClick(d);
                }
            });

        // Shadow / glow base
        nodeEls.append('circle')
            .attr('class', 'node-shadow')
            .attr('r', d => nodeR(d) + 6);

        // Dark background disc
        nodeEls.append('circle')
            .attr('class', 'node-bg')
            .attr('r', d => nodeR(d));

        // Logo image (if available)
        nodeEls.filter(d => d.logo)
            .append('image')
            .attr('class', 'node-logo')
            .attr('href', d => d.logo)
            .attr('x', d => -nodeR(d))
            .attr('y', d => -nodeR(d))
            .attr('width',  d => nodeR(d) * 2)
            .attr('height', d => nodeR(d) * 2)
            .attr('clip-path', 'url(#wtf-logo-clip)')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Initials fallback (no logo, or logo fails)
        nodeEls.filter(d => !d.logo)
            .append('text')
            .attr('class', 'node-initials')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(d => d.initials || d.id.slice(0, 3).toUpperCase());

        // Border ring — solid for live/cluster-parent, dashed for coming-soon
        nodeEls.append('circle')
            .attr('class', 'node-ring')
            .attr('r', d => nodeR(d));

        // Outer pulse ring for live nodes only
        nodeEls.filter(d => d.status === 'live')
            .append('circle')
            .attr('class', 'node-pulse')
            .attr('r', d => nodeR(d) + 4);

        // Label text
        nodeEls.append('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('y', d => nodeR(d) + 13)
            .text(d => d.clusterLabel || d.label);
    }

    /* ── Node interaction ────────────────────────────────────────── */
    function handleNodeClick(node) {
        deselect(false);
        selected = node;

        nodeGroup.selectAll('.wtf-node')
            .classed('is-selected', d => d.id === node.id)
            .classed('is-dimmed',   d => d.id !== node.id);

        // Geographic cluster zoom
        if (node.isClusterParent) {
            const cluster = clusters.find(c => c.id === node.clusterId);
            if (cluster && cluster.canZoom) {
                const members = nodes.filter(n => cluster.memberIds.includes(n.id));
                zoomToNodes(members);
            }
        }

        renderPanel(node);
    }

    function deselect(updatePanel = true) {
        selected = null;
        nodeGroup.selectAll('.wtf-node')
            .classed('is-selected', false)
            .classed('is-dimmed', false);
        if (updatePanel) renderPanel(null);
    }

    /* ── Panel rendering ─────────────────────────────────────────── */
    function esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function fmtNum(n) {
        if (!n) return '0';
        return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
    }

    function actionBtn(url, label, disabledLabel) {
        return url
            ? `<a class="btn btn-primary" href="${esc(url)}">${label}</a>`
            : `<span class="btn btn-secondary disabled" aria-disabled="true">${disabledLabel}</span>`;
    }

    function renderPanel(node) {
        if (!node) {
            panel.innerHTML = `
                <div class="wtf-d3-empty">
                    <p class="fall-map-panel-kicker">Fall Map v2</p>
                    <h2>Select a node</h2>
                    <p>Tap any region, country, or theme to open its profile. Pinch or scroll to zoom.</p>
                </div>`;
            return;
        }

        const cluster = node.clusterId ? clusters.find(c => c.id === node.clusterId) : null;
        const members = cluster
            ? nodes.filter(n => cluster.memberIds.includes(n.id))
            : [];

        const ig = node.followers?.instagram ?? 0;
        const tt = node.followers?.tiktok    ?? 0;
        const followersHtml = (ig || tt) ? `
            <div class="wtf-d3-followers">
                ${ig ? `<span class="wtf-d3-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> ${fmtNum(ig)}</span>` : ''}
                ${tt ? `<span class="wtf-d3-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/></svg> ${fmtNum(tt)}</span>` : ''}
            </div>` : '';

        const statusText = node.status === 'live' ? 'Live' : 'Coming Soon';

        const clusterHtml = members.length > 1 ? `
            <div class="fall-map-cluster">
                <h3>${esc(cluster.label)}</h3>
                <div class="fall-map-cluster-grid">
                    ${members.map(m => `
                        <button type="button"
                            class="fall-map-cluster-card ${m.id === node.id ? 'active' : ''}"
                            data-node-id="${esc(m.id)}">
                            <span class="fall-map-cluster-name">${esc(m.label)}</span>
                            <span class="fall-map-cluster-status">${m.status === 'live' ? 'Live' : 'Soon'}</span>
                        </button>`).join('')}
                </div>
            </div>` : '';

        panel.innerHTML = `
            <p class="fall-map-panel-kicker">${esc(cluster ? cluster.label : node.label)}</p>
            <h2>${esc(node.philosophyTitle)}</h2>
            <div class="fall-map-meta">
                <span class="fall-map-pill">${esc(node.clusterId || 'global')}</span>
                <span class="fall-map-pill">${statusText}</span>
            </div>
            <p class="fall-map-thesis">${esc(node.thesis)}</p>
            ${followersHtml}
            <div class="fall-map-actions">
                ${actionBtn(node.philosophyUrl, 'Read Philosophy', 'Philosophy Coming Soon')}
                ${actionBtn(node.pageUrl,       'View Page',       'Page Coming Soon')}
            </div>
            ${clusterHtml}
            <button class="wtf-d3-back-btn" type="button">← World View</button>
        `;

        panel.querySelectorAll('.fall-map-cluster-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const n = nodes.find(x => x.id === btn.dataset.nodeId);
                if (n) handleNodeClick(n);
            });
        });

        panel.querySelector('.wtf-d3-back-btn')?.addEventListener('click', () => {
            resetZoom();
            deselect();
        });
    }

    /* ── Zoom control buttons ────────────────────────────────────── */
    function addZoomControls() {
        const ctrl = document.createElement('div');
        ctrl.className = 'wtf-d3-zoom-ctrl';
        ctrl.innerHTML = `
            <button type="button" class="wtf-d3-zoom-btn" id="wtf-zoom-in"  aria-label="Zoom in">+</button>
            <button type="button" class="wtf-d3-zoom-btn" id="wtf-zoom-out" aria-label="Zoom out">−</button>
            <button type="button" class="wtf-d3-zoom-btn" id="wtf-zoom-rst" aria-label="Reset zoom" title="Reset">⊙</button>
        `;
        container.style.position = 'relative';
        container.appendChild(ctrl);

        document.getElementById('wtf-zoom-in') ?.addEventListener('click', () => {
            svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.6);
        });
        document.getElementById('wtf-zoom-out')?.addEventListener('click', () => {
            svg.transition().duration(300).call(zoomBehavior.scaleBy, 1 / 1.6);
        });
        document.getElementById('wtf-zoom-rst')?.addEventListener('click', () => {
            resetZoom();
            deselect();
        });
    }

    /* ── Node count ──────────────────────────────────────────────── */
    function updateCount() {
        if (!countEl) return;
        const live    = nodes.filter(n => n.status === 'live').length;
        const planned = nodes.filter(n => n.status === 'coming-soon').length;
        countEl.textContent = `${live} live · ${planned} coming soon`;
    }

    /* ── Init ────────────────────────────────────────────────────── */
    async function init() {
        renderPanel(null);

        try {
            const [worldRaw, mapData] = await Promise.all([
                d3.json(WORLD_URL),
                d3.json(DATA_URL, { cache: 'no-store' })
            ]);

            nodes    = mapData.nodes    || [];
            clusters = mapData.clusters || [];

            renderWorld(worldRaw);
            renderNodes();
            repositionNodes(d3.zoomIdentity);
            updateCount();
            addZoomControls();

        } catch (err) {
            console.error('[WTF D3 Map]', err);
            panel.innerHTML = `
                <div class="wtf-d3-empty">
                    <h2>Map unavailable</h2>
                    <p>Could not load geographic data. Check network connection.</p>
                    <small>${esc(err.message)}</small>
                </div>`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
