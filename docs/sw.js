/*
 * Service worker di Leonida.
 * - Shell (HTML, CSS, JS, font, icone): cache-first, istantanea e offline.
 * - data/*.json: network-first, così gli aggiornamenti arrivano subito;
 *   se sei offline usa l'ultima copia salvata.
 * A OGNI RELEASE: alza VERSION. La cache vecchia viene cancellata.
 */
const VERSION = 'v0.12.1';
const SHELL = `leonida-shell-${VERSION}`;
const DATA = `leonida-data-${VERSION}`;

const SHELL_FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'css/tokens.css', 'css/base.css', 'css/layout.css', 'css/components.css',
  'js/app.js', 'js/router.js', 'js/data.js', 'js/search.js', 'js/spoiler.js', 'js/posture.js',
  'js/store/adapter.js', 'js/store/local-adapter.js', 'js/store/migrations.js', 'js/store/progress.js',
  'js/ui/dom.js', 'js/ui/sheet.js', 'js/ui/panzoom.js',
  'js/views/shared.js', 'js/views/sessione.js', 'js/views/missioni.js', 'js/views/atlante.js',
  'js/views/collezionabili.js', 'js/views/editoriale.js', 'js/views/diario.js', 'js/views/impostazioni.js', 'js/views/ricerca.js', 'js/views/veicoli.js', 'js/views/novita.js', 'js/views/trofei.js', 'js/views/mapsvg.js', 'js/views/mapboard.js', 'js/views/armi.js',
  'fonts/Fraunces-normal.woff2', 'fonts/Fraunces-italic.woff2', 'fonts/InterTight-normal.woff2', 'fonts/InterTight-italic.woff2', 'fonts/PermanentMarker.woff2', 'fonts/Caveat.woff2', 'fonts/Pricedown.otf', 'assets/img/sfondi/palme.jpg',
  'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.all(SHELL_FILES.map((f) => c.add(f).catch(() => console.warn('[sw] non in cache:', f))));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== SHELL && k !== DATA).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data?.type === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // Dati: network-first
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    e.respondWith((async () => {
      const cache = await caches.open(DATA);
      try {
        const fresh = await fetch(e.request, { cache: 'no-store' });
        if (fresh.ok) cache.put(e.request, fresh.clone());
        return fresh;
      } catch {
        const hit = await cache.match(e.request);
        return hit || new Response('{"schemaVersion":1,"items":[]}', { headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }

  // Immagini utente (assets/img): cache quando viste, poi dalla cache
  if (url.pathname.includes('/assets/img/')) {
    e.respondWith((async () => {
      const cache = await caches.open(DATA);
      const hit = await cache.match(e.request);
      if (hit) return hit;
      try { const res = await fetch(e.request); if (res.ok) cache.put(e.request, res.clone()); return res; }
      catch { return Response.error(); }
    })());
    return;
  }

  // Shell: cache-first, con aggiornamento silenzioso in background
  e.respondWith((async () => {
    const cache = await caches.open(SHELL);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const network = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => null);
    if (hit) return hit;
    const res = await network;
    if (res) return res;
    if (e.request.mode === 'navigate') return cache.match('index.html');
    return Response.error();
  })());
});
