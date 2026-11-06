/** Trofei: la lista ufficiale non è ancora uscita; struttura pronta, dati da trophies.json */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, acc, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('trofei');
const TIER = { platino: 'Platino', oro: 'Oro', argento: 'Argento', bronzo: 'Bronzo' };
const CAT = { storia: 'Storia', completamento: 'Completamento', collezionabili: 'Collezionabili', attivita: 'Attività e sfide', mondo: 'Mondo e segreti', online: 'Online' };

export function render() {
  const all = vis(db.trophies || []);
  const st = progress.get().trophies || {};
  const done = all.filter((t) => st[t.id]).length;
  const cats = [...new Set(all.map((t) => t.category))];
  const left = `${sectionHead(section, `${done} / ${all.length}`)}
    <div class="progress" style="margin-bottom:var(--s-4)"><i style="--p:${all.length ? Math.round(done / all.length * 100) : 0}%"></i></div>
    ${all.length ? '' : `<div class="placeholder"><strong>La lista ufficiale non è ancora uscita</strong>Rockstar pubblica i trofei a ridosso del lancio; Xbox conferma gli obiettivi ma senza elenco. Qui sotto trovi lo schema con cui li organizzeremo, basato su GTA V e RDR2, e i trofei «probabili» ricostruiti dalla community: tutti da verificare.</div>`}
    ${cats.map((c) => { const list = all.filter((t) => t.category === c); const d = list.filter((t) => st[t.id]).length; return `<div class="block">${acc(`${CAT[c] || c} · ${d}/${list.length}`, list.map((t) => { const ok = !!st[t.id]; return `
      <div class="check" data-done="${ok}">
        <button class="check__box" role="checkbox" aria-checked="${ok}" data-trophy="${esc(t.id)}" aria-label="${esc(t.name)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
        <div class="check__body"><div class="check__title">${esc(t.name)} <span class="chip chip--${esc(t.tier)}">${esc(TIER[t.tier] || t.tier)}</span></div>
          <div class="check__meta">${spoiler.text(t, t.description || '')}${t.guide ? ` · <em>${esc(t.guide)}</em>` : ''}</div>
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
