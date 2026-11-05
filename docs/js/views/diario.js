import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, fmtDate, fmtTime, toast } from '../ui/dom.js';
import { showSheet, closeSheet } from '../ui/sheet.js';
import { chapterHead, opener, vis, sectionOf, currentMission } from './shared.js';

const section = sectionOf('diario');

export function render(params, query) {
  const st = progress.get();
  const notes = st.notes;
  const pending = notes.filter((n) => !n.exported);
  const groups = new Map();
  for (const n of notes) { const k = fmtDate(n.ts, { weekday: 'long', day: 'numeric', month: 'long' }); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(n); }

  const left = `${chapterHead(section, { kicker: 'Capitolo ottavo', title: 'Diario' })}
    <button class="btn-note" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg><div><strong>Appunto rapido</strong><span>Con timestamp, distretto e missione.</span></div></button>
    <div class="block">
      <button class="btn btn--solid btn--block" type="button" data-action="packet" ${notes.length ? '' : 'disabled'}>Pacchetto per Claude${pending.length ? ` · ${pending.length} nuovi` : ''}</button>
      <p class="small muted" style="margin-top:var(--s-2)">Genera un blocco da incollare in chat: i tuoi appunti diventano contenuti della guida.</p>
    </div>
    <div class="block">
      ${notes.length ? [...groups].map(([day, list]) => `<span class="kicker" style="display:block;margin-top:var(--s-4)">${esc(day)}</span>${list.map(noteHtml).join('')}`).join('')
        : '<div class="placeholder"><strong>Nessun appunto</strong>Il primo lo scrivi tu, tra una missione e l’altra.</div>'}
    </div>`;
  const right = query.pacchetto === '1' && notes.length ? packetPage(notes) : opener(section, 'Tutti gli appunti rapidi, in ordine di tempo. Il «Pacchetto per Claude» li impacchetta con lo schema dei dati e gli id esistenti, pronti da incollare in chat.');
  return { left, right, show: query.pacchetto === '1' ? 'right' : 'left', accent: section.accent, title: 'Diario' };
}

function noteHtml(n) {
  const m = n.missionId ? byId(n.missionId) : null, d = n.districtId ? byId(n.districtId) : null;
  return `<div class="note" data-note="${esc(n.id)}">
    <div class="note__time">${fmtTime(n.ts)}${m ? ` · <a href="#/missioni/${esc(m.id)}">${esc(m.title)}</a>` : ''}${d ? ` · <a href="#/atlante/${esc(d.id)}">${esc(d.name)}</a>` : ''}${n.exported ? ' · <span class="chip chip--verificato">inviato</span>' : ''}</div>
    <div class="note__text">${esc(n.text)}</div>
    <div class="note__actions"><button class="icon-btn" type="button" data-del-note="${esc(n.id)}" aria-label="Elimina appunto"><svg aria-hidden="true"><use href="#i-close"/></svg></button></div>
  </div>`;
}

/* ---------- Pacchetto per Claude ---------- */
export function buildPacket(notes) {
  const ids = {
    missioni: db.missions.map((m) => `${m.id} «${m.title}»`),
    distretti: db.districts.map((d) => `${d.id} «${d.name}»`),
    categorie: db.collectibleCategories.map((c) => `${c.id} «${c.name}»`),
    personaggi: db.characters.map((c) => `${c.id} «${c.name}»`),
    atti: db.acts.map((a) => `${a.id} (${a.number}) «${a.title}»`),
  };
  const cur = currentMission();
  const payload = notes.map((n) => ({ id: n.id, quando: n.ts, distretto: n.districtId, missione: n.missionId, testo: n.text }));
  return `# Pacchetto per Claude — Leonida (guida GTA VI)
Dati guida v${db.meta.dataVersion} del ${db.meta.updatedAt}. Missione in corso: ${cur ? `${cur.id} «${cur.title}»` : 'nessuna'}.

Istruzioni per Claude:
1. Trasforma gli appunti qui sotto in voci dei file docs/data/*.json (missions, districts, collectibles, activities, characters, radio, brands, tips).
2. Riusa gli id esistenti quando l'appunto parla di qualcosa che c'è già; crea id nuovi con i prefissi mis-/dis-/col-/act-/chr-/rad-/brd-/tip-.
3. Ogni voce ha status ("da verificare" per gli appunti di Mike, "verificato" solo se confermo), source "gioco-mike", spoilerLevel = numero dell'atto dopo il quale si può leggere, example false, updatedAt di oggi.
4. Non inventare nulla oltre agli appunti. Se un appunto è ambiguo, chiedimi.
5. Restituisci solo i blocchi JSON da inserire/sostituire, indicando file e posizione, poi aggiorna meta.json (dataVersion, changelog).

Id esistenti:
${Object.entries(ids).map(([k, v]) => `- ${k}: ${v.length ? v.join(', ') : 'nessuno'}`).join('\n')}

Appunti (${notes.length}):
\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\``;
}

function packetPage(notes) {
  const pending = notes.filter((n) => !n.exported);
  const which = pending.length ? pending : notes;
  const text = buildPacket(which);
  return `<div class="chapter-head"><span class="kicker">Pacchetto per Claude</span><h1>${which.length} appunt${which.length === 1 ? 'o' : 'i'} pront${which.length === 1 ? 'o' : 'i'}</h1>
    <p class="lede">Copia, incolla in chat con Claude, ricevi i JSON, fai commit.</p></div>
    <div class="btn-row" style="margin-bottom:var(--s-4)">
      <button class="btn btn--accent" type="button" data-copy-packet><svg aria-hidden="true"><use href="#i-check"/></svg>Copia tutto</button>
      <button class="btn" type="button" data-share-packet>Condividi…</button>
      <button class="btn btn--ghost" type="button" data-mark-exported="${esc(which.map((n) => n.id).join(','))}">Segna come inviati</button>
    </div>
    <textarea class="packet" readonly id="packet-text">${esc(text)}</textarea>`;
}

/* ---------- Foglio appunto rapido ---------- */
export function openNoteSheet(ctx = {}) {
  const cur = currentMission();
  const st = progress.get();
  const missionId = ctx.missionId || cur?.id || '';
  const districtId = ctx.districtId || byId(missionId)?.districtId || st.current.districtId || '';
  const body = document.createElement('form');
  body.innerHTML = `
    <label class="field"><span>Appunto</span><textarea class="textarea" name="text" placeholder="Es. «Dietro il distributore a nord della marina c'è una cassa. Ricompensa: …»" required autocomplete="off"></textarea></label>
    <div class="grid-2">
      <label class="field"><span>Missione</span><select class="select" name="missionId"><option value="">— nessuna —</option>${vis(db.missions).map((m) => `<option value="${esc(m.id)}" ${m.id === missionId ? 'selected' : ''}>${esc(m.title)}</option>`).join('')}</select></label>
      <label class="field"><span>Distretto</span><select class="select" name="districtId"><option value="">— nessuno —</option>${vis(db.districts).map((d) => `<option value="${esc(d.id)}" ${d.id === districtId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label>
    </div>
    <button class="btn btn--accent btn--block" type="submit">Salva nel Diario</button>`;
  body.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(body);
    const text = fd.get('text');
    if (!text?.trim()) return;
    progress.addNote({ text, missionId: fd.get('missionId') || null, districtId: fd.get('districtId') || null });
    closeSheet();
    toast('Appunto salvato', { action: 'Diario', onAction: () => { location.hash = '/diario'; } });
    ctx.onSaved?.();
  };
  showSheet({ title: 'Appunto rapido', body });
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
