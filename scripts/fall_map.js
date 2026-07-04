(function() {
    'use strict';

    const DATA_URL = 'data/fall_map.json';
    const GLOBAL_HUB_PAGE_URL = 'index.html';
    const GLOBAL_HUB_PHILOSOPHY_URL = 'philosophy.html';
    const stage = document.getElementById('fall-map-stage');
    const panel = document.getElementById('fall-map-panel');
    const countEl = document.getElementById('fall-map-count');

    let nodes = [];
    let activeNodeId = null;
    let activeClusterId = null;
    let currentView = 'world';
    const FULL_MAP_NODE_ID = '__full-map';
    const GLOBAL_MAP_URL = '/assets/fall-map/map-global.png';

    const WORLD_COORDS = {
        'the-west': { x: 23, y: 42 },
        britain: { x: 43, y: 34 },
        europe: { x: 55, y: 36 },
        ai: { x: 69, y: 30 },
        antarctica: { x: 52, y: 76 },
        watchthefall: { x: 52, y: 18 },
        scotland: { x: 43.5, y: 30 },
        england: { x: 48.5, y: 42.5 },
        wales: { x: 42.8, y: 44 },
        'northern-ireland': { x: 39.2, y: 39.2 },
        ireland: { x: 35.7, y: 45 },
        france: { x: 48, y: 54 },
        germany: { x: 57, y: 47 },
        netherlands: { x: 51, y: 42 },
        poland: { x: 64, y: 44 },
        spain: { x: 43, y: 65 },
        italy: { x: 58, y: 63 },
        sweden: { x: 57, y: 25 },
        usa: { x: 30, y: 50 },
        canada: { x: 27, y: 34 },
        australia: { x: 78, y: 68 },
        'ai-tech': { x: 74, y: 40 },
        gadgets: { x: 72, y: 52 },
        concepts: { x: 60, y: 65 },
        comedy: { x: 67, y: 60 },
        'dark-humour': { x: 70, y: 68 }
    };

    const VIEW_COORDS = {
        britain: {
            britain: { x: 45.4, y: 36.8 },
            scotland: { x: 43.5, y: 30 },
            england: { x: 48.3, y: 42 },
            wales: { x: 42.5, y: 44 },
            'northern-ireland': { x: 39.2, y: 39.2 },
            ireland: { x: 35.7, y: 45 }
        },
        europe: {
            europe: { x: 59, y: 35 },
            ireland: { x: 37, y: 42 },
            france: { x: 48, y: 53.5 },
            germany: { x: 57, y: 46.5 },
            netherlands: { x: 52, y: 41 },
            poland: { x: 64.5, y: 43.5 },
            spain: { x: 43, y: 65 },
            italy: { x: 58, y: 62.5 },
            sweden: { x: 57, y: 24.5 }
        },
        'the-west': {
            'the-west': { x: 25, y: 42 },
            usa: { x: 29, y: 51 },
            canada: { x: 25, y: 34 },
            australia: { x: 78, y: 68.5 }
        }
    };

    const FALL_MAP_VIEWS = {
        world: {
            scale: 1,
            center: { x: 50, y: 50 },
            visible: ['britain', 'europe', 'the-west', 'ai', 'antarctica']
        },
        britain: {
            scale: 3.05,
            center: { x: 42.5, y: 39.5 },
            visible: ['britain', 'scotland', 'england', 'wales', 'northern-ireland', 'ireland']
        },
        europe: {
            scale: 1.85,
            center: { x: 55, y: 45.5 },
            visible: ['europe', 'ireland', 'france', 'germany', 'netherlands', 'poland', 'spain', 'italy', 'sweden']
        },
        'the-west': {
            scale: 1.15,
            center: { x: 45, y: 50 },
            visible: ['the-west', 'usa', 'canada', 'australia']
        },
        ai: {
            scale: 1.45,
            center: { x: 69, y: 42 },
            visible: ['ai', 'ai-tech', 'gadgets']
        },
        antarctica: {
            scale: 1.45,
            center: { x: 53, y: 62 },
            visible: ['antarctica', 'watchthefall', 'concepts', 'comedy', 'dark-humour']
        }
    };

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    async function loadData() {
        const response = await fetch(DATA_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to load Fall Map data');
        return response.json();
    }

    function nodeVisual(node) {
        if (node.logo) {
            return `<img src="${escapeHtml(node.logo)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'), { className: 'fall-map-initials', textContent: '${escapeHtml(node.initials || node.id)}' }))">`;
        }
        return `<span class="fall-map-initials">${escapeHtml(node.initials || node.id)}</span>`;
    }

    function stageNode(node) {
        if (node.id === FULL_MAP_NODE_ID) return node;
        if (node.id !== 'antarctica') return node;
        const watchNode = nodes.find(item => item.id === 'watchthefall');
        if (!watchNode) return node;
        return {
            ...node,
            label: watchNode.label,
            clusterLabel: watchNode.label,
            logo: watchNode.logo,
            initials: watchNode.initials
        };
    }

    function panelNode(node, clusterContextId = null) {
        if (!node) return null;
        if (node.id === 'watchthefall') {
            return {
                ...node,
                philosophyUrl: node.philosophyUrl || GLOBAL_HUB_PHILOSOPHY_URL
            };
        }
        if (node.id !== 'antarctica' || clusterContextId) return node;
        return {
            ...node,
            pageUrl: GLOBAL_HUB_PAGE_URL,
            philosophyUrl: GLOBAL_HUB_PHILOSOPHY_URL
        };
    }

    function layoutFor(node, viewId = currentView) {
        const viewCoords = VIEW_COORDS[viewId] && VIEW_COORDS[viewId][node.id];
        if (viewCoords) return viewCoords;
        return WORLD_COORDS[node.id] || { x: node.x || 50, y: node.y || 50 };
    }

    function viewTransform(view) {
        const scale = Number(view.scale || 1);
        const center = view.center || { x: 50, y: 50 };

        return {
            scale,
            x: (50 - Number(center.x || 50)) * scale,
            y: (50 - Number(center.y || 50)) * scale
        };
    }

    function fullMapNode() {
        return {
            id: FULL_MAP_NODE_ID,
            label: 'Full Map',
            clusterLabel: 'Full Map',
            type: 'system',
            status: 'live',
            initials: 'WTF'
        };
    }

    function viewForNode(node) {
        if (!node) return 'world';
        if (node.id === 'antarctica' || node.id === 'watchthefall') return 'antarctica';
        if (FALL_MAP_VIEWS[node.id]) return node.id;
        if (FALL_MAP_VIEWS[node.clusterId]) return node.clusterId;
        return 'world';
    }

    function renderStage() {
        if (!stage) return;

        const axes = `
            <span class="fall-map-axis top">Meaning</span>
            <span class="fall-map-axis bottom">Material Pressure</span>
            <span class="fall-map-axis left">Memory</span>
            <span class="fall-map-axis right">Machine</span>
        `;

        const view = FALL_MAP_VIEWS[currentView] || FALL_MAP_VIEWS.world;
        const resetButton = currentView !== 'world'
            ? `<button class="fall-map-reset-button" type="button" data-node-id="${FULL_MAP_NODE_ID}" aria-label="Back to World View">Back to World View</button>`
            : '';
        const transform = viewTransform(view);
        const visibleNodes = view.visible
            .map(id => nodes.find(node => node.id === id))
            .filter(Boolean);
        const nodeScale = Math.max(0.48, Math.min(1, 1 / view.scale));
        const nodeHtml = visibleNodes.map(node => {
            const displayNode = stageNode(node);
            const position = layoutFor(node, currentView);
            const displayLabel = displayNode.clusterLabel || displayNode.label;
            return `
            <button
                class="fall-map-node ${escapeHtml(node.status)} ${escapeHtml(node.type)} ${node.children ? 'cluster-parent' : ''} ${node.id === FULL_MAP_NODE_ID ? 'map-reset' : ''}"
                style="--x: ${Number(position.x)}; --y: ${Number(position.y)}; --node-scale: ${nodeScale}"
                type="button"
                data-node-id="${escapeHtml(node.id)}"
                aria-label="Open ${escapeHtml(displayLabel)} preview">
                ${nodeVisual(displayNode)}
                <span class="fall-map-label">${escapeHtml(displayLabel)}</span>
            </button>
        `;
        }).join('');

        stage.dataset.view = currentView;
        stage.innerHTML = `
            <div
                class="fall-map-world"
                style="--view-scale: ${transform.scale}; --view-x: ${transform.x}%; --view-y: ${transform.y}%; --fall-map-art: url('${GLOBAL_MAP_URL}')">
                <div class="fall-map-bg-map" aria-hidden="true"></div>
                <div class="fall-map-bg-atmosphere" aria-hidden="true"></div>
                <div class="fall-map-node-layer">
                    ${nodeHtml}
                </div>
            </div>
            ${axes}
            ${resetButton}
        `;
    }

    function resetMap() {
        activeNodeId = null;
        activeClusterId = null;
        currentView = 'world';
        renderStage();
        document.querySelectorAll('.fall-map-node').forEach(button => button.classList.remove('active'));
        renderPanel(null);
    }

    function actionLink(url, label, disabledLabel) {
        if (!url) {
            return `<span class="btn btn-secondary disabled" aria-disabled="true">${disabledLabel}</span>`;
        }
        return `<a class="btn btn-primary" href="${escapeHtml(url)}">${label}</a>`;
    }

    function clusterTitle(node) {
        if (!node || !node.children) return '';
        if (node.clusterLabel) return node.clusterLabel;
        return node.id === 'britain' ? 'Britain Cluster' :
            node.id === 'europe' ? 'Europe Cluster' :
            `${node.label} Cluster`;
    }

    function renderCluster(node) {
        if (!node || !Array.isArray(node.children) || node.children.length === 0) return '';

        const childCards = node.children
            .map(childId => nodes.find(item => item.id === childId))
            .filter(Boolean)
            .map(child => {
                const isActive = child.id === activeNodeId;
                const statusText = child.status === 'live' ? 'Live' : 'Soon';
                return `
                    <button
                        type="button"
                        class="fall-map-cluster-card ${isActive ? 'active' : ''}"
                        data-cluster-node-id="${escapeHtml(child.id)}">
                        <span class="fall-map-cluster-name">${escapeHtml(child.label)}</span>
                        <span class="fall-map-cluster-status">${statusText}</span>
                    </button>
                `;
            })
            .join('');

        return `
            <div class="fall-map-cluster">
                <h3>${escapeHtml(clusterTitle(node))}</h3>
                <div class="fall-map-cluster-grid">
                    ${childCards}
                </div>
            </div>
        `;
    }

    function renderPanel(node, clusterContextId = null) {
        if (!panel) return;

        if (!node) {
            panel.innerHTML = `
                <div class="fall-map-empty">
                    <p class="fall-map-panel-kicker">Fall Map</p>
                    <h2>Select a node</h2>
                    <p>Tap a country, theme, or system layer to open its preview card.</p>
                </div>
            `;
            return;
        }

        const shown = panelNode(node, clusterContextId);
        const statusText = shown.status === 'live' ? 'Live philosophy' : 'Coming soon';
        const clusterParent = activeClusterId ? nodes.find(item => item.id === activeClusterId) : node;
        const clusterHtml = renderCluster(clusterParent);

        panel.innerHTML = `
            <p class="fall-map-panel-kicker">${escapeHtml(shown.clusterLabel || shown.label)}</p>
            <h2>${escapeHtml(shown.philosophyTitle)}</h2>
            <div class="fall-map-meta">
                <span class="fall-map-pill">${escapeHtml(shown.type)}</span>
                <span class="fall-map-pill">${statusText}</span>
            </div>
            <p class="fall-map-thesis">${escapeHtml(shown.thesis)}</p>
            <p class="fall-map-status">${statusText}</p>
            <div class="fall-map-actions">
                ${actionLink(shown.philosophyUrl, 'Read Philosophy', 'Philosophy Coming Soon')}
                ${actionLink(shown.pageUrl, 'View Page', 'Page Coming Soon')}
            </div>
            ${clusterHtml}
        `;

        panel.querySelectorAll('.fall-map-cluster-card').forEach(button => {
            button.addEventListener('click', () => selectNode(button.dataset.clusterNodeId, activeClusterId));
        });
    }

    function selectNode(id, clusterContextId = null) {
        activeNodeId = id;
        const node = nodes.find(item => item.id === id);
        const shouldFocusStage = Boolean(node && node.children && !clusterContextId);
        const childClusterId = node && node.clusterId === 'global-system' ? 'antarctica' : node && node.clusterId;
        activeClusterId = clusterContextId || (node && node.children ? node.id : childClusterId || null);
        currentView = activeClusterId || viewForNode(node);

        renderStage();
        document.querySelectorAll('.fall-map-node').forEach(button => {
            button.classList.toggle('active', button.dataset.nodeId === id || button.dataset.nodeId === activeClusterId);
        });
        renderPanel(node, clusterContextId);
        if (shouldFocusStage && typeof stage.scrollIntoView === 'function') {
            stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function handleStageClick(event) {
        const button = event.target.closest('.fall-map-node, .fall-map-reset-button');
        if (!button || !stage.contains(button)) return;

        event.preventDefault();
        if (button.dataset.nodeId === FULL_MAP_NODE_ID) {
            resetMap();
            return;
        }
        selectNode(button.dataset.nodeId);
    }

    async function init() {
        if (!stage || !panel) return;

        try {
            const data = await loadData();
            nodes = Array.isArray(data.nodes) ? data.nodes : [];
            if (countEl) countEl.textContent = `${nodes.length} nodes`;
            stage.addEventListener('click', handleStageClick);
            resetMap();
        } catch (error) {
            console.error('Fall Map error:', error);
            panel.innerHTML = `
                <div class="fall-map-empty">
                    <p class="fall-map-panel-kicker">Fall Map</p>
                    <h2>Unable to load map</h2>
                    <p>The editorial dataset could not be loaded.</p>
                </div>
            `;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
