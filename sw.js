const CACHE_NAME = 'teacher-journal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Успеваемость.html',
  '/Воспитательная.html',
  '/Посещаемость.html',
  '/Рассадка.html',
  '/Соцпаспорт.html',
  '/manifest.json',
  '/icons/launchericon-48.png',
  '/icons/launchericon-72.png',
  '/icons/launchericon-96.png',
  '/icons/launchericon-144.png',
  '/icons/launchericon-192.png',
  '/icons/launchericon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кеширование...');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});