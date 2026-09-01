/* Service worker: l'app si apre anche senza rete.
   Il guscio sta in cache, i dati passano sempre dalla rete. */
const CACHE = "piano-v1";
const GUSCIO = ["./", "./index.html", "./app.js", "./piano.js", "./manifest.json",
                "./icona-192.png", "./icona-512.png", "./icona-apple.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(GUSCIO)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;                 // le scritture non si toccano
  if (u.hostname.includes("script.google")) return;       // i dati sempre dalla rete

  if (e.request.mode === "navigate") {                    // pagina: rete, poi cache
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok && u.origin === location.origin) {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
    }
    return res;
  }).catch(() => r)));
});
