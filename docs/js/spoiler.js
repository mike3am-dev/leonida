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
  return `<div class="spoiler" data-spoiler>
    <div class="spoiler__content" aria-hidden="true">${html}</div>
    <button class="spoiler__veil" type="button"><svg aria-hidden="true"><use href="#i-eye"/></svg>${esc(label)} <span class="muted">(atto ${esc(item.spoilerLevel)})</span></button>
  </div>`;
}

/** Testo breve: sostituisce con puntini invece di sfocare */
export function text(item, str) {
  return isHidden(item) ? '<span class="muted">• • •</span>' : esc(str);
}

export function bind(root) {
  root.addEventListener('click', (e) => {
    const veil = e.target.closest('.spoiler__veil');
    if (!veil) return;
    const box = veil.closest('.spoiler');
    box.classList.add('is-revealed');
    box.querySelector('.spoiler__content').removeAttribute('aria-hidden');
  });
}
