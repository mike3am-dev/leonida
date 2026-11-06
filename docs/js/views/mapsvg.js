/**
 * Mappa di Leonida: immagine della community (fan-made, caricata da Mike) con i territori appuntati sopra
 * come post-it scritti a pennarello. Le posizioni sono in percentuale sull'immagine: indicative.
 */
import { esc } from '../ui/dom.js';

export const MAP_IMAGE = 'assets/img/mappa-leonida.jpg';

// [x%, y%, rotazione in gradi, lato del foglietto rispetto alla puntina: 'r' destra, 'l' sinistra, 'b' sotto]
const POS = {
  'dis-mount-kalaga': [68.3, 10.5, -5, 'r'], 'dis-port-gellhorn': [32.9, 25.0, 4, 'l'], 'dis-grassrivers': [50.0, 25.0, -3, 'r'], 'dis-vice-beach': [77.9, 26.9, 6, 'r'],
  'dis-waning-sands': [75.5, 34.5, -4, 'r'], 'dis-ambrosia': [39.1, 38.3, 3, 'l'], 'dis-capri': [25.8, 44.0, -6, 'l'], 'dis-vice-city': [68.3, 42.3, 5, 'r'],
  'dis-hamlet': [47.5, 47.7, -2, 'b'], 'dis-keys': [89.5, 67.0, 4, 'l'],
};

export function mapImg(districts, activeId, { full = false } = {}) {
  const pins = districts.filter((d) => POS[d.id]).map((d, i) => {
    const [x, y, rot, side] = POS[d.id]; const active = d.id === activeId;
    return `<button type="button" class="mpin mpin--${side} ${active ? 'is-active' : ''}" style="left:${x}%;top:${y}%;--rot:${rot}deg;--i:${i}" data-zone-go="${esc(d.id)}" aria-label="${esc(d.name)}">
      <span class="mpin__dot"></span><span class="mpin__note"><span class="mpin__tape"></span>${esc(d.name.replace(' National Park', ''))}</span></button>`;
  }).join('');
  return `<div class="atlas-img ${full ? 'atlas-img--full' : ''}"><img src="${MAP_IMAGE}" alt="Mappa dello stato di Leonida (community)" ${full ? '' : 'loading="lazy"'}>${pins}</div>`;
}

export const mapSvg = mapImg;
