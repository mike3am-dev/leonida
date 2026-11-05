#!/usr/bin/env node
/**
 * Valida tutti i file in docs/data contro lo schema.
 * Uso:  node scripts/validate.mjs
 * Esce con codice 1 se ci sono errori. Messaggi in italiano.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { schema } from './schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'data');
const errors = [];
const warnings = [];
const data = {};
const ids = {}; // collezione -> Set di id

const err = (file, where, msg) => errors.push(`✗ ${file}.json › ${where}: ${msg}`);
const warn = (file, where, msg) => warnings.push(`△ ${file}.json › ${where}: ${msg}`);

// 1. Lettura
for (const name of Object.keys(schema)) {
  const p = path.join(root, `${name}.json`);
  try {
    data[name] = JSON.parse(await readFile(p, 'utf8'));
  } catch (e) {
    err(name, 'file', e.code === 'ENOENT' ? 'il file non esiste' : `JSON non valido: ${e.message}`);
  }
}
if (errors.length) { report(); process.exit(1); }

// 2. Raccolta degli id (prima di controllare i riferimenti)
const collections = {
  missions: data.missions.items, acts: data.missions.acts, districts: data.districts.items,
  collectibles: data.collectibles.items, categories: data.collectibles.categories,
  activities: data.activities.items, characters: data.characters.items,
  radio: data.radio.items, brands: data.brands.items, tips: data.tips.items, vehicles: data.vehicles.items,
};
for (const [coll, list] of Object.entries(collections)) {
  ids[coll] = new Set();
  if (!Array.isArray(list)) continue;
  for (const it of list) {
    if (it?.id && ids[coll].has(it.id)) err(fileOf(coll), it.id, 'id duplicato');
    if (it?.id) ids[coll].add(it.id);
  }
}
const allIds = new Set(Object.values(ids).flatMap((s) => [...s]));
for (const [coll, set] of Object.entries(ids)) for (const id of set) {
  const dup = Object.entries(ids).filter(([c, s]) => c !== coll && s.has(id));
  if (dup.length) err(fileOf(coll), id, `lo stesso id esiste anche in ${dup.map((d) => d[0]).join(', ')}`);
}

// 3. Controllo dei campi
for (const [name, def] of Object.entries(schema)) {
  const file = data[name];
  checkFields(name, 'busta', file, def.envelope);
  for (const key of ['items', 'acts', 'categories']) {
    if (!def[key]) continue;
    const list = file[key];
    if (!Array.isArray(list)) continue;
    list.forEach((it, i) => {
      const where = it?.id || `${key}[${i}]`;
      checkFields(name, where, it, def[key]);
      if (def.idPrefix && key === 'items' && typeof it?.id === 'string' && !it.id.startsWith(def.idPrefix)) {
        warn(name, where, `l'id dovrebbe iniziare con "${def.idPrefix}"`);
      }
      if (it?.example && !/ESEMPIO/.test(it.title || it.name || '')) {
        err(name, where, 'è marcata example:true ma il titolo non contiene "ESEMPIO"');
      }
      if (!it?.example && /ESEMPIO/.test(it?.title || it?.name || '')) {
        err(name, where, 'il titolo contiene "ESEMPIO" ma example non è true');
      }
      if (it?.status === 'verificato' && it?.example) err(name, where, 'una voce ESEMPIO non può essere "verificato"');
    });
  }
}

// 4. Controlli specifici
for (const m of data.missions.items) {
  for (const o of m.extraObjectives || []) {
    if (!o?.id || !o?.label) err('missions', m.id, 'ogni obiettivo extra deve avere id e label');
  }
  for (const u of m.unlocks || []) {
    if (u?.ref && !allIds.has(u.ref)) warn('missions', m.id, `unlocks punta a "${u.ref}" che non esiste`);
  }
  if ((m.prerequisites || []).includes(m.id)) err('missions', m.id, 'una missione non può essere prerequisito di sé stessa');
}
for (const d of data.districts.items) {
  if (d.map && (typeof d.map.x !== 'number' || typeof d.map.y !== 'number')) err('districts', d.id, 'map.x e map.y devono essere numeri (griglia 0–1000)');
  if (d.map && (d.map.x < 0 || d.map.x > 1000 || d.map.y < 0 || d.map.y > 1000)) err('districts', d.id, 'map.x / map.y fuori dalla griglia 0–1000');
  for (const p of d.pois || []) {
    if (!p?.id || !p?.name) err('districts', d.id, 'ogni POI deve avere id e name');
    if (p?.id && !p.id.startsWith('poi-')) warn('districts', `${d.id} › ${p.id}`, 'gli id dei POI dovrebbero iniziare con "poi-"');
    if (p?.id && allIds.has(p.id)) err('districts', d.id, `il POI "${p.id}" ha lo stesso id di un'altra voce`);
  }
}

// 5. Riepilogo
const total = Object.values(collections).reduce((n, l) => n + (l?.length || 0), 0);
const examples = Object.values(collections).flat().filter((x) => x?.example).length;
const byStatus = {};
for (const it of Object.values(collections).flat()) byStatus[it?.status] = (byStatus[it?.status] || 0) + 1;

report();
console.log(`\n${total} voci in tutto · ${examples} ESEMPIO · ` + Object.entries(byStatus).map(([k, v]) => `${v} ${k}`).join(' · '));
console.log(`Versione dati: ${data.meta.dataVersion} (${data.meta.updatedAt})`);
process.exit(errors.length ? 1 : 0);

/* ---------- utilità ---------- */
function fileOf(coll) { return { acts: 'missions', categories: 'collectibles' }[coll] || coll; }

function checkFields(file, where, obj, def) {
  if (!obj || typeof obj !== 'object') { err(file, where, 'non è un oggetto'); return; }
  for (const [field, type] of Object.entries(def)) {
    const v = obj[field];
    if (Array.isArray(type) && type[0] === 'enum') {
      if (!type.slice(1).includes(v)) err(file, where, `"${field}" vale "${v}", ammessi: ${type.slice(1).join(' | ')}`);
      continue;
    }
    if (typeof type === 'object') {
      if (type.ref) {
        if (v == null || v === '') { if (!type.optional) err(file, where, `manca "${field}"`); continue; }
        if (!ids[type.ref]?.has(v)) err(file, where, `"${field}" punta a "${v}", che non esiste in ${type.ref}`);
      }
      if (type.refList) {
        if (v == null) { err(file, where, `manca la lista "${field}" (può essere vuota: [])`); continue; }
        if (!Array.isArray(v)) { err(file, where, `"${field}" deve essere una lista`); continue; }
        for (const r of v) if (!ids[type.refList]?.has(r)) err(file, where, `"${field}" contiene "${r}", che non esiste in ${type.refList}`);
      }
      continue;
    }
    const optional = type.endsWith('?');
    const base = type.replace('?', '');
    if (v === undefined || v === null) { if (!optional) err(file, where, `manca il campo obbligatorio "${field}"`); continue; }
    const ok = base === 'array' ? Array.isArray(v) : base === 'object' ? typeof v === 'object' : typeof v === base;
    if (!ok) err(file, where, `"${field}" dovrebbe essere ${base}, invece è ${Array.isArray(v) ? 'array' : typeof v}`);
    if (base === 'string' && !optional && v.trim() === '') err(file, where, `"${field}" è vuoto`);
  }
}

function report() {
  if (errors.length) { console.log(`\n${errors.length} errore/i:\n`); errors.forEach((e) => console.log(e)); }
  if (warnings.length) { console.log(`\n${warnings.length} avviso/i:\n`); warnings.forEach((w) => console.log(w)); }
  if (!errors.length) console.log('\n✓ Tutti i dati sono validi.');
}
