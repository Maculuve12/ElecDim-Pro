// ElecDim Pro — Service Worker
// Guarda tudo em cache para funcionar 100% offline

const CACHE = 'elecdim-v1';
const FICHEIROS = [
  '/ElecDim-Pro/dimensionador.html',
  '/ElecDim-Pro/manifest.json',
  '/ElecDim-Pro/icon-192.png',
  '/ElecDim-Pro/icon-512.png'
];

// Instalar — guardar ficheiros em cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FICHEIROS))
  );
  self.skipWaiting();
});

// Activar — limpar caches antigas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — servir do cache, ou rede se não houver
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Guardar nova resposta em cache
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
