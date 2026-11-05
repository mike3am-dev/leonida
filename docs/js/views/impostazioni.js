import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, toast } from '../ui/dom.js';
import { showSheet, closeSheet } from '../ui/sheet.js';
import { currentAct } from '../spoiler.js';
import { opener } from './shared.js';

const section = { id: 'impostazioni', num: 10, title: 'Impostazioni', accent: 'teal' };

export function render() {
  const s = progress.settings();
  const sw = (key, label, desc) => `<div class="switch-row"><div><div>${esc(label)}</div>${desc ? `<p>${esc(desc)}</p>` : ''}</div>
    <button class="switch" role="switch" aria-checked="${!!s[key]}" data-switch="${key}" aria-label="${esc(label)}"></button></div>`;

  const left = `<header class="chapter-head"><span class="kicker">Colophon</span><h1>Impostazioni</h1></header>
    <div class="block"><span class="kicker">Aspetto</span>
      <div class="switch-row"><div>Tema</div>
        <div class="segmented" role="group" aria-label="Tema">
          ${['dark', 'light', 'auto'].map((t) => `<button type="button" aria-pressed="${s.theme === t}" data-theme-set="${t}">${{ dark: 'Scuro', light: 'Chiaro', auto: 'Auto' }[t]}</button>`).join('')}
        </div></div>
    </div>
    <div class="block"><span class="kicker">Spoiler</span>
      ${sw('spoilerShield', 'Scudo spoiler', 'Sfoca i contenuti oltre la tua progressione. Si rivelano con un tocco.')}
      <div class="switch-row"><div><div>Atto raggiunto</div><p>Per impostazione predefinita segue le missioni che segni. Oggi: atto ${currentAct()}.</p></div>
        <select class="select" style="width:auto" data-manual-act aria-label="Atto raggiunto">
          <option value="" ${s.manualAct === null ? 'selected' : ''}>Automatico</option>
          ${db.acts.map((a) => `<option value="${a.number}" ${s.manualAct === a.number ? 'selected' : ''}>${esc(a.title)}</option>`).join('')}
        </select></div>
    </div>
    <div class="block"><span class="kicker">Contenuti</span>
      ${sw('showExamples', 'Mostra i dati ESEMPIO', 'Voci finte per vedere il design popolato. Spegnile quando hai contenuti veri.')}
    </div>
    <div class="block"><span class="kicker">Progressi</span>
      <p class="small muted">Salvati su: ${esc(progress.info.adapterName)}. Su iPhone la web app installata ha una memoria separata da Safari: fai un backup ogni tanto.</p>
      <div class="btn-row">
        <button class="btn btn--solid" type="button" data-export>Esporta backup (.json)</button>
        <label class="btn" style="cursor:pointer">Importa backup<input type="file" accept="application/json,.json" data-import hidden></label>
        <button class="btn btn--ghost" type="button" data-reset style="color:var(--orange)">Azzera tutto</button>
      </div>
    </div>
    <div class="block"><span class="kicker">Informazioni</span>
      <dl class="facts">
        <dt>App</dt><dd>Leonida ${esc(window.__LEONIDA_VERSION__ || '')}</dd>
        <dt>Dati</dt><dd>v${esc(db.meta.dataVersion)} · ${esc(db.meta.updatedAt)}</dd>
        <dt>Memoria</dt><dd>schema progressi v${progress.info.version}</dd>
      </dl>
      <button class="btn btn--ghost" type="button" data-check-update style="margin-top:var(--s-3)">Cerca aggiornamenti</button>
    </div>`;

  const right = `<div class="chapter-head"><span class="kicker">Novità nei dati</span><h1>Changelog</h1></div>
    ${(db.meta.changelog || []).map((c) => `<div class="card"><div class="kicker kicker--accent">v${esc(c.version)} · ${esc(c.date)}</div><ul class="prose small" style="margin:var(--s-2) 0 0">${c.changes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
    <div class="block prose small muted"><p>Leonida è una guida personale, non ufficiale e non affiliata a Rockstar Games o Take-Two Interactive. Grand Theft Auto è un marchio dei rispettivi proprietari.</p></div>`;

  return { left, right, show: 'left', accent: section.accent, title: 'Impostazioni' };
}

export function bind(root, rerender, { applyTheme, checkUpdate }) {
  root.addEventListener('click', async (e) => {
    const sw = e.target.closest('[data-switch]');
    if (sw) { progress.setSetting(sw.dataset.switch, sw.getAttribute('aria-checked') !== 'true'); rerender(); return; }
    const th = e.target.closest('[data-theme-set]');
    if (th) { progress.setSetting('theme', th.dataset.themeSet); applyTheme(); rerender(); return; }
    if (e.target.closest('[data-export]')) {
      const blob = new Blob([progress.exportJSON()], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `leonida-backup-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Backup scaricato'); return;
    }
    if (e.target.closest('[data-reset]')) {
      if (confirm('Azzerare TUTTI i progressi e gli appunti su questo dispositivo? Non si può annullare.')) { await progress.resetAll(); applyTheme(); rerender(); toast('Progressi azzerati'); }
      return;
    }
    if (e.target.closest('[data-check-update]')) { checkUpdate(); }
  });
  root.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-manual-act]');
    if (sel) { progress.setSetting('manualAct', sel.value === '' ? null : Number(sel.value)); rerender(); return; }
    const inp = e.target.closest('[data-import]');
    if (inp && inp.files[0]) {
      try {
        const text = await inp.files[0].text();
        const { state, summary } = progress.previewImport(text);
        const body = document.createElement('div');
        body.innerHTML = `<p>Questo backup contiene:</p><dl class="facts">
          <dt>Missioni completate</dt><dd>${summary.missioni}</dd><dt>Collezionabili</dt><dd>${summary.collezionabili}</dd>
          <dt>Appunti</dt><dd>${summary.appunti}</dd><dt>Esportato il</dt><dd>${summary.esportato ? new Date(summary.esportato).toLocaleString('it-IT') : '—'}</dd></dl>
          <p class="callout callout--warn" style="margin-top:var(--s-4)"><strong>Attenzione:</strong> sostituirà tutti i progressi presenti su questo dispositivo.</p>
          <button class="btn btn--accent btn--block" type="button" data-confirm-import>Sostituisci e importa</button>`;
        body.querySelector('[data-confirm-import]').onclick = async () => { await progress.importState(state); closeSheet(); applyTheme(); rerender(); toast('Progressi importati'); };
        showSheet({ title: 'Importa backup', body });
      } catch (err) { toast('Importazione fallita: ' + err.message, { ms: 5000 }); }
      inp.value = '';
    }
  });
}
