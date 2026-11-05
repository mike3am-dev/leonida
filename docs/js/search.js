/**
 * Ricerca globale istantanea e tollerante ai refusi, senza librerie.
 * - normalizza accenti e maiuscole
 * - punteggio per: match esatto, prefisso, trigrammi, distanza di Levenshtein sulle parole
 */
import { db, TYPE_LABEL } from './data.js';

let index = [];

export function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function trigrams(s) { const t = new Set(); const p = `  ${s} `; for (let i = 0; i < p.length - 2; i++) t.add(p.slice(i, i + 3)); return t; }
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

function fieldsOf(item) {
  const f = [item.title, item.name, item.summary, item.description, item.tagline, item.bio, item.body, item.directions, item.region, item.genre, item.host, item.role, item.category, item.manufacturer, item.kind, item.howToGet];
  (item.tips || []).forEach((t) => f.push(t));
  (item.secrets || []).forEach((t) => f.push(t));
  (item.pois || []).forEach((p) => f.push(p.name));
  (item.highlights || []).forEach((h) => f.push(typeof h === 'string' ? h : h.title));
  return f.filter(Boolean).join(' • ');
}

export function buildIndex() {
  const lists = [db.missions, db.districts, db.collectibles, db.activities, db.characters, db.radio, db.brands, db.tips, db.vehicles, db.weapons, db.pois];
  index = lists.flat().map((item) => {
    const title = item.title || item.name || '';
    const body = fieldsOf(item);
    const nt = norm(title), nb = norm(body);
    return { item, title, body, nt, nb, words: new Set(nb.split(' ')), tri: trigrams(nt) };
  });
  return index.length;
}

export function search(query, { limit = 30, showExamples = true } = {}) {
  const q = norm(query);
  if (q.length < 2) return [];
  const qWords = q.split(' ').filter(Boolean);
  const qTri = trigrams(q);
  const out = [];
  for (const e of index) {
    if (!showExamples && e.item.example) continue;
    let score = 0;
    if (e.nt === q) score += 100;
    else if (e.nt.startsWith(q)) score += 60;
    else if (e.nt.includes(q)) score += 40;
    if (e.nb.includes(q)) score += 20;
    let common = 0; for (const t of qTri) if (e.tri.has(t)) common++;
    score += (common / Math.max(1, qTri.size)) * 25;
    for (const w of qWords) {
      if (w.length < 3) continue;
      let best = 99;
      for (const ew of e.words) { if (Math.abs(ew.length - w.length) > 2) continue; const d = lev(w, ew); if (d < best) best = d; if (ew.startsWith(w)) { best = 0; break; } }
      if (best === 0) score += 15; else if (best === 1) score += 10; else if (best === 2 && w.length >= 5) score += 5;
    }
    if (score >= 12) out.push({ ...e, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit).map((e) => ({ item: e.item, title: e.title, type: TYPE_LABEL[e.item._type], snippet: snippet(e.body, qWords) }));
}

function snippet(body, words) {
  const nb = norm(body); let pos = -1;
  for (const w of words) { pos = nb.indexOf(w); if (pos >= 0) break; }
  if (pos < 0) return body.slice(0, 110);
  const start = Math.max(0, pos - 40);
  return (start > 0 ? '…' : '') + body.slice(start, start + 120) + (body.length > start + 120 ? '…' : '');
}
export function highlight(text, query) {
  const words = norm(query).split(' ').filter((w) => w.length >= 2);
  if (!words.length) return text;
  const re = new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}
