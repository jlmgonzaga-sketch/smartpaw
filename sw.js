const CACHE = 'smartpaw-v2';
const ASSETS = ['./', './index.html', './css/style.css', './js/app.js', './js/db.js', './js/camera.js', './js/adafruit.js', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      if (!res || res.status !== 200 || res.type !== 'basic') return res;
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => cached);
  }));
});
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'SmartPaw', body: 'Feeding complete.' };
  self.registration.showNotification(data.title, { body: data.body, icon: './icons/icon-192.png', vibrate: [200, 100, 200] });
});
