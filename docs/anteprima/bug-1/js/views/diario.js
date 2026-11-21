/** Appunti: il taccuino da gioco. Scrivi, ritrova, passa a Claude. */
import { db, byId, actNum } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, fmtDate, fmtTime, relTime, toast } from '../ui/dom.js';
import { showSheet, closeSheet } from '../ui/sheet.js';
import { sectionHead, acc, vis, sectionOf, currentMission } from './shared.js';
import * as spoiler from '../spoiler.js';
import { cup } from './trofei.js';

const section = sectionOf('diario');

export function render(params, query) {
  const creator = !!progress.settings().creatorTools;
  const st = progress.get();
  const notes = st.notes;
  const pending = notes.filter((n) => !n.exported);
  const open = notes.filter((n) => /\?/.test(n.text) && !n.exported);
  const groups = new Map();
  for (const n of notes) { const k = fmtDate(n.ts, { weekday: 'long', day: 'numeric', month: 'long' }); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(n); }
  const left = `${sectionHead(section, `${notes.length} appunt${notes.length === 1 ? "o" : "i"}`)}
    <p class="lede">Il taccuino da gioco. Scrivi mentre giochi: qui ritrovi tutto, con missione e zona già segnate.</p>
    <div class="actions">
      <button class="btn btn--solid" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Nuovo appunto</button>
 ${creator ? `<button class="btn ${pending.length ? 'btn--accent' : 'btn--ghost'}" type="button" data-action="packet" ${notes.length ? '' : 'disabled'}>Pacchetto per Claude${pending.length ? ` · ${pending.length}` : ''}</button>` : ''}
    </div>
    ${creator && query.pacchetto === '1' && notes.length ? packetPage(notes) : ''}
    ${creator ? `<div class="block">${acc('Come funziona il Pacchetto per Claude', `<ol class="steps">
      <li><b>Giochi e scrivi.</b> Un appunto per ogni cosa che scopri: una missione, un posto, un collezionabile, un trucco. Metti un «?» se è da verificare. L’appunto si aggancia da solo alla missione in corso e alla zona.</li>
      <li><b>Tocchi «Pacchetto per Claude».</b> L’app impacchetta gli appunti non ancora inviati in un testo già formattato, con le istruzioni e gli id della guida.</li>
      <li><b>Copi e incolli in chat con Claude.</b> Claude trasforma gli appunti in schede vere: missioni, luoghi, collezionabili, consigli. Non inventa nulla: solo quello che hai scritto tu, con etichetta «da verificare».</li>
      <li><b>Claude aggiorna la guida e fa il push.</b> Alla riapertura dell’app i tuoi appunti sono diventati contenuto. Poi tocchi «Segna come inviati» e il contatore torna a zero.</li>
    </ol>`, !notes.length)}</div>` : ''}
    <div class="stats">
      <div class="card"><div class="stat"><div class="stat__value tnum">${pending.length}</div><div class="stat__label">da passare a Claude</div></div></div>
      <div class="card"><div class="stat"><div class="stat__value tnum">${open.length}</div><div class="stat__label">domande aperte (con «?»)</div></div></div>
      <div class="card"><div class="stat"><div class="stat__value tnum">${st.sessions.length}</div><div class="stat__label">sessioni di gioco</div></div></div>
    </div>
    ${open.length ? `<div class="block">${acc(`Domande aperte (${open.length})`, open.map(noteHtml).join(''), true)}</div>` : ''}
    <div class="block">
      ${notes.length ? [...groups].map(([day, list]) => `<span class="kicker" style="display:block;margin-top:var(--s-4)">${esc(day)}</span>${list.map(noteHtml).join('')}`).join('')
        : '<div class="placeholder"><strong>Nessun appunto</strong>Il primo lo scrivi tu, tra una missione e l’altra. Metti un «?» per segnare una cosa da verificare.</div>'}
    </div>
    ${st.sessions.length ? `<div class="block">${acc(`Sessioni (${st.sessions.length})`, st.sessions.slice(0, 20).map((s) => `<div class="note"><div class="note__time">${esc(fmtDate(s.start, { weekday: 'long', day: 'numeric', month: 'long' }))} · ${fmtTime(s.start)}–${fmtTime(s.end)}</div></div>`).join(''))}</div>` : ''}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Appunti' };
}

function noteHtml(n) {
  const m = n.missionId ? byId(n.missionId) : null, d = n.districtId ? byId(n.districtId) : null;
  return `<div class="note" data-note="${esc(n.id)}">
    <div class="note__time">${fmtTime(n.ts)}${m ? ` · <a href="#/missioni/${esc(m.id)}">${esc(spoiler.missionName(m))}</a>` : ''}${d ? ` · <a href="#/mappa/${esc(d.id)}">${esc(d.name)}</a>` : ''}${n.exported ? ' · <span class="chip chip--verificato">inviato</span>' : ''}</div>
    <div class="note__text">${esc(n.text)}</div>
    <div class="note__actions"><button class="icon-btn" type="button" data-del-note="${esc(n.id)}" aria-label="Elimina appunto"><svg aria-hidden="true"><use href="#i-close"/></svg></button></div>
  </div>`;
}

export function buildPacket(notes) {
  const ids = {
    missioni: db.missions.filter((m) => spoiler.missionRevealed(m)).map((m) => `${m.id} «${m.title}»`),
    distretti: db.districts.map((d) => `${d.id} «${d.name}»`),
    categorie: db.collectibleCategories.map((c) => `${c.id} «${c.name}»`),
    personaggi: db.characters.map((c) => `${c.id} «${c.name}»`),
    atti: db.acts.filter((a) => a.number <= spoiler.currentAct()).map((a) => `${a.id} (${a.number}) «${a.title}»`),
  };
  const cur = currentMission();
  const payload = notes.map((n) => ({ id: n.id, quando: n.ts, distretto: n.districtId, missione: n.missionId, testo: n.text, ...(n.kind ? { tipo: n.kind, campi: n.fields } : {}) }));
  return `# Pacchetto per Claude — Leonida (guida GTA VI)
Dati guida v${db.meta.dataVersion} del ${db.meta.updatedAt}. Missione in corso: ${cur ? `${cur.id} «${cur.title}»` : 'nessuna'}.

Istruzioni per Claude:
1. Trasforma gli appunti qui sotto in voci dei file docs/data/*.json (missions, districts, collectibles, activities, characters, radio, brands, vehicles, weapons, trophies, tips, news).
2. Riusa gli id esistenti quando l'appunto parla di qualcosa che c'è già; crea id nuovi con i prefissi mis-/dis-/poi-/col-/act-/chr-/rad-/brd-/veh-/wpn-/tro-/tip-/new-.
3. Ogni voce ha status ("da verificare" per gli appunti di Mike, "verificato" solo se confermo), source "gioco-mike", spoilerLevel = numero dell'atto dopo il quale si può leggere, example false, updatedAt di oggi.
4. Qui sotto ci sono solo le missioni e i capitoli che ho già sbloccato (niente spoiler): le altre le trovi in docs/data/missions.json, ma non nominarmele.
4b. Non inventare nulla oltre agli appunti. Se un appunto è ambiguo o contiene «?», chiedimi.
5. Gli appunti con tipo "scheda-missione" sono il riepilogo fatto a fine missione: campi.contatto → missions.contact (id del personaggio se esiste, altrimenti il nome), campi.distretto → missions.districtId, campi.scelta true → missions.choice = {"irreversible": true}. Il personaggio-contatto e i personaggi citati prendono firstMissionId se non l'hanno.
6. Restituisci solo i blocchi JSON da inserire/sostituire, indicando file e posizione, poi aggiorna meta.json (dataVersion, changelog).

Id esistenti:
${Object.entries(ids).map(([k, v]) => `- ${k}: ${v.length ? v.join(', ') : 'nessuno'}`).join('\n')}

Appunti (${notes.length}):
\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`${myVehiclesPacket()}${outOfOrderPacket()}`;
}

/** Missioni giocate saltandone altre prima (20/11): servono a Claude per capire cosa apre cosa nel gioco.
 *  Le missioni saltate sono indicate solo con l'id, perché Mike potrebbe non averle ancora viste. */
function outOfOrderPacket() {
  const st = progress.get().missions;
  const rows = [];
  for (const a of db.acts) {
    const list = db.missions.filter((m) => m.actId === a.id && !m.optional && !m.kind);
    list.forEach((m, i) => {
      if (!st[m.id]?.state) return;
      const skipped = list.slice(0, i).filter((x) => !st[x.id]?.state);
      if (skipped.length) rows.push(`- ${m.id} «${m.title}» (${st[m.id].state}) giocata senza aver fatto: ${skipped.map((x) => x.id).join(', ')}`);
    });
  }
  if (!rows.length) return '';
  return `

Missioni giocate fuori ordine (${rows.length}): nel gioco sono disponibili prima di quelle saltate. Segnalo in scripts/caccia/gioco-mike.md e, se serve, in missions.json (prerequisites/unlocks), source "gioco-mike". Non nominarmi le missioni saltate che non ho ancora iniziato.
${rows.join('\n')}`;
}

/** Veicoli che Mike ha messo nel garage a mano perché nella guida non c'erano */
function myVehiclesPacket() {
  const mine = Object.values(progress.get().myVehicles || {});
  if (!mine.length) return '';
  return `

Veicoli aggiunti a mano al garage (${mine.length}): aggiungili a docs/data/vehicles.json con la classe indicata (id della classe in groups), status "da verificare", source "gioco-mike".
${mine.map((m) => `- «${m.name}» → classe ${m.cls}`).join('\n')}`;
}

function packetPage(notes) {
  const pending = notes.filter((n) => !n.exported);
  const which = pending.length ? pending : notes;
  const text = buildPacket(which);
  return `<div class="card" style="margin-bottom:var(--s-4)"><span class="kicker kicker--accent">Pacchetto per Claude · ${which.length} appunt${which.length === 1 ? 'o' : 'i'}</span>
    <p class="small muted">Copia, incolla in chat con Claude, ricevi i JSON, fai commit.</p>
    <div class="actions" style="margin:var(--s-3) 0">
      <button class="btn btn--accent" type="button" data-copy-packet><svg aria-hidden="true"><use href="#i-check"/></svg>Copia tutto</button>
      <button class="btn" type="button" data-share-packet>Condividi…</button>
      <button class="btn btn--ghost" type="button" data-mark-exported="${esc(which.map((n) => n.id).join(','))}">Segna come inviati</button>
    </div>
    <textarea class="packet" readonly id="packet-text">${esc(text)}</textarea></div>`;
}

export function openNoteSheet(ctx = {}) {
  const cur = currentMission();
  const st = progress.get();
  const missionId = ctx.missionId || cur?.id || '';
  const districtId = ctx.districtId || byId(missionId)?.districtId || st.current.districtId || '';
  const body = document.createElement('form');
  body.innerHTML = `
    <label class="field"><span>Appunto</span><textarea class="textarea" name="text" placeholder="Es. «Dietro il distributore a nord della marina c'è una cassa. Ricompensa: …?»" required autocomplete="off"></textarea></label>
    <div class="grid-2">
      <label class="field"><span>Missione</span><select class="select" name="missionId"><option value="">— nessuna —</option>${vis(db.missions).filter((m) => spoiler.missionRevealed(m)).map((m) => `<option value="${esc(m.id)}" ${m.id === missionId ? 'selected' : ''}>${esc(m.title)}</option>`).join('')}</select></label>
      <label class="field"><span>Zona</span><select class="select" name="districtId"><option value="">— nessuna —</option>${vis(db.districts).map((d) => `<option value="${esc(d.id)}" ${d.id === districtId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label>
    </div>
    <button class="btn btn--accent btn--block" type="submit">Salva negli Appunti</button>`;
  body.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(body);
    const text = fd.get('text');
    if (!text?.trim()) return;
    progress.addNote({ text, missionId: fd.get('missionId') || null, districtId: fd.get('districtId') || null });
    closeSheet();
    toast('Appunto salvato', { action: 'Appunti', onAction: () => { location.hash = '/diario'; } });
    ctx.onSaved?.();
  };
  showSheet({ title: 'Appunto rapido', body });
}

/** Trofei legati alla missione appena finita (richiesta di Mike, 20/11): così non deve andarli a cercare.
 *  - presi: trofei con `missions` che contiene la missione, o `chapterDone` del capitolo appena chiuso;
 *  - ora puoi farli: `openedBy` che contiene la missione, o `timing.from` = capitolo che si apre;
 *  - da non perdere: `timing.until` = questo capitolo, quando mancano 3 missioni o meno alla fine. */
function trophyHint(m) {
  const all = vis(db.trophies || []);
  if (!all.length) return '';
  const st = progress.get();
  const got = st.trophies || {};
  const main = vis(db.missions).filter((x) => x.actId === m.actId && !x.optional && !x.kind);
  const isMain = main.includes(m);
  const left = isMain ? main.filter((x) => st.missions[x.id]?.state !== 'completata').length : -1;
  const chapterClosed = isMain && left === 0;
  const n = actNum(m.actId);
  const earned = all.filter((t) => (t.missions || []).includes(m.id) || (chapterClosed && t.chapterDone === m.actId));
  const opened = all.filter((t) => !got[t.id] && !earned.includes(t) && ((t.openedBy || []).includes(m.id) || (chapterClosed && t.timing?.from === n + 1)));
  const closing = left > 0 && left <= 3 ? all.filter((t) => !got[t.id] && t.timing?.until === n && !opened.includes(t)) : [];
  if (!earned.length && !opened.length && !closing.length) return '';
  // Il trofeo appena preso si vede in chiaro; quelli ancora coperti dallo scudo spoiler si scoprono con un tocco
  const txt = (t, clear) => { const h = `<b>${esc(t.name)}</b><small>${esc(clear ? t.description || '' : t.guide || t.description || '')}</small>`; return clear || !spoiler.isHidden(t) ? h : spoiler.ink(h); };
  const row = (t, btn) => `<div class="tro-hint__row">${cup(t.tier, 32)}<span class="tro-hint__txt">${txt(t, btn)}</span>${btn ? `<button type="button" class="pq__chip" data-trophy-got="${esc(t.id)}" aria-pressed="${!!got[t.id]}">${got[t.id] ? 'Preso' : 'Preso?'}</button>` : ''}</div>`;
  const MAX = 4;
  const block = (title, list, btn) => (list.length ? `<div class="pq"><span>${title}</span>${list.slice(0, btn ? 99 : MAX).map((t) => row(t, btn)).join('')}${!btn && list.length > MAX ? `<p class="small tro-hint__more">e altri ${list.length - MAX} nella pagina dei trofei</p>` : ''}</div>` : '');
  return `<div class="passed-sheet__q tro-hint">
    ${block(earned.length > 1 ? 'Trofei sbloccati' : 'Trofeo sbloccato', earned, true)}
    ${block(chapterClosed ? `Dal capitolo ${n + 1} puoi fare` : 'Adesso puoi fare', opened, false)}
    ${block(`Prima che finisca il capitolo${left === 1 ? ' (manca 1 missione)' : ` (mancano ${left} missioni)`}`, closing, false)}
    ${opened.length || closing.length ? '<button type="submit" class="linkbtn small" data-go="trofei">Vai ai trofei</button>' : ''}
  </div>`;
}

/** Missione compiuta: schermata in stile GTA con la prossima mossa. Per Mike (curatore) anche tre domande per il Pacchetto. */
export function openMissionDone(m, { next = null, onNext = null } = {}) {
  if (!m) return;
  const creator = progress.settings().creatorTools;
  const ds = vis(db.districts).filter((d) => d.id !== 'dis-da-collocare');
  const body = document.createElement('form');
  body.className = 'passed-sheet';
  body.innerHTML = `
    <div class="passed-sheet__hero"><span class="passed-sheet__big">Missione compiuta</span><span class="passed-sheet__name">${esc(m.title)}</span></div>
    ${trophyHint(m)}
    ${creator ? `<div class="passed-sheet__q">
      <p class="passed-sheet__lead">Per la guida, tre tocchi:</p>
      <label class="pq"><span>Chi te l'ha data</span><input class="pq__input" name="contact" autocomplete="off" placeholder="Lucia, Brian, una telefonata…"></label>
      <div class="pq"><span>Dove è cominciata</span><div class="pq__chips">${ds.map((d) => `<button type="button" class="pq__chip" data-pick="dis" data-v="${esc(d.id)}" aria-pressed="${d.id === m.districtId}">${esc(d.name)}</button>`).join('')}</div></div>
      <div class="pq"><span>C'era una scelta senza ritorno?</span><div class="pq__chips">
        <button type="button" class="pq__chip" data-pick="choice" data-v="si" aria-pressed="false">Sì</button>
        <button type="button" class="pq__chip" data-pick="choice" data-v="no" aria-pressed="false">No</button></div></div>
      <label class="pq"><span>Altro da ricordare</span><input class="pq__input" name="extra" autocomplete="off" placeholder="Un premio, un posto, un dettaglio…"></label>
    </div>` : ''}
    <div class="passed-sheet__actions">
      ${next ? `<button class="btn btn--neon btn--big" type="submit" data-go="next"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizia la prossima</button>` : ''}
      <button class="btn btn--dark" type="submit" data-go="stay">${next ? 'Più tardi' : 'Chiudi'}</button>
    </div>`;
  let go = 'stay', saved = false;
  const save = () => {
    if (saved || !creator) return; saved = true;
    const fd = new FormData(body);
    const contact = String(fd.get('contact') || '').trim();
    const dis = body.querySelector('[data-pick="dis"][aria-pressed="true"]')?.dataset.v || null;
    const ch = body.querySelector('[data-pick="choice"][aria-pressed="true"]')?.dataset.v;
    const extra = String(fd.get('extra') || '').trim();
    const choice = ch === 'si' ? true : ch === 'no' ? false : null;
    if (!contact && choice === null && !extra && dis === m.districtId) return;
    const parts = [contact && `Me l'ha data: ${contact}`, dis && `Dove: ${byId(dis)?.name || dis}`, choice !== null && `Scelta senza ritorno: ${choice ? 'sì' : 'no'}`, extra].filter(Boolean);
    progress.addNote({ text: `Fine missione «${m.title}». ${parts.join(' · ')}`, missionId: m.id, districtId: dis, kind: 'scheda-missione', fields: { contatto: contact || null, distretto: dis, scelta: choice, altro: extra || null } });
  };
  body.addEventListener('click', (e) => {
    const tg = e.target.closest('[data-trophy-got]');
    if (tg) { progress.toggleTrophy(tg.dataset.trophyGot); const on = !!progress.get().trophies?.[tg.dataset.trophyGot]; tg.setAttribute('aria-pressed', String(on)); tg.textContent = on ? 'Preso' : 'Preso?'; return; }
    const b = e.target.closest('[data-pick]');
    if (b) { const on = b.getAttribute('aria-pressed') !== 'true'; body.querySelectorAll(`[data-pick="${b.dataset.pick}"]`).forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', String(on)); return; }
    const g = e.target.closest('[data-go]'); if (g) go = g.dataset.go;
  });
  body.onsubmit = (e) => { e.preventDefault(); save(); closeSheet(); if (go === 'next') onNext?.(); else if (go === 'trofei') location.hash = '/trofei'; };
  showSheet({ title: 'Missione compiuta', body, cls: 'sheet--passed', onClose: save });
}

export function bind(root, rerender) {
  root.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del-note]');
    if (del) { if (confirm('Eliminare questo appunto?')) { progress.deleteNote(del.dataset.delNote); rerender(); } return; }
    if (e.target.closest('[data-action="packet"]')) { location.hash = '/diario?pacchetto=1'; return; }
    if (e.target.closest('[data-copy-packet]')) {
      const t = document.getElementById('packet-text').value;
      try { await navigator.clipboard.writeText(t); toast('Copiato. Incollalo nella chat con Claude.'); }
      catch { document.getElementById('packet-text').select(); toast('Seleziona e copia il testo'); }
      return;
    }
    if (e.target.closest('[data-share-packet]')) {
      const t = document.getElementById('packet-text').value;
      if (navigator.share) { try { await navigator.share({ title: 'Pacchetto per Claude', text: t }); } catch {} } else toast('Condivisione non disponibile: usa Copia');
      return;
    }
    const mk = e.target.closest('[data-mark-exported]');
    if (mk) { progress.markNotesExported(mk.dataset.markExported.split(',')); toast('Segnati come inviati'); location.hash = '/diario'; }
  });
}
