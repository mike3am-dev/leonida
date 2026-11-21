/** Pezzi condivisi tra le viste */
import { db, byId, visible, actNum } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, pad2 } from '../ui/dom.js';
import { isOpen } from '../posture.js';

// hue = colore della banda di testata (ogni sezione il suo), tagline = sottotitolo
export const SECTIONS = [
  { id: 'home', num: 1, title: 'Home', path: '/', icon: 'home', accent: 'magenta', hue: 335, tagline: 'La tua plancia di comando', tab: true },
  { id: 'missioni', num: 2, title: 'Missioni', path: '/missioni', icon: 'flag', accent: 'teal', hue: 172, tagline: 'La storia, capitolo per capitolo', tab: true, bg: 'rapina.jpg' },
  { id: 'meccaniche', num: 3, title: 'Come si gioca', path: '/meccaniche', icon: 'book', accent: 'teal', hue: 150, tagline: 'Ogni sistema di gioco, spiegato', tab: true, bg: 'oceandrive.jpg' },
  { id: 'mappa', num: 4, title: 'Mappa', path: '/mappa', icon: 'map', accent: 'orange', hue: 24, tagline: 'Lo stato di Leonida, regione per regione', tab: true, bg: 'molo.jpg' },
  { id: 'personaggi', num: 5, title: 'Personaggi', path: '/personaggi', icon: 'person', accent: 'magenta', hue: 275, tagline: 'Chi incontri a Leonida', tab: true, bg: 'oceanview-notte.jpg' },
  { id: 'armi', num: 6, title: 'Armi', path: '/armi', icon: 'crosshair', accent: 'magenta', hue: 0, tagline: 'La ruota delle armi', bg: 'oceanview-notte.jpg' },
  { id: 'garage', num: 7, title: 'Veicoli', path: '/veicoli', icon: 'car', accent: 'orange', hue: 205, tagline: 'Auto, moto, barche e velivoli, come nel gioco', bg: 'oceandrive.jpg' },
  { id: 'collezionabili', num: 8, title: 'Collezionabili', path: '/collezionabili', icon: 'star', accent: 'teal', hue: 95, tagline: 'Tutto quello che c’è da trovare', bg: 'palme.jpg' },
  { id: 'trofei', num: 9, title: 'Trofei', path: '/trofei', icon: 'trophy', accent: 'orange', hue: 44, tagline: 'La strada verso il Platino', bg: 'palme.jpg' },
  { id: 'banda', num: 10, title: 'La banda', path: '/banda', icon: 'person', accent: 'magenta', hue: 300, tagline: 'Tu e i tuoi amici: chi è più avanti', bg: 'palme.jpg' },
  { id: 'radio', num: 11, title: 'Radio', path: '/cultura', icon: 'radio', accent: 'orange', hue: 350, tagline: 'Le stazioni e la colonna sonora', bg: 'molo-album.jpg' },
  { id: 'mondo', num: 12, title: 'Mondo', path: '/mondo', icon: 'globe', accent: 'teal', hue: 190, tagline: 'Marchi, app, gang, polizia, TV', bg: 'stripclub.jpg' },
  { id: 'news', num: 13, title: 'News', path: '/news', icon: 'bolt', accent: 'magenta', hue: 5, tagline: 'Notizie e guide, giorno per giorno', bg: 'molo.jpg' },
  { id: 'diario', num: 14, title: 'Appunti', path: '/diario', icon: 'pen', accent: 'magenta', hue: 40, tagline: 'Il taccuino da gioco', bg: 'palme.jpg', hidden: true },
];

export function sectionOf(id) { return SECTIONS.find((s) => s.id === id); }
export function showEx() { return progress.settings().showExamples; }
export function vis(list) { return visible(list, showEx()); }

export function chapterHead(section, { title, kicker, lede } = {}) {
  return `<header class="section-head section-head--band ${section.bg ? 'section-head--img' : ''}" style="--hue:${section.hue || 335}${section.bg ? `;--band-img:url(../assets/img/sfondi/${section.bg})` : ''}"><div><span class="kicker">${esc(kicker || section.tagline || '')}</span><h1>${esc(title || section.title)}</h1></div></header>${lede ? `<p class="lede">${lede}</p>` : ''}`;
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
/** Punti di riferimento (luoghi.json) come voci da trovare: contano nel completamento */
export function landmarkIds(districtId) {
  const out = [];
  for (const l of db.luoghi || []) if (!districtId || l.districtId === districtId) (l.landmarks || []).forEach((k, i) => out.push(`lmk-${l.slug}-${i + 1}`));
  return out;
}
/** Percentuale di GTA VI, una sola per Home e La banda (Mike, 21/11): ogni parte pesa per conto suo,
 *  così i 1.400 collezionabili non schiacciano tutto a 0%. 100% = hai fatto tutto quello che c'è nella guida.
 *  Una parte senza voci nella guida non conta: il suo peso si divide tra le altre. */
export const PESI = [['storia', 50, 'Storia'], ['trofei', 20, 'Trofei'], ['attivita', 15, 'Attività e missioni secondarie'], ['collezionabili', 15, 'Collezionabili']];
export function pesata(parts) {
  let w = 0, sum = 0;
  for (const [k, peso] of PESI) { const p = parts[k]; if (!p?.total) continue; w += peso; sum += peso * Math.min(1, p.done / p.total); }
  return w ? (sum / w) * 100 : 0;
}
/** 0,4% · 3,8% · 12% · 100%: un decimale finché è sotto il 10, poi intero (mai 100 se manca qualcosa) */
export const pctLabel = (x) => (x >= 100 ? '100' : x >= 10 ? String(Math.min(99, Math.floor(x))) : (Math.floor(x * 10) / 10).toLocaleString('it-IT'));
export function stats() {
  const st = progress.get();
  const missions = vis(db.missions);
  const cols = vis(db.collectibles);
  const acts = vis(db.activities);
  const mDone = missions.filter((m) => st.missions[m.id]?.state === 'completata').length;
  const cDone = cols.filter((c) => st.collectibles[c.id]).length;
  const aDone = acts.filter((a) => st.activities[a.id] === 'completata').length;
  const lmk = landmarkIds(), lDone = lmk.filter((id) => st.collectibles[id]).length;
  const side = vis(db.sideMissions || []), sDone = side.filter((m) => st.missions[m.id]?.state === 'completata').length;
  const tro = vis(db.trophies || []), tDone = tro.filter((t) => st.trophies?.[t.id]).length;
  const raw = pesata({ storia: { done: mDone, total: missions.length }, trofei: { done: tDone, total: tro.length },
    attivita: { done: aDone + sDone, total: acts.length + side.length }, collezionabili: { done: cDone + lDone, total: cols.length + lmk.length } });
  return {
    raw, pct: pctLabel(raw),
    missions: { done: mDone, total: missions.length },
    collectibles: { done: cDone, total: cols.length },
    activities: { done: aDone, total: acts.length },
    landmarks: { done: lDone, total: lmk.length },
  };
}

export function districtStats(districtId) {
  const st = progress.get();
  const items = [
    ...vis(db.missions).filter((m) => m.districtId === districtId).map((m) => ({ done: st.missions[m.id]?.state === 'completata' })),
    ...vis(db.collectibles).filter((c) => c.districtId === districtId).map((c) => ({ done: !!st.collectibles[c.id] })),
    ...vis(db.activities).filter((a) => a.districtId === districtId).map((a) => ({ done: st.activities[a.id] === 'completata' })),
    ...landmarkIds(districtId).map((id) => ({ done: !!st.collectibles[id] })),
  ];
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, missing: items.length - done, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

/** Un personaggio è «incontrato» se la sua prima missione è iniziata/completata, o se Mike l'ha segnato a mano */
export function isMet(c) { const st = progress.get(); return !!(c.firstMissionId && st.missions[c.firstMissionId]?.state) || !!st.discovered?.[c.id]; }
/** Una regione è «scoperta» se una sua missione è iniziata/completata, o se segnata a mano */
export function isFound(d) { const st = progress.get(); return vis(db.missions).some((m) => m.districtId === d.id && st.missions[m.id]?.state) || !!st.discovered?.[d.id]; }
/** Bottone «Scoperto / Incontrato» per le schede */
export function discoverBtn(item, { label = 'Scoperto', doneLabel = 'Scoperto ✓', auto = false } = {}) {
  const on = !!progress.get().discovered?.[item.id];
  if (auto) return `<span class="btn btn--ghost is-static"><svg aria-hidden="true"><use href="#i-check"/></svg>${esc(doneLabel)} (dalla storia)</span>`;
  return `<button class="btn ${on ? 'btn--accent' : 'btn--ghost'}" type="button" data-discover="${esc(item.id)}"><svg aria-hidden="true"><use href="#i-${on ? 'check' : 'eye'}"/></svg>${esc(on ? doneLabel : label)}</button>`;
}
export function currentMission() {
  const id = progress.get().current.missionId;
  return id ? byId(id) : null;
}

export function nextMission() {
  const st = progress.get();
  const list = vis(db.missions);
  const cur = currentMission();
  // La prima non toccata, in ordine: una missione saltata nel gioco resta la prossima (20/11)
  return list.find((m) => m !== cur && !st.missions[m.id]?.state) || null;
}

export function missionActLabel(m) {
  const a = db.acts.find((x) => x.id === m.actId);
  return a ? a.title : '';
}
export function hero(item, { kicker = '', title = '', lede = '', chips = '' } = {}) {
  const img = item.image || item.imageUrl;
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
  return `<header class="section-head section-head--band ${section.bg ? 'section-head--img' : ''}" style="--hue:${section.hue || 335}${section.bg ? `;--band-img:url(../assets/img/sfondi/${section.bg})` : ''}"><svg class="section-head__icon" aria-hidden="true"><use href="#n-${esc(section.id)}"/></svg><div><h1>${esc(section.title)}</h1><span class="section-head__tag">${esc(section.tagline || '')}</span></div><span class="count">${esc(count)}</span></header>`;
}
export function galleryHtml(item) {
  const imgs = [...(item.gallery || []).filter(Boolean).map((src) => ({ src })), ...(item.galleryX || [])];
  if (!imgs.length) return '';
  return `<div class="gallery ${imgs.some((g) => g.caption) ? 'gallery--cap' : ''}">${imgs.map((g, i) => `<figure><img src="${esc(g.src)}" ${g.url ? `data-fallback="${esc(g.url)}"` : ''} alt="${esc(g.caption || `${item.name || item.title || ''} ${i + 1}`)}" loading="lazy">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
}
/** Approfondimento in stile articolo: righe «## Titolo» diventano sottotitoli */
export function insightHtml(text) {
  if (!text) return '';
  return text.split(/\n{2,}|\n(?=## )/).map((b) => b.trim()).filter(Boolean).map((b) => b.startsWith('## ') ? `<h3>${esc(b.slice(3))}</h3>` : b.startsWith('# ') ? `<h3>${esc(b.slice(2))}</h3>` : `<p>${esc(b)}</p>`).join('');
}
export function tableHtml(rows) {
  if (!rows?.length) return '';
  return `<div class="table-wrap"><table>${rows.map((r, i) => `<tr>${r.map((c) => `<${i ? 'td' : 'th'}>${esc(c)}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></div>`;
}
/** Seconda etichetta: informazioni non ufficiali dentro una scheda ufficiale (riquadro con la sua etichetta) */
const XLAB = { community: 'Community', rumor: 'Rumor', leak: 'Leak', stampa: 'Stampa' };
export function extrasHtml(item) {
  if (!item?.extras?.length) return '';
  return item.extras.map((e) => `<aside class="xnote xnote--${esc(e.source)}"><span class="chip chip--src-${esc(e.source)}">${esc(XLAB[e.source] || 'Da verificare')}</span><p>${esc(e.text)}</p></aside>`).join('');
}
export function extraChips(item) {
  const set = [...new Set((item?.extras || []).map((e) => e.source))];
  return set.map((s) => `<span class="chip chip--src-${esc(s)}">${esc(XLAB[s] || '')}</span>`).join('');
}
export { isOpen, actNum };

/** Filtro «Tutti · Ce l'ho · Mi mancano» (pillole, non tendina). href(v) costruisce il link con have=v */
export function haveFilter(current, href, { yes = "Ce l'ho", no = 'Mi mancano', counts = null } = {}) {
  const opt = (v, l, n) => `<a role="button" aria-pressed="${current === v}" href="${href(v)}">${l}${n != null ? ` <span class="muted">${n}</span>` : ''}</a>`;
  return `<div class="segmented havefilter" role="group" aria-label="Filtro">${opt('', 'Tutti')}${opt('si', yes, counts?.[0])}${opt('no', no, counts?.[1])}</div>`;
}
export const passHave = (have, ok) => !have || (have === 'si' ? ok : !ok);

/** Iniziali colorate al posto della foto che non c'è */
const HUES = [340, 24, 174, 265, 200, 48, 300, 120];
export const monoParts = (x) => ({ h: HUES[[...x.id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length], ini: monoIni(x.name) });
/** Iniziali per il monogramma: salta soprannomi tra «» o virgolette e segni di punteggiatura («Francisco «Cisco» Delgado» → FD). */
const monoIni = (name = '') => {
  const words = (s) => s.split(/[\s(]+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  const w = words(name.replace(/«[^»]*»|"[^"]*"|“[^”]*”/g, ' '));
  return (w.length ? w : words(name).length ? words(name) : [name]).slice(0, 2).map((x) => x[0] || '').join('').toUpperCase();
};
export const monogram = (x) => { const { h, ini } = monoParts(x); return `<span class="monogram" style="--h:${h}">${esc(ini)}</span>`; };
/** Volto di un personaggio (o logo di una voce): foto locale, altrimenti quella online (`imageUrl`), altrimenti le iniziali.
 *  Se la foto non si carica, app.js mette le iniziali al suo posto (data-mono). */
/** Miniatura leggera di una foto locale (scripts/miniature.py): `mini` 160 px, `mini-m` 480 px. Null se la foto non è locale. */
export const mini = (path, folder = 'mini') => { const m = typeof path === 'string' ? /^((?:\.\.\/)*assets\/img\/)(?!mini)(.+?)\.[a-z0-9]+$/i.exec(path) : null; return m ? `${m[1]}${folder}/${m[2]}.jpg` : null; };
/** `small: true` dove il volto è piccolo (cerchi in Home, legami, taccuino): usa la miniatura, così il telefono non carica le foto intere */
export function face(x, { cls = '', lazy = true, alt = '', small = false } = {}) {
  const chain = [small ? mini(x.image) : null, x.image, x.imageUrl].filter((u, i, a) => u && a.indexOf(u) === i);
  if (!chain.length) return monogram(x);
  const { h, ini } = monoParts(x);
  return `<img ${cls ? `class="${cls}" ` : ''}src="${esc(chain[0])}" ${chain.length > 1 ? `data-fallback="${esc(chain.slice(1).join('|'))}" ` : ''}data-mono="${esc(ini)}" data-hue="${h}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
}
