/* Service worker: l'app si apre anche senza rete.
   Il guscio sta in cache, i dati passano sempre dalla rete.

   Il nome cambia a ogni modifica del guscio: all'attivazione le
   versioni precedenti vengono eliminate. */
const CACHE = "piano-v3";
const GUSCIO = ["./", "./index.html", "./app.js", "./piano.js", "./manifest.json",
                "./icona-192.png", "./icona-512.png", "./icona-apple.png"];

// Questi cambiano spesso durante lo sviluppo: vanno serviti dalla cache
// per la velocità, ma riscaricati in sottofondo a ogni apertura, così
// la volta successiva l'app è già aggiornata senza toccare CACHE.
const VOLATILI = /\/(app|piano)\.js$|\/index\.html$|\/$/;

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
  if (u.hostname.includes("script.google") || u.hostname.includes("googleusercontent")) return;

  if (e.request.mode === "navigate") {                    // pagina: rete, poi cache
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }

  const stessoDominio = u.origin === location.origin;

  // Codice dell'app: rispondo subito con la copia salvata, ma intanto
  // scarico la versione nuova e la metto da parte per la prossima
  // apertura. Senza questo, una modifica caricata su GitHub non
  // arriverebbe mai al telefono.
  if (stessoDominio && VOLATILI.test(u.pathname)) {
    e.respondWith(caches.open(CACHE).then(c =>
      c.match(e.request).then(salvata => {
        const dallaRete = fetch(e.request).then(res => {
          if (res.ok) c.put(e.request, res.clone());
          return res;
        }).catch(() => salvata);
        return salvata || dallaRete;
      })));
    return;
  }

  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok && stessoDominio) {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
    }
    return res;
  }).catch(() => r)));
});
