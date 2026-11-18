#!/usr/bin/env node
/**
 * Grafico a barre della completezza della guida (da mandare a Mike a fine aggiornamento).
 * Uso:  node scripts/grafico-completezza.mjs <file.png> [titolo]
 * Legge l'ultima riga di scripts/completezza-storico.json e la confronta con quella prima.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const out = process.argv[2]; const titolo = process.argv[3] || 'Completezza della guida';
const storico = JSON.parse(readFileSync(new URL('./completezza-storico.json', import.meta.url), 'utf8'));
const now = storico[storico.length - 1], prev = storico[storico.length - 2];
const dati = JSON.parse(execFileSync('node', [new URL('./completezza.mjs', import.meta.url).pathname]).toString());
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const groups = [...new Set(dati.rows.map((r) => r.gruppo))];
const bar = (r) => {
  const p = prev?.valori?.[r.nome]; const d = p == null ? null : Math.round((r.pct - p) * 10) / 10;
  return `<div class="row"><span class="name">${esc(r.nome)}</span>
    <span class="track"><i style="width:${r.pct}%"></i>${p != null && d > 0 ? `<s style="left:${p}%;width:${r.pct - p}%"></s>` : ''}</span>
    <span class="val">${r.pct.toLocaleString('it-IT')}%</span><span class="delta">${d > 0 ? '+' + d.toLocaleString('it-IT') : ''}</span>
    <span class="cnt">${r.n} / ${r.t}</span></div>`;
};
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#fbf6f8;font:14px/1.3 -apple-system,'Inter Tight',system-ui,sans-serif;color:#1b1024;padding:22px 24px;width:760px}
h1{font:italic 600 26px Georgia,serif;margin:0} .sub{color:#6b5a76;margin:4px 0 16px}
.media{display:inline-block;margin-left:8px;font:italic 600 26px Georgia,serif;color:#b0124f}
h2{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b5a76;margin:16px 0 6px}
.row{display:grid;grid-template-columns:230px 1fr 54px 44px 72px;align-items:center;gap:10px;height:24px}
.name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.track{position:relative;height:12px;background:#ece3e8;border-radius:4px;overflow:hidden}
.track i{position:absolute;left:0;top:0;bottom:0;background:#c2185b;border-radius:0 4px 4px 0}
.track s{position:absolute;top:0;bottom:0;background:#f48fb1}
.val{text-align:right;font-weight:600} .delta{color:#1b7a3f;font-weight:600;font-size:12px} .cnt{color:#6b5a76;font-size:12px;text-align:right}
.legend{margin-top:14px;color:#6b5a76;font-size:12px;display:flex;gap:16px} .legend b{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:5px}
</style><h1>${esc(titolo)} <span class="media">${dati.media.toLocaleString('it-IT')}%</span></h1>
<div class="sub">${esc(now.versione)} del ${esc(now.data)}${prev ? ` · confronto con ${esc(prev.versione)} (media ${prev.media.toLocaleString('it-IT')}%)` : ''}</div>
${groups.map((g) => `<h2>${esc(g)}</h2>${dati.rows.filter((r) => r.gruppo === g).map(bar).join('')}`).join('')}
<div class="legend"><span><b style="background:#c2185b"></b>già nella guida</span>${prev ? '<span><b style="background:#f48fb1"></b>aggiunto in questo aggiornamento</span>' : ''}<span>i numeri a destra: voci nella guida / totale del gioco</span></div>`;
const tmp = out.replace(/\.png$/, '.html'); writeFileSync(tmp, html);
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright/index.js');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 808, height: 600 }, deviceScaleFactor: 2 });
await p.goto('file://' + tmp); await p.screenshot({ path: out, fullPage: true }); await b.close();
console.log('scritto', out);
