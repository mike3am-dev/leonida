/**
 * Scheda tecnica di armi e veicoli, nello stile delle guide ufficiali.
 * Le barre vere arrivano dal campo `stats` (valori 0–10) quando il gioco è uscito.
 * Finché mancano si mostrano barre GRIGIE TRATTEGGIATE di esempio, tipiche della classe, con la scritta «Esempio · dati veri dal 19».
 */
import { esc } from '../ui/dom.js';

const WEAPON_AXES = [['damage', 'Danno'], ['rate', 'Cadenza'], ['accuracy', 'Precisione'], ['range', 'Gittata']];
const VEHICLE_AXES = [['speed', 'Velocità'], ['braking', 'Frenata'], ['accel', 'Accelerazione'], ['traction', 'Aderenza']];
// Profili di esempio per classe (solo per far capire come sarà la scheda: NON sono dati)
const WEAPON_SAMPLE = { pistola: [4, 4, 6, 3], 'fucile-assalto': [6, 7, 6, 6], mitra: [4, 9, 4, 4], 'fucile-pompa': [9, 3, 3, 2], cecchino: [9, 1, 9, 10], pesante: [10, 2, 3, 7], lancio: [8, 1, 4, 3], 'corpo-a-corpo': [3, 5, 0, 0], equipaggiamento: [0, 0, 0, 0] };
const VEHICLE_SAMPLE = { super: [9, 7, 9, 8], sportiva: [8, 7, 8, 7], muscle: [7, 4, 7, 5], berlina: [6, 5, 5, 6], suv: [6, 5, 5, 6], fuoristrada: [5, 5, 5, 8], classica: [5, 4, 4, 5], coupe: [7, 6, 6, 6], moto: [8, 6, 9, 4], furgone: [4, 4, 3, 5], industriale: [3, 3, 2, 6], servizio: [5, 5, 4, 5], militare: [5, 5, 4, 8], barca: [7, 3, 6, 4], elicottero: [7, 5, 6, 5], aereo: [10, 4, 7, 5], altro: [5, 5, 5, 5] };

function bars(axes, values, sample) {
  return `<div class="spec__bars ${sample ? 'is-sample' : ''}">${axes.map(([k, label], i) => { const v = Math.max(0, Math.min(10, values[i] ?? 0)); return `<div class="spec__bar"><span>${esc(label)}</span><i>${Array.from({ length: 10 }, (_, j) => `<b class="${j < v ? 'on' : ''}"></b>`).join('')}</i></div>`; }).join('')}</div>`;
}

export function specSheet(it, kind) {
  const axes = kind === 'weapon' ? WEAPON_AXES : VEHICLE_AXES;
  const real = it.stats && axes.every(([k]) => typeof it.stats[k] === 'number');
  const values = real ? axes.map(([k]) => it.stats[k]) : ((kind === 'weapon' ? WEAPON_SAMPLE : VEHICLE_SAMPLE)[it.class] || [5, 5, 5, 5]);
  const rows = kind === 'weapon'
    ? [['Produttore', it.manufacturer], ['Modello reale', it.realModel], ['Calibro', it.caliber], ['Caricatore', it.magazine], ['Fuoco', it.fireMode], ['Prezzo', it.price], ['Dove si compra', it.whereToBuy]]
    : [['Produttore', it.manufacturer], ['Modello reale', it.realModel], ['Posti', it.seats], ['Trazione', it.drivetrain], ['Prezzo', it.price], ['Dove si trova', it.whereToFind]];
  const filled = rows.filter(([, v]) => v !== undefined && v !== null && v !== '');
  const missing = rows.filter(([, v]) => v === undefined || v === null || v === '').map(([k]) => k);
  const showBars = !(kind === 'weapon' && it.class === 'equipaggiamento');
  return `<section class="spec">
    <header class="spec__head"><span>Scheda tecnica</span>${real ? '' : '<em>Esempio · dati veri dal 19</em>'}</header>
    ${showBars ? bars(axes, values, !real) : ''}
    ${filled.length ? `<dl class="spec__facts">${filled.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(String(v))}</dd>`).join('')}</dl>` : ''}
    ${missing.length ? `<p class="spec__todo">In arrivo: ${esc(missing.join(' · ').toLowerCase())}</p>` : ''}
    ${it.upgrades?.length ? `<details class="spec__up"><summary>Potenziamenti (${it.upgrades.length})</summary><table>${it.upgrades.map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.note || '')}</td><td>${esc(u.price || '')}</td></tr>`).join('')}</table></details>` : ''}
  </section>`;
}
