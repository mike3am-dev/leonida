#!/usr/bin/env node
/**
 * Quanto è completa la guida, sezione per sezione (0–100%), con lo storico degli aggiornamenti.
 * Uso:  node scripts/completezza.mjs [--salva "v0.37.0"]
 * Stampa la tabella; con --salva aggiunge una riga a scripts/completezza-storico.json.
 * I totali sono quelli del gioco (guide del 18/11); dove il gioco non dà un totale si usa il nostro elenco.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const D = (f) => JSON.parse(readFileSync(new URL(`../docs/data/${f}.json`, import.meta.url), 'utf8'));
const missions = D('missions'), trophies = D('trophies'), coll = D('collectibles'), weapons = D('weapons'),
  vehicles = D('vehicles'), acts = D('activities'), chars = D('characters'), radio = D('radio'), districts = D('districts');

const pois = districts.items.flatMap((d) => d.pois || []);
const pct = (n, t) => (t ? Math.min(100, Math.round((n / t) * 1000) / 10) : 0);
const rows = [];
const add = (gruppo, nome, n, t, nota = '') => rows.push({ gruppo, nome, n, t, pct: pct(n, t), nota });

// Storia
const main = missions.items.filter((m) => !m.optional && !m.kind);
const side = missions.items.filter((m) => m.optional || m.kind);
const full = (m) => (m.objectives || []).length >= 2;
add('Storia', 'Missioni principali (passi)', main.filter(full).length, main.length);
add('Storia', 'Facoltative e compiti (passi)', side.filter(full).length, side.length);
add('Storia', 'Titoli italiani ufficiali', missions.items.filter((m) => m.titleEn).length, missions.items.length);

// Trofei
add('Trofei', 'Trofei con consiglio', trophies.items.filter((t) => t.guide && t.status === 'verificato').length, 55);

// Collezionabili (totali del gioco)
const byCat = (id) => coll.items.filter((i) => i.categoryId === id).length;
for (const c of coll.categories) {
  if (!c.total || c.id === 'cat-rifugi') continue;
  add('Collezionabili', c.name, byCat(c.id), c.total);
}

// Mappa e mondo
const kind = (re) => pois.filter((p) => re.test(p.kind || '')).length;
add('Mappa', 'Operazioni delle bande', kind(/gang|band/i), 39);
add('Mappa', 'Garage', kind(/^garage/i), 12);
add('Mappa', 'Punti con coordinate', pois.filter((p) => Array.isArray(p.xy)).length, pois.length);

// Arsenale e garage
const arms = weapons.items.filter((w) => w.class !== 'equipaggiamento');
add('Arsenale', 'Armi con dati veri', arms.filter((w) => w.stats && Object.keys(w.stats).length).length, arms.length);
add('Arsenale', 'Veicoli confermati', vehicles.items.filter((v) => v.status === 'verificato' || v.whereToFind).length, 557, 'totale del gioco: 557');

// Attività, persone, radio
add('Mondo', 'Attività con requisiti e premi', acts.items.filter((a) => (a.requirements || []).length || (a.rewards || []).length).length, acts.items.length);
add('Mondo', 'Personaggi confermati', chars.items.filter((c) => c.status === 'verificato').length, chars.items.length);
add('Mondo', 'Stazioni radio con scaletta', radio.items.filter((r) => (r.highlights || r.tracks || []).length).length, radio.items.length);

const args = process.argv.slice(2);
const label = args.includes('--salva') ? args[args.indexOf('--salva') + 1] : null;
const STORICO = new URL('./completezza-storico.json', import.meta.url);
const storico = existsSync(STORICO) ? JSON.parse(readFileSync(STORICO, 'utf8')) : [];
const prev = storico[storico.length - 1];
for (const r of rows) {
  const p = prev?.valori?.[r.nome];
  r.delta = p == null ? null : Math.round((r.pct - p) * 10) / 10;
}
const media = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length * 10) / 10;
console.log(JSON.stringify({ media, rows }, null, 2));
if (label) {
  storico.push({ versione: label, data: new Date().toISOString().slice(0, 10), media, valori: Object.fromEntries(rows.map((r) => [r.nome, r.pct])) });
  writeFileSync(STORICO, JSON.stringify(storico, null, 2) + '\n');
}
