/**
 * PESANTREN AMAN - Service Worker (PWA)
 * PC RMI NU Kabupaten Demak
 */

const CACHE_NAME = 'pesantren-aman-v3.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge SEMUA cache lama secara agresif saat service worker baru aktif
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // BYPASS SEMUA GAMBAR, MEDIA, DAN API DARI SERVICE WORKER
  // Biarkan browser memuat langsung dari network tanpa intervensi cache worker
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/img') ||
    url.pathname.startsWith('/brand') ||
    url.pathname.startsWith('/perangkat-lapangan') ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|pdf)$/i)
  ) {
    return;
  }

  // Hanya tangani navigasi halaman
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
