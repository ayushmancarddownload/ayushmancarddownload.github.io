/* Service worker for postbnao.com
 * - Pages (HTML):        network first (always fresh when online), cached copy when offline
 * - /_astro/ assets:     cache first (file names contain a hash, so they never go stale)
 * - Images / fonts:      stale-while-revalidate
 * - Anything cross-origin (ads, analytics, comments) is never touched.
 * Bump VERSION to throw away all old caches.
 */
const VERSION = 'v1';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const KEEP = [PAGES, ASSETS, IMAGES];
const OFFLINE_URL = '/offline/';
const MAX_PAGES = 60;
const MAX_IMAGES = 120;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => Promise.all([OFFLINE_URL, '/'].map((u) => cache.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function networkFirst(request, cacheName, fallbackToOffline) {
  const cache = await caches.open(cacheName);
  try {
    const response = await withTimeout(fetch(request), 5000);
    if (response && response.ok && response.status === 200) {
      cache.put(request, response.clone());
      trim(cacheName, MAX_PAGES);
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackToOffline) {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && response.status === 200) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok && response.status === 200) {
        cache.put(request, response.clone());
        if (max) trim(cacheName, max);
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js') return;

  // HTML pages
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGES, true));
    return;
  }

  // Search index entry changes on every build -> always try the network first
  if (url.pathname.endsWith('pagefind-entry.json')) {
    event.respondWith(networkFirst(request, ASSETS, false));
    return;
  }

  // Hashed build output (and the other Pagefind files, which are content-hashed too)
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/pagefind/')) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  // Images, fonts
  if (/\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, IMAGES, MAX_IMAGES));
  }
});
