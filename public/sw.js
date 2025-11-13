const CACHE_NAME = 'story-app-v1';
const DATA_CACHE = 'story-data-cache';
const urlsToCache = [
  '/',             
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/images/logo.png',
  '/images/sample-screenshot.png'
];

// ------------------- INSTALL -------------------
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        urlsToCache.map((url) =>
          fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(() => {
            console.warn(`Failed to cache ${url}`);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// ------------------- ACTIVATE -------------------
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, DATA_CACHE].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ------------------- FETCH -------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // 🌐 API requests (dynamic content)
  if (requestUrl.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch {
          return cache.match(request);
        }
      })
    );
    return;
  }

  // 🏠 SPA navigation fallback (offline-friendly)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 📦 Static assets (CSS/JS/images) + dynamic caching for Vite hashed files
  event.respondWith(
    caches.match(request).then(async (response) => {
      if (response) return response;

      try {
        const fetchResponse = await fetch(request);
        // cache hanya request dari /assets/ (Vite hashed)
        if (requestUrl.pathname.startsWith('/assets/')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fetchResponse.clone());
        }
        return fetchResponse;
      } catch {
        return response;
      }
    })
  );
});

// ------------------- PUSH NOTIFICATIONS -------------------
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.options.body,
      icon: '/images/logo.png',
      badge: '/images/logo.png',
      data: data.data || {},
      actions: [{ action: 'view', title: 'Lihat Detail' }],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  event.notification.close();
  if (event.action === 'view' && event.notification.data?.storyId) {
    const storyId = event.notification.data.storyId;
    event.waitUntil(clients.openWindow(`/detail/${storyId}`));
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});