// =====================================================================
// WatchTheFall v4 - Fixed Service Worker (PWA-safe, no stale JS issues)
// =====================================================================

// 🔥 Bump this every time you change assets or JS files
const CACHE_NAME = 'wtf-v4-cache-v5';

// 🚫 DO NOT cache dynamic JS files that change often.
// Only cache the stable, static assets that rarely change.
const ASSETS_TO_CACHE = [
    '/',                     // Root
    '/index.html',
    '/watchthefallrecords.html',
    '/feed.html',

    // Styles (stable)
    '/styles/app.css',

    // Static JS utilities (stable)
    '/scripts/utils/version.js',
    '/scripts/social_links.js',

    // Manifest
    '/manifest.json'
];

// =====================================================================
// INSTALL — Pre-cache core static files only
// =====================================================================
self.addEventListener('install', (event) => {
    console.log('✔ Service Worker installing…');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching core assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch((err) => console.error('❌ Cache install error:', err))
    );
});

// =====================================================================
// ACTIVATE — Clear out all older caches
// =====================================================================
self.addEventListener('activate', (event) => {
    console.log('✔ Service Worker activated');

    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('🗑️ Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// =====================================================================
// FETCH — Cache-first for static files. Network-first for everything else.
// This prevents JS from getting stuck in cache.
// =====================================================================
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // 👇 Only use CACHE for files we explicitly added to ASSETS_TO_CACHE
    if (ASSETS_TO_CACHE.includes(url.pathname)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request);
            })
        );
        return;
    }

    // 👇 Everything else: always try network first
    event.respondWith(
        fetch(request)
            .catch(() => {
                // If offline and requesting a page, fall back to index
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// =====================================================================
// OPTIONAL: Background sync placeholder
// =====================================================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('📊 Syncing (placeholder)…');
}