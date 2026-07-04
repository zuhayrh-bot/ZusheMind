// ZuShé Mind service worker.
// IMPORTANT: this file must be a real, separately-hosted file (not a blob: URL) for
// Chrome to treat the app as installable and show the real "Install" prompt instead
// of falling back to a plain "Add to Home Screen" shortcut. Blob-URL service workers
// register and run fine, but Chrome's installability checklist specifically excludes
// them — this was the cause of the missing Install prompt.
//
// Keep CACHE_VERSION roughly in sync with APP_BUILD_VERSION in index.html when you
// bump versions, so old caches get cleaned up on update. It doesn't need to match
// exactly — it just needs to change whenever you want old caches invalidated.
const CACHE_VERSION='zushemind-v7-9-5';
const ASSETS=['./','./index.html'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const net=fetch(e.request).then(r=>{
        if(r&&r.status===200){
          const clone=r.clone();
          caches.open(CACHE_VERSION).then(c=>c.put(e.request,clone));
        }
        return r;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});
