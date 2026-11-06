/** Trofei: bacheca in stile PSN. La lista ufficiale non è ancora uscita: lo schema è ricostruito (tutto da verificare). */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, acc, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('trofei');
const TIER = { platino: 'Platino', oro: 'Oro', argento: 'Argento', bronzo: 'Bronzo' };
const CAT = { storia: 'Storia', completamento: 'Completamento', collezionabili: 'Collezionabili', attivita: 'Attività e sfide', mondo: 'Mondo e segreti', online: 'Online' };
const CAT_ICON = { storia: 'flag', completamento: 'star', collezionabili: 'bookmark', attivita: 'bolt', mondo: 'globe', online: 'radio' };

/** Coppa in stile PlayStation, colorata per livello */
export const cup = (tier, size = 40) => `<span class="cup cup--${esc(tier)}" style="--cup:${size}px" aria-label="${esc(TIER[tier] || tier)}">
  <svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="cupg-${esc(tier)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cup-hi)"/><stop offset="1" stop-color="var(--cup-lo)"/></linearGradient></defs>
    <path d="M14 8h20v10a10 10 0 0 1-20 0z" fill="url(#cupg-${esc(tier)})"/><path d="M14 11H8a6 6 0 0 0 6 8M34 11h6a6 6 0 0 1-6 8" fill="none" stroke="var(--cup-lo)" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M24 28v6M16 40h16M18 34h12v6H18z" fill="var(--cup-lo)" stroke="var(--cup-lo)" stroke-width="2" stroke-linejoin="round"/><path d="M19 12l2 7" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/></svg></span>`;

export function render() {
  const all = vis(db.trophies || []);
  const st = progress.get().trophies || {};
  const done = all.filter((t) => st[t.id]).length;
  const cats = [...new Set(all.map((t) => t.category))];
  const byTier = (tier) => { const l = all.filter((t) => t.tier === tier); return { done: l.filter((t) => st[t.id]).length, total: l.length }; };
  const tiers = ['platino', 'oro', 'argento', 'bronzo'].map((t) => ({ t, ...byTier(t) }));
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  const official = all.some((t) => t.status === 'verificato');
  const left = `${sectionHead(section, `${done} / ${all.length}`)}
    <div class="trophy-board">
      <div class="trophy-board__plat">${cup('platino', 76)}<div><span class="kicker">Verso il Platino</span><b class="trophy-board__pct">${pct}%</b><span class="small muted">${all.length - done} trofei mancanti</span></div></div>
      <div class="trophy-board__tiers">${tiers.map(({ t, done: d, total }) => `<div class="tiercount">${cup(t, 30)}<b>${d}</b><span>/ ${total}</span><small>${TIER[t]}</small></div>`).join('')}</div>
      <div class="progress progress--gold"><i style="--p:${pct}%"></i></div>
    </div>
    ${(() => { const next = all.find((t) => !st[t.id] && t.tier === 'bronzo' && t.category === 'storia') || all.find((t) => !st[t.id]); return next ? `<a class="card card--link nexttrophy" href="#/trofei"><span class="kicker kicker--accent">Prossima coppa alla portata</span><span class="nexttrophy__row">${cup(next.tier, 40)}<span><b>${esc(next.name)}</b><span class="small muted"> · ${spoiler.text(next, next.description || '')}</span></span></span></a>` : ''; })()}
    <div class="shelf-wrap">${['platino', 'oro', 'argento', 'bronzo'].map((tier) => { const l = all.filter((t) => t.tier === tier); return l.length ? `<div class="shelf shelf--${tier}"><span class="shelf__label">${TIER[tier]}</span><div class="shelf__cups">${l.map((t) => `<button type="button" class="shelfcup ${st[t.id] ? 'is-lit' : ''}" data-trophy="${esc(t.id)}" aria-pressed="${!!st[t.id]}" aria-label="${esc(t.name)}" title="${esc(t.name)}">${cup(tier, tier === 'platino' ? 56 : 34)}</button>`).join('')}</div><span class="shelf__glass"></span></div>` : ''; }).join('')}</div>
    ${official ? '' : `<div class="callout callout--warn"><strong>Lista ufficiale non ancora pubblicata.</strong> Rockstar la rilascia di solito a ridosso del lancio (per GTA V arrivò pochi giorni prima). Questo è uno schema ricostruito da GTA V e RDR2 per prepararti: nomi e requisiti cambieranno. Appena esce la lista vera, la sostituisco e i tuoi spunti restano.</div>`}
    ${cats.map((c) => { const list = all.filter((t) => t.category === c); const d = list.filter((t) => st[t.id]).length; return `<div class="block">${acc(`${CAT[c] || c} · ${d}/${list.length}`, list.map((t) => { const ok = !!st[t.id]; return `
      <div class="trophy ${ok ? 'is-done' : ''}">
        <button class="check__box" role="checkbox" aria-checked="${ok}" data-trophy="${esc(t.id)}" aria-label="${esc(t.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
        ${cup(t.tier, 44)}
        <div class="trophy__body"><div class="trophy__name">${esc(t.name)} <span class="chip chip--${esc(t.tier)}">${esc(TIER[t.tier] || t.tier)}</span></div>
          <div class="trophy__desc">${spoiler.text(t, t.description || '')}</div>
          ${t.guide ? `<div class="small muted">${esc(t.guide)}</div>` : ''}
          <div class="chips" style="margin-top:4px">${statusChip(t)}</div></div>
      </div>`; }).join(''), true)}</div>`; }).join('')}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Trofei' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-trophy]');
    if (b) { progress.toggleTrophy(b.dataset.trophy); rerender(); }
  });
}
