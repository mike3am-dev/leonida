/**
 * Migrazioni dei progressi salvati.
 * Ogni voce porta lo stato dalla versione N alla N+1.
 * Quando cambi il formato: alza CURRENT_VERSION e aggiungi una funzione.
 */
export const CURRENT_VERSION = 3;

export function emptyState() {
  return {
    version: CURRENT_VERSION,
    missions: {},      // id -> { state: 'in-corso'|'completata', at, extras: { objId: true } }
    collectibles: {},  // id -> ISO date
    activities: {},    // id -> 'completata'
    notes: [],         // { id, ts, text, districtId, missionId }
    favorites: {},     // id -> true (segnalibri)
    trophies: {},      // id -> ISO date
    discovered: {},    // id -> ISO date (personaggi incontrati, regioni scoperte: segnati a mano)
    sessions: [],      // { start, end }
    current: { missionId: null, districtId: null },
    settings: {
      theme: 'auto',       // segue il sistema, come Safari
      spoilerShield: true,
      manualAct: null,     // null = segue la progressione
      showExamples: false,
      sfx: false,
    },
  };
}

const steps = {
  // 1 → 2: il tema predefinito diventa «auto» (segue il sistema); chi aveva lasciato «scuro» passa ad auto.
  1: (s) => { if (s.settings && (s.settings.theme === 'dark' || !s.settings.theme)) s.settings.theme = 'auto'; s.version = 2; return s; },
  2: (s) => { s.discovered = s.discovered || {}; s.version = 3; return s; },
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
