/** Pezzi condivisi tra le viste */
import { db, byId, visible, actNum } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, pad2 } from '../ui/dom.js';
import { isOpen } from '../posture.js';

// hue = colore della banda di testata (ogni sezione il suo), tagline = sottotitolo
export const SECTIONS = [
  { id: 'home', num: 1, title: 'Home', path: '/', icon: 'home', accent: 'magenta', hue: 335, tagline: 'La tua plancia di comando', tab: true },
  { id: 'missioni', num: 2, title: 'Missioni', path: '/missioni', icon: 'flag', accent: 'teal', hue: 172, tagline: 'La storia, capitolo per capitolo', tab: true },
  { id: 'mappa', num: 3, title: 'Mappa', path: '/mappa', icon: 'map', accent: 'orange', hue: 24, tagline: 'Lo stato di Leonida, territorio per territorio', tab: true },
  { id: 'collezionabili', num: 4, title: 'Collezionabili', path: '/collezionabili', icon: 'star', accent: 'teal', hue: 95, tagline: 'Tutto quello che c’è da trovare', tab: true },
  { id: 'trofei', num: 5, title: 'Trofei', path: '/trofei', icon: 'trophy', accent: 'orange', hue: 44, tagline: 'La strada verso il Platino' },
  { id: 'garage', num: 6, title: 'Garage', path: '/veicoli', icon: 'car', accent: 'orange', hue: 205, tagline: 'I veicoli di Leonida' },
  { id: 'armi', num: 7, title: 'Armi', path: '/armi', icon: 'crosshair', accent: 'magenta', hue: 0, tagline: 'La ruota delle armi' },
  { id: 'personaggi', num: 8, title: 'Personaggi', path: '/personaggi', icon: 'person', accent: 'magenta', hue: 275, tagline: 'Chi incontri a Leonida' },
  { id: 'radio', num: 9, title: 'Radio', path: '/cultura', icon: 'radio', accent: 'orange', hue: 350, tagline: 'Le stazioni e la colonna sonora' },
  { id: 'mondo', num: 10, title: 'Mondo', path: '/mondo', icon: 'globe', accent: 'teal', hue: 190, tagline: 'Marchi, app, gang, polizia, TV' },
  { id: 'news', num: 11, title: 'News', path: '/news', icon: 'bolt', accent: 'magenta', hue: 5, tagline: 'Notizie e guide, giorno per giorno' },
  { id: 'diario', num: 12, title: 'Appunti', path: '/diario', icon: 'pen', accent: 'magenta', hue: 40, tagline: 'Il taccuino da gioco' },
];

export function sectionOf(id) { return SECTIONS.find((s) => s.id === id); }
export function showEx() { return progress.settings().showExamples; }
export function vis(list) { return visible(list, showEx()); }

export function chapterHead(section, { title, kicker, lede } = {}) {
  return `<header class="section-head section-head--band" style="--hue:${section.hue || 335}"><div><span class="kicker">${esc(kicker || section.tagline || '')}</span><h1>${esc(title || section.title)}</h1></div></header>${lede ? `<p class="lede">${lede}</p>` : ''}`;
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
export function hero(item, { kicker = '', title = '', lede = '', chips = '' } = {}) {
  const img = item.image;
  return `<div class="hero ${img ? '' : 'hero--text'}">
    ${img ? `<img src="${esc(img)}" ${item.imageUrl && item.imageUrl !== img ? `data-fallback="${esc(item.imageUrl)}"` : ''} alt="">` : ''}
    ${img ? '<div class="hero__veil"></div>' : ''}
    ${chips ? `<div class="hero__chips chips">${chips}</div>` : ''}
    <div class="hero__text">${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}<h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</div>
  </div>`;
}
export function row({ href, title, meta = '', thumb = '', thumbFallback = '', icon = 'i-arrow', end = '', active = false, done = false, num = null }) {
  const th = thumb ? `<span class="row__thumb"><img src="${esc(thumb)}" ${thumbFallback ? `data-fallback="${esc(thumbFallback)}"` : ''} alt="" loading="lazy"></span>`
    : num !== null ? `<span class="row__thumb row__thumb--num">${esc(num)}</span>`
    : `<span class="row__thumb"><svg aria-hidden="true"><use href="#${esc(icon)}"/></svg></span>`;
  return `<a class="row ${done ? 'row--done' : ''}" href="${esc(href)}" ${active ? 'aria-current="page"' : ''}>${th}<span><span class="row__title">${title}</span>${meta ? `<span class="row__meta">${meta}</span>` : ''}</span><span class="row__end">${end}<svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`;
}
export function acc(title, body, open = false) {
  return `<div class="acc ${open ? 'is-open' : ''}"><button class="acc__btn" type="button"><span class="kicker">${esc(title)}</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button><div class="acc__body">${body}</div></div>`;
}
export function sectionHead(section, count = '') {
  return `<header class="section-head section-head--band" style="--hue:${section.hue || 335}"><svg class="section-head__icon" aria-hidden="true"><use href="#i-${esc(section.icon)}"/></svg><div><h1>${esc(section.title)}</h1><span class="section-head__tag">${esc(section.tagline || '')}</span></div><span class="count">${esc(count)}</span></header>`;
}
export function galleryHtml(item) {
  const imgs = (item.gallery || []).filter(Boolean);
  if (!imgs.length) return '';
  return `<div class="gallery">${imgs.map((src, i) => `<img src="${esc(src)}" alt="${esc(item.name || item.title || '')} ${i + 1}" loading="lazy">`).join('')}</div>`;
}
export { isOpen, actNum };
