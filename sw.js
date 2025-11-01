// =====================================================================
// WatchTheFall v4 - Service Worker (PWA)
// =====================================================================

const CACHE_NAME = 'wtf-v4-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/watchthefallrecords.html',
    '/feed.html',
    '/styles/app.css',
    '/scripts/network.js',
    '/scripts/utils/version.js',
    '/scripts/tiktok_section.js',
    '/scripts/worldcup_display.js',
    '/scripts/social_links.js',
    '/scripts/printify_sync.js',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch((err) => console.error('❌ Cache failed:', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request).then((fetchResponse) => {
                    // Cache new requests for HTML, CSS, JS
                    if (
                        event.request.method === 'GET' &&
                        (event.request.url.endsWith('.html') ||
                         event.request.url.endsWith('.css') ||
                         event.request.url.endsWith('.js') ||
                         event.request.url.endsWith('.json'))
                    ) {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, fetchResponse.clone());
                            return fetchResponse;
                        });
                    }
                    return fetchResponse;
                });
            })
            .catch((err) => {
                console.error('❌ Fetch failed:', err);
                // Return offline page if available
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for future use
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Placeholder for syncing followers, worldcup data, etc.
        console.log('📊 Syncing data...');
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}
