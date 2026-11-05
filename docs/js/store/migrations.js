/**
 * Migrazioni dei progressi salvati.
 * Ogni voce porta lo stato dalla versione N alla N+1.
 * Quando cambi il formato: alza CURRENT_VERSION e aggiungi una funzione.
 */
export const CURRENT_VERSION = 1;

export function emptyState() {
  return {
    version: CURRENT_VERSION,
    missions: {},      // id -> { state: 'in-corso'|'completata', at, extras: { objId: true } }
    collectibles: {},  // id -> ISO date
    activities: {},    // id -> 'completata'
    notes: [],         // { id, ts, text, districtId, missionId }
    favorites: {},     // id -> true (segnalibri)
    sessions: [],      // { start, end }
    current: { missionId: null, districtId: null },
    settings: {
      theme: 'dark',
      spoilerShield: true,
      manualAct: null,     // null = segue la progressione
      showExamples: true,
      sfx: false,
    },
  };
}

const steps = {
  // 1: (s) => { ...; s.version = 2; return s; },
};

export function migrate(state) {
  if (!state || typeof state !== 'object') return emptyState();
  let s = state;
  if (!s.version) s.version = 1;
  while (s.version < CURRENT_VERSION) {
    const fn = steps[s.version];
    if (!fn) throw new Error(`Manca la migrazione dalla versione ${s.version}`);
    s = fn(s);
  }
  // Completa i campi mancanti senza toccare quelli esistenti
  const base = emptyState();
  for (const k of Object.keys(base)) if (s[k] === undefined) s[k] = base[k];
  s.settings = { ...base.settings, ...(s.settings || {}) };
  s.current = { ...base.current, ...(s.current || {}) };
  return s;
}
