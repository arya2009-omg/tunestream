const CACHE_NAME="tunestream-v2";
const APP_SHELL=["./","./index.html","./manifest.json","./icon-192.svg","./icon-512.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const x=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,x))}return r}).catch(()=>cached)));
});