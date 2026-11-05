/** Pezzi condivisi tra le viste */
import { db, byId, visible, actNum } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, pad2 } from '../ui/dom.js';
import { isOpen } from '../posture.js';

export const SECTIONS = [
  { id: 'sessione', num: 1, title: 'Sessione', path: '/', icon: 'home', accent: 'magenta', tab: true },
  { id: 'missioni', num: 2, title: 'Missioni', path: '/missioni', icon: 'flag', accent: 'teal', tab: true },
  { id: 'atlante', num: 3, title: 'Atlante', path: '/atlante', icon: 'map', accent: 'orange', tab: true },
  { id: 'collezionabili', num: 4, title: 'Collezionabili', path: '/collezionabili', icon: 'star', accent: 'teal', tab: true },
  { id: 'veicoli', num: 5, title: 'Garage', path: '/veicoli', icon: 'car', accent: 'orange' },
  { id: 'personaggi', num: 6, title: 'Personaggi', path: '/personaggi', icon: 'person', accent: 'magenta' },
  { id: 'cultura', num: 7, title: 'Radio e Cultura', path: '/cultura', icon: 'radio', accent: 'orange' },
  { id: 'prima-ora', num: 8, title: 'Prima ora', path: '/prima-ora', icon: 'bolt', accent: 'teal' },
  { id: 'diario', num: 9, title: 'Diario', path: '/diario', icon: 'pen', accent: 'magenta' },
  { id: 'online', num: 10, title: 'Online', path: '/online', icon: 'globe', accent: 'teal', disabled: true },
];

export function sectionOf(id) { return SECTIONS.find((s) => s.id === id); }
export function showEx() { return progress.settings().showExamples; }
export function vis(list) { return visible(list, showEx()); }

export function chapterHead(section, { title, kicker, lede } = {}) {
  return `<header class="chapter-head">
    <span class="chapter-num">${pad2(section.num)}</span>
    ${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}
    <h1>${esc(title || section.title)}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </header>`;
}

export function runningHead(left, right = '') {
  return `<div class="running-head"><span class="kicker">${esc(left)}</span><span class="kicker">${esc(right)}</span></div>`;
}

export function backLink(path, label = 'Indice') {
  return `<a class="back-link only-closed" href="#${esc(path)}"><svg aria-hidden="true"><use href="#i-back"/></svg>${esc(label)}</a>`;
}

/** Pagina destra vuota in modalità libro: una bella apertura di capitolo */
export function opener(section, text) {
  return `<div class="opener">
    <span class="chapter-num">${pad2(section.num)}</span>
    <h1>${esc(section.title)}</h1>
    <p class="lede">${text}</p>
  </div>`;
}

/* ---------- Calcoli di completamento ---------- */
export function stats() {
  const st = progress.get();
  const missions = vis(db.missions);
  const cols = vis(db.collectibles);
  const acts = vis(db.activities);
  const mDone = missions.filter((m) => st.missions[m.id]?.state === 'completata').length;
  const cDone = cols.filter((c) => st.collectibles[c.id]).length;
  const aDone = acts.filter((a) => st.activities[a.id] === 'completata').length;
  const total = missions.length + cols.length + acts.length;
  const done = mDone + cDone + aDone;
  return {
    pct: total ? Math.round((done / total) * 100) : 0,
    missions: { done: mDone, total: missions.length },
    collectibles: { done: cDone, total: cols.length },
    activities: { done: aDone, total: acts.length },
  };
}

export function districtStats(districtId) {
  const st = progress.get();
  const items = [
    ...vis(db.missions).filter((m) => m.districtId === districtId).map((m) => ({ done: st.missions[m.id]?.state === 'completata' })),
    ...vis(db.collectibles).filter((c) => c.districtId === districtId).map((c) => ({ done: !!st.collectibles[c.id] })),
    ...vis(db.activities).filter((a) => a.districtId === districtId).map((a) => ({ done: st.activities[a.id] === 'completata' })),
  ];
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, missing: items.length - done, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

export function currentMission() {
  const id = progress.get().current.missionId;
  return id ? byId(id) : null;
}

export function nextMission() {
  const st = progress.get();
  const list = vis(db.missions);
  const cur = currentMission();
  if (cur) {
    const i = list.indexOf(cur);
    return list.slice(i + 1).find((m) => !st.missions[m.id]?.state) || null;
  }
  return list.find((m) => !st.missions[m.id]?.state) || null;
}

export function missionActLabel(m) {
  const a = db.acts.find((x) => x.id === m.actId);
  return a ? a.title : '';
}
export function galleryHtml(item) {
  const imgs = (item.gallery || []).filter(Boolean);
  if (!imgs.length) return '';
  return `<div class="gallery">${imgs.map((src, i) => `<img src="${esc(src)}" alt="${esc(item.name || item.title || '')} ${i + 1}" loading="lazy">`).join('')}</div>`;
}
export { isOpen, actNum };
