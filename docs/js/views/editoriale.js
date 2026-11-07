/** Personaggi, Radio, Mondo */
import { db, byId } from '../data.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, insightHtml, tableHtml, vis, sectionOf, discoverBtn, isMet } from './shared.js';
import * as progress from '../store/progress.js';
import * as spoiler from '../spoiler.js';

const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };
const srcNote = (x) => x.status !== 'verificato' ? ' · ' + (SRC[x.source] || 'da verificare') : '';
const fonte = (x) => `<p class="source-line">Fonte: ${esc(x.source)}${x.sourceUrl ? ` · <a href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;

/* ---------- Personaggi ---------- */
const secP = sectionOf('personaggi');
const GROUPS = [
  ['🌴', 'Le Keys: la famiglia di Jason', 'Contrabbando, barche e vita di provincia tra le isole.', ['chr-brian', 'chr-lori', 'chr-cal']],
  ['🎤', 'Vice City: la scena musicale', 'Rapper, produttori e leggende dei club.', ['chr-boobie', 'chr-drequan', 'chr-real-dimez', 'chr-dwnply', 'chr-travis-scott', 'chr-kodak-black']],
  ['💰', 'Il colpo grosso', 'Chi vive di rapine.', ['chr-raul']],
  ['🏢', 'Megamundo', 'Soldi, potere e sorrisi di plastica.', ['chr-andres', 'chr-petra', 'chr-valentina', 'chr-cesar']],
  ['🏁', 'Strada, gang e corse', 'San4San, corse clandestine e quartieri caldi.', ['chr-raymond', 'chr-ernesto', 'chr-yago', 'chr-aunt-tee']],
  ['🚔', 'La legge e lo Stato', 'Polizia, penitenziario e politica.', ['chr-mendez', 'chr-stefanie', 'chr-erin-henshaw']],
  ['🔧', 'Affari e mezzi', 'Meccanici, ricettatori e club di fango.', ['chr-wyman', 'chr-randy', 'chr-billy']],
  ['📺', 'Voci, schermi e cult', 'Streamer, mascotte, comparse diventate meme.', ['chr-camillo', 'chr-n3on', 'chr-phil', 'chr-mud-dog-mike', 'chr-macca', 'chr-hammer-lady', 'chr-rudi', 'chr-leonida-joker']],
  ['🕵️', 'Dai leak (da verificare)', 'Nomi emersi dal leak del 2022: prendili con le pinze.', ['chr-kai', 'chr-shanese', 'chr-leak-names']],
];
const HUES = [340, 24, 174, 265, 200, 48, 300, 120];
const monogram = (x) => { const h = HUES[[...x.id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length]; const ini = x.name.split(/[\s(]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join(''); return `<span class="monogram" style="--h:${h}">${esc(ini.toUpperCase())}</span>`; };
export function renderPersonaggi(params, query = {}) {
  const q = (query.q || '').toLowerCase().trim();
  const chars = vis(db.characters).filter((x) => !q || (x.name + ' ' + (x.role || '')).toLowerCase().includes(q));
  const c = params.id ? byId(params.id) : null;
  if (c) {
    const right = `
      ${backLink('/personaggi', 'Personaggi')}
      ${c.image ? hero(c, { kicker: `${c.role || 'Personaggio'}${c.districtId ? ' · ' + (byId(c.districtId)?.name || '') : ''}`, title: c.name, lede: c.tagline || '', chips: statusChip(c) })
        : `<div class="hero hero--mono">${monogram(c)}<div class="hero__text"><span class="kicker">${esc(c.role || 'Personaggio')}${c.districtId ? ' · ' + esc(byId(c.districtId)?.name || '') : ''}</span><h1>${esc(c.name)}</h1>${c.tagline ? `<p class="lede">${esc(c.tagline)}</p>` : ''}<div class="chips">${statusChip(c)}</div></div></div>`}
      <div class="prose">${spoiler.wrap(c, `<p class="dropcap">${esc(c.bio || 'Scheda in arrivo.')}</p>`)}</div>
      <div class="actions">${discoverBtn(c, { label: 'Incontrato', doneLabel: 'Incontrato ✓', auto: isMet(c) && !progress.get().discovered?.[c.id] })}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>
      ${c.idCard?.length ? `<dl class="facts">${c.idCard.map((f) => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join('')}${c.firstSeen ? `<dt>Prima apparizione</dt><dd>${esc(c.firstSeen)}</dd>` : ''}</dl>` : ''}
      ${galleryHtml(c)}
      ${c.insight ? `<div class="block">${acc('Approfondimento (vice-central.com)', `<div class="prose prose--guide">${spoiler.wrap(c, insightHtml(c.insight))}${tableHtml(c.summaryTable)}<p class="source-line">Tradotto da <a href="${esc(c.insightUrl || 'https://vice-central.com/personnages/')}" target="_blank" rel="noopener">vice-central.com</a>.</p></div>`)}</div>` : ''}
      ${c.relations?.length ? `<div class="block"><span class="kicker">Legami</span><div class="threads"><a class="thread thread--me" href="#/personaggi/${esc(c.id)}"><span class="thread__ava">${c.image ? `<img src="${esc(c.image)}" alt="">` : monogram(c)}</span><span class="thread__name">${esc(c.name.split(' ')[0])}</span></a>${c.relations.map((id) => { const r = byId(id); return r ? `<a class="thread" href="#/personaggi/${esc(id)}"><span class="thread__ava">${r.image ? `<img src="${esc(r.image)}" alt="">` : monogram(r)}</span><span class="thread__name">${esc(r.name.split(' ')[0])}</span><span class="thread__role">${esc((r.role || '').slice(0, 28))}</span></a>` : ''; }).join('')}</div></div>` : ''}
      ${c.firstMissionId ? `<div class="block"><span class="kicker">Prima apparizione</span><a class="btn" href="#/missioni/${esc(c.firstMissionId)}">${esc(byId(c.firstMissionId)?.title || c.firstMissionId)}</a></div>` : ''}
      ${fonte(c)}`;
    return { left: '', right, show: 'right', accent: secP.accent, title: c.name };
  }
  const card = (x) => `<a class="cardx cardx--person" href="#/personaggi/${esc(x.id)}">
    <div class="cardx__img cardx__img--face">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : monogram(x)}</div>
    <div class="cardx__body"><div class="cardx__title">${esc(x.name)}</div><div class="cardx__meta">${esc(x.role || '')}${srcNote(x)}</div></div></a>`;
  const used = new Set();
  const groupHtml = GROUPS.map(([emoji, title, sub, ids]) => {
    const list = ids.map((id) => chars.find((x) => x.id === id)).filter(Boolean);
    list.forEach((x) => used.add(x.id));
    if (!list.length) return '';
    return `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">${emoji}</span><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div></div><div class="cards">${list.map(card).join('')}</div>`;
  }).join('');
  const rest = chars.filter((x) => !x.isProtagonist && !used.has(x.id));
  const left = `${sectionHead(secP, `${chars.length} schede`)}
    <input class="input" type="search" placeholder="Cerca un personaggio…" value="${esc(q)}" data-char-q aria-label="Cerca un personaggio" style="margin-bottom:var(--s-3)">
    ${q ? `<div class="cards">${chars.map(card).join('') || '<p class="muted small">Nessuno.</p>'}</div>` : `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">⭐</span><div><h2>Protagonisti</h2><p>Jason e Lucia: due vite legate da un colpo andato storto.</p></div></div>
    <div class="castboard">${chars.filter((x) => x.isProtagonist).map((x, i) => `<a class="castboard__panel castboard__panel--static" href="#/personaggi/${esc(x.id)}"><img src="${esc(x.image)}" alt=""><span class="castboard__veil"></span><span class="castboard__text"><span class="castboard__name">${esc(x.name)}</span><span class="castboard__role">${esc(x.role || '')}</span></span></a>`).join('')}</div>
    ${groupHtml}
    ${rest.length ? `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">👥</span><div><h2>Altri</h2></div></div><div class="cards">${rest.map(card).join('')}</div>` : ''}`}`;
  return { left, right: '', show: 'left', accent: secP.accent, title: 'Personaggi' };
}

/* ---------- Radio ---------- */
const secR = sectionOf('radio');
const MUSIC_CATS = ['Colonna sonora', 'Musica'];
const appleSearch = (q) => `https://music.apple.com/it/search?term=${encodeURIComponent(q)}`;
export function renderCultura(params) {
  const radio = vis(db.radio), music = vis(db.brands).filter((b) => MUSIC_CATS.includes(b.category));
  const it = params.id ? byId(params.id) : null;
  if (it) {
    const tracks = (it.highlights || []).map((h) => typeof h === 'string' ? { title: h } : h);
    const right = `
      ${backLink('/cultura', 'Radio')}
      ${it._type === 'radio' ? `<div class="vinyl-wrap"><div class="vinyl"><div class="vinyl__disc"></div>${it.image ? `<img class="vinyl__label" src="${esc(it.image)}" alt="">` : ''}</div>
          <div><span class="kicker kicker--accent">Stazione radio · ${esc(it.genre || '')}</span><h1>${esc(it.name)}</h1>${it.host ? `<p class="lede">Con ${esc(it.host)}</p>` : ''}<div class="chips">${statusChip(it)}</div></div></div>`
        : hero(it, { kicker: it.category || 'Musica', title: it.name, chips: statusChip(it) })}
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Descrizione in arrivo.')}</p>`)}</div>
      ${tracks.length ? `<div class="block"><span class="kicker">In scaletta</span>
        ${tracks.map((h) => `<div class="track"><span class="track__icon"><svg aria-hidden="true"><use href="#i-radio"/></svg></span><span><span class="track__title">${esc(h.title === '—' ? h.artist : h.title)}</span><span class="track__meta">${esc(h.title === '—' ? '' : h.artist || '')}${h.status === 'verificato' ? '' : ' · community'}</span></span><a class="btn btn--ghost track__btn" href="${appleSearch((h.artist || '') + ' ' + (h.title === '—' ? '' : h.title || ''))}" target="_blank" rel="noopener">Apple Music</a></div>`).join('')}</div>`
        : (it._type === 'radio' ? '<p class="muted small">La scaletta la compili tu, un brano alla volta, quando lo riconosci alla radio.</p>' : '')}
      ${it._type !== 'radio' ? `<div class="actions"><a class="btn btn--solid" href="${appleSearch(it.name)}" target="_blank" rel="noopener">Cerca su Apple Music</a></div>` : ''}
      ${fonte(it)}`;
    return { left: '', right, show: 'right', accent: secR.accent, title: it.name };
  }
  const left = `${sectionHead(secR, `${radio.length} stazioni`)}
    <img class="radio-logo" src="assets/img/sfondi/vice-city-logo.png" alt="Vice City">
    <div class="cards">${radio.map((r) => `<a class="cardx" href="#/cultura/${esc(r.id)}"><div class="cardx__img cardx__img--logo">${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-radio"/></svg>'}</div><div class="cardx__body"><div class="cardx__title">${esc(r.name)}</div><div class="cardx__meta">${esc(r.genre || '')}${r.host ? ' · ' + esc(r.host) : ''}</div></div></a>`).join('')}</div>
    <span class="kicker" style="display:block;margin:var(--s-5) 0 var(--s-2)">Dischi e canzoni</span>
    <div class="cards">${music.map((b) => `<a class="cardx" href="#/cultura/${esc(b.id)}"><div class="cardx__img cardx__img--logo">${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-star"/></svg>'}</div><div class="cardx__body"><div class="cardx__title">${esc(b.name)}</div><div class="cardx__meta">${esc(b.category || '')}</div></div></a>`).join('')}</div>`;
  return { left, right: '', show: 'left', accent: secR.accent, title: 'Radio' };
}

/* ---------- Mondo: marchi, app, fazioni, TV ---------- */
const secM = sectionOf('mondo');
export function renderMondo(params) {
  const all = vis(db.brands).filter((b) => !MUSIC_CATS.includes(b.category));
  const it = params.id ? byId(params.id) : null;
  if (it) {
    const right = `${backLink('/mondo', 'Mondo')}${hero(it, { kicker: it.category || 'Mondo', title: it.name, chips: statusChip(it) })}
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || '')}</p>`)}</div>${galleryHtml(it)}${fonte(it)}`;
    return { left: '', right, show: 'right', accent: secM.accent, title: it.name };
  }
  const groups = {};
  for (const b of all) (groups[b.category || 'Altro'] ||= []).push(b);
  const META = { 'Edizione': ['🎁', 'Cosa c’è nelle edizioni'], 'Bonus di acquisto': ['🎟️', 'Bonus di preordine e Ultimate'], 'App': ['📱', 'Le app del telefono di Jason e Lucia'], 'Gang': ['🔫', 'Chi comanda le strade'], "Forze dell'ordine": ['🚔', 'Polizia, sceriffi, guardie'], 'Azienda': ['🏢', 'Marchi e corporation'], 'Etichetta discografica': ['💿', 'La musica di Vice City'], 'TV': ['📺', 'Canali e show'], 'Pubblicità': ['🪧', 'Cartelloni e spot'], 'Arma': ['🎯', 'Marchi d’armi'], 'Abbonamento': ['💳', 'GTA+ e servizi'], 'Banche': ['🏦', 'Dove stanno i soldi'], 'Distributori': ['⛽', 'Benzina e minimarket'], 'Fast food': ['🍔', 'Dove si mangia'] };
  const order = ['Edizione', 'Bonus di acquisto', 'App', 'Gang', "Forze dell'ordine", 'Azienda', 'Etichetta discografica', 'TV', 'Pubblicità', 'Arma', 'Abbonamento', 'Banche', 'Distributori', 'Fast food'];
  const keys = [...new Set([...order.filter((k) => groups[k]), ...Object.keys(groups).sort((a, b) => a.localeCompare(b, 'it'))])];
  const brandCard = (b) => `<a class="brandcard" href="#/mondo/${esc(b.id)}"><span class="brandcard__img">${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy">` : monogram(b)}</span><span class="brandcard__body"><span class="brandcard__name">${esc(b.name)}</span><span class="brandcard__meta">${esc((b.description || '').slice(0, 70))}…</span></span></a>`;
  const left = `${sectionHead(secM, `${all.length} voci`)}
    <p class="lede">Marchi, app, gang, polizia, TV: tutto ciò che fa di Leonida un posto vero.</p>
    <div class="filters">${keys.map((k) => `<a class="filter" href="#mondo-${esc(k.replace(/[^a-z]/gi, '').toLowerCase())}">${esc(META[k]?.[0] || '•')} ${esc(k)}</a>`).join('')}</div>
    ${keys.map((k, i) => `<div class="acc mondo-cat ${i < 2 ? 'is-open' : ''}" id="mondo-${esc(k.replace(/[^a-z]/gi, '').toLowerCase())}"><button class="acc__btn mondo-cat__btn" type="button"><span class="group-head__emoji" aria-hidden="true">${META[k]?.[0] || '•'}</span><span class="mondo-cat__text"><b>${esc(k)}</b><small>${esc(META[k]?.[1] || '')} · ${groups[k].length}</small></span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button><div class="acc__body"><div class="brandgrid brandgrid--compact">${[...groups[k]].sort((a, b) => a.name.localeCompare(b.name, 'it')).map(brandCard).join('')}</div></div></div>`).join('')}`;
  return { left, right: '', show: 'left', accent: secM.accent, title: 'Mondo' };
}
