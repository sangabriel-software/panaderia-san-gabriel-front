// service-worker.js - Mejor para datos que cambian frecuentemente

const CACHE_NAME = 'dynamic-cache-v1';

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request) // 1. Intentar obtener de la red
            .catch(() => {
                // 2. Si la red falla (offline), intentar desde la caché
                return caches.match(event.request);
            })
    );
});