/**
 * Scheda tecnica di armi e veicoli, nello stile delle guide ufficiali.
 * Le barre vere arrivano dal campo `stats` (valori 0–10) quando il gioco è uscito.
 * Finché mancano le barre non si mostrano (prima dell'uscita c'erano barre di esempio: tolte con la v0.52.3).
 */
import { esc } from '../ui/dom.js';

export const WEAPON_AXES = [['damage', 'Danno'], ['accuracy', 'Precisione'], ['handling', 'Maneggevolezza'], ['range', 'Gittata']];
// Le cinque barre che il gioco mostra per i veicoli (elenchi di DayOne, 19/11)
const VEHICLE_AXES = [['speed', 'Velocità'], ['accel', 'Accelerazione'], ['handling', "Manovrabilità sull'asfalto"], ['offroad', 'Manovrabilità fuoristrada'], ['strength', 'Robustezza']];
function bars(axes, values, sample, num = false) {
  return `<div class="spec__bars ${sample ? 'is-sample' : ''} ${num ? 'spec__bars--num' : ''}">${axes.map(([k, label], i) => { const v = Math.max(0, Math.min(10, values[i] ?? 0)); return `<div class="spec__bar"><span>${esc(label)}</span><i>${Array.from({ length: 10 }, (_, j) => `<b class="${j < v ? 'on' : ''}"></b>`).join('')}</i>${num ? `<em>${v.toFixed(1)}</em>` : ''}</div>`; }).join('')}</div>`;
}

export function specSheet(it, kind) {
  const axes = kind === 'weapon' ? WEAPON_AXES : VEHICLE_AXES;
  const real = it.stats && axes.every(([k]) => typeof it.stats[k] === 'number');
  const values = real ? axes.map(([k]) => it.stats[k]) : [];
  const showBars = !(kind === 'weapon' && it.class === 'equipaggiamento');
  const rows = kind === 'weapon'
    ? [['Produttore', it.manufacturer], ['Modello reale', it.realModel], ['Calibro', it.caliber], ['Caricatore', it.magazine], ['Fuoco', it.fireMode], ['Prezzo', it.price], ['Dove si compra', it.whereToBuy]]
    : [['Produttore', it.manufacturer], ['Modello reale', it.realModel], ['Posti', it.seats], ['Trazione', it.drivetrain], ['Prezzo', it.price], ['Dove si trova', it.whereToFind]];
  const filled = rows.filter(([, v]) => v !== undefined && v !== null && v !== '');
  const missing = [...(showBars && !real ? ['Barre delle statistiche'] : []), ...rows.filter(([, v]) => v === undefined || v === null || v === '').map(([k]) => k)];
  return `<section class="spec">
    <header class="spec__head"><span>${kind === 'vehicle' && real ? 'Statistiche del modello base' : 'Scheda tecnica'}</span></header>
    ${showBars && real ? bars(axes, values, false, kind === 'vehicle') : ''}
    ${kind === 'vehicle' && it.rating ? `<p class="spec__rating"><span>Valutazione</span><b>${esc(it.rating.split('/').join(' · '))}</b></p>` : ''}
    ${filled.length ? `<dl class="spec__facts">${filled.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(String(v))}</dd>`).join('')}</dl>` : ''}
    ${missing.length ? `<p class="spec__todo">In arrivo: ${esc(missing.join(' · ').toLowerCase())}</p>` : ''}
    ${it.upgrades?.length ? `<details class="spec__up"><summary>Potenziamenti (${it.upgrades.length})</summary><table>${it.upgrades.map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.note || '')}</td><td>${esc(u.price || '')}</td></tr>`).join('')}</table></details>` : ''}
  </section>`;
}
