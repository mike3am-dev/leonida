/**
 * Scatti: galleria di foto della banda (ispirata agli Scapes di GT7), con mi piace e commenti.
 * Le foto vanno nel bucket pubblico «scatti» di Supabase, rimpicciolite sul telefono (lato lungo 1600 px, JPEG).
 * Una foto con spoiler (capitolo N) resta sfocata per chi non è ancora arrivato a quel capitolo.
 */
import { db } from '../data.js';
import * as cloud from '../store/cloud.js';
import { esc, toast } from '../ui/dom.js';
import { showSheet, closeSheet } from '../ui/sheet.js';
import { vis } from './shared.js';
import { currentAct } from '../spoiler.js';

let cache = null, loading = false, error = '';

const when = (iso) => { try { return new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const heart = (on) => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const hidden = (s) => s.spoiler > 0 && s.spoiler > currentAct() && !revealed.has(s.id);
const revealed = new Set();
const errMsg = (e) => (/404|PGRST202/.test(String(e?.message)) ? 'Gli Scatti non sono ancora attivi: manca un passaggio in Supabase.' : (e?.message || 'Qualcosa non ha funzionato.'));

async function load() {
  if (loading) return; loading = true; error = '';
  try { cache = { at: Date.now(), list: (await cloud.call('scatti_lista')) || [] }; }
  catch (e) { error = errMsg(e); }
  finally { loading = false; document.dispatchEvent(new CustomEvent('leonida:rerender')); }
}

const tile = (s, i) => `<button type="button" class="shot ${hidden(s) ? 'is-spoiler' : ''}" data-shot="${i}">
    <img src="${esc(cloud.photoUrl(s.percorso))}" alt="${esc(s.didascalia || 'Scatto di ' + s.nick)}" loading="lazy">
    ${hidden(s) ? `<span class="shot__veil">Spoiler del capitolo ${s.spoiler}<br><small>tocca per vedere</small></span>` : ''}
    <span class="shot__foot"><b>${esc(s.nick)}</b><span>${heart(s.piace)} ${s.likes}${s.commenti ? ` · 💬 ${s.commenti}` : ''}</span></span></button>`;

/** La galleria, in fondo alla pagina della banda */
export function galleryBlock() {
  if (!cloud.account()) return '';
  if (!cache || Date.now() - cache.at > 60000) setTimeout(load, 0);
  const list = cache?.list || [];
  return `<section class="shots-block" id="scatti">
    <div class="shots-head"><svg aria-hidden="true"><use href="#n-scatti"/></svg><div><h2>Scatti</h2><p class="small muted">Le foto migliori della banda${list.length ? ` · ${list.length}` : ''}</p></div></div>
    <label class="btn btn--accent btn--block shot-up"><svg aria-hidden="true"><use href="#i-photo"/></svg>Carica uno scatto<input type="file" accept="image/*" data-shot-file hidden></label>
    <p class="small muted">Dalla PS5: tieni premuto il tasto Create per salvare la foto, poi aprila sul telefono con l'app PlayStation e salvala nelle Foto.</p>
    ${error ? `<p class="callout callout--warn small">${esc(error)}</p>` : ''}
    ${!cache && !error ? '<p class="muted">Carico gli scatti…</p>' : ''}
    ${list.length ? `<div class="shots">${list.map(tile).join('')}</div>` : (cache ? '<p class="muted">Ancora nessuno scatto. Il primo è tuo.</p>' : '')}
  </section>`;
}

/** Rimpicciolisce sul telefono: lato lungo 1600 px, JPEG 0.82 (circa 300 KB) */
async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('Non riesco a leggere la foto.')); i.src = url; });
    const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.82));
    if (!blob) throw new Error('Non riesco a preparare la foto.');
    return { blob, preview: c.toDataURL('image/jpeg', 0.6) };
  } finally { URL.revokeObjectURL(url); }
}

function uploadSheet(prep) {
  const zones = vis(db.districts || []).filter((d) => d.id !== 'dis-da-collocare');
  const body = document.createElement('div');
  body.innerHTML = `<img class="shot-prev" src="${prep.preview}" alt="">
    <form data-shot-form>
      <label class="field"><span>Didascalia</span><input class="input" name="did" maxlength="280" placeholder="Tramonto su Ocean Drive…" autocomplete="off"></label>
      <label class="field"><span>Zona</span><select class="select" name="zona"><option value="">Non lo dico</option>${zones.map((d) => `<option>${esc(d.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Spoiler?</span><select class="select" name="sp"><option value="0">Nessuno spoiler</option>${[1, 2, 3, 4, 5].map((n) => `<option value="${n}">Sì, del capitolo ${n}</option>`).join('')}</select></label>
      <button class="btn btn--accent btn--block" type="submit">Pubblica</button>
      <p class="small muted">La vedono tutti quelli della banda. Le foto con spoiler restano sfocate per chi non è ancora arrivato a quel capitolo.</p>
    </form>`;
  body.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault(); const f = e.target, btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Carico…';
    try {
      const path = `${new Date().getFullYear()}/${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10)}.jpg`;
      await cloud.uploadPhoto(path, prep.blob);
      await cloud.call('scatto_nuovo', { p_percorso: path, p_didascalia: f.did.value.trim(), p_zona: f.zona.value, p_spoiler: Number(f.sp.value) });
      closeSheet(); toast('Scatto pubblicato'); cache = null; load();
    } catch (err) { btn.disabled = false; btn.textContent = 'Pubblica'; toast(errMsg(err), { ms: 5000 }); }
  });
  showSheet({ title: 'Nuovo scatto', body });
}

/** Il server risponde 404 se una funzione nuova non è ancora stata creata in Supabase */
const OLD_SERVER = /404|PGRST202/;

/** L'autore corregge didascalia, zona e spoiler della sua foto */
function editSheet(s) {
  const zones = vis(db.districts || []).filter((d) => d.id !== 'dis-da-collocare');
  const body = document.createElement('div');
  body.innerHTML = `<img class="shot-prev" src="${esc(cloud.photoUrl(s.percorso))}" alt="">
    <form data-shot-edit-form>
      <label class="field"><span>Didascalia</span><input class="input" name="did" maxlength="280" value="${esc(s.didascalia || '')}" autocomplete="off"></label>
      <label class="field"><span>Zona</span><select class="select" name="zona"><option value="">Non lo dico</option>${zones.map((d) => `<option ${d.name === s.zona ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Spoiler?</span><select class="select" name="sp"><option value="0">Nessuno spoiler</option>${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${Number(s.spoiler) === n ? 'selected' : ''}>Sì, del capitolo ${n}</option>`).join('')}</select></label>
      <button class="btn btn--accent btn--block" type="submit">Salva le modifiche</button>
    </form>`;
  body.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault(); const f = e.target, btn = f.querySelector('button'); btn.disabled = true;
    try {
      await cloud.call('scatto_modifica', { p_id: s.id, p_didascalia: f.did.value.trim(), p_zona: f.zona.value, p_spoiler: Number(f.sp.value) });
      closeSheet(); toast('Foto aggiornata'); cache = null; load();
    } catch (err) { btn.disabled = false; toast(OLD_SERVER.test(String(err?.message)) ? 'La modifica non è ancora attiva: manca un passaggio in Supabase.' : errMsg(err), { ms: 5000 }); }
  });
  showSheet({ title: 'Modifica la foto', body });
}

async function shotSheet(s) {
  const body = document.createElement('div'); body.className = 'shotview';
  const paint = (comments) => {
    body.innerHTML = `<img src="${esc(cloud.photoUrl(s.percorso))}" alt="">
      <div class="shotview__meta"><b>${esc(s.nick)}</b><span class="small muted">${esc(when(s.creato))}${s.zona ? ' · ' + esc(s.zona) : ''}${s.spoiler ? ` · spoiler capitolo ${s.spoiler}` : ''}</span></div>
      ${s.didascalia ? `<p>${esc(s.didascalia)}</p>` : ''}
      <div class="btn-row"><button class="btn ${s.piace ? 'btn--accent' : ''} shot-like" type="button" data-like>${heart(s.piace)} ${s.likes}</button>
        <a class="btn btn--ghost" href="${esc(cloud.photoUrl(s.percorso))}" target="_blank" rel="noopener">Apri la foto</a>
        ${s.mio ? '<button class="btn btn--ghost" type="button" data-shot-edit>Modifica</button>' : ''}
        ${s.mio || cloud.isAdmin() ? `<button class="btn btn--ghost" type="button" data-shot-del style="color:var(--orange)">Cancella${s.mio ? '' : ' (admin)'}</button>` : ''}</div>
      <h3 class="fsec__t">Commenti</h3>
      ${comments === null ? '<p class="muted small">Carico…</p>' : comments.length ? `<ul class="cmts">${comments.map((c) => `<li><b>${esc(c.nick)}</b> <span class="small muted">${esc(when(c.creato))}</span>${c.mio || cloud.isAdmin() ? ` <button type="button" class="linkbtn small" data-cmt-del="${esc(c.id)}">cancella</button>` : ''}<p>${esc(c.testo)}</p></li>`).join('')}</ul>` : '<p class="muted small">Nessun commento: scrivi il primo.</p>'}
      <form data-cmt-form class="cmt-form"><input class="input" name="t" maxlength="500" placeholder="Scrivi un commento…" autocomplete="off"><button class="btn btn--solid" type="submit">Invia</button></form>`;
  };
  const reload = async () => { try { paint(await cloud.call('scatto_commenti', { p_id: s.id }) || []); } catch (e) { paint([]); toast(errMsg(e)); } };
  paint(null); reload();
  body.addEventListener('click', async (e) => {
    if (e.target.closest('[data-like]')) {
      try { s.piace = await cloud.call('scatto_piace', { p_id: s.id }); s.likes += s.piace ? 1 : -1; reload(); document.dispatchEvent(new CustomEvent('leonida:rerender')); } catch (err) { toast(errMsg(err)); }
      return;
    }
    if (e.target.closest('[data-shot-edit]')) { editSheet(s); return; }
    if (e.target.closest('[data-shot-del]')) {
      if (!confirm(s.mio ? 'Sei sicuro? La foto sparisce per tutti, con i suoi commenti, e non si può recuperare.' : `Sei sicuro di cancellare la foto di ${s.nick}? Sparisce per tutti e non si può recuperare.`)) return;
      try {
        let path;
        try { path = await cloud.call('scatto_cancella', { p_id: s.id, p_codice: cloud.adminCode() || null }); }
        catch (err) { if (!s.mio || !OLD_SERVER.test(String(err?.message))) throw err; await cloud.call('scatto_togli', { p_id: s.id }); }   // server non ancora aggiornato: almeno la nasconde
        if (path) await cloud.deletePhoto(path);
        closeSheet(); toast('Foto cancellata'); cache = null; load();
      } catch (err) { toast(errMsg(err)); }
      return;
    }
    const d = e.target.closest('[data-cmt-del]');
    if (d) {
      if (!confirm('Cancellare questo commento?')) return;
      try {
        try { await cloud.call('commento_cancella', { p_id: d.dataset.cmtDel, p_codice: cloud.adminCode() || null }); }
        catch (err) { if (!OLD_SERVER.test(String(err?.message))) throw err; await cloud.call('commento_togli', { p_id: d.dataset.cmtDel }); }
        s.commenti = Math.max(0, s.commenti - 1); reload();
      } catch (err) { toast(errMsg(err)); }
    }
  });
  body.addEventListener('submit', async (e) => {
    const f = e.target.closest('[data-cmt-form]'); if (!f) return; e.preventDefault();
    const t = f.t.value.trim(); if (!t) return;
    try { await cloud.call('scatto_commenta', { p_id: s.id, p_testo: t }); s.commenti += 1; reload(); } catch (err) { toast(errMsg(err)); }
  });
  showSheet({ title: 'Scatto', body, cls: 'sheet--shot' });
}

export function bind(root) {
  root.addEventListener('change', async (e) => {
    const inp = e.target.closest('[data-shot-file]'); if (!inp || !inp.files[0]) return;
    try { uploadSheet(await shrink(inp.files[0])); } catch (err) { toast(err.message); }
    inp.value = '';
  });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-shot]'); if (!t || !cache) return;
    const s = cache.list[Number(t.dataset.shot)]; if (!s) return;
    if (hidden(s)) { revealed.add(s.id); document.dispatchEvent(new CustomEvent('leonida:rerender')); return; }
    shotSheet(s);
  });
}
