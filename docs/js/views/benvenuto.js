/**
 * Benvenuto: si vede una volta sola, al primo avvio (gli amici a cui Mike passa la guida).
 * Si riapre da Impostazioni › Come funziona.
 */
import * as progress from '../store/progress.js';
import { esc } from '../ui/dom.js';

const SHARE_ICON = `<svg class="welcome__share" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

export function isInstalled() {
  return window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
}

export function render() {
  const s = progress.settings();
  const installed = isInstalled();
  const sw = (key, label, desc) => `<div class="switch-row"><div><div>${esc(label)}</div>${desc ? `<p>${esc(desc)}</p>` : ''}</div>
    <button class="switch" role="switch" aria-checked="${!!s[key]}" data-switch="${key}" aria-label="${esc(label)}"></button></div>`;
  const left = `<header class="chapter-head"><span class="kicker">Prima di partire</span><h1>Benvenuto a Leonida</h1>
      <p class="lede">La guida da tenere accanto alla PS5: dove andare, cosa trovare, cosa ti manca. Senza rovinarti la storia.</p></header>
    <ol class="welcome">
      <li class="card welcome__step">
        <span class="welcome__num">1</span>
        <div><h2>${installed ? 'È installata' : 'Mettila sulla schermata Home'}</h2>
        ${installed ? '<p>Perfetto: la apri dalla sua icona, i progressi restano salvati e funziona anche senza rete.</p>'
          : `<p>Da Safari tocca ${SHARE_ICON} <b>Condividi</b>, scorri e scegli <b>«Aggiungi alla schermata Home»</b>. Poi aprila sempre dall'icona: così i tuoi progressi restano salvati e funziona anche senza rete.</p>`}</div>
      </li>
      <li class="card welcome__step">
        <span class="welcome__num">2</span>
        <div><h2>Niente spoiler</h2>
        <p>Le missioni si rivelano solo quando tocchi <b>«Inizio adesso»</b>. Se non hai visto nemmeno i trailer, accendi la modalità vergine.</p>
        ${sw('virginMode', 'Modalità vergine', 'Nasconde anche i personaggi che non hai incontrato, le teorie e i dettagli nella ricerca.')}</div>
      </li>
      <li class="card welcome__step">
        <span class="welcome__num">3</span>
        <div><h2>Le etichette</h2>
        <p>Ogni voce dice quanto è sicura. Tocca un'etichetta, ovunque, per la spiegazione.</p>
        <div class="legend welcome__chips"><span class="chip chip--verificato">Ufficiale</span><span class="chip chip--src-stampa">Stampa</span><span class="chip chip--src-community">Community</span><span class="chip chip--src-rumor">Rumor</span><span class="chip chip--src-leak">Leak</span></div></div>
      </li>
      <li class="card welcome__step">
        <span class="welcome__num">4</span>
        <div><h2>I progressi sono tuoi</h2>
        <p>Missioni, collezionabili e trofei che segni restano su questo telefono. Ogni tanto salvane una copia da <b>Impostazioni</b>.</p></div>
      </li>
    </ol>
    <button class="btn btn--accent btn--block" type="button" data-welcome-done>Entra nella guida</button>`;
  return { left, right: '', show: 'left', accent: 'magenta', title: 'Benvenuto' };
}

export function bind(root) {
  root.addEventListener('click', (e) => {
    if (!e.target.closest('[data-welcome-done]')) return;
    progress.setSetting('welcomeSeen', true);
    location.hash = '/';
  });
}
