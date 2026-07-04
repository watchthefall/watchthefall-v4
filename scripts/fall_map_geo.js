/* ============================================================
   Fall Map — Geographic Prototype (Phase 1)
   scripts/fall_map_geo.js

   Stack: D3 v7 (CDN) + topojson-client v3 (CDN)
   Projection: d3.geoNaturalEarth1()
   Data: data/world-110m.json + data/fall_map.json
   ============================================================ */

(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────
    const GEO_URL  = 'data/world-110m.json';
    const NODE_URL = 'data/fall_map.json';

    // Cluster nodes shown in world view
    const TOP_LEVEL_IDS = ['britain', 'europe', 'the-west', 'ai', 'antarctica'];

    // System cluster: no geographic drill-down
    const SYSTEM_ID = 'antarctica';

    // ISO 3166-1 numeric codes for WTF-relevant countries
    // Used to give those paths a brighter stroke in the base map
    const WTF_CODES = new Set([
        826,  // United Kingdom (covers GB)
        372,  // Ireland
        250,  // France
        276,  // Germany
        528,  // Netherlands
        616,  // Poland
        724,  // Spain
        380,  // Italy
        752,  // Sweden
        840,  // United States
        124,  // Canada
        36    // Australia
    ]);

    const VIEW_NAMES = {
        world:      'World View',
        britain:    'Britain',
        europe:     'Europe',
        'the-west': 'The West',
        ai:         'AI & Tech',
        antarctica: 'Global / System'
    };

    // ── State ─────────────────────────────────────────────────
    let allNodes        = [];
    let currentView     = 'world';
    let activeNodeId    = null;
    let activeClusterId = null;
    let currentXform    = d3.zoomIdentity;

    // ── DOM ───────────────────────────────────────────────────
    const stageEl     = document.getElementById('geo-stage');
    const panelEl     = document.getElementById('geo-panel');
    const viewLabelEl = document.getElementById('geo-view-label');
    const stageCardEl = document.querySelector('.geo-stage-card');

    // ── D3 ────────────────────────────────────────────────────
    let projection, pathGen, zoomBehavior;
    let svg, mapGroup, nodeGroup;
    let stageW, stageH;

    // Stored so resize can re-render paths
    let _worldData = null;

    // ── Helpers ───────────────────────────────────────────────
    function findNode(id) {
        return allNodes.find(n => n.id === id) || null;
    }

    function isRetired(node) {
        return node && node.retired === true;
    }

    function isCluster(node) {
        return node && Array.isArray(node.children) && node.children.length > 0;
    }

    function nodeRadius(node) {
        return isCluster(node) ? 18 : 13;
    }

    function escHtml(str) {
        return String(str || '').replace(/[&<>"']/g, c =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
        );
    }

    // ── SVG init ──────────────────────────────────────────────
    function initSVG() {
        stageW = stageEl.clientWidth  || 800;
        stageH = stageEl.clientHeight || 600;

        svg = d3.select(stageEl)
            .append('svg')
            .attr('width',   stageW)
            .attr('height',  stageH)
            .attr('viewBox', `0 0 ${stageW} ${stageH}`);

        projection = d3.geoNaturalEarth1()
            .fitExtent([[24, 24], [stageW - 24, stageH - 24]], { type: 'Sphere' });

        pathGen = d3.geoPath().projection(projection);

        zoomBehavior = d3.zoom()
            .scaleExtent([1, 14])
            .on('zoom', onZoom);

        // Attach zoom but disable native scroll-to-zoom so the page still scrolls
        svg.call(zoomBehavior)
            .on('wheel.zoom', null);

        mapGroup  = svg.append('g').attr('class', 'geo-map-group');
        nodeGroup = svg.append('g').attr('class', 'geo-node-group');
    }

    function onZoom(event) {
        currentXform = event.transform;
        mapGroup.attr('transform', currentXform);
        positionAllNodes();
    }

    // ── World geography ───────────────────────────────────────
    function renderWorld(worldData) {
        mapGroup.selectAll('*').remove();

        // Sphere background
        mapGroup.append('path')
            .datum({ type: 'Sphere' })
            .attr('class', 'geo-sphere')
            .attr('d', pathGen);

        // Graticule (lat/lng lines)
        const graticule = d3.geoGraticule()
            .step([15, 15])
            .extentMinor([[-180, -80], [180, 80]])();
        mapGroup.append('path')
            .datum(graticule)
            .attr('class', 'geo-graticule')
            .attr('d', pathGen);

        // Country paths
        const countries = topojson.feature(worldData, worldData.objects.countries);
        mapGroup.selectAll('.geo-country')
            .data(countries.features)
            .join('path')
            .attr('class', d => {
                const code = +d.id;
                return WTF_CODES.has(code)
                    ? 'geo-country geo-country--wtf'
                    : 'geo-country';
            })
            .attr('d', pathGen);
    }

    // ── Active region highlight ───────────────────────────────
    function highlightClusterRegion(clusterId) {
        // Remove any existing active highlight
        mapGroup.selectAll('.geo-country--active')
            .classed('geo-country--active', false);

        if (!clusterId || clusterId === SYSTEM_ID) return;

        const cluster = findNode(clusterId);
        if (!cluster || !cluster.clusterBounds) return;

        const b = cluster.clusterBounds;

        mapGroup.selectAll('.geo-country').each(function (d) {
            // Get centroid of this country in lat/lng
            const centroid = d3.geoCentroid(d);
            if (!centroid) return;
            const [lng, lat] = centroid;
            if (
                lat >= b.lat1 && lat <= b.lat2 &&
                lng >= b.lng1 && lng <= b.lng2
            ) {
                d3.select(this).classed('geo-country--active', true);
            }
        });
    }

    function clearHighlight() {
        mapGroup.selectAll('.geo-country--active')
            .classed('geo-country--active', false);
    }

    // ── Node rendering ────────────────────────────────────────
    function visibleNodeIds() {
        if (currentView === 'world') return TOP_LEVEL_IDS;
        const cluster = findNode(currentView);
        if (!cluster || !Array.isArray(cluster.children)) return TOP_LEVEL_IDS;
        return cluster.children.filter(id => {
            const n = findNode(id);
            return n && !isRetired(n);
        });
    }

    // clipPath defs are created once per node-with-logo
    const _clipsMade = new Set();
    function ensureClipPath(node) {
        if (_clipsMade.has(node.id)) return;
        _clipsMade.add(node.id);
        let defs = svg.select('defs');
        if (defs.empty()) defs = svg.insert('defs', ':first-child');
        defs.append('clipPath')
            .attr('id', `geo-clip-${node.id}`)
            .append('circle')
            .attr('r', nodeRadius(node) - 2);
    }

    function renderNodes() {
        const ids = visibleNodeIds();
        const visible = ids
            .map(findNode)
            .filter(n => n && !isRetired(n) && n.lat != null && n.lng != null);

        // Data-join on node id
        const groups = nodeGroup.selectAll('.geo-node')
            .data(visible, d => d.id)
            .join(
                enter  => buildNodeGroup(enter),
                update => update,
                exit   => exit.remove()
            );

        // Sync active class and label fill
        groups.classed('active', d => d.id === activeNodeId);
        groups.classed('cluster', d => isCluster(d));

        positionAllNodes();
    }

    function buildNodeGroup(enter) {
        const g = enter.append('g')
            .attr('class', d =>
                `geo-node ${d.status} ${d.type}` +
                (isCluster(d) ? ' cluster' : '') +
                (d.id === activeNodeId ? ' active' : '')
            )
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                handleNodeClick(d);
            });

        // Outer dashed ring
        g.append('circle')
            .attr('class', 'node-ring')
            .attr('r', d => nodeRadius(d) + 6);

        // Filled body
        g.append('circle')
            .attr('class', 'node-body')
            .attr('r', d => nodeRadius(d));

        // Logo image OR initials fallback
        g.each(function (d) {
            const self = d3.select(this);
            const r    = nodeRadius(d);
            const ir   = r - 2; // inner radius for logo

            if (d.logo) {
                ensureClipPath(d);
                self.append('image')
                    .attr('class',  'node-logo')
                    .attr('href',   d.logo)
                    .attr('x',      -ir)
                    .attr('y',      -ir)
                    .attr('width',  ir * 2)
                    .attr('height', ir * 2)
                    .attr('clip-path', `url(#geo-clip-${d.id})`);
            } else {
                self.append('text')
                    .attr('class',       'node-initials')
                    .attr('text-anchor', 'middle')
                    .attr('dy',          '0.35em')
                    .text(d.initials || d.id.slice(0, 3).toUpperCase());
            }
        });

        // Label below marker
        g.append('text')
            .attr('class',       'node-label')
            .attr('text-anchor', 'middle')
            .attr('y',           d => nodeRadius(d) + 15)
            .text(d => d.clusterLabel || d.label);

        return g;
    }

    // Reposition every visible node using current zoom transform
    function positionAllNodes() {
        nodeGroup.selectAll('.geo-node')
            .attr('transform', d => {
                if (d.lat == null || d.lng == null) return 'translate(-9999,-9999)';
                const projected = projection([d.lng, d.lat]);
                if (!projected) return 'translate(-9999,-9999)';
                const [sx, sy] = currentXform.apply(projected);
                return `translate(${sx.toFixed(2)},${sy.toFixed(2)})`;
            });
    }

    // ── Zoom control ──────────────────────────────────────────
    function zoomToCluster(cluster) {
        if (!cluster || !cluster.clusterBounds) return false;
        const b = cluster.clusterBounds;

        // Project the bounding box corners
        const tl = projection([b.lng1, b.lat2]); // top-left (min lng, max lat)
        const br = projection([b.lng2, b.lat1]); // bottom-right (max lng, min lat)
        if (!tl || !br) return false;

        const [x0, y0] = tl;
        const [x1, y1] = br;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;

        // Fit with 82% of available space (18% padding)
        const scale = Math.max(1.1, Math.min(12, 0.82 / Math.max(dx / stageW, dy / stageH)));
        const tx    = stageW / 2 - scale * cx;
        const ty    = stageH / 2 - scale * cy;

        svg.transition()
            .duration(720)
            .ease(d3.easeCubicInOut)
            .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

        return true;
    }

    function resetZoom() {
        svg.transition()
            .duration(580)
            .ease(d3.easeCubicInOut)
            .call(zoomBehavior.transform, d3.zoomIdentity);
    }

    // ── Click handling ────────────────────────────────────────
    function handleNodeClick(node) {
        if (!node || isRetired(node)) return;

        // System cluster: panel only, no geographic zoom
        if (node.id === SYSTEM_ID) {
            activeNodeId    = node.id;
            activeClusterId = node.id;
            currentView     = SYSTEM_ID;
            renderNodes();
            renderPanel(node, null);
            updateViewLabel();
            updateStageCard();
            return;
        }

        if (currentView === 'world' && isCluster(node)) {
            // First click on a cluster: zoom in and show children
            currentView     = node.id;
            activeClusterId = node.id;
            activeNodeId    = node.id;
            zoomToCluster(node);
            highlightClusterRegion(node.id);
            renderNodes();   // switch to child view
            renderPanel(node, null);
        } else {
            // Click on any child node (or re-click cluster hub in drill-down)
            activeNodeId    = node.id;
            // Inherit cluster context if not already set
            if (!activeClusterId) {
                activeClusterId = node.clusterId || currentView;
            }
            renderNodes();   // refresh active state
            renderPanel(node, activeClusterId);
        }

        updateViewLabel();
        updateStageCard();
    }

    function resetWorld() {
        currentView     = 'world';
        activeNodeId    = null;
        activeClusterId = null;
        clearHighlight();
        resetZoom();
        renderNodes();
        renderPanel(null);
        updateViewLabel();
        updateStageCard();
    }

    function updateViewLabel() {
        if (viewLabelEl) {
            viewLabelEl.textContent = VIEW_NAMES[currentView] || 'World View';
        }
    }

    function updateStageCard() {
        if (!stageCardEl) return;
        // Used by CSS to show Australia offset note when in the-west view
        stageCardEl.className = stageCardEl.className
            .replace(/\bview-\S+/g, '')
            .trim();
        if (currentView !== 'world') {
            stageCardEl.classList.add(`view-${currentView}`);
        }
    }

    // ── Panel rendering ───────────────────────────────────────
    function actionLink(url, label, fallback) {
        if (!url) {
            return `<span class="geo-action disabled" aria-disabled="true">${escHtml(fallback)}</span>`;
        }
        return `<a class="geo-action" href="${escHtml(url)}">${escHtml(label)}</a>`;
    }

    function buildClusterCards(clusterNode) {
        if (!isCluster(clusterNode)) return '';
        const children = clusterNode.children
            .map(findNode)
            .filter(n => n && !isRetired(n));
        if (!children.length) return '';

        const cards = children.map(child => `
            <button class="geo-child-card${child.id === activeNodeId ? ' active' : ''}"
                type="button"
                data-node-id="${escHtml(child.id)}">
                <strong>${escHtml(child.label)}</strong>
                <span>${child.status === 'live' ? 'Live' : 'Soon'}</span>
            </button>
        `).join('');

        return `
            <div class="geo-cluster">
                <h3>${escHtml(clusterNode.clusterLabel || clusterNode.label)}</h3>
                <div class="geo-child-grid">${cards}</div>
            </div>
        `;
    }

    function renderPanel(node, clusterContextId) {
        if (!panelEl) return;

        if (!node) {
            panelEl.innerHTML = `
                <p class="geo-panel-kicker">Fall Map / Geographic</p>
                <h2>Select a node</h2>
                <p>Click a region on the map or a cluster node to open its preview. This geographic prototype pins nodes to their real-world coordinates.</p>
            `;
            return;
        }

        // System layer: special panel — no geographic zoom offered
        if (node.id === SYSTEM_ID) {
            const children = (node.children || [])
                .map(findNode)
                .filter(n => n && !isRetired(n));

            const cards = children.map(child => `
                <button class="geo-child-card${child.id === activeNodeId ? ' active' : ''}"
                    type="button"
                    data-node-id="${escHtml(child.id)}">
                    <strong>${escHtml(child.label)}</strong>
                    <span>${child.status === 'live' ? 'Live' : 'Soon'}</span>
                </button>
            `).join('');

            panelEl.innerHTML = `
                <p class="geo-panel-kicker">Global / System</p>
                <h2>${escHtml(node.philosophyTitle || 'The System Layer')}</h2>
                <div class="geo-meta">
                    <span>${escHtml(node.type)}</span>
                    <span>${node.status === 'live' ? 'Live' : 'Coming soon'}</span>
                </div>
                <p>${escHtml(node.thesis || '')}</p>
                <p class="geo-system-note">The System layer is non-geographic. Its nodes are conceptual — not pinned to a territory.</p>
                <div class="geo-actions">
                    ${actionLink(node.philosophyUrl, 'Read Philosophy', 'Philosophy Coming Soon')}
                    ${actionLink(node.pageUrl, 'View Page', 'Page Coming Soon')}
                </div>
                ${cards.length ? `<div class="geo-cluster"><h3>System nodes</h3><div class="geo-child-grid">${cards}</div></div>` : ''}
            `;
            attachPanelClicks();
            return;
        }

        // Standard node panel
        const title      = node.philosophyTitle || node.clusterLabel || node.label;
        const statusText = node.status === 'live' ? 'Live' : 'Coming soon';

        // Find the right cluster node to show child cards beneath
        let clusterNode = null;
        if (isCluster(node)) {
            clusterNode = node;
        } else if (clusterContextId) {
            clusterNode = findNode(clusterContextId);
        } else if (activeClusterId) {
            clusterNode = findNode(activeClusterId);
        }

        panelEl.innerHTML = `
            <p class="geo-panel-kicker">${escHtml(node.clusterLabel || node.label)}</p>
            <h2>${escHtml(title)}</h2>
            <div class="geo-meta">
                <span>${escHtml(node.type)}</span>
                <span>${statusText}</span>
            </div>
            <p>${escHtml(node.thesis || 'This node is present in the WatchTheFall worldview map.')}</p>
            <div class="geo-actions">
                ${actionLink(node.philosophyUrl, 'Read Philosophy', 'Philosophy Coming Soon')}
                ${actionLink(node.pageUrl, 'View Page', 'Page Coming Soon')}
            </div>
            ${buildClusterCards(clusterNode)}
        `;
        attachPanelClicks();
    }

    function attachPanelClicks() {
        panelEl.querySelectorAll('[data-node-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const n = findNode(btn.dataset.nodeId);
                if (n) handleNodeClick(n);
            });
        });
    }

    // ── Resize ────────────────────────────────────────────────
    function onResize() {
        const newW = stageEl.clientWidth  || 800;
        const newH = stageEl.clientHeight || 600;
        if (Math.abs(newW - stageW) < 8 && Math.abs(newH - stageH) < 8) return;
        stageW = newW;
        stageH = newH;

        svg.attr('width',   stageW)
           .attr('height',  stageH)
           .attr('viewBox', `0 0 ${stageW} ${stageH}`);

        projection.fitExtent([[24, 24], [stageW - 24, stageH - 24]], { type: 'Sphere' });
        pathGen = d3.geoPath().projection(projection);

        if (_worldData) renderWorld(_worldData);
        renderNodes();
        // Reapply zoom transform so nodes land correctly after resize
        positionAllNodes();
    }

    // ── Init ──────────────────────────────────────────────────
    async function init() {
        if (!stageEl || !panelEl) {
            console.error('[FallMapGeo] Missing #geo-stage or #geo-panel.');
            return;
        }

        // Show loading state
        stageEl.innerHTML = '<div class="geo-load-error" style="color:var(--geo-muted)">Loading map data…</div>';

        try {
            const [worldData, mapData] = await Promise.all([
                fetch(GEO_URL).then(r => {
                    if (!r.ok) throw new Error(`world-110m.json ${r.status}`);
                    return r.json();
                }),
                fetch(NODE_URL, { cache: 'no-store' }).then(r => {
                    if (!r.ok) throw new Error(`fall_map.json ${r.status}`);
                    return r.json();
                })
            ]);

            allNodes   = Array.isArray(mapData.nodes) ? mapData.nodes : [];
            _worldData = worldData;

            // Clear loading placeholder and build SVG
            stageEl.innerHTML = '';
            initSVG();
            renderWorld(worldData);
            renderNodes();
            renderPanel(null);
            updateViewLabel();

            console.info(
                `[FallMapGeo] Loaded. ${allNodes.length} nodes total. ` +
                `${allNodes.filter(n => !n.retired && n.lat != null).length} active with coordinates. ` +
                `Retired: ${allNodes.filter(n => n.retired).map(n => n.id).join(', ')}.`
            );

        } catch (err) {
            console.error('[FallMapGeo]', err);
            stageEl.innerHTML = `<div class="geo-load-error">Map failed to load:<br>${escHtml(err.message)}</div>`;
        }

        window.addEventListener('resize', () => {
            clearTimeout(window._geoResizeTimer);
            window._geoResizeTimer = setTimeout(onResize, 180);
        });
    }

    // ── Global back-button listener ───────────────────────────
    document.addEventListener('click', event => {
        const btn = event.target.closest('[data-geo-action="world"]');
        if (btn) resetWorld();
    });

    init();

})();
