/**
 * Profilo: il riquadro «Entra con la tua email» (Benvenuto e Impostazioni) e lo stato del salvataggio online.
 */
import * as cloud from '../store/cloud.js';
import { esc, toast } from '../ui/dom.js';
import { showSheet, closeSheet } from '../ui/sheet.js';

const hhmm = (iso) => { try { return new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

export function statusText() {
  const a = cloud.account(); if (!a) return '';
  const s = cloud.getStatus();
  if (s === 'saving') return 'Sto salvando online…';
  if (s === 'offline') return 'Senza rete: salvo online appena torna.';
  if (s === 'error') return 'Salvataggio online non riuscito: riprovo da solo.';
  if (a.pushedAt && a.pushedAt === a.localAt) return `Salvato online · ${hhmm(a.pushedAt)}`;
  return a.pushedAt ? `Ultimo salvataggio online · ${hhmm(a.pushedAt)}` : 'In attesa del primo salvataggio online.';
}

/** Riquadro del profilo: modulo se non sei entrato, altrimenti email e stato. */
export function panelHtml({ compact = false } = {}) {
  const a = cloud.account();
  if (a) {
    return `<div class="acct acct--in">
      <div class="acct__who"><span class="acct__dot" aria-hidden="true"></span><div><div class="acct__mail">${esc(a.email)}</div>
      <p class="small muted" data-cloud-status>${esc(statusText())}</p></div></div>
      ${compact ? '' : `<div class="btn-row"><button class="btn btn--solid" type="button" data-cloud-now>Salva adesso</button>
      <button class="btn btn--ghost" type="button" data-cloud-out>Esci dal profilo</button></div>`}
    </div>`;
  }
  return `<form class="acct" data-login-form novalidate>
      <label class="field"><span>La tua email</span>
        <input class="input" type="email" name="email" inputmode="email" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="nome@esempio.it" required></label>
      <button class="btn btn--accent btn--block" type="submit">Entra</button>
      <p class="small muted acct__note">Niente password: scrivi la tua email e i tuoi progressi si salvano online. Su un altro telefono, o se cancelli l'app, rimetti la stessa email e ritrovi tutto. L'email serve solo a questo.</p>
    </form>`;
}

function choiceSheet(r, done) {
  const row = (t, s) => `<dl class="facts"><dt>Missioni completate</dt><dd>${s.missioni}</dd><dt>Collezionabili</dt><dd>${s.collezionabili}</dd><dt>Trofei</dt><dd>${s.trofei}</dd><dt>Appunti</dt><dd>${s.appunti}</dd></dl>`;
  const body = document.createElement('div');
  body.innerHTML = `<p>Per <b>${esc(r.email)}</b> ci sono già dei progressi online, e ce ne sono anche su questo telefono. Quali tieni?</p>
    <div class="acct__pick"><div class="card"><div class="kicker kicker--accent">Online · ${esc(hhmm(r.onlineAt))}</div>${row('online', r.online)}
      <button class="btn btn--accent btn--block" type="button" data-pick="online">Usa quelli online</button></div>
    <div class="card"><div class="kicker">Su questo telefono</div>${row('tel', r.telefono)}
      <button class="btn btn--block" type="button" data-pick="tel">Tieni quelli del telefono</button></div></div>
    <p class="small muted">Quelli che non scegli vengono sostituiti. Se non sei sicuro, prima salva una copia da Impostazioni.</p>`;
  body.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-pick]'); if (!b) return;
    b.disabled = true;
    try { if (b.dataset.pick === 'online') await r.usaOnline(); else await r.usaTelefono(); closeSheet(); toast(`Sei dentro come ${r.email}`); done(); }
    catch (err) { b.disabled = false; toast(err.message || 'Non è andata, riprova.'); }
  });
  showSheet({ title: 'Due copie dei progressi', body });
}

/** after(esito): cosa fare dopo l'ingresso (il Benvenuto porta alla Home). */
export function bind(root, rerender, { after } = {}) {
  root.addEventListener('submit', async (e) => {
    const f = e.target.closest('[data-login-form]'); if (!f) return;
    e.preventDefault();
    const btn = f.querySelector('button[type=submit]'); const email = f.email.value;
    if (!cloud.isValid(email)) { toast('Controlla l’email: sembra scritta male.'); f.email.focus(); return; }
    btn.disabled = true; btn.textContent = 'Entro…';
    try {
      const r = await cloud.login(email);
      const finish = () => { rerender(); after?.(r.esito); };
      if (r.esito === 'scegli') { btn.disabled = false; btn.textContent = 'Entra'; choiceSheet(r, finish); return; }
      toast(r.esito === 'nuovo' ? `Profilo nuovo per ${r.email}. Se ne avevi già uno, controlla di aver scritto bene l'email.` : `Bentornato, ${r.email}: progressi ripresi.`, { ms: 6000 });
      finish();
    } catch (err) { btn.disabled = false; btn.textContent = 'Entra'; toast(err.message, { ms: 5000 }); }
  });
  root.addEventListener('click', async (e) => {
    if (e.target.closest('[data-cloud-now]')) { await cloud.flush(); await cloud.sync(); toast(cloud.getStatus() === 'saved' ? 'Salvato online' : statusText()); rerender(); return; }
    if (e.target.closest('[data-cloud-out]')) {
      if (!confirm('Uscire dal profilo? I progressi restano anche su questo telefono, ma non si salvano più online finché non rientri.')) return;
      await cloud.flush(); cloud.logout(); rerender(); toast('Sei uscito dal profilo');
    }
  });
  cloud.watch(() => { for (const el of document.querySelectorAll('[data-cloud-status]')) el.textContent = statusText(); });
}
