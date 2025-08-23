// Service Worker per caching font
const CACHE_NAME = 'fonts-v1';
const FONT_URLS = [
  './fonts/PPNeueMontreal-Medium.woff2',
  './fonts/PPNeueMontreal-Bold.woff2',
  './fonts/PPNeueMontreal-Regular.woff2',
  './fonts/PPNeueMontreal-Book.woff2',
  './fonts/NeueHaasGrotDispRound-55Roman-Web.woff2',
  './fonts/NeueHaasGrotDispRound-35Thin-Web.woff2'
];

// Install - pre-cache fonts
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FONT_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch - serve fonts from cache
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/fonts/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});