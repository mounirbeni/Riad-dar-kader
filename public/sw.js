// Riad Dar Kader — service worker
// Strategy: cache-first for static assets only.
// Navigation requests (HTML) bypass the SW entirely so redirect chains
// are never stored in the cache and cannot create redirect loops.
const CACHE = 'rdk-v3';
const STATIC_EXT = /\.(js|css|woff2?|svg|png|ico|webp|jpg|jpeg)(\?|$)/;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept cross-origin, API routes, or Next.js internals
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/webpack-hmr')) return;

  // Let ALL HTML navigation requests go straight to the network.
  // This prevents any redirect response from being replayed as a loop.
  if (request.mode === 'navigate') return;

  // Cache-first only for static assets
  if (STATIC_EXT.test(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
  }
});
