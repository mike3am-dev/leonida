/** Armi: la ruota delle armi, otto spicchi come nel gioco; l'equipaggiamento sotto */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, srcBadge } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { sectionHead, backLink, hero, galleryHtml, vis, sectionOf, extrasHtml, haveFilter, passHave } from './shared.js';
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
const fold = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const classLabel = (w) => (SLICES.find(([k]) => k === w.class) || [])[1] || 'Equipaggiamento';
/** Nome corto per le righe del confronto: senza il produttore davanti */
const shortName = (w) => (w.manufacturer && w.name.startsWith(w.manufacturer + ' ') ? w.name.slice(w.manufacturer.length + 1) : w.name);
const owned = () => progress.get().owned || {};
const byDamage = (a, b) => b.stats.damage - a.stats.damage;
const pool = () => vis(db.weapons).filter(hasStats);

/** Con cosa si confronta di partenza: l'arma scelta più le tue più potenti della stessa categoria */
function startSet(w) {
  const o = owned();
  const mine = pool().filter((x) => o[x.id] && x.id !== w?.id && (!w || x.class === w.class)).sort(byDamage);
  return (w ? [w, ...mine] : mine).slice(0, CMP_MAX);
}

/**
 * Confronto tra armi (fino a 3). Il foglio è anche il posto dove si aggiungono e si tolgono:
 * in alto le armi scelte con la ×, accanto «Aggiungi» che apre l'elenco (prima lo zaino) con la ricerca.
 */
function compareSheet(start, { cat = '' } = {}) {
  let sel = start.slice(0, CMP_MAX), adding = sel.length < 2, q = '';
  const body = document.createElement('div'); body.className = 'cmp';
  const axes = [...WEAPON_AXES, ['avg', 'Nel complesso']];
  const val = (w, k) => (k === 'avg' ? WEAPON_AXES.reduce((a, [x]) => a + w.stats[x], 0) / WEAPON_AXES.length : w.stats[k]);

  const pickerHtml = () => {
    const o = owned(); const ref = sel[0]?.class || cat;
    const cand = pool().filter((w) => !sel.includes(w) && (!q || fold(`${w.name} ${w.manufacturer || ''} ${w.realModel || ''} ${classLabel(w)}`).includes(fold(q))));
    const groups = [['Nel tuo zaino', cand.filter((w) => o[w.id]).sort((a, b) => (b.class === ref) - (a.class === ref) || byDamage(a, b))],
      [ref ? 'Stessa categoria' : 'Tutte le armi', cand.filter((w) => !o[w.id] && (!ref || w.class === ref))],
      ['Le altre', cand.filter((w) => !o[w.id] && ref && w.class !== ref)]];
    const item = (w) => `<button type="button" class="cmp__opt" data-cmp-add="${esc(w.id)}"><span class="cmp__optimg">${w.image ? `<img src="${esc(w.image)}" ${w.imageUrl ? `data-fallback="${esc(w.imageUrl)}"` : ''} alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-crosshair"/></svg>'}</span><span><b>${esc(w.name)}</b><span class="small muted">${esc(classLabel(w))} · danno ${num(w.stats.damage)}</span></span><svg class="cmp__plus" aria-hidden="true"><use href="#i-plus"/></svg></button>`;
    return `<div class="cmp__picker"><input class="input" type="search" placeholder="Cerca un'arma da aggiungere…" value="${esc(q)}" data-cmp-q aria-label="Cerca un'arma da aggiungere" autocomplete="off" autocorrect="off">
      <div class="cmp__opts">${groups.filter(([, l]) => l.length).map(([t, l]) => `<div class="cmp__label">${esc(t)}</div>${l.map(item).join('')}`).join('') || '<p class="muted small">Nessun\'arma con questo nome tra quelle che hanno le barre del gioco.</p>'}</div></div>`;
  };

  const draw = ({ keepFocus = false } = {}) => {
    const o = owned(); const ws = sel;
    const best = (k) => { if (ws.length < 2) return []; const m = Math.max(...ws.map((w) => val(w, k))); const l = ws.filter((w) => Math.abs(val(w, k) - m) < 0.05); return l.length === ws.length ? [] : l; };
    const top = best('damage');
    const verdict = ws.length < 2 ? '' : top.length === 1 ? `La più potente è <b>${esc(shortName(top[0]))}</b>: danno ${num(val(top[0], 'damage'))}.`
      : top.length ? `Le più potenti, alla pari: <b>${top.map((w) => esc(shortName(w))).join('</b> e <b>')}</b>.` : 'Fanno lo stesso danno: guarda le altre barre.';
    const facts = [['Calibro', 'caliber'], ['Caricatore', 'magazine'], ['Fuoco', 'fireMode'], ['Prezzo', 'price'], ['Dove si compra', 'whereToBuy']].filter(([, k]) => ws.some((w) => w[k]));
    const slots = ws.length + (ws.length < CMP_MAX ? 1 : 0);
    body.style.setProperty('--n', Math.max(1, ws.length)); body.style.setProperty('--slots', Math.max(2, slots));
    body.innerHTML = `<div class="cmp__heads">${ws.map((w, i) => `<div class="cmp__head cmp--${i}">
        <button type="button" class="cmp__x" data-cmp-del="${esc(w.id)}" aria-label="Togli ${esc(w.name)} dal confronto"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
        <a href="#/armi/${esc(w.id)}"><span class="cmp__img">${w.image ? `<img src="${esc(w.image)}" ${w.imageUrl ? `data-fallback="${esc(w.imageUrl)}"` : ''} alt="">` : '<svg aria-hidden="true"><use href="#i-crosshair"/></svg>'}</span>
        <b>${esc(shortName(w))}</b><span class="small muted">${esc(w.manufacturer || '')}${o[w.id] ? ' · nello zaino' : ''}</span></a></div>`).join('')}
      ${ws.length < CMP_MAX ? `<button type="button" class="cmp__head cmp__addcard ${adding ? 'is-on' : ''}" data-cmp-toggle aria-expanded="${adding}"><span class="cmp__img"><svg aria-hidden="true"><use href="#i-plus"/></svg></span><b>${ws.length ? 'Aggiungi' : 'Scegli un\'arma'}</b><span class="small muted">${ws.length ? `fino a ${CMP_MAX}` : 'per cominciare'}</span></button>` : ''}</div>
      ${adding && ws.length < CMP_MAX ? pickerHtml() : ''}
      ${ws.length === 1 && !adding ? '<p class="cmp__verdict">Aggiungi un\'altra arma per il confronto.</p>' : ''}
      ${verdict ? `<p class="cmp__verdict">${verdict}</p>` : ''}
      ${ws.length ? axes.map(([k, label]) => { const b = best(k); return `<div class="cmp__axis ${k === 'avg' ? 'cmp__axis--avg' : ''}"><div class="cmp__label">${esc(label)}</div>
        ${ws.map((w, i) => { const v = val(w, k); const win = b.includes(w); return `<div class="cmp__row cmp--${i} ${win ? 'is-best' : ''}"><span class="cmp__name">${esc(shortName(w))}</span><span class="cmp__track"><i style="width:${Math.max(0, Math.min(100, v * 10))}%"></i></span><span class="cmp__val">${num(v)}${win ? '<svg aria-label="la migliore"><use href="#i-check"/></svg>' : ''}</span></div>`; }).join('')}</div>`; }).join('') : ''}
      ${ws.length && facts.length ? `<div class="cmp__facts">${facts.map(([l, k]) => `<div class="cmp__label">${esc(l)}</div><div class="cmp__cells">${ws.map((w, i) => `<span class="cmp--${i}">${esc(w[k] ? String(w[k]) : '—')}</span>`).join('')}</div>`).join('')}</div>` : ''}
      ${ws.length ? '<p class="small muted">Barre del gioco, da 0 a 10. «Nel complesso» è la media delle quattro. Tocca la × per togliere un\'arma, il nome per aprire la sua scheda.</p>' : ''}`;
    if (keepFocus) { const n = body.querySelector('[data-cmp-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(q.length, q.length); } catch {} } }
  };

  body.addEventListener('click', (e) => {
    const add = e.target.closest('[data-cmp-add]'), del = e.target.closest('[data-cmp-del]');
    if (add) { const w = byId(add.dataset.cmpAdd); if (w && sel.length < CMP_MAX) sel.push(w); q = ''; adding = sel.length < 2; draw(); body.closest('.sheet__body')?.scrollTo({ top: 0 }); return; }
    if (del) { sel = sel.filter((w) => w.id !== del.dataset.cmpDel); adding = sel.length < 2; draw(); return; }
    if (e.target.closest('[data-cmp-toggle]')) { adding = !adding; q = ''; draw(); }
  });
  let t = null;
  body.addEventListener('input', (e) => { const i = e.target.closest('[data-cmp-q]'); if (!i) return; q = i.value; clearTimeout(t); t = setTimeout(() => draw({ keepFocus: true }), 200); });
  draw();
  showSheet({ title: 'Confronta le armi', body, cls: 'sheet--cmp' });
}

/** Varianti uniche dell'arma (IGN): nome, dove si trova, barre rispetto al modello base */
function variantsHtml(it) {
  const v = it.variants || [];
  if (!v.length) return '';
  const base = it.stats || {};
  const stat = (x) => WEAPON_AXES.filter(([k]) => typeof x.stats?.[k] === 'number').map(([k, label]) => {
    const d = typeof base[k] === 'number' ? x.stats[k] - base[k] : 0;
    const cls = d > 0.05 ? 'is-up' : d < -0.05 ? 'is-down' : '';
    return `<span class="uvar__stat ${cls}">${esc(label)} <b>${num(x.stats[k])}</b>${cls ? `<i>${d > 0 ? '▲' : '▼'}</i>` : ''}</span>`;
  }).join('');
  return `<details class="fsec uvars"><summary class="uvars__sum"><span class="fsec__t">Varianti uniche · ${v.length}</span><span class="small muted">${v.length === 1 ? esc(v[0].name) : 'Tocca per vederle'}</span></summary>
    <ul class="uvar-list">${v.map((x) => `<li class="uvar"><b class="uvar__name">${esc(x.name)}</b>
      <span class="uvar__how">${esc(x.howToGet || 'Dove si trova: le guide non lo dicono ancora.')}</span>
      ${x.stats ? `<span class="uvar__stats">${stat(x)}</span>` : ''}</li>`).join('')}</ul>
    <p class="source-line">Elenco di <a href="${esc(it.variantsSource || '')}" target="_blank" rel="noopener">IGN</a>; non si modificano e, una volta prese, le hanno sia Jason sia Lucia. ▲▼ rispetto all'arma base; nel gioco sono 130.</p></details>`;
}
function detail(it) {
  const own = progress.isOwned(it.id);
  return `
    ${backLink('/armi' + (it.class && it.class !== 'equipaggiamento' ? '?cat=' + it.class : ''), 'Armi')}
    ${hero(it, { kicker: `${(SLICES.find(([k]) => k === it.class) || [])[1] || 'Equipaggiamento'}${it.manufacturer ? ' · ' + it.manufacturer : ''}`, title: it.name, chips: statusChip(it) })}
    <div class="actions">
      <button class="btn ${own ? 'btn--accent' : 'btn--solid'} own-btn" type="button" data-own="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-pack"/></svg>${own ? 'Nello zaino ✓' : 'Mettila nello zaino'}</button>
      ${hasStats(it) ? `<button class="btn btn--solid" type="button" data-cmp-open="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-compare"/></svg>Confronta</button>` : ''}
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
    ${variantsHtml(it)}
    <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
}

export function render(params, query) {
  const it = params.id ? byId(params.id) : null;
  if (it) return { left: '', right: detail(it), show: 'right', accent: section.accent, title: it.name };
  const all = vis(db.weapons);
  const favs = owned();
  const cat = query.cat || '';
  const have = query.have || '';
  const q = fold(query.q).trim();
  const nOwn = all.filter((w) => favs[w.id]).length;
  const hv = (v) => { const p = new URLSearchParams(); if (cat) p.set('cat', cat); if (v) p.set('have', v); return `#/armi${p.toString() ? '?' + p : ''}`; };
  // La ruota conta quello che stai guardando: tutte, solo lo zaino, solo quelle che mancano
  const counts = {}, fc = {};
  for (const w of all) { if (!passHave(have, favs[w.id])) continue; counts[w.class] = (counts[w.class] || 0) + 1; if (favs[w.id]) fc[w.class] = (fc[w.class] || 0) + 1; }
  const weapons = all.filter((w) => w.class !== 'equipaggiamento' && (!cat || w.class === cat) && passHave(have, favs[w.id]));
  const gear = all.filter((w) => w.class === 'equipaggiamento' && passHave(have, favs[w.id]));
  const label = cat ? (SLICES.find(([k]) => k === cat) || [])[1] : 'Tutte le armi';
  // Riga di un'arma: la scheda a sinistra, «Confronta» a destra (solo se ha le barre del gioco)
  const item = (w) => `<div class="row wrow"><a class="wrow__main" href="#/armi/${esc(w.id)}">
      <span class="row__thumb">${w.image ? `<img src="${esc(w.image)}" ${w.imageUrl ? `data-fallback="${esc(w.imageUrl)}"` : ''} alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-crosshair"/></svg>'}</span>
      <span><span class="row__title">${esc(w.name)}${favs[w.id] ? ' <svg class="wrow__own" aria-label="nello zaino"><use href="#i-pack"/></svg>' : ''}</span><span class="row__meta">${esc(q ? classLabel(w) : (w.manufacturer || classLabel(w)))}${w.realModel ? ' · ' + esc(w.realModel) : ''}${srcBadge(w)}</span></span></a>
      ${hasStats(w) ? `<button type="button" class="wrow__cmp" data-cmp-open="${esc(w.id)}" aria-label="Confronta ${esc(w.name)}"><svg aria-hidden="true"><use href="#i-compare"/></svg><span>Confronta</span></button>` : `<a class="wrow__go" href="#/armi/${esc(w.id)}" aria-hidden="true" tabindex="-1"><svg><use href="#i-arrow"/></svg></a>`}</div>`;
  const list = (arr) => arr.map(item).join('');
  const found = q ? all.filter((w) => fold(`${w.name} ${w.manufacturer || ''} ${w.realModel || ''} ${classLabel(w)}`).includes(q)) : [];
  const tools = `<div class="wtools"><input class="input" type="search" placeholder="Cerca un'arma…" value="${esc(query.q || '')}" data-weapon-q aria-label="Cerca un'arma" autocomplete="off" autocorrect="off" enterkeyhint="search">
      <button class="btn btn--solid" type="button" data-cmp-open="" data-cmp-cat="${esc(cat)}"><svg aria-hidden="true"><use href="#i-compare"/></svg>Confronta</button></div>`;
  const left = `${sectionHead(section, `${nOwn} / ${all.length} nello zaino`)}
    ${tools}
    ${q ? `<div class="wheel-panel wresults"><span class="kicker kicker--accent">${found.length === 1 ? '1 arma trovata' : `${found.length} armi trovate`}</span>
        ${list(found) || `<p class="muted small">Niente con «${esc(query.q)}». Si cerca nel nome, nel produttore e nella categoria.</p>`}</div>`
    : `<p class="lede">Scegli uno spicchio, come nel gioco. Le armi che metti nello zaino riempiono lo spicchio.</p>
    ${haveFilter(have, hv, { yes: 'Nello zaino', no: 'Mi mancano' })}
    <div class="wheel-wrap">
      <div class="wheel-stage">${wheel(counts, cat, fc)}<p class="small muted wheel-hint">${cat ? 'Tocca il centro per tornare a tutte' : 'Tocca uno spicchio'}</p></div>
      <div class="wheel-panel">
        <span class="kicker kicker--accent">${cat ? 'Categoria' : 'Tutte le categorie'}</span>
        <h2 class="wheel-panel__title">${esc(label)}</h2>
        ${list(weapons) || `<p class="muted small">${have === 'si' ? 'Ancora niente nello zaino qui.' : have === 'no' ? 'Le hai tutte.' : 'Nessuna arma vista ancora in questa categoria.'}</p>`}
      </div>
    </div>
    ${gear.length && !cat ? `<div class="block"><span class="kicker">Equipaggiamento (${gear.length})</span>${list(gear)}</div>` : ''}`}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Armi' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-own]');
    if (f && location.hash.startsWith('#/armi')) { progress.toggleOwned(f.dataset.own); rerender(); return; }
    const c = e.target.closest('[data-cmp-open]');
    if (c) {
      e.preventDefault();
      const w = c.dataset.cmpOpen ? byId(c.dataset.cmpOpen) : null; const cat = c.dataset.cmpCat || '';
      // Dal bottone in alto: le tue armi più potenti (della categoria aperta, se ce n'è una)
      const start = w ? startSet(w) : pool().filter((x) => owned()[x.id] && (!cat || x.class === cat)).sort(byDamage).slice(0, CMP_MAX);
      compareSheet(start, { cat: w?.class || cat });
    }
  });
  let t = null;
  root.addEventListener('input', (e) => { const i = e.target.closest('[data-weapon-q]'); if (!i) return; clearTimeout(t); t = setTimeout(() => { const v = i.value.trim(); const pos = i.selectionStart; history.replaceState(history.state, '', v ? `#/armi?q=${encodeURIComponent(v)}` : '#/armi'); rerender(); const n = document.querySelector('[data-weapon-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250); });
}
