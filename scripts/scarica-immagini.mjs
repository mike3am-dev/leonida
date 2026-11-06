#!/usr/bin/env node
/**
 * Scarica le immagini ufficiali elencate in scripts/immagini.json
 * dentro docs/assets/img, con i nomi che i JSON della guida già usano.
 *
 * Uso:  node scripts/scarica-immagini.mjs
 * Salta i file già presenti. Materiale Rockstar: solo per uso personale.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'scripts', 'immagini.json'), 'utf8'));
const outDir = path.join(root, 'docs', 'assets', 'img');
await mkdir(outDir, { recursive: true });

let ok = 0, skipped = 0, failed = 0;
for (const it of manifest.items) {
  const dest = path.join(outDir, it.file);
  try { await access(dest); skipped++; continue; } catch {}
  await mkdir(path.dirname(dest), { recursive: true });
  // URL relativi = sito Rockstar (con il suffisso di ridimensionamento); URL assoluti = così come sono
  const url = it.url.startsWith('http') ? it.url : manifest.base + it.url + (it.url.endsWith('.png') ? '' : manifest.suffix);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) Safari/605.1.15', Accept: 'image/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) throw new Error('file troppo piccolo, probabilmente non è un\'immagine');
    await writeFile(dest, buf);
    ok++; console.log(`✓ ${it.file} (${Math.round(buf.length / 1024)} KB) → ${it.for}`);
  } catch (e) {
    failed++; console.log(`✗ ${it.file}: ${e.message}\n   ${url}`);
  }
}
console.log(`\n${ok} scaricate · ${skipped} già presenti · ${failed} fallite`);
if (failed) console.log('Per quelle fallite: apri l’indirizzo in Safari, salva l’immagine e rinominala come indicato.');
