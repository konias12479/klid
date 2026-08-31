const C = "km-v1";
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html"])));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.mode === "navigate" || req.url.endsWith("index.html")) {
    e.respondWith(
      fetch(req).then(r => {
        const cp = r.clone();
        caches.open(C).then(c => c.put("./index.html", cp));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(fr => {
        const cp = fr.clone();
        caches.open(C).then(c => c.put(req, cp));
        return fr;
      }))
    );
  }
});
