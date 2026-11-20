// Uso: node scripts/controlli/pagine.cjs [larghezza=430] [altezza=932] [max pagine=4000] > risultato.json  (server locale: python3 -m http.server 8080 --directory docs)
// Giro errori: apre tutte le pagine raggiungibili dai link interni e segnala errori JS, testi rotti, link morti, immagini mancanti.
const { chromium } = require('/opt/node-tools/node_modules/playwright/index.js');
(async () => { const br = await chromium.launch(); const W = +(process.argv[2] || 430), H = +(process.argv[3] || 932); const MAX = +(process.argv[4] || 4000);
const c = await br.newContext({ viewport: { width: W, height: H } });
await c.route('https://geuppepguqzhjwiqbvwl.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
await c.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
const p = await c.newPage(); let errs = [];
p.on('pageerror', (e) => errs.push('JS: ' + e.message));
const st = process.env.STATE ? JSON.parse(process.env.STATE) : { version: 6, settings: { welcomeSeen: true, nick: 'Prova', spoilerShield: false, virginMode: false }, missions: {} };
await p.addInitScript((s) => { if (!localStorage.getItem('leonida:progress:v1')) localStorage.setItem('leonida:progress:v1', s); try { sessionStorage.setItem('leonida:trucchi:visti', '1'); } catch {} }, JSON.stringify(st));
await p.goto('http://localhost:8080/#/'); await p.waitForTimeout(2500);
const seen = new Set(), queue = ['#/'], out = []; const miss404 = new Set();
p.on('response', (r) => { if (r.status() === 404 && r.url().includes('localhost')) miss404.add(r.url().replace('http://localhost:8080/', '')); });
while (queue.length && seen.size < MAX) {
  const h = queue.shift(); if (seen.has(h)) continue; seen.add(h); errs = [];
  await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(140);
  const r = await p.evaluate(() => {
    const app = document.getElementById('app'); const t = app.innerText;
    const bad = [];
    for (const re of [/\bundefined\b/, /\bNaN\b/, /\[object Object\]/, /\bnull\b/, /\$\{/, /Infinity/]) { const m = re.exec(t); if (m) bad.push(m[0] + ' → «' + t.slice(Math.max(0, m.index - 50), m.index + 40).replace(/\s+/g, ' ') + '»'); }
    const links = [...app.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href'));
    const empty = t.trim().length < 40;
    const notFound = /non trovat|non esiste|pagina non/i.test(t.slice(0, 300));
    // parole doppie tipo «Capitolo 1 · Capitolo 1»
    const dup = /(Capitolo \d)[ ·:]+\1/i.exec(t);
    return { bad, links, empty, notFound, dup: dup ? dup[0] : '', len: t.length, title: document.title };
  });
  if (errs.length || r.bad.length || r.empty || r.notFound || r.dup) out.push({ h, errs, bad: r.bad, empty: r.empty, notFound: r.notFound, dup: r.dup });
  for (const l of r.links) { const k = l.split('?')[0]; if (!seen.has(l) && !queue.includes(l) && !(seen.has(k) && l.includes('?q='))) queue.push(l); }
}
console.log(JSON.stringify({ pagine: seen.size, inCoda: queue.length, problemi: out, img404: [...miss404] }, null, 1));
await br.close(); })();
