(function() {
    'use strict';

    const DATA_URL = 'data/fall_map.json';
    const stage = document.getElementById('fall-map-stage');
    const panel = document.getElementById('fall-map-panel');
    const countEl = document.getElementById('fall-map-count');

    let nodes = [];
    let activeNodeId = null;

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

    function renderStage() {
        if (!stage) return;

        const axes = `
            <span class="fall-map-axis top">Meaning</span>
            <span class="fall-map-axis bottom">Material Pressure</span>
            <span class="fall-map-axis left">Memory</span>
            <span class="fall-map-axis right">Machine</span>
        `;

        const nodeHtml = nodes.map(node => `
            <button
                class="fall-map-node ${escapeHtml(node.status)} ${escapeHtml(node.type)}"
                style="--x: ${Number(node.x || 50)}; --y: ${Number(node.y || 50)}"
                type="button"
                data-node-id="${escapeHtml(node.id)}"
                aria-label="Open ${escapeHtml(node.label)} preview">
                ${nodeVisual(node)}
                <span class="fall-map-label">${escapeHtml(node.label)}</span>
            </button>
        `).join('');

        stage.innerHTML = axes + nodeHtml;
        stage.querySelectorAll('.fall-map-node').forEach(button => {
            button.addEventListener('click', () => selectNode(button.dataset.nodeId));
        });
    }

    function actionLink(url, label, disabledLabel) {
        if (!url) {
            return `<span class="btn btn-secondary disabled" aria-disabled="true">${disabledLabel}</span>`;
        }
        return `<a class="btn btn-primary" href="${escapeHtml(url)}">${label}</a>`;
    }

    function renderPanel(node) {
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

        const statusText = node.status === 'live' ? 'Live philosophy' : 'Coming soon';

        panel.innerHTML = `
            <p class="fall-map-panel-kicker">${escapeHtml(node.label)}</p>
            <h2>${escapeHtml(node.philosophyTitle)}</h2>
            <div class="fall-map-meta">
                <span class="fall-map-pill">${escapeHtml(node.type)}</span>
                <span class="fall-map-pill">${statusText}</span>
            </div>
            <p class="fall-map-thesis">${escapeHtml(node.thesis)}</p>
            <p class="fall-map-status">${statusText}</p>
            <div class="fall-map-actions">
                ${actionLink(node.philosophyUrl, 'Read Philosophy', 'Philosophy Coming Soon')}
                ${actionLink(node.pageUrl, 'View Page', 'Page Coming Soon')}
            </div>
        `;
    }

    function selectNode(id) {
        activeNodeId = id;
        const node = nodes.find(item => item.id === id);

        document.querySelectorAll('.fall-map-node').forEach(button => {
            button.classList.toggle('active', button.dataset.nodeId === id);
        });

        renderPanel(node);
    }

    async function init() {
        if (!stage || !panel) return;

        try {
            const data = await loadData();
            nodes = Array.isArray(data.nodes) ? data.nodes : [];
            if (countEl) countEl.textContent = `${nodes.length} nodes`;
            renderStage();
            selectNode(activeNodeId || 'antarctica');
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
