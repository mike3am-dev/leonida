/** Personaggi, Radio, Mondo */
import { db, byId } from '../data.js';
import { esc, statusChip, srcBadge } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, insightHtml, tableHtml, vis, sectionOf, discoverBtn, isMet, extrasHtml, haveFilter, passHave, monogram, face } from './shared.js';
import * as progress from '../store/progress.js';
import * as spoiler from '../spoiler.js';
import * as playlist from './playlist.js';
import * as radioView from './radio.js';

const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };
const srcNote = (x) => srcBadge(x);
const fonte = (x) => `<p class="source-line">Fonte: ${esc(x.source)}${x.sourceUrl ? ` · <a href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;

/* ---------- Personaggi ---------- */
const secP = sectionOf('personaggi');
const GROUPS = [
  ['🌴', 'Le Keys: la famiglia di Jason', 'Contrabbando, barche e vita di provincia tra le isole.', ['chr-brian', 'chr-lori', 'chr-cal', 'chr-donnie', 'chr-arnold', 'chr-joey', 'chr-mandy', 'chr-shirley', 'chr-kenton-rees', 'chr-sir-todd-bancroft', 'chr-kirk', 'chr-pilot-pete']],
  ['🌺', 'Il mondo di Lucia', 'La famiglia, le amiche e chi le tiene da parte le cose.', ['chr-tomas', 'chr-mia', 'chr-kat', 'chr-mattia', 'chr-andy', 'chr-cecilia']],
  ['🏨', 'Port Gellhorn e lo Starlet Motel', 'Motel, roulotte e gente che sa sempre qualcosa.', ['chr-linda', 'chr-vicki', 'chr-shayna', 'chr-frankie-delight']],
  ['🎤', 'Vice City: la scena musicale', 'Rapper, produttori e leggende dei club.', ['chr-boobie', 'chr-drequan', 'chr-real-dimez', 'chr-bae-luxe', 'chr-roxy', 'chr-dwnply', 'chr-travis-scott', 'chr-kodak-black']],
  ['💰', 'Il colpo grosso', 'Chi vive di rapine, e chi le rende possibili.', ['chr-raul', 'chr-karim', 'chr-andrea', 'chr-felipe', 'chr-nicole', 'chr-yasmani', 'chr-gil', 'chr-monty', 'chr-evelyn-andrews', 'chr-halifax']],
  ['🏢', 'Megamundo', 'Soldi, potere e sorrisi di plastica.', ['chr-andres', 'chr-petra', 'chr-valentina', 'chr-cesar']],
  ['🏁', 'Strada, gang e corse', 'San4San, corse clandestine e quartieri caldi.', ['chr-raymond', 'chr-ernesto', 'chr-yago', 'chr-aunt-tee', 'chr-tyrone', 'chr-dunk', 'chr-manuel']],
  ['🚔', 'La legge e lo Stato', 'Polizia, penitenziario, tribunali e politica.', ['chr-mendez', 'chr-stefanie', 'chr-erin-henshaw', 'chr-abe-gonzalez']],
  ['🔧', 'Affari e mezzi', 'Meccanici, ricettatori, cacciatori e club di fango.', ['chr-wyman', 'chr-randy', 'chr-moses', 'chr-eddie-acosta', 'chr-bret-vogel', 'chr-kyle', 'chr-billy']],
  ['📻', 'Le voci della radio', 'Chi parla tra una canzone e l\'altra.', ['chr-el-martillo', 'chr-la-gata', 'chr-mw', 'chr-delta-dawne']],
  ['📺', 'Voci, schermi e cult', 'Streamer, mascotte, comparse diventate meme.', ['chr-camillo', 'chr-phil', 'chr-mud-dog-mike', 'chr-macca', 'chr-fede-the-flamingo', 'chr-hammer-lady', 'chr-rudi', 'chr-leonida-joker']],
  ['🎸', 'Band, locali e comparse', 'Gruppi musicali, mascotte e volti visti di sfuggita nei trailer.', ['chr-gutless-wonders', 'chr-the-hummers-the-strummers', 'chr-dolls-of-destruction', 'chr-monalisa', 'chr-sparky-malarky', 'chr-chunkee-the-manatee', 'chr-pinche-the-crab', 'chr-ricky', 'chr-sam-mud-club', 'chr-brittney', 'chr-ej', 'chr-ian', 'chr-krever', 'chr-jimmy-canto', 'chr-lil-ricky-sawdust', 'chr-kenny-brewster']],
  ['🕵️', 'Dai leak (da verificare)', 'Nomi emersi dal leak del 2022: prendili con le pinze.', ['chr-shanese', 'chr-leak-names']],
];
export function renderPersonaggi(params, query = {}) {
  const q = (query.q || '').toLowerCase().trim();
  const have = query.have || '';
  const met = (x) => isMet(x) || !!progress.get().discovered?.[x.id];
  // Modalità vergine: chi non hai ancora incontrato non compare
  const hidden = (x) => spoiler.virgin() && !x.isProtagonist && !isMet(x) && !progress.get().discovered?.[x.id];
  const nHidden = vis(db.characters).filter(hidden).length;
  const chars = vis(db.characters).filter((x) => !hidden(x) && (!q || (x.name + ' ' + (x.role || '')).toLowerCase().includes(q)) && (x.isProtagonist || passHave(have, met(x))));
  const c = params.id ? byId(params.id) : null;
  if (c && hidden(c)) {
    return { left: '', right: `${backLink('/personaggi', 'Personaggi')}<div class="empty"><p><b>Non ancora incontrato.</b></p><p class="muted small">La modalità vergine tiene nascosti i personaggi finché non li incontri nel gioco. Puoi spegnerla in Impostazioni.</p></div>`, show: 'right', accent: secP.accent, title: 'Personaggi' };
  }
  if (c) {
    const right = `
      ${backLink('/personaggi', 'Personaggi')}
      ${c.image || c.imageUrl ? hero(c, { kicker: `${c.role || 'Personaggio'}${c.districtId ? ' · ' + (byId(c.districtId)?.name || '') : ''}`, title: c.name, lede: c.tagline || '', chips: statusChip(c) })
        : `<div class="hero hero--mono">${monogram(c)}<div class="hero__text"><span class="kicker">${esc(c.role || 'Personaggio')}${c.districtId ? ' · ' + esc(byId(c.districtId)?.name || '') : ''}</span><h1>${esc(c.name)}</h1>${c.tagline ? `<p class="lede">${esc(c.tagline)}</p>` : ''}<div class="chips">${statusChip(c)}</div></div></div>`}
      <div class="prose">${spoiler.wrap(c, `<p class="dropcap">${esc(c.bio || 'Scheda in arrivo.')}</p>`)}</div>
      ${extrasHtml(c)}
      <div class="actions">${discoverBtn(c, { label: 'Incontrato', doneLabel: 'Incontrato ✓', auto: isMet(c) && !progress.get().discovered?.[c.id] })}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>
      ${c.idCard?.length ? `<dl class="facts">${c.idCard.map((f) => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join('')}${c.firstSeen ? `<dt>Prima apparizione</dt><dd>${esc(c.firstSeen)}</dd>` : ''}</dl>` : ''}
      ${galleryHtml(c)}
      ${c.insight ? `<div class="block">${acc('Approfondimento', `<div class="prose prose--guide">${spoiler.wrap(c, insightHtml(c.insight))}${tableHtml(c.summaryTable)}<p class="source-line">Tradotto da <a href="${esc(c.insightUrl || 'https://vice-central.com/personnages/')}" target="_blank" rel="noopener">vice-central.com</a>.</p></div>`)}</div>` : ''}
      ${c.relations?.length ? `<div class="block"><span class="kicker">Legami</span><div class="threads"><a class="thread thread--me" href="#/personaggi/${esc(c.id)}"><span class="thread__ava">${face(c, { lazy: false })}</span><span class="thread__name">${esc(c.name.split(' ')[0])}</span></a>${c.relations.map((id) => { const r = byId(id); return r ? `<a class="thread" href="#/personaggi/${esc(id)}"><span class="thread__ava">${face(r)}</span><span class="thread__name">${esc(r.name.split(' ')[0])}</span><span class="thread__role">${esc((r.role || '').slice(0, 28))}</span></a>` : ''; }).join('')}</div></div>` : ''}
      ${c.firstMissionId ? `<div class="block"><span class="kicker">Prima apparizione</span><a class="btn" href="#/missioni/${esc(c.firstMissionId)}">${esc(byId(c.firstMissionId) ? spoiler.missionName(byId(c.firstMissionId)) : 'Missione bloccata')}</a></div>` : ''}
      ${fonte(c)}`;
    return { left: '', right, show: 'right', accent: secP.accent, title: c.name };
  }
  const card = (x) => `<a class="cardx cardx--person" href="#/personaggi/${esc(x.id)}">
    <div class="cardx__img cardx__img--face">${face(x)}</div>
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
    ${nHidden ? `<p class="muted small">${nHidden} ${nHidden === 1 ? 'personaggio nascosto' : 'personaggi nascosti'} finché non li incontri (modalità vergine).</p>` : ''}
    <input class="input" type="search" placeholder="Cerca un personaggio…" value="${esc(q)}" data-char-q aria-label="Cerca un personaggio" style="margin-bottom:var(--s-3)">
    ${haveFilter(have, (v) => `#/personaggi${v ? '?have=' + v : ''}`, { yes: 'Incontrati', no: 'Da incontrare' })}
    ${q ? `<div class="cards">${chars.map(card).join('') || '<p class="muted small">Nessuno.</p>'}</div>` : `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">⭐</span><div><h2>Protagonisti</h2><p>Jason e Lucia: due vite legate da un colpo andato storto.</p></div></div>
    <div class="castboard">${chars.filter((x) => x.isProtagonist).map((x, i) => `<a class="castboard__panel castboard__panel--static" href="#/personaggi/${esc(x.id)}">${face(x, { lazy: false })}<span class="castboard__veil"></span><span class="castboard__text"><span class="castboard__name">${esc(x.name)}</span><span class="castboard__role">${esc(x.role || '')}</span></span></a>`).join('')}</div>
    ${groupHtml}
    ${rest.length ? `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">👥</span><div><h2>Altri</h2></div></div><div class="cards">${rest.map(card).join('')}</div>` : ''}`}`;
  return { left, right: '', show: 'left', accent: secP.accent, title: 'Personaggi' };
}

/* ---------- Radio ---------- */
const secR = sectionOf('radio');
const MUSIC_CATS = ['Colonna sonora', 'Musica'];
const appleSearch = (q) => `https://music.apple.com/it/search?term=${encodeURIComponent(q)}`;
export function renderCultura(params, query = {}) {
  const radio = vis(db.radio), music = vis(db.brands).filter((b) => MUSIC_CATS.includes(b.category));
  let it = params.id ? byId(params.id) : null;
  // Una stazione si apre sul giradischi, non in una scheda a parte
  if (it && it._type === 'radio') { query = { ...query, st: it.id, v: '' }; it = null; }
  // Un marchio che non è musica si apre nel Mondo, non nella Radio
  if (it && it._type === 'brand' && !MUSIC_CATS.includes(it.category)) return renderMondo(params);
  if (it) {
    const tracks = it._type === 'radio' ? playlist.allSongs().filter((x) => x.stationId === it.id) : [];
    const right = `
      ${backLink('/cultura', 'Radio')}
      ${it._type === 'radio' ? `<div class="vinyl-wrap"><div class="vinyl"><div class="vinyl__disc"></div>${it.image ? `<img class="vinyl__label" src="${esc(it.image)}" alt="">` : ''}</div>
          <div><span class="kicker kicker--accent">Stazione radio · ${esc(it.genre || '')}</span><h1>${esc(it.name)}</h1>${it.host ? `<p class="lede">Con ${esc(it.host)}</p>` : ''}<div class="chips">${statusChip(it)}</div></div></div>`
        : hero(it, { kicker: it.category || 'Musica', title: it.name, chips: statusChip(it) })}
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Descrizione in arrivo.')}</p>`)}</div>
      ${tracks.length ? `<div class="block"><span class="kicker">In scaletta (${tracks.length})</span><div class="songs">${tracks.map((x) => playlist.songRow(x, { showStation: false })).join('')}</div>
        <p class="small muted">Tocca il cuore per mettere una canzone nella tua playlist.</p></div>`
        : (it._type === 'radio' ? '<p class="muted small">La scaletta non è ancora nota. Se senti una canzone su questa stazione, aggiungila dalla scheda «La mia playlist».</p>' : '')}
      ${it._type !== 'radio' ? `<div class="actions"><a class="btn btn--solid" href="${appleSearch(it.name)}" target="_blank" rel="noopener">Cerca su Apple Music</a></div>` : ''}
      ${fonte(it)}`;
    return { left: '', right, show: 'right', accent: secR.accent, title: it.name };
  }
  const view = query.v || '';
  const head = `${sectionHead(secR, `${radio.length} stazioni`)}${playlist.tabs(view, playlist.allSongs().length, (progress.get().playlist || []).length)}`;
  if (view === 'canzoni') return { left: head + playlist.songsView(query), right: '', show: 'left', accent: secR.accent, title: 'Canzoni' };
  if (view === 'playlist') return { left: head + playlist.playlistView(), right: '', show: 'left', accent: secR.accent, title: 'La mia playlist' };
  const left = head + radioView.stationsView(query, music);
  return { left, right: '', show: 'left', accent: secR.accent, title: 'Radio' };
}

/* ---------- Mondo: marchi, app, fazioni, TV ---------- */
const secM = sectionOf('mondo');
export function renderMondo(params, query = {}) {
  const all = vis(db.brands).filter((b) => !MUSIC_CATS.includes(b.category) && b.category !== 'Edizione');
  const it = params.id ? byId(params.id) : null;
  if (it) {
    const right = `${backLink('/mondo', 'Mondo')}${hero(it, { kicker: it.category || 'Mondo', title: it.name, chips: statusChip(it) })}
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || '')}</p>`)}</div>${galleryHtml(it)}`;
    return { left: '', right, show: 'right', accent: secM.accent, title: it.name };
  }
  const q = (query.q || '').toLowerCase().trim();
  const EMOJI = { 'Bonus di acquisto': '🎟️', 'App': '📱', 'Gang': '🔫', "Forze dell'ordine": '🚔', 'Azienda': '🏢', 'Etichetta discografica': '💿', 'TV': '📺', 'Pubblicità': '🪧', 'Arma': '🎯', 'Abbonamento': '💳', 'Banche': '🏦', 'Distributori': '⛽', 'Fast food': '🍔', 'Luoghi di ritrovo': '🍹', 'Servizi': '🛠️', 'Negozi': '🛍️', 'Vita notturna': '🪩', 'Hotel': '🏨', 'Minimarket': '🏪', 'Moda': '👗', 'Radio': '📻', 'Bevande': '🥤', 'Squadre sportive': '🏈', 'Trasporti': '🚌', 'Logistica': '📦', 'Ente': '🏛️', 'Negozio di videogiochi': '🎮', 'Mascotte': '🦩' };
  const brandCard = (b) => `<a class="brandcard" href="#/mondo/${esc(b.id)}"><span class="brandcard__img">${b.image ? `<img src="${esc(b.image)}" ${b.imageUrl && b.imageUrl !== b.image ? `data-fallback="${esc(b.imageUrl)}"` : ''} alt="" loading="lazy">` : monogram(b)}</span><span class="brandcard__body"><span class="brandcard__name">${esc(b.name)}</span><span class="brandcard__meta">${esc((b.description || '').slice(0, 70))}…</span></span></a>`;
  const byName = (a, b) => a.name.localeCompare(b.name, 'it');
  let body;
  if (q) {
    const hits = all.filter((b) => (b.name + ' ' + (b.category || '') + ' ' + (b.description || '')).toLowerCase().includes(q)).sort(byName);
    body = hits.length ? `<div class="brandgrid brandgrid--compact">${hits.map(brandCard).join('')}</div>` : '<p class="muted small">Niente con questo nome.</p>';
  } else {
    const groups = {};
    for (const b of all) (groups[b.category || 'Altro'] ||= []).push(b);
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'it'));
    body = keys.map((k) => `<div class="acc mondo-cat"><button class="acc__btn mondo-cat__btn" type="button"><span class="group-head__emoji" aria-hidden="true">${EMOJI[k] || '•'}</span><span class="mondo-cat__text"><b>${esc(k)}</b></span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button><div class="acc__body"><div class="brandgrid brandgrid--compact">${[...groups[k]].sort(byName).map(brandCard).join('')}</div></div></div>`).join('');
  }
  const left = `${sectionHead(secM, `${all.length} voci`)}
    <p class="lede">Marchi, app, gang, polizia, TV: tutto ciò che fa di Leonida un posto vero.</p>
    <input class="input" type="search" placeholder="Cerca un marchio, un locale, un'app…" value="${esc(query.q || '')}" data-mondo-q aria-label="Cerca nel Mondo" style="margin-bottom:var(--s-3)">
    ${body}`;
  return { left, right: '', show: 'left', accent: secM.accent, title: 'Mondo' };
}
