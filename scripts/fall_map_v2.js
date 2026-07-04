(function() {
    'use strict';

    const DATA_URL = 'data/fall_map.json';
    const GLOBAL_HUB_PAGE_URL = 'index.html';
    const GLOBAL_HUB_PHILOSOPHY_URL = 'philosophy.html';
    const stage = document.getElementById('fall-map-v2-stage');
    const panel = document.getElementById('fall-map-v2-panel');
    const viewLabel = document.getElementById('v2-view-label');

    const TOP_LEVEL = ['the-west', 'britain', 'europe', 'ai', 'antarctica'];

    const VIEW_NAMES = {
        world: 'World',
        britain: 'Britain',
        europe: 'Europe',
        'the-west': 'The West',
        ai: 'AI & Tech',
        antarctica: 'Global / System'
    };

    const WORLD_COORDS = {
        'the-west': { x: 25, y: 48 },
        britain: { x: 47, y: 41 },
        europe: { x: 56, y: 43 },
        ai: { x: 74, y: 33 },
        antarctica: { x: 57, y: 73 },
        watchthefall: { x: 51, y: 24 },
        scotland: { x: 45, y: 35 },
        england: { x: 48, y: 46 },
        wales: { x: 45, y: 48 },
        'northern-ireland': { x: 42, y: 43 },
        ireland: { x: 39, y: 48 },
        france: { x: 52, y: 50 },
        germany: { x: 56, y: 47 },
        netherlands: { x: 53, y: 44 },
        poland: { x: 61, y: 45 },
        spain: { x: 49, y: 59 },
        italy: { x: 58, y: 60 },
        sweden: { x: 58, y: 34 },
        usa: { x: 24, y: 52 },
        canada: { x: 24, y: 36 },
        australia: { x: 78, y: 68 },
        'ai-tech': { x: 80, y: 41 },
        gadgets: { x: 78, y: 53 },
        concepts: { x: 61, y: 62 },
        comedy: { x: 69, y: 58 },
        'dark-humour': { x: 70, y: 69 }
    };

    const VIEW_COORDS = {
        britain: {
            britain: { x: 50, y: 47 },
            scotland: { x: 50, y: 31 },
            england: { x: 59, y: 60 },
            wales: { x: 43, y: 63 },
            'northern-ireland': { x: 35, y: 51 },
            ireland: { x: 28, y: 67 }
        },
        europe: {
            europe: { x: 53, y: 35 },
            ireland: { x: 27, y: 45 },
            france: { x: 44, y: 60 },
            germany: { x: 57, y: 50 },
            netherlands: { x: 46, y: 45 },
            poland: { x: 68, y: 48 },
            spain: { x: 35, y: 75 },
            italy: { x: 61, y: 72 },
            sweden: { x: 59, y: 26 }
        },
        'the-west': {
            'the-west': { x: 43, y: 45 },
            canada: { x: 35, y: 33 },
            usa: { x: 43, y: 58 },
            australia: { x: 78, y: 69 }
        },
        ai: {
            ai: { x: 49, y: 37 },
            'ai-tech': { x: 64, y: 51 },
            gadgets: { x: 39, y: 64 }
        },
        antarctica: {
            antarctica: { x: 53, y: 59 },
            watchthefall: { x: 50, y: 44 },
            concepts: { x: 37, y: 55 },
            comedy: { x: 67, y: 53 },
            'dark-humour': { x: 67, y: 69 }
        }
    };

    const VIEWS = {
        world: {
            visible: TOP_LEVEL,
            center: { x: 50, y: 50 },
            scale: 1,
            caption: 'A whole-system atlas. Choose a region, theme, or system layer.'
        },
        britain: {
            visible: ['britain', 'scotland', 'england', 'wales', 'northern-ireland', 'ireland'],
            center: { x: 50, y: 51 },
            scale: 1.45,
            caption: 'The island contract, civic memory, and the borders inside the story.'
        },
        europe: {
            visible: ['europe', 'ireland', 'france', 'germany', 'netherlands', 'poland', 'spain', 'italy', 'sweden'],
            center: { x: 53, y: 51 },
            scale: 1.2,
            caption: 'Managed distance, continental pressure, and institutions above ordinary life.'
        },
        'the-west': {
            visible: ['the-west', 'usa', 'canada', 'australia'],
            center: { x: 48, y: 53 },
            scale: 1.12,
            caption: 'A transatlantic mirror with Australia held as a satellite pressure point.'
        },
        ai: {
            visible: ['ai', 'ai-tech', 'gadgets'],
            center: { x: 52, y: 52 },
            scale: 1.14,
            caption: 'A symbolic machine layer: tools, platforms, automation, and attention.'
        },
        antarctica: {
            visible: ['watchthefall', 'antarctica', 'concepts', 'comedy', 'dark-humour'],
            center: { x: 54, y: 58 },
            scale: 1.12,
            caption: 'The meta layer underneath the signal: sovereignty, control, and interpretation.'
        }
    };

    let nodes = [];
    let currentView = 'world';
    let activeNodeId = null;
    let activeClusterId = null;

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function findNode(id) {
        return nodes.find(node => node.id === id);
    }

    function displayNode(node) {
        if (!node) return null;
        if (node.id === 'antarctica') {
            return {
                ...node,
                label: 'Global / System',
                clusterLabel: 'Global / System'
            };
        }
        return node;
    }

    function panelNode(node, clusterContextId = null) {
        if (!node) return null;
        const shown = displayNode(node);
        if (node.id === 'watchthefall') {
            return {
                ...shown,
                philosophyUrl: shown.philosophyUrl || GLOBAL_HUB_PHILOSOPHY_URL
            };
        }
        if (node.id !== 'antarctica' || clusterContextId) return shown;
        return {
            ...shown,
            pageUrl: GLOBAL_HUB_PAGE_URL,
            philosophyUrl: GLOBAL_HUB_PHILOSOPHY_URL
        };
    }

    function viewForNode(node) {
        if (!node) return 'world';
        if (node.id === 'antarctica' || node.id === 'watchthefall') return 'antarctica';
        if (VIEWS[node.id]) return node.id;
        if (VIEWS[node.clusterId]) return node.clusterId;
        if (node.clusterId === 'global-system') return 'antarctica';
        return currentView;
    }

    function coordsFor(node, viewId = currentView) {
        const viewCoords = VIEW_COORDS[viewId] && VIEW_COORDS[viewId][node.id];
        if (viewCoords) return viewCoords;
        return WORLD_COORDS[node.id] || { x: Number(node.x || 50), y: Number(node.y || 50) };
    }

    function childrenFor(node) {
        if (!node || !Array.isArray(node.children)) return [];
        return node.children.map(findNode).filter(Boolean);
    }

    function nodeGraphic(node) {
        const initials = escapeHtml(node.initials || node.id);
        if (node.logo) {
            return `
                <span class="v2-node-icon">
                    <img src="${escapeHtml(node.logo)}" alt="" loading="lazy">
                    <span>${initials}</span>
                </span>
            `;
        }
        return `<span class="v2-node-icon initials-only"><span>${initials}</span></span>`;
    }

    function atlasBackground(viewId) {
        const visible = (VIEWS[viewId] || VIEWS.world).visible
            .map(findNode)
            .filter(Boolean)
            .map(node => coordsFor(node, viewId));

        const links = [];
        for (let i = 0; i < visible.length; i += 1) {
            for (let j = i + 1; j < visible.length; j += 1) {
                if ((i + j) % 2 === 0 || viewId !== 'world') {
                    const midX = (visible[i].x + visible[j].x) / 2;
                    const midY = Math.min(visible[i].y, visible[j].y) - 9;
                    links.push(`<path class="v2-arc" d="M ${visible[i].x} ${visible[i].y} Q ${midX} ${midY} ${visible[j].x} ${visible[j].y}" />`);
                }
            }
        }

        const pressurePoints = visible.map(point =>
            `<circle class="v2-pressure" cx="${point.x}" cy="${point.y}" r="0.62" />`
        ).join('');

        const fineGrid = Array.from({ length: 8 }, (_, index) => {
            const position = 10 + (index * 11);
            return `
                <path class="v2-grid-line" d="M ${position} 4 L ${position} 96" />
                <path class="v2-grid-line" d="M 4 ${position} L 96 ${position}" />
            `;
        }).join('');

        const constellation = visible.slice(0, 6).map((point, index) => {
            const next = visible[(index + 2) % visible.length] || visible[0];
            return `<path class="v2-constellation" d="M ${point.x} ${point.y} L ${next.x} ${next.y}" />`;
        }).join('');

        const labels = `
            <text class="v2-map-label" x="16" y="21">MEMORY FIELD</text>
            <text class="v2-map-label" x="44" y="18">CIVIC FIELD</text>
            <text class="v2-map-label" x="71" y="23">MACHINE FIELD</text>
            <text class="v2-map-label" x="47" y="84">SYSTEM FLOOR</text>
        `;

        const systemRings = viewId === 'antarctica'
            ? `
                <circle class="v2-system-ring" cx="53" cy="58" r="12" />
                <circle class="v2-system-ring outer" cx="53" cy="58" r="22" />
                <path class="v2-system-orbit" d="M 37 55 C 43 44 59 42 67 53 C 72 62 67 72 53 58" />
            `
            : '';

        return `
            <svg class="v2-atlas-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <radialGradient id="v2-glow" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stop-color="rgba(212,175,55,0.22)" />
                        <stop offset="60%" stop-color="rgba(212,175,55,0.05)" />
                        <stop offset="100%" stop-color="rgba(0,0,0,0)" />
                    </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#v2-glow)" />
                ${fineGrid}
                <rect class="v2-field field-west" x="8" y="25" width="28" height="44" rx="5" />
                <rect class="v2-field field-civic" x="39" y="23" width="33" height="38" rx="5" />
                <rect class="v2-field field-machine" x="67" y="19" width="24" height="50" rx="5" />
                <rect class="v2-field field-system" x="31" y="61" width="45" height="26" rx="5" />
                <path class="v2-zone-boundary" d="M 38 18 L 38 88" />
                <path class="v2-zone-boundary" d="M 67 16 L 67 88" />
                <path class="v2-zone-boundary" d="M 10 60 L 91 60" />
                <circle class="v2-focus-ring" cx="24" cy="48" r="16" />
                <circle class="v2-focus-ring" cx="55" cy="42" r="17" />
                <circle class="v2-focus-ring" cx="75" cy="39" r="14" />
                <circle class="v2-focus-ring low" cx="53" cy="72" r="18" />
                <path class="v2-route-spine" d="M 17 51 C 32 37 46 40 56 43 C 68 47 75 42 84 35" />
                <path class="v2-route-spine secondary" d="M 31 76 C 43 63 56 60 73 70" />
                ${constellation}
                ${links.join('')}
                ${systemRings}
                ${pressurePoints}
                ${labels}
            </svg>
        `;
    }

    function renderStage() {
        if (!stage) return;
        const view = VIEWS[currentView] || VIEWS.world;
        const visibleNodes = view.visible.map(findNode).filter(Boolean);
        const nodeMarkup = visibleNodes.map(node => {
            const shown = displayNode(node);
            const position = coordsFor(node, currentView);
            const label = shown.clusterLabel || shown.label;
            const isActive = node.id === activeNodeId ? ' active' : '';
            const isParent = Array.isArray(node.children) && node.children.length ? ' parent' : '';

            return `
                <button class="v2-node ${escapeHtml(node.status)} ${escapeHtml(node.type)}${isActive}${isParent}"
                    type="button"
                    style="--x: ${position.x}; --y: ${position.y};"
                    data-node-id="${escapeHtml(node.id)}"
                    aria-label="Open ${escapeHtml(label)}">
                    ${nodeGraphic(shown)}
                    <span class="v2-node-label">${escapeHtml(label)}</span>
                </button>
            `;
        }).join('');

        const back = currentView === 'world' ? '' :
            '<button class="v2-back" type="button" data-map-action="world">Back to World View</button>';

        stage.dataset.view = currentView;
        stage.innerHTML = `
            <div class="v2-atlas-art">${atlasBackground(currentView)}</div>
            <div class="v2-zone-label top">Meaning</div>
            <div class="v2-zone-label bottom">Material Pressure</div>
            <div class="v2-zone-label left">Memory</div>
            <div class="v2-zone-label right">Machine</div>
            <div class="v2-node-layer">${nodeMarkup}</div>
            ${back}
        `;

        if (viewLabel) {
            viewLabel.textContent = `${VIEW_NAMES[currentView] || 'World'} - ${view.caption}`;
        }
    }

    function actionLink(url, label, disabledLabel) {
        if (!url) {
            return `<span class="v2-action disabled" aria-disabled="true">${disabledLabel}</span>`;
        }
        return `<a class="v2-action" href="${escapeHtml(url)}">${label}</a>`;
    }

    function clusterMarkup(node) {
        const children = childrenFor(node);
        if (!children.length) return '';
        const title = node.clusterLabel || node.label;
        const cards = children.map(child => `
            <button class="v2-child-card ${child.id === activeNodeId ? 'active' : ''}" type="button" data-node-id="${escapeHtml(child.id)}" data-cluster-context="${escapeHtml(node.id)}">
                <strong>${escapeHtml(child.label)}</strong>
                <span>${child.status === 'live' ? 'Live' : 'Soon'}</span>
            </button>
        `).join('');

        return `
            <div class="v2-cluster">
                <h3>${escapeHtml(title)}</h3>
                <div class="v2-child-grid">${cards}</div>
            </div>
        `;
    }

    function renderPanel(node, clusterContextId = null) {
        if (!panel) return;
        if (!node) {
            panel.innerHTML = `
                <p class="v2-panel-kicker">Fall Map</p>
                <h2>Select a node</h2>
                <p>Choose a region, theme, or system layer to open its preview card. This v2 experiment uses a coded symbolic atlas instead of image-crop geography.</p>
            `;
            return;
        }

        const shown = panelNode(node, clusterContextId);
        const title = shown.philosophyTitle || shown.clusterLabel || shown.label;
        const thesis = shown.thesis || 'This node is present in the WatchTheFall worldview map.';
        const statusText = shown.status === 'live' ? 'Live' : 'Coming soon';
        const parentNode = Array.isArray(node.children) ? node : findNode(activeClusterId);

        panel.innerHTML = `
            <p class="v2-panel-kicker">${escapeHtml(shown.clusterLabel || shown.label)}</p>
            <h2>${escapeHtml(title)}</h2>
            <div class="v2-meta">
                <span>${escapeHtml(shown.type)}</span>
                <span>${statusText}</span>
            </div>
            <p>${escapeHtml(thesis)}</p>
            <div class="v2-actions">
                ${actionLink(shown.philosophyUrl, 'Read Philosophy', 'Philosophy Coming Soon')}
                ${actionLink(shown.pageUrl, 'View Page', 'Page Coming Soon')}
            </div>
            ${clusterMarkup(parentNode)}
        `;
    }

    function selectNode(id, clusterContextId = null) {
        const node = findNode(id);
        if (!node) return;

        const nextView = viewForNode(node);
        currentView = nextView;
        activeNodeId = node.id;
        activeClusterId = clusterContextId || (Array.isArray(node.children) ? node.id : (node.clusterId === 'global-system' ? 'antarctica' : node.clusterId));

        renderStage();
        renderPanel(node, clusterContextId);
    }

    function resetWorld() {
        currentView = 'world';
        activeNodeId = null;
        activeClusterId = null;
        renderStage();
        renderPanel(null);
    }

    async function init() {
        if (!stage || !panel) return;
        try {
            const data = await fetch(DATA_URL, { cache: 'no-store' }).then(response => {
                if (!response.ok) throw new Error('Unable to load Fall Map data');
                return response.json();
            });
            nodes = Array.isArray(data.nodes) ? data.nodes : [];
            renderStage();
            renderPanel(null);
        } catch (error) {
            stage.innerHTML = '<p class="v2-error">Fall Map v2 data could not be loaded.</p>';
            panel.innerHTML = `<p class="v2-error">${escapeHtml(error.message)}</p>`;
        }
    }

    document.addEventListener('click', event => {
        const action = event.target.closest('[data-map-action]');
        if (action && action.dataset.mapAction === 'world') {
            resetWorld();
            return;
        }

        const nodeButton = event.target.closest('[data-node-id]');
        if (nodeButton) {
            selectNode(nodeButton.dataset.nodeId, nodeButton.dataset.clusterContext || null);
        }
    });

    init();
})();
