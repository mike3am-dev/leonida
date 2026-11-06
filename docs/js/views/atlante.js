/** Mappa: illustrazione + schede dei territori espandibili + popover per luoghi e persone */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, vis, sectionOf, districtStats } from './shared.js';
import { mapSvg } from './mapsvg.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('mappa');
const SRC = { stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community' };

/** Cosa c'è in una zona: numeri da spiegare, non «mancano 3» e basta */
function zoneBreakdown(d) {
  const st = progress.get();
  const m = vis(db.missions).filter((x) => x.districtId === d.id), c = vis(db.collectibles).filter((x) => x.districtId === d.id), a = vis(db.activities).filter((x) => x.districtId === d.id);
  const parts = [];
  const mm = m.filter((x) => st.missions[x.id]?.state !== 'completata').length; if (m.length) parts.push(`${mm} mission${mm === 1 ? 'e' : 'i'}`);
  const cm = c.filter((x) => !st.collectibles[x.id]).length; if (c.length) parts.push(`${cm} collezionabil${cm === 1 ? 'e' : 'i'}`);
  const am = a.filter((x) => st.activities[x.id] !== 'completata').length; if (a.length) parts.push(`${am} attività`);
  return { total: m.length + c.length + a.length, missing: mm + cm + am, text: parts.join(' · ') };
}

function whatThere(p) {
  // Icone di cosa trovi in un luogo (dalle relazioni note)
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
  const img = it.image ? `<img class="pop__img" src="${esc(it.image)}" alt="">` : '';
  const body = document.createElement('div');
  body.innerHTML = `${img}
    <div class="chips" style="margin:var(--s-2) 0">${statusChip(it)}${isPoi && it.kind ? `<span class="chip">${esc(it.kind)}</span>` : ''}${isChr && it.role ? `<span class="chip">${esc(it.role)}</span>` : ''}</div>
    <p class="small">${spoiler.text(it, (it.description || it.bio || it.tagline || '').slice(0, 220))}${(it.description || it.bio || '').length > 220 ? '…' : ''}</p>
    ${isPoi ? `<div class="whats">${whatThere(it) || '<span class="muted small">Cosa c\'è: da scoprire.</span>'}</div>` : ''}
    <div class="actions" style="margin-bottom:0"><a class="btn btn--solid" href="#${isPoi ? `/mappa/${d.id}/${it.id}` : `/personaggi/${it.id}`}">Vai alla scheda</a></div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: it.name, body });
}

function zoneCard(d, expanded) {
  const b = zoneBreakdown(d);
  const chars = vis(db.characters).filter((c) => c.districtId === d.id);
  const pois = d.pois || [];
  const st = progress.get();
  const body = !expanded ? '' : `<div class="zone__body">
      ${d.tagline ? `<p class="lede">${esc(d.tagline)}</p>` : ''}
      <div class="prose">${spoiler.wrap(d, `<p>${esc(d.description || 'Descrizione in arrivo.')}</p>`)}</div>
      ${b.total ? `<div class="card" style="margin:var(--s-3) 0"><div class="stat"><div class="stat__value">${b.missing === 0 ? 'Zona completa' : `Mancano ${b.missing}`}</div><div class="stat__label">${esc(b.text)}</div></div><div class="progress" style="margin-top:var(--s-2)"><i style="--p:${Math.round((b.total - b.missing) / b.total * 100)}%"></i></div></div>` : ''}
      ${galleryHtml(d)}
      ${d.subAreas?.length ? `<span class="kicker">Quartieri e zone</span><div class="chips" style="margin:var(--s-2) 0 var(--s-4)">${d.subAreas.map((a) => `<span class="chip" title="${esc(typeof a === 'string' ? '' : a.note || '')}">${esc(typeof a === 'string' ? a : a.name)}</span>`).join('')}</div>` : ''}
      ${chars.length ? `<span class="kicker">Chi ci vive</span><div class="chips" style="margin:var(--s-2) 0 var(--s-4)">${chars.map((c) => `<button class="chip chip--btn" type="button" data-pop="${esc(c.id)}">${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}${esc(c.name)}</button>`).join('')}</div>` : ''}
      ${pois.length ? `<span class="kicker">Luoghi (${pois.length})</span><div class="pois">${pois.map((p) => `<button class="poi" type="button" data-pop="${esc(p.id)}">
          <span class="poi__thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : '<svg aria-hidden="true"><use href="#i-pin"/></svg>'}</span>
          <span class="poi__name">${esc(p.name)}</span><span class="poi__kind">${esc(p.kind || '')}${p.status !== 'verificato' ? ' · ' + (SRC[p.source] || 'da verificare') : ''}</span>
          <span class="whats whats--mini">${whatThere(p)}</span></button>`).join('')}</div>` : ''}
      <div class="actions"><a class="btn btn--solid" href="#/mappa/${esc(d.id)}">Scheda completa</a><button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>
    </div>`;
  return `<article class="zone ${expanded ? 'is-open' : ''}" id="zona-${esc(d.id)}">
    <a class="zone__head" href="#/mappa${expanded ? '' : '?zona=' + esc(d.id)}">
      <span class="zone__img">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-map"/></svg>'}</span>
      <span class="zone__text"><span class="zone__name">${esc(d.name)}</span><span class="zone__meta">${esc(d.region || '')}${pois.length ? ` · ${pois.length} luoghi` : ''}${b.total ? ` · ${b.missing ? 'mancano ' + b.missing : 'completa'}` : ''}</span><span class="chips">${statusChip(d)}</span></span>
      <svg class="zone__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
    </a>${body}</article>`;
}

function index(zona) {
  const ds = vis(db.districts).filter((d) => d.id !== 'dis-da-collocare');
  const extra = vis(db.districts).find((d) => d.id === 'dis-da-collocare');
  if (zona) setTimeout(() => document.getElementById('zona-' + zona)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  return `${sectionHead(section, `${ds.length} territori`)}
    <div class="atlas atlas--full">${mapSvg(ds, zona)}
      <button class="btn btn--solid atlas__full" type="button" data-map-full>Schermo intero</button></div>
    <p class="atlas-note">Tocca un segnaposto per aprire la zona qui sotto. Illustrazione originale: le posizioni le verifichi giocando.</p>
    <div class="zones">${ds.map((d) => zoneCard(d, d.id === zona)).join('')}${extra ? zoneCard(extra, extra.id === zona) : ''}</div>`;
}

function detail(d) {
  const b = zoneBreakdown(d);
  const chars = vis(db.characters).filter((c) => c.districtId === d.id);
  const pois = d.pois || [];
  const st = progress.get();
  const missions = vis(db.missions).filter((m) => m.districtId === d.id), cols = vis(db.collectibles).filter((c) => c.districtId === d.id), acts = vis(db.activities).filter((a) => a.districtId === d.id);
  return `
    ${backLink('/mappa?zona=' + d.id, 'Mappa')}
    ${hero(d, { kicker: d.region || 'Leonida', title: d.name, lede: d.tagline || '', chips: statusChip(d) })}
    ${b.total ? `<div class="card"><div class="stat"><div class="stat__value">${b.missing === 0 ? 'Zona completa' : `Mancano ${b.missing}`}</div><div class="stat__label">${esc(b.text)}</div></div><div class="progress" style="margin-top:var(--s-2)"><i style="--p:${Math.round((b.total - b.missing) / b.total * 100)}%"></i></div></div>` : ''}
    <div class="block prose">${spoiler.wrap(d, `<p class="dropcap">${esc(d.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${galleryHtml(d)}
    ${d.subAreas?.length ? `<div class="block"><span class="kicker">Quartieri e zone</span><div class="chips" style="margin-top:var(--s-2)">${d.subAreas.map((a) => `<span class="chip" title="${esc(typeof a === 'string' ? '' : a.note || '')}">${esc(typeof a === 'string' ? a : a.name)}</span>`).join('')}</div></div>` : ''}
    ${chars.length ? `<div class="block"><span class="kicker">Chi ci vive</span><div class="chips" style="margin-top:var(--s-2)">${chars.map((c) => `<button class="chip chip--btn" type="button" data-pop="${esc(c.id)}">${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}${esc(c.name)}</button>`).join('')}</div></div>` : ''}
    <div class="block">
      ${pois.length ? acc(`Luoghi (${pois.length})`, `<div class="pois">${pois.map((p) => `<button class="poi" type="button" data-pop="${esc(p.id)}"><span class="poi__thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : '<svg aria-hidden="true"><use href="#i-pin"/></svg>'}</span><span class="poi__name">${esc(p.name)}</span><span class="poi__kind">${esc(p.kind || '')}</span><span class="whats whats--mini">${whatThere(p)}</span></button>`).join('')}</div>`, true) : ''}
      ${acc(`Missioni qui (${missions.length})`, missions.length ? missions.map((m, i) => row({ href: `#/missioni/${m.id}`, num: String(i + 1).padStart(2, '0'), title: esc(m.title), done: st.missions[m.id]?.state === 'completata' })).join('') : '<p class="muted small">Nessuna missione registrata.</p>')}
      ${acc(`Collezionabili qui (${cols.length})`, cols.length ? cols.map((c) => { const done = !!st.collectibles[c.id]; return `<div class="check" data-done="${done}"><button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(c.id)}" aria-label="${esc(c.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button><div class="check__body"><div class="check__title">${esc(c.name)}</div><div class="check__meta">${esc(byId(c.categoryId)?.name || '')}</div></div></div>`; }).join('') : '<p class="muted small">Nessun collezionabile registrato.</p>')}
      ${acc(`Attività (${acts.length})`, acts.length ? acts.map((a) => { const done = st.activities[a.id] === 'completata'; return `<div class="check" data-done="${done}"><button class="check__box" role="checkbox" aria-checked="${done}" data-activity="${esc(a.id)}" aria-label="${esc(a.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button><div class="check__body"><div class="check__title">${esc(a.name)}</div><div class="check__meta">${esc(a.description || '')}</div></div></div>`; }).join('') : '<p class="muted small">Nessuna attività registrata.</p>')}
    </div>
    <p class="source-line">Fonte: ${esc(d.source)}${d.sourceUrl ? ` · <a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
}

function poiDetail(d, p) {
  const chars = vis(db.characters).filter((c) => (p.characterIds || []).includes(c.id));
  return `
    ${backLink('/mappa/' + d.id, d.name)}
    ${hero(p, { kicker: `${d.name} · ${p.kind || 'Luogo'}`, title: p.name, lede: p.tagline || '', chips: statusChip(p) })}
    <div class="whats" style="margin-bottom:var(--s-4)">${whatThere(p)}</div>
    <div class="prose">${spoiler.wrap(p, `<p class="dropcap">${esc(p.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${chars.length ? `<div class="block"><span class="kicker">Chi lo frequenta</span><div class="chips" style="margin-top:var(--s-2)">${chars.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}${esc(c.name)}</a>`).join('')}</div></div>` : ''}
    <div class="actions"><button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto su questo luogo</button></div>
    <p class="source-line">Fonte: ${esc(p.source)}${p.sourceUrl ? ` · <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''} · in <a href="#/mappa/${esc(d.id)}">${esc(d.name)}</a></p>`;
}

export function render(params, query) {
  const d = params.id ? byId(params.id) : null;
  const p = d && params.poi ? byId(params.poi) : null;
  if (d) progress.setCurrentDistrict(d.id);
  const right = p ? poiDetail(d, p) : d ? detail(d) : '';
  return { left: d ? '' : index(query.zona), right, show: d ? 'right' : 'left', accent: section.accent, title: p?.name || d?.name || 'Mappa' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const pop = e.target.closest('[data-pop]'); if (pop) { popover(pop.dataset.pop); return; }
    if (e.target.closest('[data-map-full]')) {
      const ov = document.createElement('div'); ov.className = 'map-full';
      ov.innerHTML = `<button class="icon-btn map-full__close" type="button" aria-label="Chiudi"><svg aria-hidden="true"><use href="#i-close"/></svg></button><div class="map-full__scroll">${mapSvg(vis(db.districts), null)}</div>`;
      ov.querySelector('.map-full__close').onclick = () => ov.remove();
      ov.addEventListener('click', (ev) => { const a = ev.target.closest('a.pin'); if (a) ov.remove(); });
      document.body.append(ov); const sc = ov.querySelector('.map-full__scroll'); sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 3;
      return;
    }
    const c = e.target.closest('[data-collect]'); if (c) { progress.toggleCollected(c.dataset.collect); rerender(); return; }
    const a = e.target.closest('[data-activity]'); if (a) { progress.toggleActivity(a.dataset.activity); rerender(); }
  });
}
