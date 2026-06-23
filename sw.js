const CACHE = 'paz-total-v3';
const BASE = '/paz-total/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'music/instrumental.mp3',
  BASE + 'music/cradle.mp3',
  BASE + 'music/lullaby.mp3',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(ASSETS.map(a => c.add(a).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Always serve index.html for navigation requests within the app
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(BASE + 'index.html')
        .then(cached => cached || fetch(BASE + 'index.html'))
        .catch(() => caches.match(BASE + 'index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(BASE + 'index.html'));
    })
  );
});
