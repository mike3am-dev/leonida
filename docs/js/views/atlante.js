/** Mappa: immagine della community + schede dei territori (si aprono sul posto) + luoghi di gtasixmap + popover */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, srcBadge } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, insightHtml, vis, sectionOf, districtStats, discoverBtn, isFound } from './shared.js';
import * as mapboard from './mapboard.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('mappa');
const SRC = { stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community' };
const GSM = 'https://www.gtasixmap.com/';
let scrolledZona = null;

/** Immagine locale con ripiego sull'originale online (finché lo script non l'ha scaricata) */
export function img(src, remote, cls = '', alt = '') {
  if (!src && !remote) return '';
  return `<img class="${cls}" src="${esc(src || remote)}" ${src && remote ? `data-fallback="${esc(remote)}"` : ''} alt="${esc(alt)}" loading="lazy">`;
}

/** Cosa c'è in una zona: numeri da spiegare, non «mancano 3» e basta */
function zoneBreakdown(d) {
  const st = progress.get();
  const m = vis(db.missions).filter((x) => x.districtId === d.id), c = vis(db.collectibles).filter((x) => x.districtId === d.id), a = vis(db.activities).filter((x) => x.districtId === d.id);
  const parts = [];
  const mm = m.filter((x) => st.missions[x.id]?.state !== 'completata').length; if (m.length) parts.push(`${mm} mission${mm === 1 ? 'e' : 'i'}`);
  const cm = c.filter((x) => !st.collectibles[x.id]).length; if (c.length) parts.push(`${cm} collezionabil${cm === 1 ? 'e' : 'i'}`);
  const am = a.filter((x) => st.activities[x.id] !== 'completata').length; if (a.length) parts.push(`${am} attività`);
  const pct = (done, tot) => tot ? Math.round(done / tot * 100) : 0;
  return { total: m.length + c.length + a.length, missing: mm + cm + am, text: parts.join(' · '), bars: [['Missioni', m.length - mm, m.length], ['Collezionabili', c.length - cm, c.length], ['Attività', a.length - am, a.length]].filter((b) => b[2]).map(([l, d, t]) => ({ l, d, t, p: pct(d, t) })) };
}

function whatThere(p) {
  const chars = (p.characterIds || []).length;
  const icons = [];
  if (chars) icons.push(`<span class="what"><svg aria-hidden="true"><use href="#i-person"/></svg>${chars}</span>`);
  if (/armer|ammu/i.test(p.kind + p.name)) icons.push('<span class="what"><svg aria-hidden="true"><use href="#i-bolt"/></svg>armi</span>');
  if (/officina|garage|concession|cantiere/i.test(p.kind)) icons.push('<span class="what"><svg aria-hidden="true"><use href="#i-car"/></svg>veicoli</span>');
  if (/banca|gioiell|negozio|minimarket|distributore|alimentari/i.test(p.kind)) icons.push('<span class="what"><svg aria-hidden="true"><use href="#i-star"/></svg>rapinabile</span>');
  if (/club|bar|locale|strip|cabaret/i.test(p.kind)) icons.push('<span class="what"><svg aria-hidden="true"><use href="#i-radio"/></svg>vita notturna</span>');
  return icons.join('');
}

export function popover(id) {
  const it = byId(id); if (!it) return;
  const isPoi = it._type === 'poi', isChr = it._type === 'character';
  const d = isPoi ? byId(it.districtId) : null;
  const im = it.image ? `<img class="pop__img" src="${esc(it.image)}" alt="">` : '';
  const body = document.createElement('div');
  body.innerHTML = `${im}
    <div class="chips" style="margin:var(--s-2) 0">${statusChip(it)}${isPoi && it.kind ? `<span class="chip">${esc(it.kind)}</span>` : ''}${isChr && it.role ? `<span class="chip">${esc(it.role)}</span>` : ''}</div>
    <p class="small">${spoiler.text(it, (it.description || it.bio || it.tagline || '').slice(0, 220))}${(it.description || it.bio || '').length > 220 ? '…' : ''}</p>
    ${isPoi ? `<div class="whats">${whatThere(it) || '<span class="muted small">Cosa c\'è: da scoprire.</span>'}</div>` : ''}
    <div class="actions" style="margin-bottom:0"><a class="btn btn--solid" href="#${isPoi ? `/mappa/${d.id}/${it.id}` : `/personaggi/${it.id}`}">Vai alla scheda</a></div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: it.name, body });
}

/* ---------- Luoghi (schede di gtasixmap, tradotte) ---------- */
const luoghi = () => db.luoghi || [];
const luogoCard = (l) => `<a class="placecard" href="#/mappa/luogo/${esc(l.slug)}">
    <span class="placecard__img">${img(l.hero?.local, l.hero?.src)}</span>
    <span class="placecard__body"><span class="placecard__name">${esc(l.name)}</span><span class="placecard__meta">${esc(l.facts?.Regione || l.facts?.Region || '')}</span></span></a>`;

function landmarkRows(l) {
  const st = progress.get();
  return (l.landmarks || []).map((k, i) => { const id = `lmk-${l.slug}-${i + 1}`; const done = !!st.collectibles[id]; return `
    <div class="check check--lmk" data-done="${done}">
      <button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(id)}" aria-label="${esc(k.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
      <span class="lmk__photo">${img(k.local, k.image)}</span>
      <div class="check__body"><div class="check__title"><span class="lmk__num">${String(i + 1).padStart(2, '0')}</span> ${esc(k.name)}</div>
        ${k.real ? `<div class="small"><span class="muted">Nel mondo reale:</span> ${esc(k.real)}</div>` : ''}
        <div class="small" style="margin-top:4px">${esc(k.text)}</div>
        <a class="btn btn--ghost lmk__map" href="#/mappa?punto=${encodeURIComponent(`lmk:${l.slug}:${i}`)}"><svg aria-hidden="true"><use href="#i-pin"/></svg>Mostra sulla mappa</a>
      </div></div>`; }).join('');
}

function luogoDetail(l) {
  const d = l.districtId ? byId(l.districtId) : null;
  const st = progress.get();
  const found = (l.landmarks || []).filter((k, i) => st.collectibles[`lmk-${l.slug}-${i + 1}`]).length;
  const facts = l.facts || {};
  const near = (l.nearby || []).map((n) => { const t = luoghi().find((x) => x.slug === n.slug); return `<a class="nearcard" href="#/mappa/luogo/${esc(n.slug)}"><span class="nearcard__img">${img(t?.hero?.local, n.image)}</span><span class="nearcard__name">${esc(n.name)}</span><span class="nearcard__dist">${esc(n.distance)}</span></a>`; }).join('');
  const heroImg = l.hero?.local || l.hero?.src;
  return `
    ${backLink('/mappa', 'Mappa')}
    <div class="hero ${heroImg ? '' : 'hero--text'}">${heroImg ? `<img src="${esc(l.hero.local || l.hero.src)}" ${l.hero.local ? `data-fallback="${esc(l.hero.src)}"` : ''} alt=""><div class="hero__veil"></div>` : ''}
      <div class="hero__chips chips">${statusChip(l)}</div>
      <div class="hero__text"><span class="kicker">${esc(d ? d.name : 'Leonida')}</span><h1>${esc(l.name)}</h1></div></div>
    ${l.lead ? `<p class="lede">${esc(l.lead)}</p>` : ''}
    ${l.hero?.caption ? `<p class="caption">${esc(l.hero.caption)} <span class="muted">${esc(l.hero.credit || '')}</span></p>` : ''}
    <div class="card card--glance"><span class="kicker kicker--accent">In breve</span><p>${esc(l.summary || '')}</p>
      <dl class="facts">${Object.entries(facts).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <div class="actions" style="margin:var(--s-3) 0 0"><a class="btn btn--solid" href="#/mappa?punto=${encodeURIComponent('luogo:' + l.slug)}"><svg aria-hidden="true"><use href="#i-map"/></svg>Mostra sulla mappa</a>${d ? `<a class="btn btn--ghost" href="#/mappa?zona=${esc(d.id)}">Territorio: ${esc(d.name)}</a>` : ''}</div></div>
    ${l.mapThumb ? `<div class="mapstrip">${img(l.mapLocal, l.mapThumb, 'mapstrip__img', 'Posizione sulla mappa della community')}${l.xy ? `<span class="mapstrip__xy">X ${esc(String(Math.round(l.xy[0])))} · Y ${esc(String(Math.round(l.xy[1])))}</span>` : ''}</div>` : ''}
    <div class="block">${(l.sections || []).map((s, i) => acc(s.title, `<div class="prose">${(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div>`, i === 0)).join('')}</div>
    ${l.landmarks?.length ? `<div class="block"><header class="section-head section-head--sub"><div><span class="kicker">Da trovare</span><h2>Punti di riferimento</h2></div><span class="count">${found} / ${l.landmarks.length}</span></header>
      <p class="small muted">Posti identificati nei video ufficiali. I nomi vengono dalle insegne; gli abbinamenti con il mondo reale sono ricerca della community. Spunta quelli che hai trovato.</p>
      ${landmarkRows(l)}</div>` : ''}
    ${l.tips?.length ? `<div class="callout callout--tips"><span class="kicker">Consigli dell'esploratore</span><ul>${l.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    ${l.gallery?.length ? `<div class="block"><span class="kicker">Screenshot ufficiali</span><div class="gallery gallery--cap">${l.gallery.map((g) => `<figure>${img(g.local, g.src)}<figcaption>${esc(g.alt)}</figcaption></figure>`).join('')}</div></div>` : ''}
    ${l.faq?.length ? `<div class="block">${acc('Domande frequenti', `<div class="faq">${l.faq.map((f) => `<div class="faq__item"><b>${esc(f.q)}</b><p>${esc(f.a)}</p></div>`).join('')}</div>`, true)}</div>` : ''}
    ${near ? `<div class="block"><span class="kicker">Nei dintorni</span><div class="nearrow">${near}</div></div>` : ''}
    ${l.note ? `<p class="small muted">${esc(l.note)}</p>` : ''}`;
}

function zoneStats(b) {
  return `<div class="card zonestats"><div class="zonestats__head"><span class="kicker kicker--accent">${b.missing === 0 ? 'Territorio completato' : `Da fare qui: ${b.missing}`}</span><span class="small muted">${b.total - b.missing} / ${b.total} fatti</span></div>
    <div class="zonestats__bars">${b.bars.map((x) => `<div class="zonestats__bar"><span>${esc(x.l)}</span><b>${x.d}<small>/${x.t}</small></b><i class="progress"><i style="--p:${x.p}%"></i></i></div>`).join('')}</div></div>`;
}
export const TERRITORY_SLUGS = { 'port-gellhorn': 'dis-port-gellhorn', 'ambrosia': 'dis-ambrosia', 'grassrivers': 'dis-grassrivers', 'hamlet': 'dis-hamlet', 'leonida-keys': 'dis-keys', 'mount-kalaga': 'dis-mount-kalaga', 'waning-sands': 'dis-waning-sands', 'capri': 'dis-capri', 'vice-beach': 'dis-vice-beach' };

/* ---------- Schede delle regioni ----------
   Ordine pensato per chi gioca: chi e cosa c'è (in alto, subito) → cosa mi resta da fare → la guida → i posti. */
const chipLink = (name, places) => { const l = places.find((x) => x.name.toLowerCase().startsWith(name.toLowerCase().split(/[,(]/)[0].trim())); return l ? `<a class="chip chip--btn" href="#/mappa/luogo/${esc(l.slug)}">${esc(name)}</a>` : `<span class="chip">${esc(name)}</span>`; };
function zoneCard(d, expanded, num = 0) {
  const b = zoneBreakdown(d);
  const chars = vis(db.characters).filter((c) => c.districtId === d.id);
  const pois = d.pois || [];
  const mainSlug = Object.keys(TERRITORY_SLUGS).find((k) => TERRITORY_SLUGS[k] === d.id);
  const main = mainSlug ? luoghi().find((l) => l.slug === mainSlug) : null;
  const places = luoghi().filter((l) => l.districtId === d.id && l.slug !== mainSlug);
  const subs = (d.subAreas || []).map((a) => typeof a === 'string' ? a : a.name);
  const photos = [...(d.gallery || []).filter(Boolean).map((src) => ({ src })), ...(d.galleryX || [])];
  const body = `<div class="zone__body">
      ${subs.length || chars.length ? `<div class="zone__who">
        ${subs.length ? `<div><span class="kicker">Quartieri e zone</span><div class="chips">${subs.map((n) => chipLink(n, luoghi().filter((l) => l.districtId === d.id))).join('')}</div></div>` : ''}
        ${chars.length ? `<div><span class="kicker">Chi ci vive</span><div class="chips">${chars.map((c) => `<button class="chip chip--btn" type="button" data-pop="${esc(c.id)}">${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}${esc(c.name)}</button>`).join('')}</div></div>` : ''}
      </div>` : ''}
      ${d.tagline ? `<p class="lede">${esc(d.tagline)}</p>` : ''}
      <div class="prose">${spoiler.wrap(d, `<p>${esc(d.description || 'Descrizione in arrivo.')}</p>`)}</div>
      ${b.total ? zoneStats(b) : ''}
      ${main ? `<a class="guidelink" href="#/mappa/luogo/${esc(main.slug)}"><span class="guidelink__img">${img(main.hero?.local, main.hero?.src)}</span><span><span class="kicker">Guida alla regione</span><b>${esc(main.name)}</b><span class="small muted">Tocca per aprirla${main.landmarks?.length ? ` · ${main.landmarks.length} punti da trovare` : ''}</span></span><svg class="guidelink__arrow" aria-hidden="true"><use href="#i-arrow"/></svg></a>` : ''}
      ${pois.length ? `<span class="kicker">Punti d'interesse (${pois.length})</span><div class="pois">${pois.map((p) => `<button class="poi" type="button" data-pop="${esc(p.id)}">
          <span class="poi__thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : '<svg aria-hidden="true"><use href="#i-pin"/></svg>'}</span>
          <span class="poi__name">${esc(p.name)}</span><span class="poi__kind">${esc(p.kind || '')}${srcBadge(p)}</span>
          <span class="whats whats--mini">${whatThere(p)}</span></button>`).join('')}</div>` : ''}
      ${places.length ? `<span class="kicker">Luoghi con la loro guida</span><div class="placegrid placegrid--mini">${places.map(luogoCard).join('')}</div>` : ''}
      ${photos.length ? `<span class="kicker">Foto</span><div class="zone__photos">${photos.map((g) => `<figure><img src="${esc(g.src)}" ${g.url ? `data-fallback="${esc(g.url)}"` : ''} alt="" loading="lazy">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}</div>` : ''}
      ${d.insight ? acc('Approfondimento', `<div class="prose prose--guide">${d.inspiration ? `<p><b>Ispirato a:</b> ${esc(d.inspiration)}</p>` : ''}${insightHtml(d.insight)}${d.keyFacts?.length ? `<h3>Cosa ricordare</h3><div class="table-wrap"><table><tr><th>Informazione</th><th>Dettaglio</th><th>Affidabilità</th></tr>${d.keyFacts.map((f) => `<tr><td>${esc(f.label)}</td><td>${esc(f.value)}</td><td>${esc(f.reliability || '')}</td></tr>`).join('')}</table></div>` : ''}</div>`) : ''}
      <div class="actions">${discoverBtn(d, { label: 'Scoperta', doneLabel: 'Scoperta ✓', auto: isFound(d) && !progress.get().discovered?.[d.id] })}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>
    </div>`;
  return `<article class="zone ${expanded ? 'is-open' : ''}" id="zona-${esc(d.id)}">${num ? `<span class="bignum-over zone__num" aria-hidden="true">${String(num).padStart(2, '0')}</span>` : ''}
    <button class="zone__head" type="button" data-zone-toggle="${esc(d.id)}" aria-expanded="${expanded}">
      <span class="zone__img">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-map"/></svg>'}</span>
      <span class="zone__text"><span class="zone__name">${esc(d.name)}</span><span class="zone__meta">${esc(d.region || '')}${b.total ? ` · ${b.missing ? 'da fare: ' + b.missing : 'completa'}` : ''}</span><span class="chips">${statusChip(d)}</span></span>
      <svg class="zone__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
    </button>${body}</article>`;
}

function index(zona, q) {
  const order = new Map(vis(db.missions).map((m, i) => [m.id, i]));
  const firstM = (d) => order.get(vis(db.missions).find((m) => m.districtId === d.id)?.id) ?? 999;
  const ds = vis(db.districts).filter((d) => d.id !== 'dis-da-collocare').sort((a, b) => firstM(a) - firstM(b));
  const extra = vis(db.districts).find((d) => d.id === 'dis-da-collocare');
  if (zona && zona !== scrolledZona) { scrolledZona = zona; setTimeout(() => document.getElementById('zona-' + zona)?.scrollIntoView({ block: 'start' }), 30); }
  const all = luoghi();
  const needle = (q || '').toLowerCase();
  const list = needle ? all.filter((l) => (l.name + ' ' + (l.lead || '')).toLowerCase().includes(needle)) : all;
  return `${sectionHead(section, `${ds.length} regioni`)}
    <p class="map-hint"><svg aria-hidden="true"><use href="#i-lock"/></svg><span>La mappa è <b>bloccata</b> e la pagina scorre. Tocca «Tocca per esplorare» per muoverla e ingrandirla; quando hai finito, «Blocca la mappa».</span></p>
    ${mapboard.boardHtml(ds)}
    <input class="input" type="search" placeholder="Cerca un luogo o un quartiere…" value="${esc(q || '')}" data-luogo-q aria-label="Cerca un luogo" style="margin:var(--s-4) 0 var(--s-3)">
    ${needle ? `<div class="placegrid" style="margin-bottom:var(--s-4)">${list.map(luogoCard).join('') || '<p class="muted small">Nessun luogo con questo nome.</p>'}</div>` : ''}
    <div class="zones">${ds.map((d, i) => zoneCard(d, d.id === zona, i + 1)).join('')}${extra ? zoneCard(extra, extra.id === zona) : ''}</div>`;
}

const ZONE_EMOJI = { 'dis-vice-city': '🌆', 'dis-vice-beach': '🏖️', 'dis-keys': '🌴', 'dis-grassrivers': '🐊', 'dis-port-gellhorn': '⚓', 'dis-ambrosia': '🌾', 'dis-mount-kalaga': '⛰️', 'dis-waning-sands': '🏘️', 'dis-hamlet': '🚜', 'dis-capri': '🚤' };

function poiDetail(d, p) {
  const chars = vis(db.characters).filter((c) => (p.characterIds || []).includes(c.id));
  return `
    ${backLink('/mappa?zona=' + d.id, d.name)}
    ${hero(p, { kicker: `${d.name} · ${p.kind || 'Luogo'}`, title: p.name, lede: p.tagline || '', chips: statusChip(p) })}
    <div class="whats" style="margin-bottom:var(--s-4)">${whatThere(p)}</div>
    <div class="prose">${spoiler.wrap(p, `<p class="dropcap">${esc(p.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${p.insight ? `<div class="block">${acc('Approfondimento', `<div class="prose prose--guide">${p.inspiration ? `<p><b>Ispirato a:</b> ${esc(p.inspiration)}</p>` : ''}${insightHtml(p.insight)}${p.toSee ? `<h3>Da vedere</h3><p>${esc(Array.isArray(p.toSee) ? p.toSee.join(' · ') : p.toSee)}</p>` : ''}${p.whoYouMeet ? `<h3>Chi incontri</h3><p>${esc(Array.isArray(p.whoYouMeet) ? p.whoYouMeet.join(', ') : p.whoYouMeet)}</p>` : ''}${p.keyFacts?.length ? `<h3>Cosa ricordare</h3><div class="table-wrap"><table><tr><th>Informazione</th><th>Dettaglio</th><th>Affidabilità</th></tr>${p.keyFacts.map((f) => `<tr><td>${esc(f.label)}</td><td>${esc(f.value)}</td><td>${esc(f.reliability || '')}</td></tr>`).join('')}</table></div>` : ''}<p class="source-line">Tradotto da <a href="${esc(p.insightUrl || 'https://vice-central.com/lieux/')}" target="_blank" rel="noopener">vice-central.com</a>.</p></div>`)}</div>` : ''}
    ${chars.length ? `<div class="block"><span class="kicker">Chi lo frequenta</span><div class="chips" style="margin-top:var(--s-2)">${chars.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}${esc(c.name)}</a>`).join('')}</div></div>` : ''}
    <div class="actions"><button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto su questo luogo</button></div>
`;
}

export function render(params, query) {
  if (params.id === 'luogo' && params.poi) {
    const l = luoghi().find((x) => x.slug === params.poi);
    if (l) { if (l.districtId) progress.setCurrentDistrict(l.districtId); return { left: '', right: luogoDetail(l), show: 'right', accent: section.accent, title: l.name }; }
  }
  const d = params.id ? byId(params.id) : null;
  const p = d && params.poi ? byId(params.poi) : null;
  if (p) { progress.setCurrentDistrict(d.id); return { left: '', right: poiDetail(d, p), show: 'right', accent: section.accent, title: p.name }; }
  // La «scheda completa» della regione non esiste più: è la scheda aperta nella pagina della Mappa
  if (d) { progress.setCurrentDistrict(d.id); history.replaceState(history.state, '', `#/mappa?zona=${d.id}`); return { left: index(d.id, ''), right: '', show: 'left', accent: section.accent, title: d.name }; }
  return { left: index(query.zona, query.q), right: '', show: 'left', accent: section.accent, title: 'Mappa' };
}

/** Mappa interattiva di gtasixmap, a tutto schermo, dentro l'app */
function openGsm(marker) {
  const ov = document.createElement('div'); ov.className = 'map-full map-frame';
  ov.innerHTML = `<div class="map-frame__bar"><span>Mappa interattiva · gtasixmap.com</span><a class="btn btn--ghost" href="${GSM}${marker ? '?marker=' + encodeURIComponent(marker) : ''}" target="_blank" rel="noopener">Apri in Safari</a><button class="icon-btn" type="button" data-close aria-label="Chiudi"><svg aria-hidden="true"><use href="#i-close"/></svg></button></div>
    <iframe src="${GSM}${marker ? '?marker=' + encodeURIComponent(marker) : ''}" title="Mappa interattiva di Leonida" loading="eager" referrerpolicy="no-referrer"></iframe>`;
  ov.querySelector('[data-close]').onclick = () => ov.remove();
  document.body.append(ov);
}

let pending = null;
export function afterRender(root, { remount = true } = {}) {
  if (remount) mapboard.mount(root);
  // «Mostra sulla mappa»: il punto resta in attesa qualche secondo, così sopravvive a un eventuale secondo disegno della pagina
  const punto = new URLSearchParams(location.hash.split('?')[1] || '').get('punto');
  if (punto) { pending = { key: punto, t: Date.now() }; history.replaceState(history.state, '', '#/mappa'); }
  if (pending && Date.now() - pending.t < 4000) { const k = pending.key; setTimeout(() => mapboard.focusPoint(k), 120); } else pending = null;
}

export function bind(root, rerender) {
  mapboard.bind(root);
  root.addEventListener('click', (e) => {
    const pop = e.target.closest('[data-pop]'); if (pop) { popover(pop.dataset.pop); return; }
    const tg = e.target.closest('[data-zone-toggle]');
    if (tg) {
      const z = tg.closest('.zone'); const open = !z.classList.contains('is-open');
      // Un territorio alla volta: chiudo gli altri, la pagina resta ferma
      root.querySelectorAll('.zone.is-open').forEach((o) => { if (o !== z) { o.classList.remove('is-open'); o.querySelector('[data-zone-toggle]')?.setAttribute('aria-expanded', 'false'); } });
      z.classList.toggle('is-open', open); tg.setAttribute('aria-expanded', open);
      scrolledZona = open ? tg.dataset.zoneToggle : null;
      history.replaceState(history.state, '', open ? `#/mappa?zona=${tg.dataset.zoneToggle}` : '#/mappa');
      return;
    }
    const go = e.target.closest('[data-zone-go]');
    if (go) {
      const full = document.querySelector('.mapboard.is-full'); if (full) full.querySelector('[data-mb-tool="full"]')?.click();
      const z = document.getElementById('zona-' + go.dataset.zoneGo); if (!z) return;
      if (!z.classList.contains('is-open')) z.querySelector('[data-zone-toggle]')?.click();
      z.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const g = e.target.closest('[data-gsm]'); if (g) { openGsm(g.dataset.gsm); return; }
    // [data-collect] lo gestisce collezionabili.bind (una sola volta, altrimenti la spunta si annulla da sola)
    const a = e.target.closest('[data-activity]'); if (a) { progress.toggleActivity(a.dataset.activity); rerender(); }
  });
  let t = null;
  root.addEventListener('input', (e) => {
    const q = e.target.closest('[data-luogo-q]'); if (!q) return;
    clearTimeout(t); t = setTimeout(() => { const v = q.value.trim(); const pos = q.selectionStart; history.replaceState(history.state, '', v ? `#/mappa?q=${encodeURIComponent(v)}` : '#/mappa'); rerender(); const n = document.querySelector('[data-luogo-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250);
  });
}
