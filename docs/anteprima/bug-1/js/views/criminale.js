/**
 * Profilo criminale: il giocatore dichiara qual è il suo nel gioco (uno dei tipi di `mec-profilo-criminale.profileTypes`).
 * Si sceglie in Home, si salva nei progressi (`state.crime`) e la banda lo vede accanto al nick.
 * Non si calcola da niente: è quello che il gioco mostra a lui.
 */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc } from '../ui/dom.js';

const MEC = 'mec-profilo-criminale';
export const types = () => (db.meccaniche || []).find((m) => m.id === MEC)?.profileTypes || [];
export const typeOf = (id) => types().find((t) => t.id === id) || null;
export const mine = () => typeOf(progress.get().crime);

/** Il diavoletto del gioco: con l'aureola per il profilo più pulito, col ghigno per gli altri */
export function devil(t, size = 22) {
  const halo = t.halo ? '<ellipse cx="12" cy="3.4" rx="5.2" ry="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>' : '';
  const mouth = t.halo ? '<path d="M8.6 15.6q3.4 2.6 6.8 0" fill="none" stroke="#17131f" stroke-width="1.5" stroke-linecap="round"/>' : '<path d="M7.8 15.2q4.2 4.2 8.4 0z" fill="#17131f"/>';
  const brows = t.halo ? '' : '<path d="M7.4 10.2l3.2 1.4M16.6 10.2l-3.2 1.4" stroke="#17131f" stroke-width="1.4" stroke-linecap="round"/>';
  return `<svg class="devil" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" style="color:${esc(t.color)}">${halo}
    <path d="M4.6 10.6C3 8.6 2.6 6.4 3.2 4.6c1.6.6 3.2 1.8 4.2 3.4zM19.4 10.6c1.6-2 2-4.2 1.4-6-1.6.6-3.2 1.8-4.2 3.4z" fill="currentColor"/>
    <circle cx="12" cy="13.4" r="7.6" fill="currentColor"/>${brows}
    <circle cx="9.3" cy="12.6" r="1.15" fill="#17131f"/><circle cx="14.7" cy="12.6" r="1.15" fill="#17131f"/>${mouth}</svg>`;
}

/** Etichetta piccola (classifica della banda, confronto): diavoletto + nome */
export function tag(id) {
  const t = typeOf(id); if (!t) return '';
  return `<span class="crimtag" style="--c:${esc(t.color)}">${devil(t, 16)}${esc(t.name)}</span>`;
}

/** Riquadro della Home */
export function homeCard() {
  const list = types(); if (!list.length) return '';
  const cur = mine();
  return `<section class="crim">
      <div class="profile__head"><span class="kicker kicker--accent">Profilo criminale</span><a class="small" href="#/meccaniche/${MEC}">Come funziona</a></div>
      <div class="crim__grid" role="radiogroup" aria-label="Il tuo profilo criminale">${list.map((t) => `<button type="button" class="crim__opt ${cur?.id === t.id ? 'is-on' : ''}" role="radio" aria-checked="${cur?.id === t.id}" data-crime="${esc(t.id)}" style="--c:${esc(t.color)}">${devil(t, 34)}<b>${esc(t.name)}</b></button>`).join('')}</div>
      <p class="small crim__say">${cur ? `<b>${esc(cur.name)}.</b> ${esc(cur.short)} La banda lo vede accanto al tuo nome.` : 'Qual è il tuo nel gioco? Toccalo: la banda lo vede accanto al tuo nome.'}</p>
    </section>`;
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-crime]'); if (!b) return;
    const id = b.dataset.crime;
    progress.update((s) => { if (s.crime === id) delete s.crime; else s.crime = id; });
    rerender();
  });
}
