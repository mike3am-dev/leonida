import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { galleryHtml, chapterHead, runningHead, backLink, opener, vis, sectionOf, districtStats } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('atlante');

/** La nostra mappa schematica di Leonida: una penisola stilizzata, nessun ricalco. */
export function mapSvg(activeId) {
  const districts = vis(db.districts);
  const hasPhoto = db.meta.mapImage; // opzionale: "assets/img/map.jpg" in meta.json
  return `<div class="atlas">
    <svg viewBox="0 0 1000 1000" role="img" aria-label="Mappa schematica di Leonida">
      ${hasPhoto ? `<image href="${esc(hasPhoto)}" width="1000" height="1000" preserveAspectRatio="xMidYMid slice"/>` : `
      <rect class="sea" width="1000" height="1000"/>
      <path class="contour" d="M120 80 Q 380 40 700 70 Q 900 110 920 400 Q 940 700 820 900 Q 600 980 300 900 Q 80 760 120 80 Z"/>
      <path class="land" d="M170 130 Q 380 100 680 120 Q 860 160 870 420 Q 880 690 800 840 Q 620 930 340 880 Q 160 760 170 130 Z"/>
      <path class="contour" d="M300 150 Q 500 120 700 180 Q 790 400 760 700" />
      <g class="compass" transform="translate(905 905)"><circle r="34"/><path d="M0 -26 L8 0 L0 26 L-8 0 Z" fill="currentColor"/><text y="-40" text-anchor="middle" font-size="16" fill="currentColor" stroke="none">N</text></g>`}
      ${districts.map((d) => d.map?.path ? `
        <a href="#/atlante/${esc(d.id)}" aria-label="${esc(d.name)}">
          <path class="region ${d.example ? 'region--example' : ''}" data-active="${d.id === activeId}" d="${esc(d.map.path)}"/>
          <text class="label" x="${d.map.x}" y="${d.map.y}" text-anchor="middle">${esc(d.name)}</text>
        </a>` : '').join('')}
      <text class="label label--sm" x="500" y="60" text-anchor="middle">Stato di Leonida</text>
    </svg>
  </div>
  <p class="atlas-note">Illustrazione schematica originale. Le posizioni sono indicative finché non le verifichi giocando.</p>`;
}

function districtList(activeId) {
  return vis(db.districts).map((d) => { const s = districtStats(d.id); return `
    <a class="toc__row" href="#/atlante/${esc(d.id)}" ${d.id === activeId ? 'aria-current="page"' : ''}>
      <span class="toc__num" style="font-size:.85rem">${s.total ? `${s.pct}%` : '—'}</span>
      <span><span class="toc__title">${esc(d.name)}</span><span class="toc__meta">${esc(d.region || '')}${s.total ? ` · mancano ${s.missing}` : ''}</span></span>
      <span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span>
    </a>`; }).join('');
}

function detail(d) {
  if (!d) return opener(section, 'Tocca un distretto sulla mappa. Ogni zona ha la sua pagina con descrizione, missioni, collezionabili e il contatore di quanto manca per completarla.');
  const st = progress.get();
  const s = districtStats(d.id);
  const missions = vis(db.missions).filter((m) => m.districtId === d.id);
  const cols = vis(db.collectibles).filter((c) => c.districtId === d.id);
  const acts = vis(db.activities).filter((a) => a.districtId === d.id);
  const chars = vis(db.characters).filter((c) => c.districtId === d.id);
  return `
    ${backLink('/atlante', 'Atlante')}
    ${runningHead(d.region || 'Leonida', s.total ? `${s.done} / ${s.total}` : '')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(d)}</div>
    <h1>${esc(d.name)}</h1>
    ${d.tagline ? `<p class="lede" style="margin-top:var(--s-2)">${esc(d.tagline)}</p>` : ''}
    ${d.image ? `<img src="${esc(d.image)}" alt="" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    ${galleryHtml(d)}
    ${s.total ? `<div class="card" style="margin-top:var(--s-4)">
      <div class="stat" style="border:0;padding-top:0"><div class="stat__value">${s.missing === 0 ? 'Completata' : `Mancano ${s.missing}`}</div><div class="stat__label">per completare questa zona</div></div>
      <div class="progress"><i style="--p:${s.pct}%"></i></div>
    </div>` : ''}
    <div class="block prose">${spoiler.wrap(d, `<p class="dropcap">${esc(d.description || 'Descrizione in arrivo.')}</p>`)}</div>

    ${chars.length ? `<div class="block"><span class="kicker">Chi ci vive</span><div class="chips">${chars.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${esc(c.name)}</a>`).join('')}</div></div>` : ''}

    <div class="block"><span class="kicker">Missioni qui</span>
      ${missions.length ? missions.map((m) => `<a class="toc__row" href="#/missioni/${esc(m.id)}"><span class="toc__num">${st.missions[m.id]?.state === 'completata' ? '✓' : '·'}</span><span class="toc__title">${esc(m.title)}</span><span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`).join('') : '<p class="muted small">Nessuna missione registrata in questa zona.</p>'}
    </div>
    <div class="block"><span class="kicker">Collezionabili qui</span>
      ${cols.length ? cols.map((c) => { const done = !!st.collectibles[c.id]; return `
        <div class="check" data-done="${done}">
          <button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(c.id)}" aria-label="${esc(c.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
          <div class="check__body"><div class="check__title">${esc(c.name)}</div><div class="check__meta">${esc(byId(c.categoryId)?.name || '')}</div></div>
        </div>`; }).join('') : '<p class="muted small">Nessun collezionabile registrato.</p>'}
    </div>
    <div class="block"><span class="kicker">Attività</span>
      ${acts.length ? acts.map((a) => { const done = st.activities[a.id] === 'completata'; return `
        <div class="check" data-done="${done}">
          <button class="check__box" role="checkbox" aria-checked="${done}" data-activity="${esc(a.id)}" aria-label="${esc(a.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
          <div class="check__body"><div class="check__title">${esc(a.name)}</div><div class="check__meta">${esc(a.type)}${a.description ? ' · ' + esc(a.description) : ''}</div></div>
        </div>`; }).join('') : '<p class="muted small">Nessuna attività registrata.</p>'}
    </div>
    ${d.subAreas?.length ? `<div class="block"><span class="kicker">Quartieri e zone</span><div class="chips">${d.subAreas.map((a) => `<span class="chip">${esc(typeof a === 'string' ? a : a.name)}</span>`).join('')}</div></div>` : ''}
    ${d.pois?.length ? `<div class="block"><span class="kicker">Luoghi</span>${d.pois.map((p) => `<a class="toc__row" href="#/atlante/${esc(d.id)}/${esc(p.id)}"><span class="toc__num"><svg style="width:18px;height:18px;margin-left:auto" aria-hidden="true"><use href="#i-pin"/></svg></span><span><span class="toc__title">${esc(p.name)}</span><span class="toc__meta">${esc(p.kind || '')}</span></span><span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`).join('')}</div>` : ''}
    <p class="source-line">Fonte: ${esc(d.source)}${d.sourceUrl ? ` · <a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">pagina ufficiale</a>` : ''}</p>`;
}

function poiDetail(d, p) {
  const chars = vis(db.characters).filter((c) => (p.characterIds || []).includes(c.id));
  return `
    ${backLink('/atlante/' + d.id, d.name)}
    ${runningHead(d.name, p.kind || 'Luogo')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(p)}</div>
    <h1>${esc(p.name)}</h1>
    ${p.tagline ? `<p class="lede" style="margin-top:var(--s-2)">${esc(p.tagline)}</p>` : ''}
    ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    <hr class="rule">
    <div class="prose">${spoiler.wrap(p, `<p class="dropcap">${esc(p.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${chars.length ? `<div class="block"><span class="kicker">Chi lo frequenta</span><div class="chips">${chars.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${esc(c.name)}</a>`).join('')}</div></div>` : ''}
    <p class="source-line">Fonte: ${esc(p.source)}${p.sourceUrl ? ` · <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">pagina ufficiale</a>` : ''} · in <a href="#/atlante/${esc(d.id)}">${esc(d.name)}</a></p>`;
}

export function render(params) {
  const d = params.id ? byId(params.id) : null;
  const p = d && params.poi ? byId(params.poi) : null;
  if (d) progress.setCurrentDistrict(d.id);
  const left = `${chapterHead(section, { kicker: 'Capitolo terzo', title: 'Atlante' })}${mapSvg(params.id)}<div class="block">${districtList(params.id)}</div>`;
  const right = p ? poiDetail(d, p) : detail(d);
  return { left, right, show: d ? 'right' : 'left', accent: section.accent, title: p?.name || d?.name || 'Atlante' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-collect]'); if (c) { progress.toggleCollected(c.dataset.collect); rerender(); return; }
    const a = e.target.closest('[data-activity]'); if (a) { progress.toggleActivity(a.dataset.activity); rerender(); }
  });
}
