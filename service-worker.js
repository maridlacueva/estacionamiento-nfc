const CACHE_NAME = "estacionamiento-nfc-v2";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {

  // Para páginas HTML intenta primero internet.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copia = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copia);
          });

          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => response || caches.match("./index.html"));
        })
    );

    return;
  }

  // Para los demás archivos usa caché primero.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
