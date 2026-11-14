const CACHE = 'vip-restobar-order-v45';
const FILES = ['./', './index.html', './styles.css', './app.js', './config.js', './manifest.webmanifest', './logo.png','./logo-ink.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(FILES.map(file => new Request(file, {cache: 'reload'}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// Serve the app shell immediately from cache, then refresh it quietly when the network is available.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeout = setTimeout(() => controller && controller.abort(), 8000);
  const update = fetch(request, controller ? {signal: controller.signal} : {}).then(response => {
    if (!response.ok) return response;
    const copy = response.clone();
    return caches.open(CACHE).then(cache => cache.put(request, copy).catch(() => {})).then(() => response);
  }).catch(() => null).then(response => {clearTimeout(timeout); return response});
  event.waitUntil(update.then(() => {}));
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html').then(shell => shell || update.then(response => response || new Response('Offline', {status: 503})));
    return update.then(response => response || caches.match('./index.html').then(shell => shell || new Response('Offline', {status: 503})));
  }));
});
