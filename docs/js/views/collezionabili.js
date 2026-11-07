/** Collezionabili: categorie come schede, checklist che aggiorna il contatore */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';
import { showSheet } from '../ui/sheet.js';

const section = sectionOf('collezionabili');
const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };
const GROUP_LABEL = { domestici: '🐕 Domestici', uccelli: '🦩 Uccelli', marini: '🐬 Marini', paludi: '🐊 Paludi', foresta: '🦌 Foresta', pesci: '🎣 Pesci', altri: 'Altri' };

export function render(params, query) {
  const st = progress.get();
  const cats = vis(db.collectibleCategories);
  const all = vis(db.collectibles);
  const cat = query.cat || '';
  const dis = query.dis || '';
  const grp = query.gruppo || '';
  const q = (query.q || '').toLowerCase();
  const list = all.filter((c) => (!cat || c.categoryId === cat) && (!dis || c.districtId === dis) && (!grp || c.group === grp) && (!q || c.name.toLowerCase().includes(q)));
  const done = list.filter((c) => st.collectibles[c.id]).length;
  const totalDone = all.filter((c) => st.collectibles[c.id]).length;
  const link = (k, v) => { const p = new URLSearchParams(); if (cat) p.set('cat', cat); if (dis) p.set('dis', dis); if (grp) p.set('gruppo', grp); if (v) p.set(k, v); else p.delete(k); return `#/collezionabili${p.toString() ? '?' + p : ''}`; };
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
    ${active ? `${active.id === 'cat-fauna' ? `<div class="filters" style="margin-top:var(--s-4)"><a class="filter" role="button" aria-pressed="${!grp}" href="${link('gruppo', '')}">Tutti gli habitat</a>${Object.entries(GROUP_LABEL).filter(([g]) => all.some((c) => c.categoryId === 'cat-fauna' && c.group === g)).map(([g, l]) => `<a class="filter" role="button" aria-pressed="${grp === g}" href="${link('gruppo', g)}">${l}</a>`).join('')}</div>` : ''}
    <div class="filters" style="margin-top:var(--s-2)">
      <a class="filter" role="button" aria-pressed="${!dis}" href="${link('dis', '')}">Tutte le regioni</a>
      ${vis(db.districts).filter((d) => all.some((c) => c.categoryId === cat && c.districtId === d.id)).map((d) => `<a class="filter" role="button" aria-pressed="${dis === d.id}" href="${link('dis', d.id)}">${esc(d.name)}</a>`).join('')}
    </div>
    ${active.id === 'cat-fauna' || list.filter((c) => c.image || c.emoji).length >= Math.max(6, list.length * 0.4) ? album(list, st, active) : `<span class="kicker" style="display:block;margin:var(--s-4) 0 var(--s-2)">${esc(active.name)} · ${done} / ${list.length}</span>${checklist(list, st)}`}`
    : `<p class="small muted" style="margin-top:var(--s-4)">Tocca una categoria per vedere l'album.</p>`}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Collezionabili' };
}

/** Album di figurine: grigie finché non le trovi, a colori quando le spunti */
function album(list, st, cat) {
  const found = list.filter((c) => st.collectibles[c.id]).length;
  return `<div class="album-head"><div class="album-head__num" data-album-num>${found}<small> / ${list.length}</small></div><div><b>${esc(cat.name)}</b><div class="small muted">Tocca la figurina quando l'hai vista: si colora. La «i» apre la scheda.</div><div class="progress" style="margin-top:8px"><i data-album-bar style="--p:${list.length ? Math.round(found / list.length * 100) : 0}%"></i></div></div></div>
    <div class="album">${list.map((c, i) => { const ok = !!st.collectibles[c.id]; return `<button type="button" class="sticker ${ok ? 'is-found' : ''}" data-collect="${esc(c.id)}" aria-pressed="${ok}" aria-label="${esc(c.name)}">
      <span class="sticker__tick"><svg aria-hidden="true"><use href="#i-check"/></svg></span>
      <span class="sticker__img">${stickerImg(c)}</span>
      <span class="sticker__name">${esc(c.name)}${c.uncertain ? ' ?' : ''}</span>
      <span class="sticker__info" data-sticker-info="${esc(c.id)}" role="button" aria-label="Scheda">i</span></button>`; }).join('')}</div>`;
}

/** Foto inquadrata sull'animale (imageFocus = [x%, y%, zoom]); se la foto non c'è, l'emoji della specie */
export function stickerImg(c, focus = c.imageFocus) {
  if (!c.image && !c.src) return c.emoji ? `<span class="sticker__emoji" aria-hidden="true">${c.emoji}</span>` : '<svg aria-hidden="true"><use href="#i-star"/></svg>';
  const src = c.image || c.src, fb = c.imageUrl || c.url;
  const st = focus ? ` style="object-position:${focus[0]}% ${focus[1]}%;transform-origin:${focus[0]}% ${focus[1]}%;transform:scale(${focus[2] || 1})"` : '';
  return `<img src="${esc(src)}" ${fb ? `data-fallback="${esc(fb)}"` : ''}${st} alt="" loading="lazy">`;
}
const DANGER = ['Innocuo', 'Pericolo basso', 'Attenzione', 'Pericoloso'];
const HABITAT = { domestici: 'Città e case', uccelli: 'Cielo, coste e paludi', marini: 'Mare', paludi: 'Paludi', foresta: 'Boschi e campagna', pesci: 'Acqua', altri: 'Varie' };
function stickerSheet(c) {
  const body = document.createElement('div');
  const regions = [c.districtId].filter(Boolean).map((id) => byId(id)).filter(Boolean);
  const sec = (title, html) => html ? `<section class="fsec"><h3 class="fsec__t">${esc(title)}</h3>${html}</section>` : '';
  const hasStruct = c.short || c.behavior || c.seen?.length;
  body.innerHTML = `<div class="fhead"><span class="fhead__img">${stickerImg(c)}</span>
      <div class="fhead__facts">
        ${c.short ? `<p class="fhead__short">${esc(c.short)}</p>` : ''}
        <div class="chips">${statusChip(c)}${c.group ? `<span class="chip">${esc(HABITAT[c.group] || c.group)}</span>` : ''}${regions.map((d) => `<a class="chip chip--btn" href="#/mappa?zona=${esc(d.id)}">${esc(d.name)}</a>`).join('')}${typeof c.danger === 'number' ? `<span class="chip chip--danger chip--danger-${c.danger}">${'●'.repeat(c.danger + 1)} ${DANGER[c.danger]}</span>` : ''}</div>
      </div></div>
    ${hasStruct ? `
    ${sec('Comportamento', c.behavior ? `<p>${esc(c.behavior)}</p>` : '')}
    ${sec('Cosa puoi fare', c.actions?.length ? `<div class="chips">${c.actions.map((a) => `<span class="chip chip--act">${esc(a)}</span>`).join('')}</div>` : '')}
    ${sec('Pericolo', c.dangerNote ? `<p>${esc(c.dangerNote)}</p>` : '')}
    ${sec('Razze e varianti', c.varieties?.length ? `<ul class="flist">${c.varieties.map((v) => `<li><b>${esc(v.name)}</b>${v.note ? `<span>${esc(v.note)}</span>` : ''}</li>`).join('')}</ul>` : '')}
    ${sec('Foto', c.photos?.length ? `<div class="fphotos">${c.photos.map((p) => `<figure><span>${stickerImg(p, p.focus)}</span><figcaption>${esc(p.caption || '')}</figcaption></figure>`).join('')}</div>` : '')}
    ${sec('Dove è stato visto', c.seen?.length ? `<ul class="flist">${c.seen.map((v) => `<li><b>${esc(v.where)}</b><span>${esc(v.what)}</span></li>`).join('')}</ul>` : '')}
    ${sec('Missioni collegate', c.missions?.length ? `<ul class="flist">${c.missions.map((m) => `<li>${esc(typeof m === 'string' ? (byId(m)?.title || m) : m.title || '')}</li>`).join('')}</ul>` : '')}
    ${sec('Lo sapevi?', c.trivia?.length ? `<ul class="flist flist--tips">${c.trivia.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '')}`
    : `<p class="small">${spoiler.text(c, c.directions || 'Nessun dettaglio ancora.')}</p>`}
    ${c.reward ? sec('Ricompensa', `<p>${esc(c.reward)}</p>`) : ''}`;
  body.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: c.name, body });
}

function checklist(list, st) {
  if (!list.length) return `<div class="placeholder"><strong>Niente qui</strong>Niente corrisponde ai filtri, oppure questa categoria aspetta ancora i dati. Le voci arrivano giocando: Appunti → Pacchetto per Claude.</div>`;
  return list.map((c) => { const done = !!st.collectibles[c.id]; return `
    <div class="check check--rich" data-done="${done}">
      <button class="check__box" role="checkbox" aria-checked="${done}" data-collect="${esc(c.id)}" aria-label="${esc(c.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
      ${c.image ? `<img class="check__img" src="${esc(c.image)}" ${c.imageUrl ? `data-fallback="${esc(c.imageUrl)}"` : ''} alt="" loading="lazy">` : ''}
      <div class="check__body">
        <div class="check__title">${esc(c.name)}${c.uncertain ? ' <span class="chip chip--src-rumor">da confermare</span>' : ''}</div>
        <div class="check__meta">${esc(byId(c.categoryId)?.name?.replace('ESEMPIO — ', '') || '')} · ${c.districtId ? `<a href="#/mappa/${esc(c.districtId)}">${esc(byId(c.districtId)?.name || '')}</a>` : 'zona da scoprire'}${c.status !== 'verificato' ? ' · ' + (SRC[c.source] || 'da verificare') : ''}</div>
      </div>
      ${c.directions || c.short || c.reward ? `<button type="button" class="info-btn" data-sticker-info="${esc(c.id)}" aria-label="Scheda">i</button>` : ''}
    </div>`; }).join('');
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const info = e.target.closest('[data-sticker-info]');
    if (info) { e.stopPropagation(); const c = byId(info.dataset.stickerInfo); if (c) stickerSheet(c); return; }
    const c = e.target.closest('[data-collect]');
    if (!c) return;
    progress.toggleCollected(c.dataset.collect);
    // Figurina: si accende sul posto, senza ridisegnare la pagina (niente lampo sulle altre)
    if (c.classList.contains('sticker')) {
      const on = !!progress.get().collectibles[c.dataset.collect];
      c.classList.toggle('is-found', on); c.setAttribute('aria-pressed', on);
      const all = [...document.querySelectorAll('.album .sticker')]; const n = all.filter((x) => x.classList.contains('is-found')).length;
      const num = document.querySelector('[data-album-num]'); if (num) num.firstChild.textContent = n;
      const bar = document.querySelector('[data-album-bar]'); if (bar) bar.style.setProperty('--p', `${all.length ? Math.round(n / all.length * 100) : 0}%`);
      return;
    }
    rerender();
  });
}
