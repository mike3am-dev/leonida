/** Collezionabili: categorie come schede, checklist che aggiorna il contatore */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('collezionabili');
const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };

export function render(params, query) {
  const st = progress.get();
  const cats = vis(db.collectibleCategories);
  const all = vis(db.collectibles);
  const cat = query.cat || '';
  const dis = query.dis || '';
  const q = (query.q || '').toLowerCase();
  const list = all.filter((c) => (!cat || c.categoryId === cat) && (!dis || c.districtId === dis) && (!q || c.name.toLowerCase().includes(q)));
  const done = list.filter((c) => st.collectibles[c.id]).length;
  const totalDone = all.filter((c) => st.collectibles[c.id]).length;
  const link = (k, v) => { const p = new URLSearchParams(); if (cat) p.set('cat', cat); if (dis) p.set('dis', dis); if (v) p.set(k, v); else p.delete(k); return `#/collezionabili${p.toString() ? '?' + p : ''}`; };
  const active = cat ? byId(cat) : null;

  const catCard = (c) => { const items = all.filter((x) => x.categoryId === c.id); const d = items.filter((x) => st.collectibles[x.id]).length; return `
    <a class="catcard ${cat === c.id ? 'is-active' : ''}" href="${cat === c.id ? '#/collezionabili' : link('cat', c.id)}">
      <span class="catcard__icon"><svg aria-hidden="true"><use href="#i-${esc(c.icon || 'star')}"/></svg></span>
      <span class="catcard__name">${esc(c.name.replace('ESEMPIO — ', ''))}</span>
      <span class="catcard__count">${items.length ? `${d} / ${items.length}` : 'da scoprire'}</span>
      <span class="progress"><i style="--p:${items.length ? Math.round(d / items.length * 100) : 0}%"></i></span>
    </a>`; };

  const left = `${sectionHead(section, `${totalDone} / ${all.length}`)}
    <div class="progress" style="margin-bottom:var(--s-4)"><i style="--p:${all.length ? Math.round(totalDone / all.length * 100) : 0}%"></i></div>
    <div class="catgrid">${cats.map(catCard).join('')}</div>
    ${active ? `<div class="card" style="margin-top:var(--s-4)"><span class="kicker kicker--accent">${esc(active.name)}</span><p class="small" style="margin:var(--s-2) 0 0">${esc(active.description || '')}</p><div class="chips" style="margin-top:var(--s-2)">${statusChip(active)}</div></div>` : ''}
    <div class="filters" style="margin-top:var(--s-4)">
      <a class="filter" role="button" aria-pressed="${!dis}" href="${link('dis', '')}">Tutte le zone</a>
      ${vis(db.districts).filter((d) => all.some((c) => c.districtId === d.id)).map((d) => `<a class="filter" role="button" aria-pressed="${dis === d.id}" href="${link('dis', d.id)}">${esc(d.name)}</a>`).join('')}
    </div>
    <span class="kicker" style="display:block;margin:var(--s-4) 0 var(--s-2)">${esc(active ? active.name : 'Tutti i collezionabili')} · ${done} / ${list.length}</span>
    ${checklist(list, st)}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Collezionabili' };
}

function checklist(list, st) {
  if (!list.length) return `<div class="placeholder"><strong>Niente qui</strong>Niente corrisponde ai filtri, oppure questa categoria aspetta ancora i dati. Le voci arrivano giocando: Appunti → Pacchetto per Claude.</div>`;
  return list.map((c) => { const done = !!st.collectibles[c.id]; return `
    <div class="check check--rich" data-done="${done}">
      <button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(c.id)}" aria-label="${esc(c.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
      ${c.image ? `<img class="check__img" src="${esc(c.image)}" alt="" loading="lazy">` : ''}
      <div class="check__body">
        <div class="check__title">${esc(c.name)}</div>
        <div class="check__meta">${esc(byId(c.categoryId)?.name?.replace('ESEMPIO — ', '') || '')} · ${c.districtId ? `<a href="#/mappa/${esc(c.districtId)}">${esc(byId(c.districtId)?.name || '')}</a>` : 'zona da scoprire'}${c.status !== 'verificato' ? ' · ' + (SRC[c.source] || 'da verificare') : ''}</div>
        ${c.directions ? `<div class="small" style="margin-top:4px">${spoiler.text(c, c.directions)}</div>` : ''}
        ${c.reward ? `<div class="small muted">Ricompensa: ${esc(c.reward)}</div>` : ''}
      </div>
    </div>`; }).join('');
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-collect]');
    if (c) { progress.toggleCollected(c.dataset.collect); rerender(); }
  });
}
