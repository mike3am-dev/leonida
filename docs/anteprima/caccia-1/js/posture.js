/**
 * Postura: una pagina web normale.
 * "Aperto" vuol dire semplicemente abbastanza spazio per due colonne.
 */
const QUERY = '(min-width: 600px) and (min-height: 520px)';

export function startPosture() {
  const apply = () => { document.documentElement.dataset.posture = isOpen() ? 'open' : 'closed'; };
  apply();
  addEventListener('resize', apply);
}

export function isOpen() { return matchMedia(QUERY).matches; }
