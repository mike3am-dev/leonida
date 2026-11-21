/**
 * Veicoli: come la pagina «Progresso / Veicoli» del gioco.
 * Sei schede (Auto, Motocicli quad e bici, Imbarcazioni, Velivoli, Servizio, Speciali), ogni scheda divisa
 * nelle classi del gioco con «Scoperti X / Y». I totali stanno in vehicles.json → groups (dal gioco di Mike, 20/11).
 * Il garage è personale: i veicoli della guida si segnano con la chiave; quelli che nella guida non ci sono
 * si aggiungono a mano (progress.myVehicles) e finiscono anche nel Pacchetto per Claude.
 */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, vis, sectionOf, extrasHtml, passHave, galleryHtml, mini } from './shared.js';
import * as spoiler from '../spoiler.js';
import { specSheet } from './specs.js';

const section = sectionOf('garage');
const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const groups = () => db.vehicleGroups || [];
const classes = () => groups().flatMap((g) => g.classes.map((c) => ({ ...c, group: g })));
export const classOf = (id) => classes().find((c) => c.id === id) || null;
export const classLabel = (id) => (id === 'fuori-elenco' ? 'Fuori elenco' : classOf(id)?.name || id || '');
/** Totale dei veicoli del gioco (somma delle classi) e quanti ne hai scoperti */
export function vehicleCounts() {
  const st = progress.get(); const own = st.owned || {}; const mine = Object.values(st.myVehicles || {});
  const per = {};
  for (const v of vis(db.vehicles || [])) if (own[v.id] && v.class !== 'fuori-elenco') per[v.class] = (per[v.class] || 0) + 1;
  for (const m of mine) per[m.cls] = (per[m.cls] || 0) + 1;
  const cap = (c) => Math.min(per[c.id] || 0, c.total);
  const total = classes().reduce((a, c) => a + c.total, 0);
  const found = classes().reduce((a, c) => a + cap(c), 0);
  return { per, cap, total, found };
}

const href = (o = {}) => { const p = new URLSearchParams(); for (const [k, v] of Object.entries(o)) if (v) p.set(k, v); const s = p.toString(); return `#/veicoli${s ? '?' + s : ''}`; };
const bar = (n, t) => `<span class="vbar"><i style="width:${t ? Math.round((Math.min(n, t) / t) * 100) : 0}%"></i></span>`;
const ownBtn = (id, on) => `<button class="vown ${on ? 'is-on' : ''}" type="button" data-own="${esc(id)}" aria-pressed="${on}" aria-label="${on ? 'Nel garage: tocca per togliere' : 'Mettilo nel garage'}"><svg aria-hidden="true"><use href="#i-key"/></svg></button>`;

/** Foto delle schede e delle righe: la miniatura (mini-m 480 px, mini 160 px), mai la foto intera.
 *  Con le foto intere una classe lunga arrivava a centinaia di MB in memoria e Safari su iPhone si chiudeva (Dada, 20/11).
 *  Se la miniatura manca si passa alla foto locale e poi alla copia online. */
function thumb(x, folder) {
  const m = mini(x.image, folder); const chain = [x.image, x.imageUrl].filter(Boolean);
  const src = m || chain.shift();
  return `<img src="${esc(src)}" ${chain.length ? `data-fallback="${esc(chain.join('|'))}"` : ''} alt="" loading="lazy" decoding="async">`;
}
/** La foto di copertina di una classe: quella scelta nei dati (`cover` = id del veicolo), altrimenti il primo veicolo con una foto */
const cover = (c, all) => all.find((v) => v.id === c.cover && v.image) || all.find((v) => v.class === c.id && v.image) || null;
function card(x, own, back) {
  return `<div class="dcard-wrap"><a class="dcard ${x.image ? '' : 'dcard--noimg'}" href="#/veicoli/${esc(x.id)}${back}">
      <span class="dcard__img">${x.image ? thumb(x, 'mini-m') : '<svg aria-hidden="true"><use href="#i-car"/></svg>'}</span>
      <span class="dcard__body"><span class="dcard__name">${esc(x.name)}</span>${x.status !== 'verificato' ? `<span class="dcard__src">${esc(SRC[x.source] || 'da verificare')}</span>` : ''}</span></a>
    ${ownBtn(x.id, !!own[x.id])}</div>`;
}
const mineCard = (id, m) => `<div class="dcard-wrap"><button class="dcard dcard--mine" type="button" data-mine="${esc(id)}">
    <span class="dcard__img"><svg aria-hidden="true"><use href="#i-key"/></svg></span>
    <span class="dcard__body"><span class="dcard__name">${esc(m.name)}</span><span class="dcard__src">aggiunto da te</span></span></button></div>`;
// Riga dei risultati della ricerca: scheda a sinistra, chiave del garage a destra
const resultRow = (x, own) => `<div class="row wrow"><a class="wrow__main" href="#/veicoli/${esc(x.id)}">
    <span class="row__thumb">${x.image ? thumb(x, 'mini') : '<svg aria-hidden="true"><use href="#i-car"/></svg>'}</span>
    <span><span class="row__title">${esc(x.name)}</span><span class="row__meta">${esc(classLabel(x.class))}${x.manufacturer ? ' · ' + esc(x.manufacturer) : ''}</span></span></a>
    ${ownBtn(x.id, !!own[x.id])}</div>`;

export function render(params, query) {
  const it = params.id ? byId(params.id) : null;
  const own = progress.get().owned || {};
  const mine = progress.get().myVehicles || {};
  if (it) return detail(it, own, query);

  const all = vis(db.vehicles);
  const { per, cap, total, found } = vehicleCounts();
  const q = fold(query.q).trim();
  const tools = `<div class="wtools wtools--one"><input class="input" type="search" placeholder="Cerca un veicolo da mettere nel garage…" value="${esc(query.q || '')}" data-vehicle-q aria-label="Cerca un veicolo" autocomplete="off" autocorrect="off" enterkeyhint="search"></div>`;
  const head = sectionHead(section, `${found} / ${total} scoperti`);

  if (q) {
    const hits = all.filter((v) => fold(`${v.name} ${v.manufacturer || ''} ${v.realModel || ''} ${classLabel(v.class)}`).includes(q));
    const myHits = Object.entries(mine).filter(([, m]) => fold(m.name).includes(q));
    const left = `${head}${tools}
      <div class="wheel-panel wresults"><span class="kicker kicker--accent">${hits.length === 1 ? '1 veicolo trovato' : `${hits.length} veicoli trovati`}</span>
        ${hits.map((x) => resultRow(x, own)).join('')}
        ${myHits.map(([id, m]) => `<div class="row wrow"><button class="wrow__main" type="button" data-mine="${esc(id)}"><span class="row__thumb"><svg aria-hidden="true"><use href="#i-key"/></svg></span><span><span class="row__title">${esc(m.name)}</span><span class="row__meta">${esc(classLabel(m.cls))} · aggiunto da te</span></span></button></div>`).join('')}
        ${hits.length ? '' : `<p class="muted small">Nella guida non c'è niente con «${esc(query.q)}».</p>`}
        <button class="btn btn--solid vadd" type="button" data-vadd="${esc(query.q)}"><svg aria-hidden="true"><use href="#i-key"/></svg>Aggiungi «${esc(query.q)}» al garage</button>
        <p class="small muted">Se non lo trovi, aggiungilo tu: scegli la classe come nel gioco. Finisce nel tuo garage e nel Pacchetto per Claude.</p></div>`;
    return { left, right: '', show: 'left', accent: section.accent, title: 'Veicoli' };
  }

  const g = groups().find((x) => x.id === query.gruppo) || groups()[0];
  const one = g.classes.length === 1;
  const c = one ? g.classes[0] : g.classes.find((x) => x.id === query.classe) || null;
  const tabs = `<div class="vtabs" role="tablist" aria-label="Schede">${groups().map((x) => `<a role="tab" aria-selected="${x.id === g.id}" href="${href({ gruppo: x.id })}">${esc(x.name)}</a>`).join('')}</div>`;
  const myList = Object.entries(mine);
  const garage = !c && (all.some((v) => own[v.id]) || myList.length)
    ? `<div class="block vgarage"><span class="kicker">Il tuo garage · ${all.filter((v) => own[v.id]).length + myList.length}</span><div class="keys">${all.filter((v) => own[v.id]).map((x) => `<a class="key" href="#/veicoli/${esc(x.id)}"><span class="key__ring"></span>${esc(x.name)}</a>`).join('')}${myList.map(([id, m]) => `<button class="key" type="button" data-mine="${esc(id)}"><span class="key__ring"></span>${esc(m.name)}</button>`).join('')}</div></div>`
    : '';

  let body;
  if (!c) {
    body = `<div class="vclasses">${g.classes.map((x, i) => { const n = cap(x); const cv = cover(x, all); return `<a class="vclass ${cv ? '' : 'vclass--noimg'} ${n >= x.total ? 'is-full' : ''}" style="--h:${[320, 268, 205, 176, 22][i % 5]}" href="${href({ gruppo: g.id, classe: x.id })}">
        ${cv ? thumb(cv, 'mini-m') : '<svg class="vclass__ico" aria-hidden="true"><use href="#i-car"/></svg>'}<span class="vclass__veil"></span>
        <b class="vclass__n">${n}<span> / ${x.total}</span></b>
        <span class="vclass__text"><span class="vclass__name">${esc(x.name)}</span>${x.note ? `<span class="vclass__note">${esc(x.note)}</span>` : ''}</span>
        ${bar(n, x.total)}</a>`; }).join('')}</div>`;
  } else {
    const have = query.have === 'si' ? 'si' : '';
    const list = all.filter((v) => v.class === c.id && passHave(have, own[v.id]));
    const myHere = myList.filter(([, m]) => m.cls === c.id && have !== 'no');
    const back = `?gruppo=${g.id}${one ? '' : '&classe=' + c.id}`;
    const n = cap(c);
    body = `${one ? '' : `<a class="vback" href="${href({ gruppo: g.id })}">‹ ${esc(g.name)}</a>`}
      <div class="vhead ${cover(c, all) ? 'vhead--img' : ''}">${cover(c, all) ? `${thumb(cover(c, all), 'mini-m')}<span class="vclass__veil"></span>` : ''}<h2>${esc(c.name)}</h2>${c.note ? `<p class="vclass__note">${esc(c.note)}</p>` : ''}
        <span class="vclass__count"><span>Scoperti</span><b>${n} / ${c.total}</b></span>${bar(n, c.total)}</div>
      <div class="segmented havefilter" role="group" aria-label="Filtro">${[['', 'Tutti'], ['si', 'Scoperti']].map(([v, l]) => `<a role="button" aria-pressed="${have === v}" href="${href({ gruppo: g.id, classe: one ? '' : c.id, have: v })}">${l}</a>`).join('')}</div>
      ${list.length || myHere.length ? `<div class="dealer dealer--v">${list.map((x) => card(x, own, back)).join('')}${myHere.map(([id, m]) => mineCard(id, m)).join('')}</div>`
        : `<div class="placeholder"><strong>${have === 'si' ? 'Non ne hai ancora scoperto nessuno qui' : 'Nessun veicolo di questa classe nella guida, per ora'}</strong>${have ? '' : 'Quando ne trovi uno, aggiungilo tu qui sotto.'}</div>`}
      <button class="btn btn--ghost vadd" type="button" data-vadd="" data-vadd-cls="${esc(c.id)}"><svg aria-hidden="true"><use href="#i-key"/></svg>Aggiungi un veicolo che non c'è</button>`;
  }
  // La scheda scelta resta visibile nella fila che scorre di lato
  // La fila delle schede resta dov'era quando tocchi (prima saltava all'inizio e poi tornava: sfarfallio, Mike 20/11).
  // Il microtask gira dopo l'inserimento dell'HTML e prima che la pagina venga disegnata.
  const prevRow = document.querySelector('.vtabs:not(.vtabs--sheet)'), tabsX = prevRow ? prevRow.scrollLeft : null;
  queueMicrotask(() => { const r = document.querySelector('.vtabs:not(.vtabs--sheet)'); if (!r) return;
    if (tabsX != null) { r.scrollLeft = tabsX; return; }
    const on = r.querySelector('[aria-selected="true"]'); if (on && g !== groups()[0]) r.scrollLeft = on.offsetLeft - r.offsetLeft - 8; });
  const left = `${head}${tools}${garage}${tabs}${body}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Veicoli' };
}

function detail(it, own, query) {
  const c = classOf(it.class);
  const back = c ? `/veicoli?gruppo=${c.group.id}${c.group.classes.length > 1 ? '&classe=' + c.id : ''}` : '/veicoli';
  const right = `
    ${backLink(back, c ? c.name : 'Veicoli')}
    ${hero(it, { kicker: `${c ? `${c.group.name}${c.group.classes.length > 1 ? ' · ' + c.name : ''}` : classLabel(it.class)}${it.manufacturer ? ' · ' + it.manufacturer : ''}`, title: it.name, chips: statusChip(it) })}
    <div class="actions">
      <button class="btn ${own[it.id] ? 'btn--accent' : 'btn--solid'} own-btn" type="button" data-own="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-key"/></svg>${own[it.id] ? 'Nel garage ✓' : 'Mettilo nel garage'}</button>
      <button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
    </div>
    ${it.class === 'fuori-elenco' ? '<p class="small muted">Visto nel mondo di gioco ma non nell\'elenco dei veicoli del gioco: non conta per «Scoperti».</p>' : ''}
    <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Scheda in arrivo.')}</p>`)}</div>
    ${extrasHtml(it)}
    ${specSheet(it, 'vehicle')}
    ${galleryHtml(it)}
    ${it.howToGet && !/^Da verificare\.?$/.test(it.howToGet.trim()) ? `<div class="block"><span class="kicker">Come ottenerlo</span><div class="prose">${spoiler.wrap(it, `<p>${esc(it.howToGet)}</p>`)}</div></div>` : ''}
    <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
  return { left: '', right, show: 'right', accent: section.accent, title: it.name };
}

/** Foglio per aggiungere un veicolo che nella guida non c'è: nome + classe, come nel gioco */
async function addSheet(name = '', preset = '') {
  const { showSheet } = await import('../ui/sheet.js');
  let gid = (classOf(preset)?.group.id) || groups()[0].id;
  const body = document.createElement('div');
  const paint = () => {
    const g = groups().find((x) => x.id === gid);
    body.innerHTML = `<label class="small muted" for="vadd-name">Nome, come lo vedi nel gioco</label>
      <input class="input" id="vadd-name" type="text" value="${esc(body.querySelector('#vadd-name')?.value ?? name)}" autocomplete="off" autocorrect="off">
      <p class="small muted vadd__hint">Tocca la classe e lo metto nel garage.</p>
      <div class="vtabs vtabs--sheet">${groups().map((x) => `<button type="button" role="tab" aria-selected="${x.id === gid}" data-vg="${esc(x.id)}">${esc(x.name)}</button>`).join('')}</div>
      <div class="chips vadd__cls">${g.classes.map((x) => `<button type="button" class="chip chip--btn ${x.id === preset ? 'is-on' : ''}" data-vc="${esc(x.id)}">${esc(x.name)}</button>`).join('')}</div>`;
  };
  paint();
  const sh = showSheet({ title: 'Aggiungi al garage', body });
  body.addEventListener('click', (e) => {
    const t = e.target.closest('[data-vg]'); if (t) { gid = t.dataset.vg; paint(); return; }
    const c = e.target.closest('[data-vc]'); if (!c) return;
    const inp = body.querySelector('#vadd-name'); const v = inp.value.trim();
    if (!v) { inp.focus(); inp.classList.add('is-error'); return; }
    progress.addMyVehicle(v, c.dataset.vc); sh.close();
    location.hash = href({ gruppo: classOf(c.dataset.vc).group.id, classe: classOf(c.dataset.vc).group.classes.length > 1 ? c.dataset.vc : '' });
  });
}

async function mineSheet(id, rerender) {
  const m = (progress.get().myVehicles || {})[id]; if (!m) return;
  const { showSheet } = await import('../ui/sheet.js');
  const sh = showSheet({ title: m.name, body: `<p>${esc(classLabel(m.cls))} · aggiunto da te il ${new Date(m.at).toLocaleDateString('it-IT')}.</p><p class="small muted">Non è ancora nella guida: arriva con il prossimo Pacchetto per Claude.</p><div class="actions"><button class="btn btn--ghost" type="button" data-mine-del>Togli dal garage</button></div>` });
  sh.el.querySelector('[data-mine-del]').onclick = () => { progress.removeMyVehicle(id); sh.close(); rerender(); };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    if (!location.hash.startsWith('#/veicoli')) return;
    const f = e.target.closest('[data-own]');
    if (f) { e.preventDefault(); progress.toggleOwned(f.dataset.own); rerender(); return; }
    const a = e.target.closest('[data-vadd]');
    if (a) { addSheet(a.dataset.vadd, a.dataset.vaddCls || ''); return; }
    const m = e.target.closest('[data-mine]');
    if (m) mineSheet(m.dataset.mine, rerender);
  });
  let t = null;
  root.addEventListener('input', (e) => { const i = e.target.closest('[data-vehicle-q]'); if (!i) return; clearTimeout(t); t = setTimeout(() => { const v = i.value.trim(); const pos = i.selectionStart; history.replaceState(history.state, '', v ? `#/veicoli?q=${encodeURIComponent(v)}` : '#/veicoli'); rerender(); const n = document.querySelector('[data-vehicle-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250); });
}
