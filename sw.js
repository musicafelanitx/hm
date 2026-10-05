/* Service worker de l'app: guarda una còpia de la web per si no hi ha connexió.
   Sempre intenta primer la xarxa, així els canvis es veuen de seguida. */
const CACHE = "hm-v3";
const BASE = [
  "./", "index.html", "4t.html", "5e.html", "6e.html", "linia-del-temps.html", "glossari.html", "audicions.html", "recursos.html",
  "css/estils.css", "js/app.js",
  "dades/sessions.json", "dades/obra-setmana.json", "dades/periodes.json", "dades/recursos.json", "dades/glossari.json", "dades/audicions.json",
  "icones/icona-192.png", "icones/icona-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(claus => Promise.all(claus.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(resposta => {
        const copia = resposta.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return resposta;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
