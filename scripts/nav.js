/**
 * WatchTheFall — shared nav
 * Drop a <div id="wtf-nav-root"></div> where the nav should appear,
 * or the script will prepend the nav to <body> automatically.
 * Paths are root-relative (/assets/...) — works on watchthefall.com.
 */
(function () {
  'use strict';

  /* ── CSS ─────────────────────────────────────────────────── */
  const CSS = `
#wtf-topnav {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(3, 4, 4, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.35s;
  font-family: "Inter", Arial, sans-serif;
}
#wtf-topnav.scrolled {
  border-bottom-color: rgba(212, 175, 55, 0.45);
}
.wtf-nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.7rem clamp(1rem, 4vw, 2.5rem);
  display: flex;
  align-items: center;
  gap: 1rem;
}
.wtf-nav-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}
.wtf-nav-brand img {
  height: 36px;
  width: auto;
  display: block;
  filter: drop-shadow(0 0 6px rgba(212,175,55,0.2));
}
.wtf-nav-links {
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 1.4vw, 1.4rem);
  flex: 1;
  justify-content: flex-end;
  flex-wrap: nowrap;
}
.wtf-nav-links a {
  color: rgba(243, 231, 211, 0.72);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
  transition: color 0.2s;
}
.wtf-nav-links a:hover,
.wtf-nav-links a.wtf-active {
  color: #d4af37;
}
.wtf-nav-cta {
  display: inline-block;
  margin-left: 0.8rem;
  flex-shrink: 0;
  padding: 0.42rem 1rem;
  background: #d4af37;
  color: #030404 !important;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-radius: 3px;
  white-space: nowrap;
  transition: background 0.2s, opacity 0.2s;
}
.wtf-nav-cta:hover { background: #e5c84a; }

/* Hamburger */
.wtf-nav-burger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 22px;
  height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  flex-shrink: 0;
}
.wtf-nav-burger span {
  display: block;
  width: 100%;
  height: 2px;
  background: rgba(243, 231, 211, 0.85);
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.25s;
}
.wtf-nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.wtf-nav-burger.open span:nth-child(2) { opacity: 0; }
.wtf-nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile drawer */
@media (max-width: 1040px) {
  .wtf-nav-links {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(3, 4, 4, 0.97);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    z-index: 999;
  }
  .wtf-nav-links.open {
    display: flex;
  }
  .wtf-nav-links a {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(243,231,211,0.85);
  }
  .wtf-nav-cta {
    display: none;
  }
  /* Show Build The Machine inside the mobile menu */
  .wtf-nav-links .wtf-mobile-cta {
    display: inline-block;
    padding: 0.6rem 1.6rem;
    background: #d4af37;
    color: #030404 !important;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 3px;
    text-decoration: none;
    margin-top: 0.5rem;
  }
  .wtf-nav-burger {
    display: flex;
    z-index: 1001;
  }
  .wtf-nav-inner {
    position: relative;
    z-index: 1001;
  }
}
`;

  /* ── NAV ITEMS ───────────────────────────────────────────── */
  const NAV_LINKS = [
    { label: 'Home',        href: '/' },
    { label: 'Support',     href: '/donate.html' },
    { label: 'Leaderboard', href: '/#worldcup' },
    { label: 'Shop',        href: '/wtfcreations.html' },
    { label: 'Directory',   href: '/feed.html' },
    { label: 'Fall Map',    href: '/fall-map.html' },
    { label: 'Brandr',      href: '/brandr.html' },
    { label: 'WTF Records', href: '/wtfrecords.html' },
    { label: 'Philosophy',  href: '/philosophy.html' },
  ];

  /* ── ACTIVE STATE ────────────────────────────────────────── */
  function isActive(href) {
    const path = window.location.pathname;
    // Hash-only links (e.g. /#worldcup) are never marked active
    if (href.includes('#')) return false;
    if (href === '/') return path === '/' || path === '/index.html';
    return path === href || path.endsWith(href);
  }

  /* ── BUILD HTML ──────────────────────────────────────────── */
  function buildNav() {
    const linksHtml = NAV_LINKS.map(({ label, href }) => {
      const active = isActive(href) ? ' class="wtf-active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    }).join('\n      ');

    return `
<nav id="wtf-topnav" aria-label="Primary navigation">
  <div class="wtf-nav-inner">
    <a class="wtf-nav-brand" href="/">
      <img src="/assets/watermark/watchthefall_watermark.png" alt="WatchTheFall">
    </a>
    <div class="wtf-nav-links" id="wtf-nav-drawer">
      ${linksHtml}
      <a href="https://build.watchthefall.com" target="_blank" rel="noopener" class="wtf-mobile-cta">Build The Machine</a>
    </div>
    <a href="https://build.watchthefall.com" target="_blank" rel="noopener" class="wtf-nav-cta">Build The Machine</a>
    <button class="wtf-nav-burger" id="wtf-burger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`.trim();
  }

  /* ── INJECT ──────────────────────────────────────────────── */
  function inject() {
    // Styles
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.insertBefore(style, document.head.firstChild);

    // Nav HTML
    const navHtml = buildNav();
    const root = document.getElementById('wtf-nav-root');
    if (root) {
      root.outerHTML = navHtml;
    } else {
      document.body.insertAdjacentHTML('afterbegin', navHtml);
    }

    // Scroll border
    const nav = document.getElementById('wtf-topnav');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // Hamburger toggle
    const burger = document.getElementById('wtf-burger');
    const drawer = document.getElementById('wtf-nav-drawer');
    burger.addEventListener('click', function () {
      const open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close drawer on link click
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
