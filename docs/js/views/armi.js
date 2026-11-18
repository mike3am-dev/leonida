/** Armi: la ruota delle armi, otto spicchi come nel gioco; l'equipaggiamento sotto */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, srcBadge, toast } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { sectionHead, backLink, hero, row, galleryHtml, vis, sectionOf, extrasHtml, haveFilter, passHave } from './shared.js';
import * as spoiler from '../spoiler.js';
import { specSheet, WEAPON_AXES } from './specs.js';

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
  const total = SLICES.reduce((a, [k]) => a + (counts[k] || 0), 0);
  return `<svg class="wheel" viewBox="0 0 220 220" role="group" aria-label="Ruota delle armi">
    <defs><linearGradient id="wheel-num" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset=".45" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient><radialGradient id="wheel-bg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,255,255,.06)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${R + 4}" class="wheel__ring"/>
    ${slices}
    <a class="wheel__all" href="#/armi" aria-label="Tutte le armi"><circle cx="${cx}" cy="${cy}" r="${r - 4}" class="wheel__hub"/>
    <text x="${cx}" y="${cy + 3}" text-anchor="middle" class="wheel__total">${total}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="wheel__sub">${active ? 'tutte' : 'armi'}</text></a>
  </svg>`;
}

const CMP_MAX = 3;
const hasStats = (w) => !!w.stats && WEAPON_AXES.every(([k]) => typeof w.stats[k] === 'number');
const num = (v) => Number(v).toLocaleString('it-IT', { maximumFractionDigits: 1 });
/** Nome corto per le righe del confronto: senza il produttore davanti */
const shortName = (w) => (w.manufacturer && w.name.startsWith(w.manufacturer + ' ') ? w.name.slice(w.manufacturer.length + 1) : w.name);

/** Confronto tra 2 o 3 armi: per ogni barra una riga per arma, la migliore è accesa */
function compareSheet(ws) {
  const owned = progress.get().owned || {};
  const axes = [...WEAPON_AXES, ['avg', 'Nel complesso']];
  const val = (w, k) => (k === 'avg' ? WEAPON_AXES.reduce((a, [x]) => a + w.stats[x], 0) / WEAPON_AXES.length : w.stats[k]);
  const best = (k) => { const m = Math.max(...ws.map((w) => val(w, k))); const l = ws.filter((w) => Math.abs(val(w, k) - m) < 0.05); return l.length === ws.length ? [] : l; };
  const top = best('damage');
  const verdict = top.length === 1 ? `La più potente è <b>${esc(shortName(top[0]))}</b>: danno ${num(val(top[0], 'damage'))}.`
    : top.length ? `Le più potenti, alla pari: <b>${top.map((w) => esc(shortName(w))).join('</b> e <b>')}</b>.` : 'Fanno lo stesso danno: guarda le altre barre.';
  const facts = [['Calibro', 'caliber'], ['Caricatore', 'magazine'], ['Fuoco', 'fireMode'], ['Prezzo', 'price'], ['Dove si compra', 'whereToBuy']].filter(([, k]) => ws.some((w) => w[k]));
  const body = document.createElement('div');
  body.className = 'cmp'; body.style.setProperty('--n', ws.length);
  body.innerHTML = `<div class="cmp__heads">${ws.map((w, i) => `<a class="cmp__head cmp--${i}" href="#/armi/${esc(w.id)}">
      <span class="cmp__img">${w.image ? `<img src="${esc(w.image)}" ${w.imageUrl ? `data-fallback="${esc(w.imageUrl)}"` : ''} alt="">` : '<svg aria-hidden="true"><use href="#i-crosshair"/></svg>'}</span>
      <b>${esc(shortName(w))}</b><span class="small muted">${esc(w.manufacturer || '')}${owned[w.id] ? ' · nello zaino' : ''}</span></a>`).join('')}</div>
    <p class="cmp__verdict">${verdict}</p>
    ${axes.map(([k, label]) => { const b = best(k); return `<div class="cmp__axis ${k === 'avg' ? 'cmp__axis--avg' : ''}"><div class="cmp__label">${esc(label)}</div>
      ${ws.map((w, i) => { const v = val(w, k); const win = b.includes(w); return `<div class="cmp__row cmp--${i} ${win ? 'is-best' : ''}"><span class="cmp__name">${esc(shortName(w))}</span><span class="cmp__track"><i style="width:${Math.max(0, Math.min(100, v * 10))}%"></i></span><span class="cmp__val">${num(v)}${win ? '<svg aria-label="la migliore"><use href="#i-check"/></svg>' : ''}</span></div>`; }).join('')}</div>`; }).join('')}
    ${facts.length ? `<div class="cmp__facts">${facts.map(([l, k]) => `<div class="cmp__label">${esc(l)}</div><div class="cmp__cells">${ws.map((w, i) => `<span class="cmp--${i}">${esc(w[k] ? String(w[k]) : '—')}</span>`).join('')}</div>`).join('')}</div>` : ''}
    <p class="small muted">Barre del gioco, da 0 a 10. «Nel complesso» è la media delle quattro. Tocca un'arma in alto per aprire la sua scheda.</p>`;
  showSheet({ title: 'Confronto', body, cls: 'sheet--cmp' });
}

function detail(it) {
  const own = progress.isOwned(it.id);
  return `
    ${backLink('/armi' + (it.class && it.class !== 'equipaggiamento' ? '?cat=' + it.class : ''), 'Armi')}
    ${hero(it, { kicker: `${(SLICES.find(([k]) => k === it.class) || [])[1] || 'Equipaggiamento'}${it.manufacturer ? ' · ' + it.manufacturer : ''}`, title: it.name, chips: statusChip(it) })}
    <div class="actions">
      <button class="btn ${own ? 'btn--accent' : 'btn--solid'} own-btn" type="button" data-own="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-pack"/></svg>${own ? 'Nello zaino ✓' : 'Mettila nello zaino'}</button>
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
  const favs = progress.get().owned || {};
  const cat = query.cat || '';
  const have = query.have || '';
  const nOwn = all.filter((w) => favs[w.id]).length;
  const cmpOn = 'cmp' in query && !!cat;
  const sel = cmpOn ? String(query.cmp || '').split(',').filter(Boolean) : [];
  const url = (o = {}) => { const q = { cat, have, ...o }; const p = new URLSearchParams(); if (q.cat) p.set('cat', q.cat); if (q.have) p.set('have', q.have); if (q.cmp !== undefined) p.set('cmp', q.cmp); return `#/armi${p.toString() ? '?' + p : ''}`; };
  const hv = (v) => url({ have: v, ...(cmpOn ? { cmp: sel.join(',') } : {}) });
  // La ruota conta quello che stai guardando: tutte, solo lo zaino, solo quelle che mancano
  const counts = {}, fc = {};
  for (const w of all) { if (!passHave(have, favs[w.id])) continue; counts[w.class] = (counts[w.class] || 0) + 1; if (favs[w.id]) fc[w.class] = (fc[w.class] || 0) + 1; }
  const weapons = all.filter((w) => w.class !== 'equipaggiamento' && (!cat || w.class === cat) && passHave(have, favs[w.id]));
  const gear = all.filter((w) => w.class === 'equipaggiamento' && passHave(have, favs[w.id]));
  const label = cat ? (SLICES.find(([k]) => k === cat) || [])[1] : 'Tutte le armi';
  const thumbOf = (w) => w.image ? `<span class="row__thumb"><img src="${esc(w.image)}" ${w.imageUrl ? `data-fallback="${esc(w.imageUrl)}"` : ''} alt="" loading="lazy"></span>` : '<span class="row__thumb"><svg aria-hidden="true"><use href="#i-crosshair"/></svg></span>';
  const list = (arr) => arr.map((w) => row({ href: `#/armi/${w.id}`, thumb: w.image, thumbFallback: w.imageUrl, icon: 'i-crosshair', title: esc(w.name), meta: `${esc(w.manufacturer || (SLICES.find(([k]) => k === w.class) || [])[1] || '')}${w.realModel ? ' · ' + esc(w.realModel) : ''}${srcBadge(w)}`, end: favs[w.id] ? '<svg aria-hidden="true" style="color:var(--accent)"><use href="#i-pack"/></svg>' : '' })).join('');
  // Confronto: si scelgono 2 o 3 armi della categoria (solo quelle con le barre del gioco)
  const comparable = weapons.filter(hasStats);
  const pickList = (arr) => arr.map((w) => { const ok = hasStats(w); const i = sel.indexOf(w.id); return `<button type="button" class="row row--pick ${i >= 0 ? 'is-picked' : ''}" data-cmp-pick="${esc(w.id)}" aria-pressed="${i >= 0}" ${ok ? '' : 'disabled'}>${thumbOf(w)}<span><span class="row__title">${esc(w.name)}</span><span class="row__meta">${ok ? `Danno ${num(w.stats.damage)} · Precisione ${num(w.stats.accuracy)}` : 'Senza barre: non si può confrontare'}${favs[w.id] ? ' · nello zaino' : ''}</span></span><span class="row__end"><span class="pick" aria-hidden="true">${i >= 0 ? i + 1 : ''}</span></span></button>`; }).join('');
  const preset = comparable.filter((w) => favs[w.id]).slice(0, CMP_MAX).map((w) => w.id);
  const picked = sel.filter((id) => comparable.some((w) => w.id === id));
  const cmpBar = !cat || comparable.length < 2 ? '' : cmpOn
    ? `<div class="cmpbar"><span class="cmpbar__hint">${picked.length < 2 ? 'Scegli 2 o 3 armi' : `${picked.length} scelte`}</span><a class="btn btn--ghost" href="${url()}">Annulla</a><button class="btn btn--accent" type="button" data-cmp-go ${picked.length < 2 ? 'disabled' : ''}>Confronta</button></div>`
    : `<a class="btn btn--solid cmpstart" href="${url({ cmp: preset.length >= 2 ? preset.join(',') : '' })}"><svg aria-hidden="true"><use href="#i-crosshair"/></svg>Confronta le armi</a>`;
  const left = `${sectionHead(section, `${nOwn} / ${all.length} nello zaino`)}
    <p class="lede">Scegli uno spicchio, come nel gioco. Le armi che metti nello zaino riempiono lo spicchio.</p>
    ${haveFilter(have, hv, { yes: 'Nello zaino', no: 'Mi mancano' })}
    <div class="wheel-wrap">
      <div class="wheel-stage">${wheel(counts, cat, fc)}<p class="small muted wheel-hint">${cat ? 'Tocca il centro per tornare a tutte' : 'Tocca uno spicchio'}</p></div>
      <div class="wheel-panel">
        <span class="kicker kicker--accent">${cat ? 'Categoria' : 'Tutte le categorie'}</span>
        <h2 class="wheel-panel__title">${esc(label)}</h2>
        ${cmpBar}
        ${(cmpOn ? pickList(weapons) : list(weapons)) || `<p class="muted small">${have === 'si' ? 'Ancora niente nello zaino qui.' : have === 'no' ? 'Le hai tutte.' : 'Nessuna arma vista ancora in questa categoria.'}</p>`}
      </div>
    </div>
    ${gear.length && !cat ? `<div class="block"><span class="kicker">Equipaggiamento (${gear.length})</span>${list(gear)}</div>` : ''}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Armi' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-own]');
    if (f && location.hash.startsWith('#/armi')) { progress.toggleOwned(f.dataset.own); rerender(); return; }
    const pick = e.target.closest('[data-cmp-pick]'), go = e.target.closest('[data-cmp-go]');
    if (!pick && !go) return;
    const [path, qs] = location.hash.slice(1).split('?'); const q = new URLSearchParams(qs || '');
    let sel = (q.get('cmp') || '').split(',').filter(Boolean);
    if (go) { const ws = sel.map((id) => byId(id)).filter((w) => w && hasStats(w)); if (ws.length >= 2) compareSheet(ws.slice(0, CMP_MAX)); return; }
    const id = pick.dataset.cmpPick;
    if (sel.includes(id)) sel = sel.filter((x) => x !== id);
    else if (sel.length >= CMP_MAX) { toast(`Al massimo ${CMP_MAX} armi alla volta: togline una.`); return; }
    else sel.push(id);
    q.set('cmp', sel.join(',')); history.replaceState(history.state, '', `#${path}?${q}`); rerender();
  });
}
