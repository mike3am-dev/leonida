/**
 * API dei progressi usata dalle viste.
 * Un solo oggetto di stato, salvato attraverso l'adapter scelto.
 */
import { LocalAdapter } from './local-adapter.js';
import { migrate, emptyState, CURRENT_VERSION } from './migrations.js';

let adapter = new LocalAdapter();
let state = emptyState();
const listeners = new Set();
let saveTimer = null;

export async function init(customAdapter) {
  if (customAdapter) adapter = customAdapter;
  const loaded = await adapter.load();
  state = migrate(loaded);
  await adapter.save(state);
  return state;
}

export function get() { return state; }
export function settings() { return state.settings; }

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function commit() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => adapter.save(state), 60);
  for (const fn of listeners) fn(state);
}

export function update(mutator) { mutator(state); commit(); }

/* ---------- Missioni ---------- */
export function missionState(id) { return state.missions[id]?.state || null; }

export function setMissionState(id, next) {
  update((s) => {
    if (!next) { delete s.missions[id]; if (s.current.missionId === id) s.current.missionId = null; return; }
    const prev = s.missions[id] || { extras: {} };
    s.missions[id] = { ...prev, state: next, at: new Date().toISOString() };
    if (next === 'in-corso') {
      // Una sola missione in corso alla volta: le altre tornano "non iniziate"
      for (const [k, v] of Object.entries(s.missions)) {
        if (k !== id && v.state === 'in-corso') delete s.missions[k];
      }
      s.current.missionId = id;
    }
    if (next === 'completata' && s.current.missionId === id) s.current.missionId = null;
  });
}

export function toggleExtra(missionId, objId) {
  update((s) => {
    const m = s.missions[missionId] || (s.missions[missionId] = { state: null, extras: {} });
    m.extras = m.extras || {};
    if (m.extras[objId]) delete m.extras[objId]; else m.extras[objId] = true;
    if (!m.state && Object.keys(m.extras).length === 0) delete s.missions[missionId];
  });
}
export function hasExtra(missionId, objId) { return !!state.missions[missionId]?.extras?.[objId]; }

/* ---------- Collezionabili e attività ---------- */
export function isCollected(id) { return !!state.collectibles[id]; }
export function toggleCollected(id) {
  update((s) => { if (s.collectibles[id]) delete s.collectibles[id]; else s.collectibles[id] = new Date().toISOString(); });
}
export function isActivityDone(id) { return state.activities[id] === 'completata'; }
export function toggleActivity(id) {
  update((s) => { if (s.activities[id]) delete s.activities[id]; else s.activities[id] = 'completata'; });
}

/* ---------- Preferiti ---------- */
/** Ce l'ho: armi nello zaino (unico per Jason e Lucia), veicoli nel garage */
export function isOwned(id) { return !!state.owned?.[id]; }
export function toggleOwned(id) {
  update((s) => { s.owned = s.owned || {}; if (s.owned[id]) delete s.owned[id]; else s.owned[id] = new Date().toISOString(); });
}

/* ---------- Trofei ---------- */
/** Veicoli che nella guida non ci sono: li aggiungi tu al garage con la classe del gioco */
export function addMyVehicle(name, cls) { update((s) => { s.myVehicles = s.myVehicles || {}; s.myVehicles['mine-' + Date.now().toString(36)] = { name, cls, at: new Date().toISOString() }; }); }
export function removeMyVehicle(id) { update((s) => { if (s.myVehicles) delete s.myVehicles[id]; }); }
export function isDiscovered(id) { return !!state.discovered?.[id]; }
export function toggleDiscovered(id) {
  update((s) => { s.discovered = s.discovered || {}; if (s.discovered[id]) delete s.discovered[id]; else s.discovered[id] = new Date().toISOString(); });
}
/** Spunte libere (es. i bonus del «Da non perdere» di un capitolo) */
export function isChecked(id) { return !!state.checks?.[id]; }
export function toggleCheck(id) {
  update((s) => { s.checks = s.checks || {}; if (s.checks[id]) delete s.checks[id]; else s.checks[id] = new Date().toISOString(); });
}
export function toggleTrophy(id) {
  update((s) => { s.trophies = s.trophies || {}; if (s.trophies[id]) delete s.trophies[id]; else s.trophies[id] = new Date().toISOString(); });
}

/* ---------- Appunti ---------- */
export function addNote({ text, districtId = null, missionId = null, kind = null, fields = null }) {
  const note = { id: 'n-' + Date.now().toString(36), ts: new Date().toISOString(), text: text.trim(), districtId, missionId };
  if (kind) note.kind = kind;
  if (fields) note.fields = fields;
  update((s) => { s.notes.unshift(note); });
  return note;
}
export function deleteNote(id) { update((s) => { s.notes = s.notes.filter((n) => n.id !== id); }); }
export function markNotesExported(ids) {
  update((s) => { for (const n of s.notes) if (ids.includes(n.id)) n.exported = true; });
}

/* ---------- La mia playlist (Radio) ---------- */
export function inPlaylist(id) { return (state.playlist || []).some((x) => x.id === id); }
/** song: { id, title, artist, station, stationId, custom } */
export function togglePlaylist(song) {
  update((s) => {
    s.playlist = s.playlist || [];
    const i = s.playlist.findIndex((x) => x.id === song.id);
    if (i >= 0) s.playlist.splice(i, 1);
    else s.playlist.unshift({ id: song.id, title: song.title || '', artist: song.artist || '', station: song.station || '', stationId: song.stationId || null, custom: !!song.custom, at: new Date().toISOString() });
  });
}

/* ---------- Sessioni ---------- */
export function touchSession() {
  update((s) => {
    const now = Date.now();
    const last = s.sessions[0];
    // Se l'ultima attività è di meno di 30 minuti fa, è la stessa sessione
    if (last && now - new Date(last.end).getTime() < 30 * 60 * 1000) last.end = new Date(now).toISOString();
    else s.sessions.unshift({ start: new Date(now).toISOString(), end: new Date(now).toISOString() });
    s.sessions = s.sessions.slice(0, 100);
  });
}

/* ---------- Impostazioni ---------- */
export function setSetting(key, value) { update((s) => { s.settings[key] = value; }); }
export function setCurrentDistrict(id) { update((s) => { s.current.districtId = id; }); }

/* ---------- Export / Import ---------- */
export function exportJSON() {
  return JSON.stringify({ app: 'leonida', exportedAt: new Date().toISOString(), state }, null, 2);
}
export function previewImport(text) {
  const parsed = JSON.parse(text);
  const incoming = parsed.state || parsed;
  if (!incoming || typeof incoming !== 'object' || !('missions' in incoming)) {
    throw new Error('Il file non sembra un backup di Leonida.');
  }
  const m = migrate(JSON.parse(JSON.stringify(incoming)));
  return {
    state: m,
    summary: {
      missioni: Object.values(m.missions).filter((x) => x.state === 'completata').length,
      collezionabili: Object.keys(m.collectibles).length,
      appunti: m.notes.length,
      esportato: parsed.exportedAt || null,
    },
  };
}
export async function importState(newState) {
  state = migrate(newState);
  await adapter.save(state);
  for (const fn of listeners) fn(state);
}
export async function resetAll() {
  state = emptyState();
  await adapter.save(state);
  for (const fn of listeners) fn(state);
}

export const info = { get adapterName() { return adapter.name; }, version: CURRENT_VERSION };
