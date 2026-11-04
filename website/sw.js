/**
 * PESANTREN AMAN - Service Worker (PWA Offline-First)
 * PC RMI NU Kabupaten Demak
 */

const CACHE_NAME = 'pesantren-aman-v1.1';
const STATIC_ASSETS = [
  '/',
  '/tentang',
  '/lima-pilar',
  '/unduhan',
  '/kabar',
  '/kontak',
  '/asesmen',
  '/logo-utama.png',
  '/favicon.png',
  '/splash-logo.png',
  '/manifest.json',
  '/css/style.css',
  '/js/main.js',
  '/brand/tokens.css',
  '/brand/icons/pilar-1-pengasuhan-aman.svg',
  '/brand/icons/pilar-2-kepatuhan-hukum.svg',
  '/brand/icons/pilar-3-tata-kelola.svg',
  '/brand/icons/pilar-4-sistem-pengaduan.svg',
  '/brand/icons/pilar-5-evaluasi-berkelanjutan.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and refresh in background (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      });
    }).catch(() => {
      // Fallback bila offline total dan request adalah halaman HTML
      if (event.request.headers.get('accept')?.includes('text/html')) {
        return caches.match('/');
      }
    })
  );
});

