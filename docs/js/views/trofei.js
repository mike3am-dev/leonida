/** Trofei: bacheca in stile PSN. La lista ufficiale non è ancora uscita: lo schema è ricostruito (tutto da verificare). */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, acc, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';
import { showSheet } from '../ui/sheet.js';
import { byId } from '../data.js';

const section = sectionOf('trofei');
/* Trofei nascosti: anche il nome può svelare la storia (nomi delle missioni) → inchiostro */
const plainName = (t) => (spoiler.isHidden(t) ? 'Trofeo nascosto' : t.name);
const richName = (t) => (spoiler.isHidden(t) ? spoiler.text(t, t.name) : esc(t.name));
const TIER = { platino: 'Platino', oro: 'Oro', argento: 'Argento', bronzo: 'Bronzo' };
const CAT = { storia: 'Storia', completamento: 'Completamento', collezionabili: 'Collezionabili', attivita: 'Attività e sfide', mondo: 'Mondo e segreti', online: 'Online' };
const CAT_ICON = { storia: 'flag', completamento: 'star', collezionabili: 'bookmark', attivita: 'bolt', mondo: 'globe', online: 'radio' };

/** Icona del trofeo in stile PlayStation, colorata per livello */
export const cup = (tier, size = 40) => `<span class="cup cup--${esc(tier)}" style="--cup:${size}px" aria-label="${esc(TIER[tier] || tier)}">
  <svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="cupg-${esc(tier)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cup-hi)"/><stop offset="1" stop-color="var(--cup-lo)"/></linearGradient></defs>
    <path d="M14 8h20v10a10 10 0 0 1-20 0z" fill="url(#cupg-${esc(tier)})"/><path d="M14 11H8a6 6 0 0 0 6 8M34 11h6a6 6 0 0 1-6 8" fill="none" stroke="var(--cup-lo)" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M24 28v6M16 40h16M18 34h12v6H18z" fill="var(--cup-lo)" stroke="var(--cup-lo)" stroke-width="2" stroke-linejoin="round"/><path d="M19 12l2 7" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/></svg></span>`;

export function render(params, query = {}) {
  const fold = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = fold(query.q).trim();
  const all = vis(db.trophies || []);
  // La ricerca non guarda dentro i trofei nascosti: il solo fatto di trovarli svelerebbe la storia
  const found = q ? all.filter((t) => !spoiler.isHidden(t) && fold(t.name + ' ' + (t.description || '') + ' ' + (t.guide || '')).includes(q)) : [];
  const st = progress.get().trophies || {};
  const done = all.filter((t) => st[t.id]).length;
  const cats = [...new Set(all.map((t) => t.category))];
  const byTier = (tier) => { const l = all.filter((t) => t.tier === tier); return { done: l.filter((t) => st[t.id]).length, total: l.length }; };
  const tiers = ['platino', 'oro', 'argento', 'bronzo'].map((t) => ({ t, ...byTier(t) }));
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  const official = all.some((t) => t.status === 'verificato');
  const row = (t) => { const ok = !!st[t.id]; return `
      <div class="trophy ${ok ? 'is-done' : ''}">
        <button class="check__box" role="checkbox" aria-checked="${ok}" data-trophy="${esc(t.id)}" aria-label="${esc(plainName(t))}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
        <button type="button" class="trophy__cup" data-trophy="${esc(t.id)}" aria-label="Segna ${esc(plainName(t))}">${cup(t.tier, 44)}</button>
        <div class="trophy__body"><div class="trophy__name">${richName(t)} <span class="chip chip--${esc(t.tier)}">${esc(TIER[t.tier] || t.tier)}</span></div>
          <div class="trophy__desc">${spoiler.text(t, t.description || '')}</div>
          ${t.guide ? `<div class="small muted">${esc(t.guide)}</div>` : ''}
          <div class="chips" style="margin-top:4px">${statusChip(t)}</div></div>
      </div>`; };
  const left = `${sectionHead(section, `${done} / ${all.length}`)}
    <input class="input" type="search" placeholder="Cerca un trofeo per nome…" value="${esc(q)}" data-trophy-q aria-label="Cerca un trofeo" style="margin:var(--s-4) 0 var(--s-3)">
    ${q ? `<div class="block trophy-results"><span class="kicker">${found.length ? (found.length === 1 ? '1 trofeo trovato' : `${found.length} trofei trovati`) : 'Nessun trofeo trovato'}</span>
      ${found.length ? found.map(row).join('') : `<p class="muted">Niente con «${esc(query.q)}». Prova con un'altra parola: si cerca nel nome, nella descrizione e nel consiglio.</p>`}</div>` : ''}
    <div class="trophy-board">
      <div class="trophy-board__plat">${cup('platino', 76)}<div><span class="kicker">Verso il Platino</span><b class="trophy-board__pct">${pct}%</b><span class="small muted">${all.length - done === 1 ? 'Ti manca 1 trofeo' : `Ti mancano ${all.length - done} trofei`}</span></div></div>
      <div class="trophy-board__tiers">${tiers.map(({ t, done: d, total }) => `<div class="tiercount">${cup(t, 30)}<b>${d}</b><span>/ ${total}</span><small>${TIER[t]}</small></div>`).join('')}</div>
      <div class="progress progress--gold"><i style="--p:${pct}%"></i></div>
    </div>
    ${(() => { const next = all.find((t) => !st[t.id] && t.tier === 'bronzo' && !spoiler.isHidden(t)) || all.find((t) => !st[t.id] && !spoiler.isHidden(t)); return next ? `<a class="card card--link nexttrophy" href="#/trofei"><span class="kicker kicker--accent">Prossimo trofeo alla portata</span><span class="nexttrophy__row">${cup(next.tier, 40)}<span><b>${richName(next)}</b><span class="small muted"> · ${spoiler.text(next, next.description || '')}</span></span></span></a>` : ''; })()}
    ${(db.roadmap || []).length ? `<div class="card roadmap"><span class="kicker kicker--accent">Da non perdere per il Platino</span><ul>${db.roadmap.map((r) => `<li>${esc(r.text)}${r.trophy ? ` <span class="small muted">· «${esc(r.trophy)}»</span>` : ''}</li>`).join('')}</ul></div>` : ''}
    <div class="showcase"><div class="showcase__head"><span class="kicker">La tua bacheca</span><span class="small muted">${done ? `${done} ${done === 1 ? 'trofeo ottenuto' : 'trofei ottenuti'}` : 'Vuota: tocca un trofeo per segnarlo'}</span></div>
      ${['platino', 'oro', 'argento', 'bronzo'].map((tier) => { const l = all.filter((t) => t.tier === tier); return l.length ? `<div class="shelf shelf--${tier}"><div class="shelf__cups">${l.map((t) => `<button type="button" class="shelfcup ${st[t.id] ? 'is-lit' : ''}" data-trophy-open="${esc(t.id)}" aria-pressed="${!!st[t.id]}" aria-label="${esc(plainName(t))}">${cup(tier, tier === 'platino' ? 52 : 36)}<span class="shelfcup__name">${esc(plainName(t))}</span></button>`).join('')}</div><span class="shelf__glass"></span><span class="shelf__label">${TIER[tier]} · ${l.filter((t) => st[t.id]).length}/${l.length}</span></div>` : ''; }).join('')}</div>
    ${official ? '' : `<div class="callout callout--warn"><strong>Lista ufficiale non ancora pubblicata.</strong> Rockstar la rilascia di solito a ridosso del lancio (per GTA V arrivò pochi giorni prima). Questo è uno schema ricostruito da GTA V e RDR2 per prepararti: nomi e requisiti cambieranno. Appena esce la lista vera, la sostituisco e i tuoi spunti restano.</div>`}
    ${q ? '' : cats.map((c) => { const list = all.filter((t) => t.category === c); const d = list.filter((t) => st[t.id]).length; return `<div class="block">${acc(`${CAT[c] || c} · ${d}/${list.length}`, list.map(row).join(''), false)}</div>`; }).join('')}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Trofei' };
}

function trophySheet(t, rerender) {
  const ok = !!(progress.get().trophies || {})[t.id];
  const body = document.createElement('div');
  body.innerHTML = `<div style="display:flex;gap:var(--s-3);align-items:center;margin-bottom:var(--s-3)">${cup(t.tier, 56)}<div><span class="chip chip--${esc(t.tier)}">${esc(TIER[t.tier] || t.tier)}</span> ${statusChip(t)}</div></div>
    <p>${spoiler.text(t, t.description || '')}</p>${t.guide ? `<p class="small muted">${esc(t.guide)}</p>` : ''}
    <button type="button" class="btn ${ok ? 'btn--accent' : 'btn--solid'} found-btn" data-trophy-toggle="${esc(t.id)}">${ok ? 'Ottenuto ✓' : 'Segna come ottenuto'}</button>`;
  body.addEventListener('click', (e) => { const b = e.target.closest('[data-trophy-toggle]'); if (!b) return; progress.toggleTrophy(t.id); document.querySelector('.sheet-backdrop')?.click(); rerender(); });
  showSheet({ title: plainName(t), body });
  if (spoiler.isHidden(t)) body.insertAdjacentHTML('afterbegin', `<p class="small"><b>${spoiler.text(t, t.name)}</b></p>`);
}
export function bind(root, rerender) {
  let t = null;
  root.addEventListener('input', (e) => { const q = e.target.closest('[data-trophy-q]'); if (!q) return; clearTimeout(t); t = setTimeout(() => { const v = q.value.trim(); const pos = q.selectionStart; history.replaceState(history.state, '', v ? `#/trofei?q=${encodeURIComponent(v)}` : '#/trofei'); rerender(); const n = document.querySelector('[data-trophy-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250); });
  root.addEventListener('click', (e) => {
    const o = e.target.closest('[data-trophy-open]');
    if (o) { const t = (db.trophies || []).find((x) => x.id === o.dataset.trophyOpen); if (t) trophySheet(t, rerender); return; }
    const b = e.target.closest('[data-trophy]');
    if (b) { progress.toggleTrophy(b.dataset.trophy); rerender(); }
  });
}
