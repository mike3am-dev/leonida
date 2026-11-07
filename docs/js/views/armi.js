/** Armi: la ruota delle armi, otto spicchi come nel gioco; l'equipaggiamento sotto */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, srcBadge } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, galleryHtml, vis, sectionOf , extrasHtml} from './shared.js';
import * as spoiler from '../spoiler.js';
import { specSheet } from './specs.js';

const section = sectionOf('armi');
// Ordine della ruota (in senso orario dall'alto): come la ruota delle armi di GTA
export const SLICES = [
  ['corpo-a-corpo', 'Armi da corpo a corpo', 'Corpo a corpo'], ['pistola', 'Pistole', 'Pistole'], ['fucile-assalto', "Fucili d'assalto", "Fucili d'assalto"], ['mitra', 'Mitragliette', 'Mitragliette'],
  ['fucile-pompa', 'Fucili a pompa', 'Fucili a pompa'], ['cecchino', 'Fucili di precisione', 'Fucili di precisione'], ['pesante', 'Armi pesanti', 'Armi pesanti'], ['lancio', 'Armi da lancio', 'Da lancio'],
];
const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };

/** Etichetta su due righe se è lunga (es. «Fucili / a pompa») */
function wrapLabel(t, x, y) {
  const w = t.split(' ');
  if (w.length < 2 || t.length < 11) return `<text x="${x}" y="${y}" text-anchor="middle" class="wheel__label">${esc(t)}</text>`;
  let best = 1, diff = 1e9;
  for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if (d < diff) { diff = d; best = i; } }
  return `<text x="${x}" y="${y - 4}" text-anchor="middle" class="wheel__label"><tspan x="${x}">${esc(w.slice(0, best).join(' '))}</tspan><tspan x="${x}" dy="8">${esc(w.slice(best).join(' '))}</tspan></text>`;
}
/** La ruota in SVG: 8 spicchi, numero di armi per spicchio, spicchio attivo acceso */
export function wheel(counts, active, favs) {
  const R = 100, r = 40, cx = 110, cy = 110, n = SLICES.length, gap = 0.035;
  const arc = (a0, a1, ro, ri) => {
    const p = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
    const [x0, y0] = p(a0, ro), [x1, y1] = p(a1, ro), [x2, y2] = p(a1, ri), [x3, y3] = p(a0, ri);
    const big = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0} ${y0} A${ro} ${ro} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${ri} ${ri} 0 ${big} 0 ${x3} ${y3} Z`;
  };
  const slices = SLICES.map(([k, label, short], i) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / n + gap, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / n - gap;
    const am = (a0 + a1) / 2, lr = (R + r) / 2 + 7;
    const lx = cx + lr * Math.sin(am), ly = cy - lr * Math.cos(am);
    const c = counts[k] || 0, f = favs[k] || 0;
    return `<a class="wheel__slice ${active === k ? 'is-active' : ''} ${c ? '' : 'is-empty'}" href="#/armi${active === k ? '' : '?cat=' + k}" aria-label="${esc(label)}: ${c} armi">
      <path d="${arc(a0, a1, R, r)}"/>
      ${f ? `<path class="wheel__fill" d="${arc(a0, a1, r + (R - r) * Math.min(1, f / Math.max(1, c)), r)}"/>` : ''}
      ${wrapLabel(short || label, lx, ly - 9)}
      <circle cx="${lx}" cy="${ly + 7}" r="8.5" class="wheel__bubble"/>
      <text x="${lx + 0.3}" y="${ly + 10.6}" text-anchor="middle" class="wheel__count">${c}</text></a>`;
  }).join('');
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return `<svg class="wheel" viewBox="0 0 220 220" role="group" aria-label="Ruota delle armi">
    <defs><linearGradient id="wheel-num" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset=".45" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient><radialGradient id="wheel-bg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,255,255,.06)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${R + 4}" class="wheel__ring"/>
    ${slices}
    <a class="wheel__all" href="#/armi" aria-label="Tutte le armi"><circle cx="${cx}" cy="${cy}" r="${r - 4}" class="wheel__hub"/>
    <text x="${cx}" y="${cy + 3}" text-anchor="middle" class="wheel__total">${total}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="wheel__sub">${active ? 'tutte' : 'armi'}</text></a>
  </svg>`;
}

function detail(it) {
  const favs = progress.get().favorites || {};
  return `
    ${backLink('/armi' + (it.class && it.class !== 'equipaggiamento' ? '?cat=' + it.class : ''), 'Armi')}
    ${hero(it, { kicker: `${(SLICES.find(([k]) => k === it.class) || [])[1] || 'Equipaggiamento'}${it.manufacturer ? ' · ' + it.manufacturer : ''}`, title: it.name, chips: statusChip(it) })}
    <div class="actions">
      <button class="btn ${favs[it.id] ? 'btn--accent' : 'btn--ghost'}" type="button" data-fav="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-bookmark"/></svg>${favs[it.id] ? 'Nei preferiti' : 'Aggiungi ai preferiti'}</button>
      <button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
    </div>
    <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Scheda in arrivo.')}</p>`)}</div>
    ${extrasHtml(it)}
    ${specSheet(it, 'weapon')}
    ${it.ultimate ? '<p class="small muted">Bonus della Ultimate Edition.</p>' : ''}
    ${it.insight ? `<div class="prose small"><p>${esc(it.insight)}</p><p class="source-line">Da <a href="https://vice-central.com/guide-toutes-les-armes-identifiees-dans-gta-vi-pistolets-fusils-melee/" target="_blank" rel="noopener">vice-central.com</a>.</p></div>` : ''}
    ${it.facts?.length ? `<section class="fsec"><h3 class="fsec__t">Cosa sappiamo</h3><ul class="flist flist--tips">${it.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></section>` : ''}
    ${it.seen?.length ? `<section class="fsec"><h3 class="fsec__t">Dove si è vista</h3><ul class="flist">${it.seen.map((v) => `<li><b>${esc(v.where)}</b><span>${esc(v.what)}</span></li>`).join('')}</ul></section>` : ''}
    ${galleryHtml(it)}
    ${it.howToGet && !/^Da verificare\.?$/.test(it.howToGet) ? `<div class="block"><span class="kicker">Come ottenerla</span><div class="prose">${spoiler.wrap(it, `<p>${esc(it.howToGet)}</p>`)}</div></div>` : ''}
    <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
}

export function render(params, query) {
  const it = params.id ? byId(params.id) : null;
  if (it) return { left: '', right: detail(it), show: 'right', accent: section.accent, title: it.name };
  const all = vis(db.weapons);
  const favs = progress.get().favorites || {};
  const cat = query.cat || '';
  const counts = {}, fc = {};
  for (const w of all) { counts[w.class] = (counts[w.class] || 0) + 1; if (favs[w.id]) fc[w.class] = (fc[w.class] || 0) + 1; }
  const weapons = all.filter((w) => w.class !== 'equipaggiamento' && (!cat || w.class === cat));
  const gear = all.filter((w) => w.class === 'equipaggiamento');
  const label = cat ? (SLICES.find(([k]) => k === cat) || [])[1] : 'Tutte le armi';
  const idx = SLICES.findIndex(([k]) => k === cat);
  const list = (arr) => arr.map((w) => row({ href: `#/armi/${w.id}`, thumb: w.image, thumbFallback: w.imageUrl, icon: 'i-crosshair', title: esc(w.name), meta: `${esc(w.manufacturer || (SLICES.find(([k]) => k === w.class) || [])[1] || '')}${w.realModel ? ' · ' + esc(w.realModel) : ''}${srcBadge(w)}`, end: favs[w.id] ? '<svg aria-hidden="true" style="color:var(--accent)"><use href="#i-bookmark"/></svg>' : '' })).join('');
  const left = `${sectionHead(section, `${all.length} voci`)}
    <p class="lede">Scegli uno spicchio, come nel gioco. Le armi che segni tra i preferiti riempiono lo spicchio.</p>
    <div class="wheel-wrap">
      <div class="wheel-stage">${wheel(counts, cat, fc)}<p class="small muted wheel-hint">${cat ? 'Tocca il centro per tornare a tutte' : 'Tocca uno spicchio'}</p></div>
      <div class="wheel-panel">
        <span class="kicker kicker--accent">${cat ? 'Categoria' : 'Tutte le categorie'}</span>
        <h2 class="wheel-panel__title">${esc(label)}</h2>
        ${list(weapons) || '<p class="muted small">Nessuna arma vista ancora in questa categoria.</p>'}
      </div>
    </div>
    ${gear.length && !cat ? `<div class="block"><span class="kicker">Equipaggiamento (${gear.length})</span>${list(gear)}</div>` : ''}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Armi' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fav]');
    if (f && location.hash.startsWith('#/armi')) { progress.toggleFavorite(f.dataset.fav); rerender(); }
  });
}
