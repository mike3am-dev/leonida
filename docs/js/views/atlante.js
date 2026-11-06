import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, vis, sectionOf, districtStats } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('mappa');

export function mapSvg(activeId) {
  const districts = vis(db.districts);
  const hasPhoto = db.meta.mapImage;
  return `<div class="atlas">
    <svg viewBox="0 0 1000 1000" role="img" aria-label="Mappa schematica di Leonida">
      ${hasPhoto ? `<image href="${esc(hasPhoto)}" width="1000" height="1000" preserveAspectRatio="xMidYMid slice"/>` : `
      <rect class="sea" width="1000" height="1000"/>
      <path class="contour" d="M120 80 Q 380 40 700 70 Q 900 110 920 400 Q 940 700 820 900 Q 600 980 300 900 Q 80 760 120 80 Z"/>
      <path class="land" d="M170 130 Q 380 100 680 120 Q 860 160 870 420 Q 880 690 800 840 Q 620 930 340 880 Q 160 760 170 130 Z"/>
      <g class="compass" transform="translate(905 905)"><circle r="34"/><path d="M0 -26 L8 0 L0 26 L-8 0 Z" fill="currentColor"/><text y="-40" text-anchor="middle" font-size="16" fill="currentColor" stroke="none">N</text></g>`}
      ${districts.map((d) => d.map?.path ? `
        <a href="#/mappa/${esc(d.id)}" aria-label="${esc(d.name)}">
          <path class="region ${d.example ? 'region--example' : ''}" data-active="${d.id === activeId}" d="${esc(d.map.path)}"/>
          <text class="label" x="${d.map.x}" y="${d.map.y}" text-anchor="middle">${esc(d.name)}</text>
        </a>` : '').join('')}
      <text class="label label--sm" x="500" y="60" text-anchor="middle">Stato di Leonida</text>
    </svg>
  </div>
  <p class="atlas-note">Illustrazione schematica originale. Le posizioni sono indicative finché non le verifichi giocando.</p>`;
}

function index(activeId) {
  const ds = vis(db.districts);
  return `${sectionHead(section, `${ds.length} territori`)}
    ${mapSvg(activeId)}
    <div class="cards" style="margin-top:var(--s-5)">
      ${ds.map((d, i) => { const s = districtStats(d.id); const pois = (d.pois || []).length; return `
        <a class="cardx ${i === 0 ? 'cardx--wide' : ''}" href="#/mappa/${esc(d.id)}" ${d.id === activeId ? 'aria-current="page"' : ''}>
          <div class="cardx__img">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-map"/></svg>'}<span class="cardx__badge chips">${statusChip(d)}</span></div>
          <div class="cardx__body"><div class="cardx__title">${esc(d.name)}</div><div class="cardx__meta">${esc(d.region || '')}${pois ? ` · ${pois} luoghi` : ''}${s.total ? ` · mancano ${s.missing}` : ''}</div></div>
        </a>`; }).join('')}
    </div>`;
}

function detail(d) {
  const st = progress.get();
  const s = districtStats(d.id);
  const missions = vis(db.missions).filter((m) => m.districtId === d.id);
  const cols = vis(db.collectibles).filter((c) => c.districtId === d.id);
  const acts = vis(db.activities).filter((a) => a.districtId === d.id);
  const chars = vis(db.characters).filter((c) => c.districtId === d.id);
  const pois = d.pois || [];
  return `
    ${backLink('/mappa', 'Atlante')}
    ${hero(d, { kicker: d.region || 'Leonida', title: d.name, lede: d.tagline || '', chips: statusChip(d) })}
    ${s.total ? `<div class="stats"><div class="card"><div class="stat"><div class="stat__value">${s.missing === 0 ? 'Completa' : `Mancano ${s.missing}`}</div><div class="stat__label">per completare la zona</div></div><div class="progress" style="margin-top:var(--s-2)"><i style="--p:${s.pct}%"></i></div></div></div>` : ''}
    <div class="block prose">${spoiler.wrap(d, `<p class="dropcap">${esc(d.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${galleryHtml(d)}
    ${d.subAreas?.length ? `<div class="block"><span class="kicker">Quartieri e zone</span><div class="chips" style="margin-top:var(--s-2)">${d.subAreas.map((a) => `<span class="chip" title="${esc(typeof a === 'string' ? '' : a.note || '')}">${esc(typeof a === 'string' ? a : a.name)}</span>`).join('')}</div></div>` : ''}
    ${chars.length ? `<div class="block"><span class="kicker">Chi ci vive</span><div class="chips" style="margin-top:var(--s-2)">${chars.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${esc(c.name)}</a>`).join('')}</div></div>` : ''}
    <div class="block">
      ${pois.length ? acc(`Luoghi (${pois.length})`, pois.map((p) => row({ href: `#/mappa/${d.id}/${p.id}`, icon: 'i-pin', title: esc(p.name), meta: `${esc(p.kind || '')}${p.status !== 'verificato' ? ' · ' + esc({ stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' }[p.source] || 'da verificare') : ''}` })).join(''), true) : ''}
      ${acc(`Missioni qui (${missions.length})`, missions.length ? missions.map((m, i) => row({ href: `#/missioni/${m.id}`, num: String(i + 1).padStart(2, '0'), title: esc(m.title), done: st.missions[m.id]?.state === 'completata' })).join('') : '<p class="muted small">Nessuna missione registrata.</p>')}
      ${acc(`Collezionabili qui (${cols.length})`, cols.length ? cols.map((c) => { const done = !!st.collectibles[c.id]; return `
        <div class="check" data-done="${done}"><button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(c.id)}" aria-label="${esc(c.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
        <div class="check__body"><div class="check__title">${esc(c.name)}</div><div class="check__meta">${esc(byId(c.categoryId)?.name || '')}</div></div></div>`; }).join('') : '<p class="muted small">Nessun collezionabile registrato.</p>')}
      ${acc(`Attività (${acts.length})`, acts.length ? acts.map((a) => { const done = st.activities[a.id] === 'completata'; return `
        <div class="check" data-done="${done}"><button class="check__box" role="checkbox" aria-checked="${done}" data-activity="${esc(a.id)}" aria-label="${esc(a.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
        <div class="check__body"><div class="check__title">${esc(a.name)}</div><div class="check__meta">${esc(a.description || '')}</div></div></div>`; }).join('') : '<p class="muted small">Nessuna attività registrata.</p>')}
    </div>
    <p class="source-line">Fonte: ${esc(d.source)}${d.sourceUrl ? ` · <a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
}

function poiDetail(d, p) {
  const chars = vis(db.characters).filter((c) => (p.characterIds || []).includes(c.id));
  return `
    ${backLink('/mappa/' + d.id, d.name)}
    ${hero(p, { kicker: `${d.name} · ${p.kind || 'Luogo'}`, title: p.name, lede: p.tagline || '', chips: statusChip(p) })}
    <div class="prose">${spoiler.wrap(p, `<p class="dropcap">${esc(p.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${chars.length ? `<div class="block"><span class="kicker">Chi lo frequenta</span><div class="chips" style="margin-top:var(--s-2)">${chars.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${esc(c.name)}</a>`).join('')}</div></div>` : ''}
    <p class="source-line">Fonte: ${esc(p.source)}${p.sourceUrl ? ` · <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''} · in <a href="#/mappa/${esc(d.id)}">${esc(d.name)}</a></p>`;
}

export function render(params) {
  const d = params.id ? byId(params.id) : null;
  const p = d && params.poi ? byId(params.poi) : null;
  if (d) progress.setCurrentDistrict(d.id);
  const right = p ? poiDetail(d, p) : d ? detail(d) : '';
  return { left: d ? '' : index(params.id), right, show: d ? 'right' : 'left', accent: section.accent, title: p?.name || d?.name || 'Atlante' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-collect]'); if (c) { progress.toggleCollected(c.dataset.collect); rerender(); return; }
    const a = e.target.closest('[data-activity]'); if (a) { progress.toggleActivity(a.dataset.activity); rerender(); }
  });
}
