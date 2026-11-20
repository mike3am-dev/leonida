// Uso: node scripts/controlli/grafica.cjs 393 852 500 > pro.json  e  node scripts/controlli/grafica.cjs 440 956 500 > promax.json  (server locale su 8080)
// Cerca difetti grafici sugli iPhone: cose che escono dallo schermo o dal loro riquadro, testo che si sovrappone, pagina che scorre di lato.
const { chromium } = require('/opt/node-tools/node_modules/playwright/index.js');
(async () => { const W = +process.argv[2], H = +process.argv[3], MAX = +(process.argv[4] || 400);
const br = await chromium.launch(); const c = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await c.route('https://geuppepguqzhjwiqbvwl.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
await c.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
const p = await c.newPage();
const st = { version: 6, settings: { welcomeSeen: true, nick: 'Lor192', spoilerShield: false }, missions: { 'mis-prologo-lucia': { state: 'completata' }, 'mis-prologo-keys': { state: 'completata' }, 'mis-gear-up': { state: 'in-corso' } }, current: { missionId: 'mis-gear-up', districtId: null }, collectibles: { 'col-riviste-1': 'x' }, trophies: {}, notes: [{ id: 'n1', ts: Date.now(), text: 'Prova di appunto abbastanza lungo per vedere come va a capo sul telefono', missionId: 'mis-gear-up' }] };
await p.addInitScript((s) => { localStorage.setItem('leonida:progress:v1', s); try { sessionStorage.setItem('leonida:trucchi:visti', '1'); } catch {} }, JSON.stringify(st));
await p.goto('http://localhost:8080/#/'); await p.waitForTimeout(2500);
const seen = new Set(), queue = ['#/', '#/game', '#/banda', '#/news', '#/impostazioni', '#/altro', '#/trucchi', '#/ricerca?q=lucia', '#/diario'], found = {};
const tpl = (h) => h.replace(/\?.*$/, '').replace(/\/[^/]+$/, (m) => (h.split('/').length > 2 ? '/:id' : m));
const perTpl = {};
while (queue.length && seen.size < MAX) {
  const h = queue.shift(); if (seen.has(h)) continue; const t = tpl(h); perTpl[t] = (perTpl[t] || 0) + 1; if (perTpl[t] > 25) continue; seen.add(h);
  await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(260);
  // apri i pannelli chiusi della pagina (accordion e details), per controllare anche il contenuto
  await p.evaluate(() => { document.querySelectorAll('#app details').forEach((d) => { d.open = true; }); document.querySelectorAll('#app .acc:not(.is-open) > .acc__btn').forEach((b) => b.click()); }); await p.waitForTimeout(120);
  const r = await p.evaluate((W) => {
    const out = []; const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1) out.push(['pagina', 'la pagina scorre di lato di ' + (document.documentElement.scrollWidth - vw) + 'px']);
    const scrollerX = (el) => { for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (/auto|scroll|hidden|clip/.test(cs.overflowX)) return n; } return null; };
    const name = (el) => (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : el.tagName.toLowerCase());
    const path = (el) => { const a = []; for (let n = el, i = 0; n && n.id !== 'app' && i < 3; n = n.parentElement, i++) a.unshift(name(n)); return a.join(' > '); };
    for (const el of document.querySelectorAll('#app *, .tabbar *, .masthead *, #follow-bar *')) {
      if (el.closest('.mapboard, svg, .anteprima-fascia, .is-hidden, [hidden], .sheet')) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
      const sc = scrollerX(el);
      if (b.right > vw + 1 || b.left < -1) {
        if (sc) { const sb = sc.getBoundingClientRect(); if (sb.right <= vw + 1 && sb.left >= -1) continue; }   // tagliato da un contenitore che scorre o nasconde: va bene
        out.push(['schermo', path(el), Math.round(b.left) + '…' + Math.round(b.right)]);
      }
      // figlio che esce dal riquadro del genitore che ha un bordo o uno sfondo (si vede che sborda)
      const par = el.parentElement; if (!par || par.id === 'app') continue;
      const pcs = getComputedStyle(par); if (/hidden|auto|scroll|clip/.test(pcs.overflowX)) continue;
      const boxed = pcs.borderRightWidth !== '0px' || (pcs.backgroundColor && pcs.backgroundColor !== 'rgba(0, 0, 0, 0)');
      const pb = par.getBoundingClientRect();
      if (boxed && b.right > pb.right + 2 && cs.position !== 'absolute') out.push(['riquadro', path(el), 'esce di ' + Math.round(b.right - pb.right) + 'px da ' + name(par)]);
      // testo spezzato dentro una sola parola troppo lunga
      if (el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 2 && !/hidden|clip|auto|scroll/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis' && cs.display !== 'inline') out.push(['testo', path(el), el.textContent.trim().slice(0, 40)]);
    }
    const links = [...document.querySelectorAll('#app a[href^="#/"]')].map((a) => a.getAttribute('href'));
    return { out, links };
  }, W);
  for (const o of r.out) { const k = o[0] + ' | ' + o[1]; (found[k] ||= { n: 0, ex: o[2] || '', pages: [] }).n++; if (found[k].pages.length < 3) found[k].pages.push(h); }
  for (const l of r.links) if (!seen.has(l) && !queue.includes(l)) queue.push(l);
}
console.log(JSON.stringify({ W, pagine: seen.size, problemi: Object.entries(found).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.ex, v.pages]) }, null, 1));
await br.close(); })();
