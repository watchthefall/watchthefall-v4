/* ============================================================
   Fall Map — Geographic v2.0
   scripts/fall_map_geo.js

   Stack: D3 v7 + topojson-client v3 (CDN)
   Projection: d3.geoNaturalEarth1()
   Data: data/world-110m.json + data/fall_map.json
   ============================================================ */

(function () {
  'use strict';

  /* ── Module State ─────────────────────────────────────────── */

  let projection, pathGen;
  let svg, mapGroup, pinsGroup;
  let zoomBehavior;
  let currentTransform = { k: 1, x: 0, y: 0 };
  let hubExpanded = false;
  let mapDataCache = null;
  let topoDataCache = null;

  /* ── Init ─────────────────────────────────────────────────── */

  function init() {
    const container = document.getElementById('map-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    svg = d3.select('#world-map')
      .attr('width', W)
      .attr('height', H);

    projection = d3.geoNaturalEarth1()
      .scale(W / 6.4)
      .translate([W / 2, H / 2]);

    pathGen = d3.geoPath().projection(projection);

    // Two groups: map behind, pins in front (both respond to zoom independently)
    mapGroup  = svg.append('g').attr('id', 'map-group');
    pinsGroup = svg.append('g').attr('id', 'pins-group');

    zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', onZoom);

    svg.call(zoomBehavior);

    // Click on bare map → close panel / collapse hub
    svg.on('click', function (event) {
      if (
        event.target === this ||
        event.target.closest && event.target.closest('#map-group')
      ) {
        closeInfoPanel();
        if (hubExpanded) collapseHub();
      }
    });

    window.addEventListener('resize', debounce(onResize, 200));

    loadData();
  }

  /* ── Data Loading ─────────────────────────────────────────── */

  function loadData() {
    Promise.all([
      d3.json('data/world-110m.json'),
      d3.json('data/fall_map.json')
    ])
    .then(function ([topo, mapData]) {
      topoDataCache = topo;
      mapDataCache  = mapData;

      drawMap(topo);
      drawPins(mapData);
      initHub(mapData);
      initControls();

      document.getElementById('map-loading').style.display = 'none';
    })
    .catch(function (err) {
      console.error('[FallMap] Load error:', err);
      const el = document.getElementById('map-loading');
      el.textContent = 'Map unavailable — must be served via HTTP (not file://).';
      el.style.color = 'rgba(232,39,58,0.6)';
    });
  }

  /* ── Map Drawing ──────────────────────────────────────────── */

  function drawMap(topo) {
    const land    = topojson.feature(topo, topo.objects.land);
    const borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);

    // Sphere (ocean fill via CSS)
    mapGroup.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere')
      .attr('d', pathGen);

    // Graticule grid
    const graticule = d3.geoGraticule()();
    mapGroup.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', pathGen);

    // Land mass
    mapGroup.append('path')
      .datum(land)
      .attr('class', 'land')
      .attr('d', pathGen);

    // Country borders
    mapGroup.append('path')
      .datum(borders)
      .attr('class', 'country-border')
      .attr('d', pathGen);
  }

  /* ── Pins ─────────────────────────────────────────────────── */

  function drawPins(mapData) {
    const nodes = mapData.nodes.filter(function (n) {
      return n.display === 'map' && n.lat != null && n.lng != null;
    });

    const groups = pinsGroup.selectAll('.pin-group')
      .data(nodes, function (d) { return d.id; })
      .join('g')
        .attr('class', function (d) {
          return 'pin-group pin-type-' + d.type + ' pin-status-' + d.status;
        })
        .attr('data-id', function (d) { return d.id; })
        .attr('transform', function (d) {
          const [x, y] = projection([d.lng, d.lat]);
          return 'translate(' + x + ',' + y + ')';
        })
        .on('click', function (event, d) {
          event.stopPropagation();
          openInfoPanel(d);
        })
        .on('mousemove', function (event, d) {
          showTooltip(d.label, event.clientX, event.clientY);
        })
        .on('mouseleave', hideTooltip);

    // Pulse ring — live nodes only
    groups.filter(function (d) { return d.status === 'live'; })
      .append('circle')
        .attr('class', 'pin-pulse')
        .attr('r', function (d) { return d.type === 'region' ? 13 : 11; });

    // Main circle
    groups.append('circle')
      .attr('class', 'pin-circle')
      .attr('r', function (d) { return d.type === 'region' ? 11 : 8; });

    // Initials text
    groups.append('text')
      .attr('class', 'pin-initials')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text(function (d) {
        const s = d.initials || d.id.substring(0, 3).toUpperCase();
        return s.length > 4 ? s.substring(0, 3) : s;
      });
  }

  /* ── Zoom ─────────────────────────────────────────────────── */

  function onZoom(event) {
    const t = event.transform;
    currentTransform = t;

    mapGroup.attr('transform', t);

    // Counter-scale pins so they stay visually constant size
    pinsGroup.selectAll('.pin-group')
      .attr('transform', function (d) {
        const sx = t.applyX(projection([d.lng, d.lat])[0]);
        const sy = t.applyY(projection([d.lng, d.lat])[1]);
        return 'translate(' + sx + ',' + sy + ') scale(' + (1 / t.k) + ')';
      });
  }

  /* ── Info Panel ───────────────────────────────────────────── */

  function openInfoPanel(node) {
    // Fill content
    const logo = document.getElementById('info-logo');
    if (node.logo) {
      logo.src = node.logo;
      logo.style.display = 'block';
    } else {
      logo.style.display = 'none';
    }

    const statusEl = document.getElementById('info-status');
    statusEl.textContent = node.status === 'live' ? 'Live' : 'Coming Soon';
    statusEl.className = 'info-status status-' + node.status;

    document.getElementById('info-label').textContent = node.label || '';
    document.getElementById('info-philosophy-title').textContent = node.philosophyTitle || '';
    document.getElementById('info-thesis').textContent = node.thesis || '';

    const link = document.getElementById('info-link');
    if (node.pageUrl) {
      link.href = node.pageUrl;
      link.style.display = 'inline-flex';
    } else {
      link.style.display = 'none';
    }

    document.getElementById('info-panel').classList.add('open');

    // Highlight pin
    pinsGroup.selectAll('.pin-group').classed('pin-active', false);
    pinsGroup.select('.pin-group[data-id="' + node.id + '"]').classed('pin-active', true);
  }

  function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('open');
    pinsGroup.selectAll('.pin-group').classed('pin-active', false);
  }

  /* ── Tooltip ──────────────────────────────────────────────── */

  function showTooltip(text, cx, cy) {
    const tip = document.getElementById('map-tooltip');
    tip.textContent = text;
    tip.style.left = (cx + 14) + 'px';
    tip.style.top  = (cy - 30) + 'px';
    tip.style.display = 'block';
  }

  function hideTooltip() {
    document.getElementById('map-tooltip').style.display = 'none';
  }

  /* ── WTF Hub ──────────────────────────────────────────────── */

  function initHub(mapData) {
    const hubNode = mapData.nodes.find(function (n) { return n.id === 'watchthefall'; });
    if (!hubNode) return;

    const childIds  = hubNode.hubChildren || [];
    const children  = childIds
      .map(function (id) { return mapData.nodes.find(function (n) { return n.id === id; }); })
      .filter(Boolean);

    const layer = document.getElementById('hub-satellite-layer');

    children.forEach(function (child, i) {
      const sat = document.createElement('div');
      sat.className = 'hub-satellite';
      sat.dataset.id = child.id;
      sat.title = child.label;

      if (child.logo) {
        const img = document.createElement('img');
        img.src = child.logo;
        img.alt = child.label;
        img.onerror = function () {
          this.remove();
          const span = document.createElement('span');
          span.className = 'hub-satellite-initials';
          span.textContent = child.initials || child.id.substring(0, 3).toUpperCase();
          sat.appendChild(span);
        };
        sat.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'hub-satellite-initials';
        span.textContent = child.initials || child.id.substring(0, 3).toUpperCase();
        sat.appendChild(span);
      }

      sat.addEventListener('click', function (e) {
        e.stopPropagation();
        openInfoPanel(child);
      });

      layer.appendChild(sat);
    });

    document.getElementById('wtf-hub-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      hubExpanded ? collapseHub() : expandHub();
    });
  }

  function expandHub() {
    hubExpanded = true;
    document.getElementById('wtf-hub').classList.add('expanded');

    const sats = Array.from(document.querySelectorAll('.hub-satellite'));
    const n = sats.length;
    const radius = 120;
    const spread = 160; // degrees of arc, centred at straight-up (-90°)
    const startAngle = -90 - spread / 2; // -170°

    sats.forEach(function (sat, i) {
      const angleDeg = startAngle + (i / Math.max(n - 1, 1)) * spread;
      const angleRad = angleDeg * (Math.PI / 180);
      const tx = Math.cos(angleRad) * radius;
      const ty = Math.sin(angleRad) * radius;

      sat.style.transitionDelay = (i * 45) + 'ms';
      sat.style.transform  = 'translate(' + tx + 'px, ' + ty + 'px) scale(1)';
      sat.style.opacity    = '1';
      sat.style.pointerEvents = 'auto';
    });
  }

  function collapseHub() {
    hubExpanded = false;
    document.getElementById('wtf-hub').classList.remove('expanded');

    document.querySelectorAll('.hub-satellite').forEach(function (sat) {
      sat.style.transitionDelay = '0ms';
      sat.style.transform  = 'translate(0px, 0px) scale(0)';
      sat.style.opacity    = '0';
      sat.style.pointerEvents = 'none';
    });
  }

  /* ── Controls ─────────────────────────────────────────────── */

  function initControls() {
    document.getElementById('ctrl-zoom-in').addEventListener('click', function () {
      svg.transition().duration(320).call(zoomBehavior.scaleBy, 1.6);
    });

    document.getElementById('ctrl-zoom-out').addEventListener('click', function () {
      svg.transition().duration(320).call(zoomBehavior.scaleBy, 0.625);
    });

    document.getElementById('ctrl-reset').addEventListener('click', function () {
      svg.transition().duration(600).call(
        zoomBehavior.transform,
        d3.zoomIdentity
      );
    });
  }

  /* ── Resize ───────────────────────────────────────────────── */

  function onResize() {
    if (!topoDataCache || !mapDataCache) return;

    const container = document.getElementById('map-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    svg.attr('width', W).attr('height', H);

    projection
      .scale(W / 6.4)
      .translate([W / 2, H / 2]);

    pathGen = d3.geoPath().projection(projection);

    // Redraw map paths
    mapGroup.select('.sphere').attr('d', pathGen);
    mapGroup.select('.graticule').attr('d', pathGen(d3.geoGraticule()()));
    mapGroup.select('.land').attr('d', pathGen(topojson.feature(topoDataCache, topoDataCache.objects.land)));
    mapGroup.select('.country-border').attr('d', pathGen(
      topojson.mesh(topoDataCache, topoDataCache.objects.countries, function (a, b) { return a !== b; })
    ));

    // Reposition pins (reset transform first)
    pinsGroup.selectAll('.pin-group')
      .attr('transform', function (d) {
        const [x, y] = projection([d.lng, d.lat]);
        return 'translate(' + x + ',' + y + ') scale(' + (1 / currentTransform.k) + ')';
      });
  }

  /* ── Utilities ────────────────────────────────────────────── */

  function debounce(fn, ms) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  /* ── Boot ─────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
