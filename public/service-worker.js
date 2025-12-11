// Service Worker mínimo válido para una PWA y compatible con TWA
self.addEventListener("install", (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });
  
  self.addEventListener("fetch", () => {
    // No hacemos nada, solo interceptamos requests
  });
  