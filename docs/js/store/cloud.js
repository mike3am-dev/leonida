/**
 * Profilo online: si entra con l'email (niente password, niente codice, scelta di Mike del 18/11).
 * I progressi restano prima di tutto sul telefono (funziona anche offline); questo modulo li copia
 * su Supabase sotto l'email e li riprende da lì su un altro dispositivo.
 * La tabella è chiusa: si passa solo dalle due funzioni leggi_profilo / salva_profilo.
 * Regola: vince la copia modificata per ultima (savedAt).
 */
import * as progress from './progress.js';

const API = 'https://geuppepguqzhjwiqbvwl.supabase.co/rest/v1/rpc/';
const KEY = 'sb_publishable_qjrsrBCvY9NA3Zc7rEJaiA_EVrxgb_l';
const ACC = 'leonida:account';

export const normalize = (e) => String(e || '').trim().toLowerCase();
export const isValid = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalize(e));

/** { email, localAt, pushedAt } oppure null */
export function account() {
  try { const a = JSON.parse(localStorage.getItem(ACC)); return a?.email ? a : null; } catch { return null; }
}
function setAccount(a) {
  try { a ? localStorage.setItem(ACC, JSON.stringify(a)) : localStorage.removeItem(ACC); } catch {}
}

let status = 'idle'; // idle | saving | saved | offline | error
let applying = false, timer = null, onApplied = () => {}, lastSig = '';
// Le sessioni e il «dove sei» cambiano solo aprendo l'app: non contano come modifiche
// (se no aprire l'app su un telefono vecchio sovrascriverebbe i progressi fatti su un altro).
const sig = (s) => JSON.stringify({ ...s, sessions: undefined, current: undefined });
const watchers = new Set();
const setStatus = (s) => { status = s; for (const f of watchers) f(s); };
export const getStatus = () => status;
export const watch = (fn) => { watchers.add(fn); return () => watchers.delete(fn); };

async function rpc(fn, body, opts = {}) {
  const res = await fetch(API + fn, {
    method: 'POST', keepalive: !!opts.keepalive,
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`server ${res.status}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

/** { savedAt, state } oppure null se il profilo non esiste */
export async function readRemote(email) {
  const d = await rpc('leggi_profilo', { p_email: normalize(email) });
  return d && d.state ? d : null;
}

async function push({ keepalive = false } = {}) {
  const a = account(); if (!a) return;
  const savedAt = a.localAt || new Date().toISOString();
  setStatus('saving');
  try {
    await rpc('salva_profilo', { p_email: a.email, p_dati: { savedAt, state: progress.get() } }, { keepalive });
    const b = account(); if (b && b.email === a.email) setAccount({ ...b, pushedAt: savedAt });
    setStatus('saved');
  } catch (e) {
    setStatus(navigator.onLine === false ? 'offline' : 'error');
  }
}

/** Conta quello che c'è in uno stato, per capire se è vuoto e per mostrarlo nella scelta. */
export function summary(s) {
  const n = (o) => Object.keys(o || {}).length;
  return {
    missioni: Object.values(s?.missions || {}).filter((m) => m.state === 'completata').length,
    collezionabili: n(s?.collectibles), trofei: n(s?.trophies), appunti: (s?.notes || []).length,
    totale: n(s?.missions) + n(s?.collectibles) + n(s?.trophies) + n(s?.activities) + n(s?.owned) + n(s?.discovered) + (s?.notes || []).length,
  };
}

async function applyRemote(r, email) {
  applying = true;
  try { await progress.importState(r.state); } finally { applying = false; }
  lastSig = sig(progress.get());
  setAccount({ email, localAt: r.savedAt, pushedAt: r.savedAt });
  setStatus('saved');
  onApplied();
}

/**
 * Primo accesso con un'email. Restituisce:
 *  { esito: 'nuovo' }       profilo creato con i progressi di questo telefono
 *  { esito: 'bentornato' }  profilo ripreso (il telefono era vuoto)
 *  { esito: 'scegli', online, telefono, usaOnline(), usaTelefono() }  ci sono progressi in tutti e due
 */
export async function login(rawEmail) {
  const email = normalize(rawEmail);
  if (!isValid(email)) throw new Error('Controlla l’email: sembra scritta male.');
  let r;
  try { r = await readRemote(email); } catch { throw new Error('Non riesco a collegarmi. Controlla la rete e riprova.'); }
  const now = new Date().toISOString();
  if (!r) {
    setAccount({ email, localAt: now, pushedAt: null });
    await push();
    if (status !== 'saved') { setAccount(null); throw new Error('Non riesco a creare il profilo. Riprova tra poco.'); }
    return { esito: 'nuovo', email };
  }
  const local = summary(progress.get());
  if (local.totale === 0) { await applyRemote(r, email); return { esito: 'bentornato', email }; }
  return {
    esito: 'scegli', email, online: summary(r.state), telefono: local, onlineAt: r.savedAt,
    usaOnline: () => applyRemote(r, email),
    usaTelefono: async () => { setAccount({ email, localAt: now, pushedAt: null }); await push(); },
  };
}

export function logout() { clearTimeout(timer); setAccount(null); setStatus('idle'); }

/** Salva subito (bottone «Salva progressi» e uscita dall'app). */
export async function flush(opts) { clearTimeout(timer); const a = account(); if (a && a.localAt !== a.pushedAt) await push(opts); }

/** Allinea con la copia online: se è più recente la prende, se è più vecchia la aggiorna. */
export async function sync() {
  const a = account(); if (!a) return;
  let r;
  try { r = await readRemote(a.email); } catch { setStatus(navigator.onLine === false ? 'offline' : 'error'); return; }
  if (r && r.savedAt && r.savedAt > (a.localAt || '')) { await applyRemote(r, a.email); return; }
  if (!r || (a.localAt || '') > (a.pushedAt || '')) { await push(); return; }
  setStatus('saved');
}

/** Da chiamare una volta, dopo progress.init(). */
export function start({ applied } = {}) {
  if (applied) onApplied = applied;
  lastSig = sig(progress.get());
  progress.subscribe((st) => {
    if (applying) return;
    const now = sig(st); if (now === lastSig) return; lastSig = now;
    const a = account(); if (!a) return;
    setAccount({ ...a, localAt: new Date().toISOString() });
    clearTimeout(timer); timer = setTimeout(() => push(), 1500);
  });
  document.addEventListener('visibilitychange', () => {
    if (!account()) return;
    if (document.visibilityState === 'hidden') flush({ keepalive: true });
    else sync();
  });
  window.addEventListener('online', () => { if (account()) sync(); });
  sync();
}
