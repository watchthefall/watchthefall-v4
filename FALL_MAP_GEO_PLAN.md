# Fall Map — Geographic Upgrade: Planning Document

**Status:** Planning only. No code written. This document covers decisions through to phased execution.  
**Author:** Dr. Atlas (analysis session)  
**Codebase read:** `fall-map.html`, `scripts/fall_map_v2.js`, `scripts/fall_map.js`, `styles/fall-map-v2.css`, `data/fall_map.json`, `assets/fall-map/` PNG inventory

---

## What I found in the codebase

Before recommending anything, the existing architecture needs to be understood correctly, because the prompt description slightly misrepresented it.

There are **two versions of the Fall Map** currently in the repo, not one:

**v1 (`fall_map.js`)** — the older version, still referenced by some parts of the codebase. This one used **actual PNG image maps** (`assets/fall-map/map-global.png`, `map-britain.png`, `map-europe.png`, `map-thewest.png`). The zoom-into-region effect was achieved by CSS `transform: scale()` and `translate()` on a container div that held the PNG as a background image. Nodes were absolutely positioned on top of the scaled image. This was the closest the site has ever come to a geographic map, and it was discarded in favour of the symbolic atlas.

**v2 (`fall_map_v2.js`)** — the current live version. Pure SVG symbolic coordinate system — the `MEMORY FIELD / CIVIC FIELD / MACHINE FIELD / SYSTEM FLOOR` zones. No real geography. Nodes positioned by hand-coded `%` values in `WORLD_COORDS` and `VIEW_COORDS` lookup tables. The atlas background is procedurally generated SVG (arcs, grid lines, focus rings, constellation paths). Clean, editorial, deliberately abstract.

**The data schema** in `fall_map.json` uses `x/y` percentage fields (`"x": 50, "y": 14`) — these are the v1 symbolic positions, carried forward. There is **no lat/lng data** in the current JSON. The prompt mentioned `fall_map_d3.json` and `fall_map_d3.js` — these do not exist in the repo. No D3 prototype was built; it was discussed but never committed.

**What does exist geographically:** Five PNG regional map images. These are raster crops, not vector geography. They have no coordinate system baked in, which is why v1 node placement was always approximate and the zoom transitions were jank at the edges.

This is important context for the recommendation below.

---

## 1. Technology Choice

### Recommendation: D3.js v7 + TopoJSON (CDN) + self-hosted world-110m.json

**Libraries to load:**
```html
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
```

**World data file:** `data/world-110m.json` — self-hosted in the existing `/data/` directory. File size: ~120kb raw, ~40kb gzipped. No external tile server. No API key. No cost. Fully static-compatible.

**Projection:** `d3.geoNaturalEarth1()`

### Why D3 + Natural Earth, not any of the alternatives

**Why not Leaflet or Mapbox:** Both require tile servers (paid or self-hosted). Leaflet with OpenStreetMap tiles looks like an app. Mapbox costs money and requires a key. Both produce something that visually fights the WTF aesthetic — you're spending more energy overriding than building.

**Why not a pre-built SVG world map (static file):** A flat SVG world file works fine for background rendering but loses the ability to do geographic projection math. Positioning nodes accurately requires calling `projection([lng, lat])` to get pixel coordinates. Without a projection function, you're back to hand-tuned percentages — the same problem that made v1 node placement inaccurate.

**Why not Canvas/WebGL:** Overkill for this node count. Canvas loses the SVG filter pipeline (glow, blur, masks) that makes the aesthetic work. WebGL is far too complex for a no-build-step constraint.

**Why D3:** D3 gives us the projection function, the zoom state machine (`d3.zoom()`), and the geographic path renderer (`d3.geoPath()`) — all from a single CDN-loaded library. The SVG it produces is completely styleable with CSS and SVG filters. Every visual effect described in section 4 is achievable inside D3's SVG output. The library is 87kb gzipped, loads from jsDelivr CDN reliably, and requires no build step.

**Why Natural Earth projection specifically:**

Natural Earth (1) is the standard projection for editorial data journalism. The Guardian, the New York Times data desk, and The Economist all default to it for world maps. It keeps all landmasses visible, proportionate, and readable. It doesn't inflate polar regions like Mercator. It doesn't distort area like Robinson. It reads as "authoritative press atlas" — which maps exactly to WatchTheFall's tone. Mercator would look like Google Maps. Azimuthal would look like a globe screensaver. Natural Earth looks like something a serious analyst printed out and put on a wall.

### Constraints check

| Constraint | Status |
|---|---|
| Static file / GitHub Pages | ✅ All files local or CDN |
| No tile API | ✅ TopoJSON geometry, no tiles |
| No build step | ✅ CDN script tags only |
| No paid dependencies | ✅ All free |
| Self-contained | ✅ world-110m.json lives in /data/ |

---

## 2. Data Strategy

### The core question: one schema or two?

**Recommendation: one schema, additive fields.**

Do not create a separate `fall_map_d3.json`. Maintaining two JSON files for the same nodes is a maintenance trap — they will diverge, and the next person to add a node will update one and forget the other.

Instead, add `lat` and `lng` fields to every node in `fall_map.json`. The existing `x` and `y` fields stay in place — they serve the v2 symbolic atlas and must not be removed until that view is explicitly retired.

### Required lat/lng additions (all nodes)

```json
{ "id": "britain",          "lat": 54.5,   "lng": -2.5  }
{ "id": "scotland",         "lat": 57.0,   "lng": -4.0  }
{ "id": "england",          "lat": 52.5,   "lng": -1.5  }
{ "id": "wales",            "lat": 52.3,   "lng": -3.7  }
{ "id": "northern-ireland", "lat": 54.7,   "lng": -6.7  }
{ "id": "ireland",          "lat": 53.3,   "lng": -8.2  }
{ "id": "europe",           "lat": 50.0,   "lng": 10.0  }
{ "id": "france",           "lat": 46.2,   "lng":  2.2  }
{ "id": "germany",          "lat": 51.2,   "lng": 10.4  }
{ "id": "netherlands",      "lat": 52.3,   "lng":  5.3  }
{ "id": "poland",           "lat": 51.9,   "lng": 19.1  }
{ "id": "spain",            "lat": 40.4,   "lng": -3.7  }
{ "id": "italy",            "lat": 41.9,   "lng": 12.5  }
{ "id": "sweden",           "lat": 59.3,   "lng": 18.1  }
{ "id": "the-west",         "lat": 45.0,   "lng": -90.0 }
{ "id": "usa",              "lat": 37.1,   "lng": -95.7 }
{ "id": "canada",           "lat": 56.1,   "lng": -96.3 }
{ "id": "australia",        "lat": -25.3,  "lng": 133.8 }
{ "id": "ai",               "lat": 37.4,   "lng": -122.1}
{ "id": "ai-tech",          "lat": 34.0,   "lng": -118.2}
{ "id": "gadgets",          "lat": 40.7,   "lng": -74.0 }
{ "id": "antarctica",       "lat": -15.0,  "lng": 0.0   }
{ "id": "watchthefall",     "lat": 55.0,   "lng": -3.5  }
{ "id": "concepts",         "lat": 48.9,   "lng": 2.3   }
{ "id": "comedy",           "lat": 51.5,   "lng": -0.1  }
{ "id": "dark-humour",      "lat": 53.5,   "lng": -2.2  }
```

**Notes on non-geographic nodes:**

- `the-west` is a conceptual cluster, not a landmass. Position it over the Atlantic mid-ocean (lat: 45, lng: -40) so the arc lines connecting USA, Canada, and Australia look like a transatlantic network rather than pointing at empty coordinates.
- `ai`, `ai-tech`, `gadgets` — position in Silicon Valley / New York. This gives them a geographic anchor without implying they're geographically constrained. The editorial fiction works.
- `antarctica`, `watchthefall`, `comedy`, `dark-humour`, `concepts` — these are meta/system nodes. They should cluster in a visually distinct region. Options: float them over the North Atlantic at various positions, or treat them as an overlay layer (non-geographic). See section 3 for the recommended approach.
- `ireland` appears in both the `britain` and `europe` cluster children arrays. The lat/lng is the same (the island doesn't move). The cluster membership determines *when* it appears, not *where*.

### Additional schema field: `clusterBounds`

Add a `clusterBounds` object to each cluster node to define the D3 zoom target:

```json
{
  "id": "britain",
  "clusterBounds": {
    "lat1": 49.9, "lng1": -8.2,
    "lat2": 58.7, "lng2":  1.8
  }
}
```

This replaces the hardcoded `center` and `scale` values currently in `FALL_MAP_VIEWS` within the JS. Keeping bounds in the data file makes it possible to tweak zoom targets without touching code.

---

## 3. State Machine Design

### Architecture overview

The map is a single SVG element managed by D3. The SVG contains:

1. **Layer 0 — Atmosphere** (SVG `<defs>` + background rect with radial gradient)
2. **Layer 1 — Graticule** (D3 geo graticule — lat/lng lines at low opacity)
3. **Layer 2 — Country paths** (TopoJSON world geometry, all countries rendered)
4. **Layer 3 — Cluster region overlays** (filled regions for active clusters — added dynamically)
5. **Layer 4 — Arc lines** (great-circle arcs connecting cluster children to cluster hub)
6. **Layer 5 — Node markers** (circles + logos positioned by projection(lat, lng))
7. **Layer 6 — Scan overlay** (the intro animation element — a single rect, removed after init)

The `d3.zoom()` behaviour is attached to the SVG element. All zoom/pan operations call `zoom.transform()` with a computed `d3.zoomIdentity.translate(x, y).scale(k)` — this is a single DOM operation that triggers a CSS `transform` on the SVG group, hardware-accelerated.

### World view state

- All 5 cluster nodes visible as large markers (radius 16px)
- Country paths rendered at base opacity
- No arc lines
- Zoom identity (k=1, translate 0,0)
- Graticule at 12% opacity

### Cluster drill-down: trigger sequence

When user clicks a cluster node (e.g., EuropeWTF):

1. **Compute target transform** from `clusterBounds` in the data. Use the four lat/lng corners to derive a bounding box in screen pixels, then compute the `d3.zoomIdentity` that fits that box within the stage dimensions (with 15% padding).

2. **Animate zoom** via `svg.transition().duration(820).ease(d3.easeCubicInOut).call(zoom.transform, targetTransform)`. The country paths, graticule, and all other map elements scale with the zoom — this is real geographic zoom, not a CSS filter or image crop.

3. **On zoom transition end** (`.on("end", ...)`):
   - Hide the 4 other cluster nodes (opacity transition, 200ms)
   - Reveal the cluster's child nodes with staggered entrance: each child fades in and translates up 8px over 280ms, with 80ms offset between nodes
   - Draw arc lines from cluster hub to each child (strokeDashoffset animation from full length to 0, 400ms, staggered 60ms per arc)
   - Activate the region pressure overlay (see section 4)

4. **Back button:** Calls `zoom.transform()` back to identity. Child nodes fade out during the zoom. Cluster nodes reappear at the end.

### Sub-node selection

Clicking a child node does not trigger a zoom — it opens the panel. The node receives a `gold-ring-pulse` class (a CSS animation: the outer stroke ring expands to 140% diameter and fades, loops 1.5 times then stops). This gives tactile feedback without navigation disruption.

### The Antarctica/System layer problem

The Antarctica, Comedy, DarkHumour, Concepts, and WatchTheFall nodes are meta nodes with no coherent geographic cluster. Two options:

**Option A (Recommended):** Treat the System layer as a **floating overlay panel** rather than a geographic drill-down. Clicking the System cluster node opens a full-width overlay that appears *above* the map (z-index layer), showing the system nodes in the existing symbolic grid style. The geographic map blurs behind it (CSS `filter: blur(4px)`). This is honest about the nodes' non-geographic nature and looks deliberate — like switching from the atlas to the codex.

**Option B:** Pin the system nodes to the North Atlantic / North Sea (conceptually the "WTF home base" — Britain). Works geographically but feels like a hack.

Option A is the right choice. It's editorially coherent (system layer is *above* geography, not *in* it) and technically simpler (no need to force non-geographic nodes into a projection).

### View state machine (formal)

```
WORLD ──click cluster──► CLUSTER_DRILL (zoom + children revealed)
WORLD ──click system──►  SYSTEM_OVERLAY (modal overlay)
CLUSTER_DRILL ──back──►  WORLD (zoom reverse)
CLUSTER_DRILL ──click child──► CLUSTER_DRILL + PANEL_OPEN
SYSTEM_OVERLAY ──close──► WORLD
PANEL_OPEN ──close / click elsewhere──► PANEL_CLOSED (stays in current zoom state)
```

State is stored in three variables: `currentView`, `activeNodeId`, `activeClusterId` — same as the existing v2 pattern. No framework needed.

---

## 4. The Aesthetic Layer

This is where WatchTheFall either wins or loses against every other web map you've ever seen. The default D3 world map looks like a census agency dashboard. The following treatments transform it into something else entirely.

### Country path treatment

**Base style (all countries):**
```css
fill: #060606;
stroke: rgba(212, 175, 55, 0.09);
stroke-width: 0.4px;
```

**WTF-relevant countries** (those with nodes in the dataset) receive a separate CSS class `country--wtf`:
```css
fill: #0c0b09;
stroke: rgba(212, 175, 55, 0.22);
stroke-width: 0.5px;
transition: fill 400ms ease;
```

**Active cluster region** (the countries inside the current drill-down bounding box) receive `country--active`:
```css
fill: rgba(212, 175, 55, 0.045);
stroke: rgba(212, 175, 55, 0.38);
```
This is applied via D3 `.classed()` after the zoom transition completes. The fill transition makes it look like the region "heats up" as the map zooms in.

### SVG filter definitions

Define these in `<defs>` at the top of the SVG. They are referenced by class across all layers.

**Gold node glow (`filter: url(#glow-gold)`):**
```svg
<filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="3" result="blur" />
  <feFlood flood-color="#d4af37" flood-opacity="0.6" result="color" />
  <feComposite in="color" in2="blur" operator="in" result="glow" />
  <feMerge>
    <feMergeNode in="glow" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```
Applied to node circles on hover and when active.

**Country pressure overlay (`filter: url(#pressure-blur)`):**
```svg
<filter id="pressure-blur">
  <feGaussianBlur stdDeviation="18" />
</filter>
```
Used for the large blurred radial gradient behind the active cluster region — creates a "heat signature" effect.

**Subtle vignette on the whole stage:** Not an SVG filter — a CSS `::after` pseudo-element on the stage container:
```css
background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(3, 4, 4, 0.65) 100%);
pointer-events: none;
```
This darkens the edges and focuses the eye on the map centre. Looks like a darkroom photograph.

### The graticule

D3's `d3.geoGraticule()` generates lat/lng lines every 10°. Render them at:
```css
stroke: rgba(212, 175, 55, 0.055);
stroke-width: 0.3px;
fill: none;
```
This creates the "intelligence map / declassified document" feel — barely visible but clearly there. It tells the viewer this is a serious coordinate system, not a decoration. Do not use the default 10° step for the polar regions — suppress graticule lines above 80°N and below 80°S to keep the poles clean.

### Node markers

Replace the current square node buttons with SVG circle markers for the geographic version. Each node is:

- **Outer ring:** `stroke-dasharray` set to the circumference, `stroke-dashoffset` animated to rotate slowly (like a radar lock-on indicator). Rotation rate: 1 full revolution per 8 seconds. Diameter: 36px for cluster nodes, 24px for child nodes.
- **Inner filled circle:** `fill: rgba(5, 5, 5, 0.88)`, `stroke: rgba(212, 175, 55, 0.7)`
- **Logo image:** `<image>` element clipped to the inner circle via `clipPath`. Falls back to initials text.
- **Label:** SVG `<text>` positioned below the circle, `font-family: Archivo Black`, `font-size: 11px`, `fill: rgba(243, 231, 211, 0.85)`

On hover: the outer ring's `stroke` opacity increases to 1 and the glow filter activates. The circle scales to 1.08x via `transform: scale(1.08)` on the SVG group. This is instant feedback, no delay.

### Scan line effect (background texture)

A CSS `repeating-linear-gradient` on the stage container, as a fixed-position decorative layer:
```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 3px,
  rgba(0, 0, 0, 0.04) 3px,
  rgba(0, 0, 0, 0.04) 4px
);
pointer-events: none;
```
Opacity is very low (0.04). This is a "CRT / broadcast monitor" reference that's subliminal — you don't notice it consciously, but it adds density and stops the dark background from looking flat.

### Arc lines (cluster → children)

Great-circle arcs connecting each child node back to its cluster hub. Rendered as SVG `<path>` using `d3.geoPath()` with a geographic link generator. Style:
```css
stroke: rgba(212, 175, 55, 0.28);
stroke-width: 1px;
stroke-dasharray: 4 3;
fill: none;
```
The dashed pattern and low opacity make them read as "signal routes" rather than solid connections. They appear via `stroke-dashoffset` animation (draw-in from 0 over 500ms) when the drill-down opens.

### Pressure overlay (active cluster)

When a cluster drill-down is active, render a large blurred radial gradient beneath the cluster region. This is an SVG `<ellipse>` with `filter: url(#pressure-blur)` and:
```css
fill: rgba(212, 175, 55, 0.08);
```
The blur filter spreads it into a soft "heat" zone beneath the active region. It's the difference between "map with nodes" and "map with atmosphere."

---

## 5. The Impressive Moment

**The first 10 seconds, described precisely.**

The stage is black when the page loads. D3 fetches `world-110m.json` and `fall_map.json` in parallel. While loading, no spinner — just the black stage with the gold border. This silence is intentional. The map earns its entrance.

When both files resolve:

**0ms — 600ms: The world materialises.**
Country paths fade in via an `opacity` transition from 0 to 1 over 600ms. Not a sweep, not a wipe — a pure cross-fade. The whole world at once, out of the dark. The effect: something was hidden and is now being revealed.

**0ms — 1400ms: The graticule draws in.**
The lat/lng grid lines animate using `stroke-dashoffset` from full path length to 0. This is the "hand-drawing the grid" effect — lines extending across the map from west to east over 1.4 seconds with a slight stagger (each graticule line offset by ~40ms from the previous). By the time the country paths have fully faded in, the coordinate grid is completing its final lines. The combination reads as: "the map is coming online."

**600ms — 1800ms: The scan line.**

This is the signature moment.

A single SVG `<rect>` element, full map width, 3px tall, gold fill at 0.6 opacity, positioned at the top of the map. It animates downward from `y=0` to `y=100%` of the SVG height over 1200ms with a linear easing. A `feGaussianBlur` on the rect (stdDeviation 0 4) gives it a slight vertical bloom — it looks less like a line and more like a scanner beam.

As the scan line passes over each landmass, it has no interaction with the country paths — but the timing means the viewer's eye tracks across the full world geography for the first time. Their gaze is guided. They see the whole map before they're asked to click anything.

At the end of the scan line's travel, it fades out over 200ms and is removed from the DOM. It does not repeat.

**1000ms — 1800ms: Cluster nodes enter.**
The 5 cluster nodes appear with a staggered entrance: each materialises at 160ms intervals, scaling from 0 to 1 with a slight overshoot (cubic bezier with overshoot, `cubic-bezier(0.175, 0.885, 0.32, 1.275)`). As each node appears, it emits a single gold ring pulse — a concentric circle that expands from the node's diameter to 3× diameter while fading from 0.6 opacity to 0. Duration 600ms, fires once, not looped. This is the "signal broadcasting" effect. It looks like each node is turning on.

**After 1800ms: idle state.**
The node outer rings begin their slow rotation (1 revolution / 8 seconds). The map is fully interactive. Total intro time: under 2 seconds. The user has not clicked anything yet and already knows this is something different.

**What earns the "that's pretty cool" reaction:**

It's the scan line. Nothing else on a web map does that. It's not a loading animation — it appears *after* the map is visible. It doesn't explain itself. It reads as surveillance, monitoring, oversight. It is the visual manifestation of the WatchTheFall premise: *someone is watching*. A visitor who has never heard of WatchTheFall will stop and think about it for a half-second before they click anything. That half-second of meaning is the entire point.

---

## 6. Phased Build Plan

### Guiding constraint

The current `fall-map.html` is live and linked from the main navigation. It must not break at any phase. All development happens in new files until Phase 4, when a deliberate cutover decision is made.

---

### Phase 1 — Real geography, working interactions, no transitions

**Deliverables:**
- `fall-map-geo.html` (new file — does not affect live map)
- `scripts/fall_map_geo.js` (new file)
- `styles/fall-map-geo.css` (new file, extends `fall-map-v2.css` variables)
- `data/world-110m.json` (self-hosted — download from Natural Earth / TopoJSON CDN and commit)
- `data/fall_map.json` — add `lat`, `lng`, and `clusterBounds` fields to every node

**What Phase 1 produces:**

A real world map rendered in SVG using D3 + Natural Earth projection. All 5 cluster nodes positioned at their geographic lat/lng. Clicking a cluster node immediately (no animation) transitions to showing that cluster's children at their geographic positions. Clicking a child opens the detail panel — same HTML structure as v2's panel, same CSS classes, same content. A "Back to World" button resets the view.

No zoom animation. No scan line. No arc lines. No glow filters. Just: real geography, correct node positions, working interactions, WTF colour scheme applied to country paths and node markers.

This is shippable as a preview/beta. It can be linked from the philosophy page or shared internally without replacing the live map.

**What to check before moving to Phase 2:**
- All node positions look geographically sensible (Ireland isn't floating over Norway)
- Panel content loads correctly for every node
- `clusterBounds` zoom targets frame each region correctly (Britain tight, The West wide)
- Works on mobile (the panel should stack below the map at ≤980px, same as v2)
- No console errors when world-110m.json is served from GitHub Pages

---

### Phase 2 — Zoom state machine + transitions

**Deliverables:** Updates to `scripts/fall_map_geo.js` only.

**What Phase 2 adds:**
- `d3.zoom()` wired up to the SVG
- World → cluster zoom: `clusterBounds` from the JSON → computed `d3.zoomIdentity` → `transition().duration(820)` animation
- Cluster → world: reverse zoom on Back button click
- Child node entrance animation after zoom completes (staggered fade-in + translate-up, 80ms offset per node)
- Arc lines drawn in after zoom completes (strokeDashoffset draw-in, 400ms, staggered 60ms)
- Back button correctly re-hides child nodes and re-shows cluster nodes
- System layer (Antarctica cluster) opens as a modal overlay (Option A from section 3)

**What to check before moving to Phase 3:**
- Zoom transitions feel smooth and don't jank on mid-range mobile hardware
- The Britain zoom is tight enough to show all sub-nations without clipping
- The West zoom is wide enough to show USA + Canada + Australia simultaneously (this will be a very wide view — may need to adjust `clusterBounds`)
- Arc lines don't render on top of node markers (check SVG layer order)
- Back button is reachable and functional during all states

---

### Phase 3 — Intro sequence + aesthetic polish

**Deliverables:** Updates to `scripts/fall_map_geo.js` and `styles/fall-map-geo.css`.

**What Phase 3 adds:**
- Boot animation sequence: map fade-in → graticule draw-in → scan line → cluster node entrance with ring pulses
- SVG filter defs: glow filter, pressure blur filter
- Node outer ring rotation (CSS animation, infinite, slow)
- Country path `country--wtf` class + differential styling
- Country path `country--active` class applied/removed on cluster transitions
- Pressure overlay ellipse appearing/disappearing with cluster drill-downs
- Scan line texture (CSS `repeating-linear-gradient`) on the stage container
- Vignette `::after` element on the stage
- Hover states with glow filter activation

**What to check before moving to Phase 4:**
- Intro sequence timing feels right — not so slow it's annoying, not so fast it's invisible
- Glow filter doesn't kill performance (test on a ~2017 mid-range device or via Chrome DevTools throttling)
- Scan line lands correctly — check it renders as a "beam", not a chunky rectangle
- Country active highlighting actually enhances the drill-down (if it looks wrong, cut it — it's decorative, not structural)
- The whole experience at Phase 3 is something you'd be proud to show a collaborator or funder

---

### Phase 4 — Cutover decision

Phase 4 is a decision, not just a build step. There are two options:

**Option A — Full replacement:**
Rename `fall-map-geo.html` to `fall-map.html`, archive the v2 files. Update the nav link. The symbolic atlas is retired.

**Option B — Toggle:**
Add a view-switcher UI to `fall-map.html` that lets users toggle between "Geographic" and "Atlas" views. The symbolic atlas stays as an alternative mode — potentially appealing as the more abstract/editorial choice. The geographic view becomes the default.

Option B adds maintenance complexity (two rendering paths in one file) but preserves the symbolic atlas as a creative asset. Option A is cleaner. The right answer depends on whether the symbolic atlas has editorial value the owner wants to preserve — that's not a technical question.

Whichever option is chosen: **do not archive the v2 CSS and JS immediately.** Keep them for 30 days after cutover in case something breaks on GitHub Pages that doesn't reproduce locally.

---

## Decisions that need owner input before Phase 1 starts

1. **The West cluster bounding box**: USA + Canada + Australia cannot realistically appear on the same zoomed map view — they're on opposite sides of the planet. A geographic drill-down for "The West" either shows the Western Hemisphere (cutting out Australia) or pulls back to a near-world-view zoom (which is barely a zoom). Recommendation: treat The West as a cluster that zooms to the Western Hemisphere and shows Australia with a visual "satellite" marker in the bottom-right corner of the stage, clearly labelled as geographically offset. This is an editorial choice, not a technical one.

2. **AI / Tech cluster geography**: Currently positioned in Silicon Valley (lat: 37.4, lng: -122.1). This is a reasonable editorial decision but it's worth confirming — some might prefer New York, London, or a deliberately abstract position (e.g., the Pacific Ocean, to make the point that AI has no home).

3. **System layer treatment**: Section 3 recommends Option A (modal overlay) for the Antarctica/System cluster. This is the right call technically. But if the owner wants to see the system nodes floating on the actual map (even with made-up positions), that's buildable — it just needs the creative decision first.

4. **Phase 4 cutover strategy**: Replacement or toggle. This affects how the JS is structured from Phase 1.

---

## Things that are bad ideas (named explicitly, per brief)

**Don't load D3 as an ES module with import statements.** The CDN approach (global `d3` object via script tag) is the only path that works without a build step. Several D3 tutorials use `import` — that requires a bundler.

**Don't try to position the symbolic atlas nodes (x/y percentages) onto the geographic projection.** The v2 coordinates were hand-tuned for the symbolic grid. They bear no relationship to lat/lng and will produce garbage positions on a real projection.

**Don't use a raster tile base layer under the D3 SVG.** The current PNG regional maps (`map-britain.png` etc.) are tempting to keep as background images inside the zoom areas — resist this. They're differently scaled, don't align with the D3 projection, and introduce seam artifacts at zoom transitions. The pure SVG path approach looks better and is fully controllable.

**Don't animate the entire SVG redraw on each state change.** The current v2 approach (`stage.innerHTML = ...`) tears down and rebuilds the entire DOM on every click. For the geographic version, use D3's `selection.join()` and `selection.transition()` to update only what needs to change. This is the difference between 60fps and visible flash.

**Don't add tooltips on hover.** The panel handles all node information. A hover tooltip is redundant, adds visual noise, and on mobile (no hover) becomes inaccessible. The node label below the marker is sufficient signalling.

**Don't use `requestAnimationFrame` loops for the rotating ring effect.** CSS animations (`@keyframes` with `animation: spin 8s linear infinite`) are hardware-accelerated and hand nothing to the JS thread. Use them instead.

---

*End of planning document. Code begins at Phase 1.*
