import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc } from '../ui/dom.js';
import { chapterHead, opener, vis, sectionOf, isOpen } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('collezionabili');

export function render(params, query) {
  const st = progress.get();
  const cats = vis(db.collectibleCategories);
  const all = vis(db.collectibles);
  const cat = query.cat || '';
  const dis = query.dis || '';
  const q = (query.q || '').toLowerCase();
  const list = all.filter((c) => (!cat || c.categoryId === cat) && (!dis || c.districtId === dis) && (!q || c.name.toLowerCase().includes(q)));
  const done = list.filter((c) => st.collectibles[c.id]).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
  const link = (k, v) => { const p = new URLSearchParams({ cat, dis }); if (v) p.set(k, v); else p.delete(k); for (const [kk, vv] of [...p]) if (!vv) p.delete(kk); return `#/collezionabili${p.toString() ? '?' + p : ''}`; };

  const left = `
    ${chapterHead(section, { kicker: 'Capitolo quarto', title: 'Collezionabili' })}
    <div class="card">
      <div class="stat" style="border:0;padding-top:0"><div class="stat__value tnum">${done} <span class="muted" style="font-size:1rem">/ ${list.length}</span></div><div class="stat__label">${cat || dis ? 'nella selezione' : 'in tutto'}</div></div>
      <div class="progress"><i style="--p:${pct}%"></i></div>
    </div>
    <div class="block"><span class="kicker">Categoria</span>
      <div class="filters" role="group">
        <a class="filter" role="button" aria-pressed="${!cat}" href="${link('cat', '')}">Tutte</a>
        ${cats.map((c) => `<a class="filter" role="button" aria-pressed="${cat === c.id}" href="${link('cat', c.id)}">${esc(c.name.replace('ESEMPIO — ', ''))}</a>`).join('')}
      </div>
      <span class="kicker">Distretto</span>
      <div class="filters" role="group">
        <a class="filter" role="button" aria-pressed="${!dis}" href="${link('dis', '')}">Tutti</a>
        ${vis(db.districts).map((d) => `<a class="filter" role="button" aria-pressed="${dis === d.id}" href="${link('dis', d.id)}">${esc(d.name)}</a>`).join('')}
      </div>
    </div>
    ${isOpen() ? '' : checklist(list, st)}`;

  const right = list.length || cat || dis
    ? `<div class="chapter-head"><span class="kicker">Checklist</span><h1>${esc(cat ? byId(cat)?.name || '' : dis ? byId(dis)?.name || '' : 'Tutti i collezionabili')}</h1></div>${checklist(list, st)}`
    : opener(section, 'Un tracker da spuntare, filtrabile per categoria e distretto. Le categorie vere arrivano dopo il 19: oggi vedi solo voci ESEMPIO.');

  return { left, right, show: 'left', accent: section.accent, title: 'Collezionabili' };
}

function checklist(list, st) {
  if (!list.length) return `<div class="placeholder" style="margin-top:var(--s-4)"><strong>Nessun collezionabile</strong>Niente corrisponde ai filtri, oppure i dati non sono ancora stati inseriti.</div>`;
  return `<div class="block">${list.map((c) => { const done = !!st.collectibles[c.id]; return `
    <div class="check" data-done="${done}">
      <button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(c.id)}" aria-label="${esc(c.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
      <div class="check__body">
        <div class="check__title">${esc(c.name)}</div>
        <div class="check__meta">${esc(byId(c.categoryId)?.name?.replace('ESEMPIO — ', '') || '')} · <a href="#/atlante/${esc(c.districtId || '')}">${esc(byId(c.districtId)?.name || 'zona sconosciuta')}</a></div>
        ${c.directions ? `<div class="small" style="margin-top:4px">${spoiler.text(c, c.directions)}</div>` : ''}
        ${c.reward ? `<div class="small muted">Ricompensa: ${esc(c.reward)}</div>` : ''}
      </div>
    </div>`; }).join('')}</div>`;
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-collect]');
    if (c) { progress.toggleCollected(c.dataset.collect); rerender(); }
  });
}
