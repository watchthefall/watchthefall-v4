# Cowork Handoff — watchthefall.com nav + site connection (2026-07-18)

Handoff from the Brandr app chat. You (new cowork chat) work in **`watchthefall_website`** (the marketing site; CNAME → watchthefall.com). The user will paste **3 screenshots**: (1) build.watchthefall.com nav they like, (2) watchthefall.com/brandr.html nav, (3) watchthefall.com/index.html homepage where "Brandr" is missing from the nav.

## The 3 tasks

### A. Connect watchthefall.com ↔ build.watchthefall.com
`build.watchthefall.com` = the "Build the Machine" site (public marketing `/` + Access-gated `/roadmap/` founder hub). It's a **separate** Cloudflare Worker (folder `Desktop/build-the-machine-site`), NOT in this repo. "Connect" = wire the two together — confirm with the user which they want:
- A nav / footer link from watchthefall.com → `https://build.watchthefall.com` (e.g. a "Build the Machine" or "The Machine / Roadmap" item), and/or
- build.watchthefall.com already CTAs to `brandr.online/waitlist`; consider a return link back to watchthefall.com.
- Likely also: unify the visual language (see task C — same nav).

### B. Fix homepage nav — "Brandr" not showing on index.html
⚠️ **It's NOT a missing link.** The `Brandr` item **is already in `index.html`'s source** (it references `brandr.html` — grep confirms 5 refs). So it's a **rendering bug on the homepage** (CSS/responsive/JS hiding it), matching the screenshot arrow. Debug in-browser: check for a display:none / overflow / width-based hide, a JS nav builder, or a duplicated/broken nav block on index.html specifically. Compare index.html's nav markup against brandr.html's (where Brandr renders fine).

### C. Restyle watchthefall.com nav to match build.watchthefall.com (user prefers it)
Current site nav items (keep these): **Home · Support · World Cup · Shop · Directory · Fall Map · Brandr · WTF Records · Philosophy**. Restyle to the build-site look below.

⚠️ **Nav is hardcoded separately on EVERY page** (no shared include) — pages: index, brandr, ai, donate, fall-map, fall-map-geo, feed, philosophy, wtfrecords, watchthefallrecords, wtfcreations, worldcup-history. That's why it drifts (Brandr missing on one page). **Strongly recommend introducing a single shared nav** (a small JS include or a build partial) so it can never drift again — then style it once.

## The nav to emulate (from build.watchthefall.com)
Markup:
```html
<nav id="topnav">
  <div class="nav-inner">
    <a href="/" class="nav-brand">
      <img src="assets/logos/wtf_logo.png" alt="WTF" class="nav-logo">
      <span>WATCH&nbsp;THE&nbsp;FALL</span>
    </a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="support...">Support</a>
      <!-- World Cup, Shop, Directory, Fall Map, Brandr, WTF Records, Philosophy -->
    </div>
    <a href="https://build.watchthefall.com" class="cta" style="padding:.5rem 1.1rem;font-size:.8rem;margin:0;">Build the Machine</a>
  </div>
</nav>
```
CSS (uses vars — map to the site's palette; `--gold` ≈ #f2a93b, `--max` = content width, `--font-mono`):
```css
#topnav { position: fixed; top:0; left:0; right:0; z-index:100; background: rgba(7,7,12,0.74); backdrop-filter: blur(14px); border-bottom:1px solid transparent; transition: border-color .4s; }
#topnav.scrolled { border-bottom-color: var(--border); }
.nav-inner { max-width: var(--max); margin:0 auto; padding:.65rem 1.5rem; display:flex; align-items:center; gap:1.2rem; }
.nav-brand { display:flex; align-items:center; gap:.55rem; text-decoration:none; color:var(--text); font-family:var(--font-mono); font-size:.68rem; letter-spacing:.2em; white-space:nowrap; }
.nav-logo { height:24px; filter: drop-shadow(0 0 6px rgba(242,169,59,.25)); }
.nav-links { display:flex; gap:1.1rem; margin-left:auto; }
.nav-links a { color:var(--muted); text-decoration:none; font-size:.76rem; font-weight:500; letter-spacing:.04em; transition:color .25s; white-space:nowrap; }
.nav-links a:hover, .nav-links a.current { color:var(--gold); }
@media (max-width:1040px){ .nav-links{ display:none; } .nav-inner{ justify-content:space-between; } }
/* NOTE: build-site hides nav-links under 1040px with no mobile menu — add a hamburger for watchthefall.com since it has more items. */
```
Full source: `Desktop/build-the-machine-site/index.html` (`#topnav`) + `style.css` (nav block ~lines 54–75). `#topnav.scrolled` is toggled by JS on scroll>40px.

## Latest product/brand facts to keep in sync (already in this repo)
See **`WEBSITE_SYNC_BRIEF.md`** (pricing £4.99/£9.99/£19.99 + £6.99/£14.99/£24.99; corrected **Founder policy** — never "locked for life / below standard / 12 months"; Brandr positioning; Discord `discord.gg/ZTEtyQz7V`) and **`Instagram_Network_Evidence_2026-07.md`** (documented ~8.38M views / ~5.07M reached / 19 accounts — per-region data for the Fall Map). Cross-check brandr.html pricing/founder copy against the sync brief while you're in there.

## Don't forget
- Once the shared nav exists, add Brandr + the build.watchthefall.com link to ALL pages at once.
- Mobile menu: the site nav has 9 items — needs a hamburger under ~1040px (the build-site nav just hides links, which won't do here).
