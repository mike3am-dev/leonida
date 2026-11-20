// Uso: node scripts/controlli/screenshot.cjs <cartella di uscita>  → <pagina>-<pro|promax|duo>.png di Home, Game, Missioni, una missione, Mappa (server locale su 8080). Si mandano a Mike con SendUserFile.
const { chromium } = require('/opt/node-tools/node_modules/playwright/index.js');
const OUT = process.argv[2];
const DEV = { pro: [393, 852], promax: [440, 956], duo: [703, 1000] };
const PAGES = [
  ['1-home', '#/'],
  ['2-game', '#/game'],
  ['3-missioni', '#/missioni'],
  ['4-missione', '#/missioni/mis-just-a-scratch'],
  ['6-veicoli', '#/veicoli'],
  ['5-mappa', '#/mappa', async (p) => { const b = await p.$('[data-mb-base="ufficiale"]'); if (b) { await b.click(); await p.waitForTimeout(2500); } }],
];
const st = JSON.stringify({ version: 6, settings: { welcomeSeen: true, nick: 'Mike3am', spoilerShield: true }, missions: { 'mis-prologo-keys': { state: 'completata' }, 'mis-gear-up': { state: 'completata' }, 'mis-just-a-scratch': { state: 'in corso' } } });
(async () => { const br = await chromium.launch();
for (const [d, [w, h]] of Object.entries(DEV)) {
  const c = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await c.route('https://geuppepguqzhjwiqbvwl.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
  await c.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  await c.addInitScript((s) => { localStorage.setItem('leonida:progress:v1', s); try { sessionStorage.setItem('leonida:trucchi:visti', '1'); } catch {} }, st);
  for (const [name, hash, fn] of PAGES) {
    const p = await c.newPage(); p.on('pageerror', (e) => console.log(d, name, 'ERR', e.message));
    await p.goto('http://localhost:8080/' + hash); await p.waitForTimeout(2500);
    if (fn) await fn(p);
    await p.screenshot({ path: `${OUT}/${name}-${d}.png` }); await p.close();
  }
  await c.close();
}
await br.close(); })();
