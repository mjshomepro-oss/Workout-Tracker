const CACHE = 'wt-v97';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE).then(c => c.addAll(['.', 'index.html'])))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Network-first: always try the network, fall back to cache.
// The app's own files are fetched with cache: 'no-cache' so the browser
// re-checks with GitHub Pages every time; its max-age=600 header otherwise
// let a reopen show a version up to 10 minutes old (11/11/2026).
self.addEventListener('fetch', e => {
  const sameOrigin = new URL(e.request.url).origin === self.location.origin;
  const net = sameOrigin && e.request.method === 'GET'
    ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : fetch(e.request);
  e.respondWith(
    net
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
