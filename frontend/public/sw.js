// Service Worker for caching map tiles and static assets
const CACHE_NAME = 'earcheo-v1.1';
const MAP_TILE_CACHE = 'earcheo-map-tiles-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== MAP_TILE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin or specific external resources
  if (url.origin !== location.origin && 
      !url.hostname.includes('cuzk.gov.cz') &&
      !url.hostname.includes('arcgis.com') &&
      !url.hostname.includes('openstreetmap.org')) {
    return;
  }

  // Map tiles - Cache first, then network
  if (url.pathname.includes('/api/wms-proxy') || 
      url.pathname.includes('/api/ortofoto-proxy') ||
      url.pathname.includes('/api/history-proxy') ||
      url.hostname.includes('tile.openstreetmap.org')) {
    
    event.respondWith(
      caches.open(MAP_TILE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Return cached tile if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fetch and cache for next time
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return a placeholder or cached version if available
            return cache.match(request);
          });
        });
      })
    );
    return;
  }

  // Static assets - Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request);
      })
  );
});

// Message handler for cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

