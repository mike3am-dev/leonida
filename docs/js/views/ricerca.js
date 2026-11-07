import { TYPE_ROUTE } from '../data.js';
import { esc } from '../ui/dom.js';
import { search, highlight } from '../search.js';
import * as spoiler from '../spoiler.js';
import { showEx, opener } from './shared.js';

const section = { id: 'ricerca', num: 0, title: 'Ricerca', accent: 'magenta' };

export function render(params, query) {
  const q = query.q || '';
  const results = q ? search(q, { showExamples: showEx() }) : [];
  const left = `<header class="chapter-head"><span class="kicker">Cerca in tutta la guida</span><h1>Ricerca</h1></header>
    <form class="search-box" data-search-form role="search">
      <svg aria-hidden="true"><use href="#i-search"/></svg>
      <input class="input" type="search" name="q" value="${esc(q)}" placeholder="Missioni, luoghi, personaggi, radio…" autocomplete="off" autocorrect="off" enterkeyhint="search" aria-label="Cerca">
    </form>
    <div data-results>${resultsHtml(results, q)}</div>`;
  return { left, right: opener(section, 'Istantanea e tollerante ai refusi: «lusia» trova Lucia. I contenuti protetti dallo scudo spoiler restano coperti anche qui.'), show: 'left', accent: section.accent, title: 'Ricerca' };
}

function resultsHtml(results, q) {
  if (!q) return '<p class="muted small">Scrivi almeno due lettere.</p>';
  if (!results.length) return `<div class="placeholder"><strong>Nessun risultato</strong>Niente per «${esc(q)}». Prova con un'altra parola.</div>`;
  return results.map((r) => {
    const hidden = spoiler.isHidden(r.item);
    return `<a class="result" href="#${TYPE_ROUTE[r.item._type]?.(r.item) || '/'}">
      <div class="result__type">${esc(r.type)}${r.item.example ? ' · Esempio' : ''}</div>
      <div class="result__title">${hidden ? '<span class="muted">• • • (spoiler)</span>' : highlight(esc(r.title), q)}</div>
      <div class="result__snip">${hidden ? 'Contenuto protetto dallo scudo spoiler.' : highlight(esc(r.snippet), q)}</div>
    </a>`; }).join('');
}

export function bind(root) {
  root.addEventListener('input', (e) => {
    const inp = e.target.closest('[data-search-form] input');
    if (!inp) return;
    const q = inp.value;
    history.replaceState(history.state, '', '#/ricerca' + (q ? '?q=' + encodeURIComponent(q) : ''));
    root.querySelector('[data-results]').innerHTML = resultsHtml(q ? search(q, { showExamples: showEx() }) : [], q);
  });
  root.addEventListener('submit', (e) => { if (e.target.closest('[data-search-form]')) { e.preventDefault(); e.target.querySelector('input').blur(); } });
}
