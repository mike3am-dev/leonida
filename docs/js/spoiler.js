/**
 * Scudo spoiler.
 * spoilerLevel = numero dell'atto dopo il quale la voce si può leggere.
 * La progressione è l'atto più alto in cui hai una missione iniziata o completata,
 * oppure quello fissato a mano nelle Impostazioni.
 */
import { db, actNum } from './data.js';
import * as progress from './store/progress.js';
import { esc } from './ui/dom.js';

export function currentAct() {
  const manual = progress.settings().manualAct;
  if (manual !== null && manual !== undefined) return Number(manual);
  let max = 0;
  for (const [id, v] of Object.entries(progress.get().missions)) {
    if (!v.state) continue;
    const m = db.byId.get(id);
    if (m) max = Math.max(max, actNum(m.actId));
  }
  return max;
}

export function isHidden(item) {
  if (!progress.settings().spoilerShield) return false;
  const lvl = Number(item?.spoilerLevel || 0);
  return lvl > currentAct();
}

/** Avvolge un pezzo di HTML in una sfocatura rivelabile con un tocco */
export function wrap(item, html, label = 'Spoiler: tocca per rivelare') {
  if (!isHidden(item)) return html;
  const lvl = Number(item.spoilerLevel || 0);
  const why = lvl >= 9 ? 'Rumor o leak sulla trama: può rovinarti il gioco.' : `Contenuto oltre l'atto ${lvl}: leggi solo se sei arrivato lì.`;
  return `<div class="spoiler-box" data-spoiler>
    <button class="spoiler-box__btn" type="button" aria-expanded="false"><svg aria-hidden="true"><use href="#i-eye"/></svg><div><b>Attenzione: ${esc(label.replace(': tocca per rivelare', ''))}</b><span>${why} Tocca per mostrare.</span></div></button>
    <div class="spoiler-box__body" aria-hidden="true">${html}</div>
  </div>`;
}

/** Testo breve: sostituisce con puntini invece di sfocare */
export function text(item, str) {
  return isHidden(item) ? '<span class="muted">⚠ spoiler</span>' : esc(str);
}

export function bind(root) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.spoiler-box__btn');
    if (btn) { const box = btn.closest('.spoiler-box'); const open = box.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open); box.querySelector('.spoiler-box__body').setAttribute('aria-hidden', !open); return; }
    const acc = e.target.closest('.acc__btn');
    if (acc) { acc.closest('.acc').classList.toggle('is-open'); }
  });
}
