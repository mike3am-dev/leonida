#!/usr/bin/env node
/**
 * Anteprima: una copia della guida «in prova», da far vedere a Mike PRIMA che vada online.
 * Nasce il 19/11/2026, quando la guida è diventata pubblica: le modifiche (soprattutto grafiche) si approvano qui.
 *
 * Uso:  node scripts/anteprima.mjs <nome> [--radice <cartella di un checkout di main>]
 *   Prende i file di docs/ COSÌ COME SONO ORA nella cartella di lavoro (anche non ancora pubblicati) e scrive
 *   <radice>/docs/anteprima/<nome>/ (radice = questo repo, se non la dai). Cancella solo le anteprime vecchie con lo stesso prefisso (es. grafica-1 cancella grafica-*).
 *   L'anteprima usa immagini, font e icone della guida vera (percorsi ../../): i file nuovi di docs/assets vengono
 *   copiati anche nella radice, perché l'anteprima li trovi.
 * Indirizzo: https://mike3am-dev.github.io/leonida/anteprima/<nome>/
 * Ogni anteprima ha un NOME NUOVO (es. 1.0.1-a, 1.0.1-b): il telefono tiene in memoria i file già visti.
 * L'anteprima non installa il service worker e ha una fascetta «ANTEPRIMA». Usa gli stessi progressi e lo stesso
 * Supabase della guida vera: non cambiare il formato dei progressi in un'anteprima.
 * Procedura completa (ramo di lavoro, checkout di main, via libera di Mike): STATO.md, sezione «Anteprima».
 */
import { readFile, writeFile, mkdir, readdir, rm, cp, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--radice');
if (!name || !/^[a-z0-9][a-z0-9.-]{1,30}$/.test(name)) { console.error('Dammi un nome: lettere minuscole, numeri, punti e trattini (es. 1.0.1-a)'); process.exit(1); }
const root = args.includes('--radice') ? path.resolve(args[args.indexOf('--radice') + 1]) : repo;
const src = path.join(repo, 'docs'), base = path.join(root, 'docs', 'anteprima'), out = path.join(base, name);
const UP = '../../';

// Ogni chat ha il suo prefisso (grafica-…, bug-…, caccia-…, gioco-…): si cancellano solo le anteprime vecchie con lo stesso prefisso,
// così le anteprime delle altre chat restano visibili (Mike lavora con più chat in parallelo dal 20/11).
const prefix = name.includes('-') ? name.slice(0, name.lastIndexOf('-') + 1) : name;
try { for (const e of await readdir(base, { withFileTypes: true })) if (e.isDirectory() && (e.name === name || e.name.startsWith(prefix))) await rm(path.join(base, e.name), { recursive: true, force: true }); } catch {}
await mkdir(out, { recursive: true });

async function walk(dir) { const o = []; for (const e of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) o.push(...await walk(p)); else o.push(p); } return o; }
const fix = {
  // nei file JS e nei dati i percorsi partono dalla pagina: assets/… → ../../assets/…
  js: (t) => t.replace(/(["'`])(assets|fonts|icons)\//g, `$1${UP}$2/`),
  json: (t) => t.replace(/"(assets|fonts|icons)\//g, `"${UP}$1/`),
  // nei CSS partono dal file CSS (che sta in css/): ../assets/… → ../../../assets/…
  css: (t) => t.replace(/\.\.\/(assets|fonts|icons)\//g, `../${UP}$1/`),
};
let n = 0;
for (const folder of ['css', 'js', 'data']) for (const f of await walk(path.join(src, folder))) {
  const ext = path.extname(f).slice(1); const dest = path.join(out, path.relative(src, f));
  await mkdir(path.dirname(dest), { recursive: true });
  if (fix[ext]) { let t = fix[ext](await readFile(f, 'utf8')); if (f.endsWith(path.join('js', 'app.js'))) t = t.replace(/window\.__LEONIDA_VERSION__ = '[^']*'/, `window.__LEONIDA_VERSION__ = 'prova ${name}'`); await writeFile(dest, t); }
  else await cp(f, dest);
  n++;
}
let html = await readFile(path.join(src, 'index.html'), 'utf8');
html = html.replace(/(["'(])(assets|fonts|icons)\//g, `$1${UP}$2/`).replace(/<link[^>]+rel="manifest"[^>]*>\s*/i, '')
  .replace('</head>', `<meta name="robots" content="noindex"><style>.anteprima-fascia{position:fixed;z-index:99999;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 86px);transform:translateX(-50%);padding:5px 12px;border-radius:999px;background:#ffd166;color:#1b1024;font:700 11px/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,.35);pointer-events:none;opacity:.92}</style></head>`)
  .replace(/<body([^>]*)>/, `<body$1><div class="anteprima-fascia">Anteprima ${name} · non è online</div>`);
await writeFile(path.join(out, 'index.html'), html); n++;

// file nuovi di immagini, font e icone: servono anche nella radice, dove l'anteprima li va a prendere
let extra = 0;
if (root !== repo) for (const folder of ['assets', 'fonts', 'icons']) for (const f of await walk(path.join(src, folder))) {
  const dest = path.join(root, 'docs', path.relative(src, f));
  try { const [a, b] = [await stat(f), await stat(dest)]; if (a.size === b.size) continue; } catch {}
  await mkdir(path.dirname(dest), { recursive: true }); await cp(f, dest); extra++;
}
console.log(`anteprima «${name}»: ${n} file in ${path.relative(root, out)}${extra ? ` · ${extra} immagini/font nuovi copiati nella radice` : ''}`);
console.log(`https://mike3am-dev.github.io/leonida/anteprima/${name}/`);
