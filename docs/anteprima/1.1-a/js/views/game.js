/**
 * «Game»: sugli iPhone la barra in basso ha quattro voci fisse (Home, Game, Social, News).
 * Game apre questa pagina: un tassello grande per ogni sezione del gioco, con un numero vivo.
 * In cima il tassello «Riprendi», cioè l'ultima sezione che hai aperto. Sul Duo aperto resta la fila a sinistra.
 * (Proposta di Lollo, 19/11; in anteprima dalla 1.1.)
 */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc } from '../ui/dom.js';
import { SECTIONS, stats, vis, isMet } from './shared.js';

const LAST = 'leonida:game:ultima';
/** Le sezioni che stanno dentro «Game» (tutto tranne Home, La banda e News) */
export const GAME_IDS = ['missioni', 'meccaniche', 'mappa', 'personaggi', 'armi', 'garage', 'collezionabili', 'trofei', 'radio', 'mondo', 'diario'];
export const isGamePath = (p) => p === '/game' || p === '/trucchi' || p === '/altro' || SECTIONS.some((s) => GAME_IDS.includes(s.id) && (p === s.path || p.startsWith(s.path + '/')));
/** Da chiamare a ogni cambio pagina: ricorda l'ultima sezione di gioco aperta */
export function remember(path) {
  const s = SECTIONS.find((x) => GAME_IDS.includes(x.id) && (path === x.path || path.startsWith(x.path + '/')));
  if (s) { try { localStorage.setItem(LAST, s.id); } catch {} }
}
const last = () => { try { return localStorage.getItem(LAST) || ''; } catch { return ''; } };

function numbers() {
  const st = progress.get(), s = stats();
  const chars = vis(db.characters || []);
  return {
    missioni: `${s.missions.done} / ${s.missions.total} fatte`,
    meccaniche: `${vis(db.meccaniche || []).length} schede`,
    mappa: `${vis(db.districts || []).filter((d) => d.id !== 'dis-da-collocare').length} regioni`,
    personaggi: `${chars.filter(isMet).length} / ${chars.length} incontrati`,
    armi: `${vis(db.weapons || []).filter((w) => st.owned?.[w.id]).length} / ${vis(db.weapons || []).length} nello zaino`,
    garage: `${vis(db.vehicles || []).filter((v) => st.owned?.[v.id]).length} / ${vis(db.vehicles || []).length} nel garage`,
    collezionabili: `${s.collectibles.done} / ${s.collectibles.total} trovati`,
    trofei: `${vis(db.trophies || []).filter((t) => st.trophies?.[t.id]).length} / ${vis(db.trophies || []).length}`,
    radio: `${vis(db.radio || []).length} stazioni`,
    mondo: `${vis(db.brands || []).length} voci`,
    diario: (st.notes || []).length ? `${st.notes.length} appunti` : 'Il taccuino da gioco',
  };
}

export function render() {
  const n = numbers();
  const secs = GAME_IDS.map((id) => SECTIONS.find((s) => s.id === id)).filter(Boolean);
  const cur = secs.find((s) => s.id === last()) || secs[0];
  const tile = (s, big = false) => `<a class="gtile ${big ? 'gtile--big' : ''}" href="#${s.path}" style="--h:${s.hue}">
      <span class="gtile__icon" aria-hidden="true"><svg><use href="#n-${s.id}"/></svg></span>
      <span class="gtile__text">${big ? '<span class="gtile__kicker">Riprendi da</span>' : ''}<span class="gtile__name">${esc(s.title)}</span><span class="gtile__num">${esc(n[s.id] || s.tagline || '')}</span></span>
      ${big ? '<svg class="gtile__go" aria-hidden="true"><use href="#i-arrow"/></svg>' : ''}</a>`;
  const left = `<header class="ghead"><h1>Game</h1><p class="small muted">Tutto il gioco, sezione per sezione</p></header>
    ${tile(cur, true)}
    <div class="ggrid">${secs.filter((s) => s !== cur).map((s) => tile(s)).join('')}</div>
    <div class="glinks"><a class="btn btn--ghost" href="#/trucchi">Trucchi</a><a class="btn btn--ghost" href="#/ricerca"><svg aria-hidden="true"><use href="#i-search"/></svg>Cerca nella guida</a></div>`;
  return { left, right: '', show: 'left', accent: 'teal', title: 'Game' };
}
