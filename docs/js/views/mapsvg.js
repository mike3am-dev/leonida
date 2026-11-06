/**
 * Mappa di Leonida: immagine della community (fan-made, caricata da Mike) con i segnaposto dei territori sopra.
 * Le posizioni sono in percentuale sull'immagine: indicative, finché Rockstar non pubblica la mappa vera.
 */
import { esc } from '../ui/dom.js';

export const MAP_IMAGE = 'assets/img/mappa-leonida.jpg';

// [x%, y%] sull'immagine
const POS = {
  'dis-mount-kalaga': [68.3, 10.5], 'dis-port-gellhorn': [32.9, 25.0], 'dis-grassrivers': [50.0, 25.0], 'dis-vice-beach': [77.9, 26.9],
  'dis-waning-sands': [75.5, 34.5], 'dis-ambrosia': [39.1, 38.3], 'dis-capri': [25.8, 44.0], 'dis-vice-city': [68.3, 42.3],
  'dis-hamlet': [47.5, 47.7], 'dis-keys': [89.5, 67.0],
};
const BIG = new Set(['dis-vice-city', 'dis-keys', 'dis-mount-kalaga', 'dis-grassrivers', 'dis-port-gellhorn', 'dis-ambrosia']);

export function mapImg(districts, activeId, { full = false } = {}) {
  const pins = districts.filter((d) => POS[d.id]).map((d) => {
    const [x, y] = POS[d.id]; const active = d.id === activeId; const big = BIG.has(d.id);
    return `<button type="button" class="mpin ${active ? 'is-active' : ''} ${big ? 'mpin--big' : ''}" style="left:${x}%;top:${y}%" data-zone-go="${esc(d.id)}" aria-label="${esc(d.name)}">
      <span class="mpin__dot"></span><span class="mpin__label">${esc(d.name.replace(' National Park', ''))}</span></button>`;
  }).join('');
  return `<div class="atlas-img ${full ? 'atlas-img--full' : ''}"><img src="${MAP_IMAGE}" alt="Mappa dello stato di Leonida (community)" ${full ? '' : 'loading="lazy"'}>${pins}</div>`;
}

// Compatibilità con chi importava la vecchia illustrazione
export const mapSvg = mapImg;
