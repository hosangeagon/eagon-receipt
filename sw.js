const CACHE = 'igum-v7';
const STATIC = [
  './manifest.json',
  './icon-192.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

/* 설치 시 정적 파일만 캐시 (HTML 제외) */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

/* 구버전 캐시 삭제 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k \!== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* HTML -> 항상 네트워크 우선 (캐시 저장 안 함) */
/* 나머지 -> 네트워크 우선, 실패 시 캐시 */
self.addEventListener('fetch', e => {
  const url = e.request.url;
  const isHtml = url.endsWith('.html') || url.endsWith('/');

  if (isHtml) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
