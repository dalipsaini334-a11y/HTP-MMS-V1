/* HTP MMS service worker - app shell offline. Version badlo jab files update karo. */
const CACHE = 'htp-mms-v25-pr-po-flow';
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon-32.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;                       // Google Sheet sync (POST) ko kabhi nahi chhedna
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // script.google.com etc. direct network
  // network-first: online ho to hamesha latest, offline ho to cache
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('./index.html'); });
    })
  );
});
