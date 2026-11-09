/** News: notiziario editoriale (notizie con foto) + guide (articoli), in formato rivista */
import { db, byId, TYPE_ROUTE } from '../data.js';
import { esc, statusChip, fmtDate } from '../ui/dom.js';
import { sectionHead, backLink, hero, acc, vis, sectionOf, extrasHtml } from './shared.js';
import { img } from './atlante.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('news');
export const SRC_LABEL = { trailer: 'Ufficiale', stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community', 'gioco-mike': 'Mike' };
export const TOPIC_LABEL = { gameplay: 'Gameplay', mappa: 'Mappa', personaggi: 'Personaggi', veicoli: 'Veicoli', armi: 'Armi', musica: 'Musica', uscita: 'Uscita', tecnica: 'Tecnica', business: 'Business', online: 'Online', community: 'Community' };
const CAT_LABEL = { 'prima-ora': 'Prima ora', generale: 'Da sapere', combattimento: 'Combattimento', soldi: 'Soldi', guida: 'Guida e veicoli', esplorazione: 'Esplorazione', online: 'Online', trasporti: 'Spostarsi', sistemi: 'Sistemi di gioco', tecnica: 'Console', storia: 'Storia', mappa: 'Mappa e luoghi' };
// Foto di ripiego per tema, dalle immagini ufficiali già nella guida
const TOPIC_IMG = { gameplay: 'assets/img/ss-vice-city-27.jpg', mappa: 'assets/img/mappa-leonida.jpg', personaggi: 'assets/img/ss-jason-lucia-14.jpg', veicoli: 'assets/img/veh-grotti-cheetah.jpg', armi: 'assets/img/revolvers.jpg', musica: 'assets/img/the-album.jpg', uscita: 'assets/img/cover-art.jpg', tecnica: 'assets/img/ultimate-edition-01.jpg', business: 'assets/img/ss-port-gellhorn-07.jpg', online: 'assets/img/ss-ambrosia-06.jpg', community: 'assets/img/ss-grassrivers-07.jpg' };
const CAT_IMG = { 'prima-ora': 'assets/img/ultimate-edition.jpg', generale: 'assets/img/ss-vice-city-27.jpg', combattimento: 'assets/img/revolvers.jpg', soldi: 'assets/img/ss-raul-bautista-01.jpg', guida: 'assets/img/veh-vapid-stanier.jpg', esplorazione: 'assets/img/ss-mount-kalaga-01.jpg', trasporti: 'assets/img/ss-port-gellhorn-07.jpg', sistemi: 'assets/img/ss-jason-duval-11.jpg', tecnica: 'assets/img/ultimate-edition-01.jpg', storia: 'assets/img/ss-lucia-caminos-11.jpg', online: 'assets/img/ss-ambrosia-06.jpg' };

/** Immagine di una notizia o guida: la sua, altrimenti quella della voce collegata, altrimenti per tema */
export function newsImage(n) {
  if (n.image) return n.image;
  if (n.imageUrl) return n.imageUrl;
  if (n._type === 'guida') { const b = (n.blocks || []).find((x) => x.t === 'img'); return b ? (b.local || b.src) : 'assets/img/mappa-leonida.jpg'; }
  for (const id of n.relatedIds || []) { const r = byId(id); if (r?.image) return r.image; if (r?.hero?.src) return r.hero.local || r.hero.src; }
  return n._type === 'tip' ? (CAT_IMG[n.category] || 'assets/img/ss-vice-city-27.jpg') : (TOPIC_IMG[n.topic] || 'assets/img/cover-art.jpg');
}

function guideBody(g) {
  let out = '', list = [], table = [];
  const flushList = () => { if (list.length) { out += `<ul>${list.map((t) => `<li>${t}</li>`).join('')}</ul>`; list = []; } };
  const flushTable = () => { if (table.length) { out += `<div class="table-wrap"><table>${table.map((r, i) => `<tr>${r.map((c) => `<${i === 0 ? 'th' : 'td'}>${esc(c)}</${i === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</table></div>`; table = []; } };
  const linkify = (b) => { let t = esc(b.text); for (const l of b.links || []) { const slug = l.split('/').pop(); const p = (db.luoghi || []).find((x) => x.slug === slug); if (p && t.includes(esc(p.name))) t = t.replace(esc(p.name), `<a href="#/mappa/luogo/${esc(slug)}">${esc(p.name)}</a>`); } return t; };
  for (const b of g.blocks || []) {
    if (b.t !== 'li') flushList(); if (b.t !== 'tr') flushTable();
    if (b.t === 'h2') out += `<h2>${esc(b.text)}</h2>`;
    else if (b.t === 'h3') out += `<h3>${esc(b.text)}</h3>`;
    else if (b.t === 'p') out += `<p>${linkify(b)}</p>`;
    else if (b.t === 'li') list.push(linkify(b));
    else if (b.t === 'tr') table.push(b.cells);
    else if (b.t === 'img') out += `<figure>${img(b.local, b.src, '', b.alt)}${b.alt ? `<figcaption>${esc(b.alt)}</figcaption>` : ''}</figure>`;
  }
  flushList(); flushTable();
  return out;
}

const segmented = (tipo) => `<div class="segmented" role="group" aria-label="Tipo" style="margin-bottom:var(--s-4)">
      ${[['tutto', 'Tutto'], ['notizie', 'Notizie'], ['guide', 'Guide'], ['teorie', 'Teorie']].map(([k, l]) => `<a role="button" aria-pressed="${tipo === k}" href="#/news${k === 'tutto' ? '' : '?tipo=' + k}">${l}</a>`).join('')}
    </div>`;

/** Il tavolo delle teorie: post-it per stato, con puntina colorata */
const TSTATUS = { confermata: ['Confermate', 'ok'], aperta: ['In discussione', 'viola'], rumor: ['Rumor', 'giallo'], smentita: ['Smentite', 'rosa'] };
function teorieBoard() {
  const all = db.teorie || [];
  if (!all.length) return '<div class="placeholder"><strong>Nessuna teoria</strong></div>';
  return `<p class="lede">Le teorie della community, valutate da vice-central.com e tradotte: cosa le sostiene, cosa le indebolisce, com'è finita.</p>
    <div class="tboard">${Object.entries(TSTATUS).map(([k, [label, col]]) => { const list = all.filter((t) => t.verdict === k); return `<section class="tboard__col tboard__col--${col}"><h3 class="tboard__head">${esc(label)} <span class="count">${list.length}</span></h3>
      ${list.map((t, i) => `<article class="tnote" style="--rot:${((i * 5) % 7) - 3}deg"><span class="tnote__pin"></span>
        ${spoiler.wrap(t, `<h4>${esc(t.title)}</h4>
        <p class="small">${esc((t.summary || '').slice(0, 260))}${(t.summary || '').length > 260 ? '…' : ''}</p>
        ${acc('Prove e dettagli', `<div class="prose small">${t.origin ? `<p><b>Origine:</b> ${esc(t.origin)}</p>` : ''}${t.concerns ? `<p><b>Riguarda:</b> ${esc(t.concerns)}</p>` : ''}<p>${esc(t.summary || '')}</p>${t.evidence?.length ? `<ul>${t.evidence.map((e) => `<li>${esc(typeof e === 'string' ? e : e.text || JSON.stringify(e))}</li>`).join('')}</ul>` : ''}${t.statusNote ? `<p class="muted">${esc(t.statusNote)}</p>` : ''}<p class="source-line"><a href="${esc(t.sourceUrl || '')}" target="_blank" rel="noopener">vice-central.com</a>${t.updatedAt ? ' · ' + esc(t.updatedAt) : ''}</p></div>`)}`, 'Teoria sulla trama')}
      </article>`).join('') || '<p class="small muted">Nessuna.</p>'}</section>`; }).join('')}</div>`;
}

function article(it) {
  const isTip = it._type === 'tip', isGuide = it._type === 'guida';
  const kicker = isGuide ? 'Guida · gtasixmap.com' : isTip ? `Guida · ${CAT_LABEL[it.category] || it.category}` : `${fmtDate(it.date, { day: 'numeric', month: 'long', year: 'numeric' })} · ${TOPIC_LABEL[it.topic] || it.topic}${it.outlet ? ' · ' + it.outlet : ''}`;
  const im = newsImage(it);
  const fb = isGuide ? (it.blocks || []).find((x) => x.t === 'img')?.src : null;
  return `
    ${backLink('/news', 'News')}
    <div class="hero">${im ? `<img src="${esc(im)}" ${fb && fb !== im ? `data-fallback="${esc(fb)}"` : ''} alt=""><div class="hero__veil"></div>` : ''}
      <div class="hero__chips chips">${statusChip(it)}</div>
      <div class="hero__text"><span class="kicker">${esc(kicker)}</span><h1>${esc(it.title)}</h1>${isGuide && it.lead ? `<p class="lede">${esc(it.lead)}</p>` : ''}</div></div>
    ${isGuide ? `<div class="prose prose--guide">${guideBody(it)}</div><p class="source-line">Tradotto da <a href="${esc(it.url)}" target="_blank" rel="noopener">gtasixmap.com</a>. Screenshot © Rockstar Games.</p>`
      : `<div class="prose">${spoiler.wrap(it, paras(it.body))}</div>${extrasHtml(it)}`}
    ${it.relatedIds?.length ? `<div class="block"><span class="kicker">Nella guida</span><div class="chips" style="margin-top:var(--s-2)">${it.relatedIds.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#${TYPE_ROUTE[r._type]?.(r) || '/'}">${esc(r.name || r.title)}</a>` : ''; }).join('')}</div></div>` : ''}
    <div class="actions">${it.sourceUrl ? `<a class="btn btn--solid" href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">Leggi la fonte</a>` : ''}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>`;
}

/** Corpo della notizia: paragrafi separati da una riga vuota; «Dove e quando:» all'inizio va in grassetto */
function paras(body = '') {
  return String(body).split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean).map((t) => {
    const m = t.match(/^([^:.!?]{2,32}):\s+(.*)$/s);
    return m ? `<p><b>${esc(m[1])}:</b> ${esc(m[2])}</p>` : `<p>${esc(t)}</p>`;
  }).join('');
}
/** <img> con ripiego online per le guide le cui foto non sono ancora state scaricate */
export function newsImgTag(x) {
  const src = newsImage(x); const fb = x._type === 'guida' ? (x.blocks || []).find((b) => b.t === 'img')?.src : null;
  return `<img src="${esc(src)}" ${fb && fb !== src ? `data-fallback="${esc(fb)}"` : ''} alt="" loading="lazy">`;
}
/** Apertura da prima pagina: foto grande, titolo enorme, timbro inclinato */
const frontpage = (x) => `<a class="frontpage" href="#/news/${esc(x.id)}">
    ${newsImgTag(x)}<span class="frontpage__veil"></span>
    <span class="stamp">${(statusChip(x).match(/>([^<]+)</) || [])[1] || ''}</span>
    <span class="frontpage__text"><span class="frontpage__kicker">${x._type === 'news' ? esc(fmtDate(x.date, { weekday: 'long', day: 'numeric', month: 'long' })) : 'Guida'}${x.outlet ? ' · ' + esc(x.outlet) : ''}</span><span class="frontpage__title">${spoiler.isHidden(x) ? '⚠ Contiene spoiler' : esc(x.title)}</span><span class="frontpage__excerpt">${spoiler.isHidden(x) ? '' : esc((x.body || x.lead || '').slice(0, 180))}…</span></span></a>`;
const card = (x, wide = false) => `<a class="cardx ${wide ? 'cardx--wide' : ''}" href="#/news/${esc(x.id)}">
    <div class="cardx__img">${newsImgTag(x)}<span class="cardx__badge chips">${statusChip(x)}</span></div>
    <div class="cardx__body"><div class="cardx__kicker">${x._type === 'news' ? esc(fmtDate(x.date, { day: 'numeric', month: 'long' })) : 'Guida'}${x.outlet ? ' · ' + esc(x.outlet) : ''}${x._type === 'tip' ? ' · ' + esc(CAT_LABEL[x.category] || x.category) : ''}</div><div class="cardx__title">${spoiler.isHidden(x) ? '⚠ Contiene spoiler' : esc(x.title)}</div>${wide ? `<div class="cardx__excerpt">${spoiler.isHidden(x) ? '' : esc((x.body || x.lead || '').slice(0, 160))}…</div>` : ''}</div></a>`;
/** La notizia più «scottante» del giorno: ufficiale > stampa > community > rumor > leak, poi la più lunga */
const HOT = { trailer: 0, stampa: 1, community: 2, rumor: 3, leak: 4 };
const hottest = (items) => [...items].sort((a, b) => (HOT[a.source] ?? 9) - (HOT[b.source] ?? 9) || (b.body || '').length - (a.body || '').length)[0];
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
/** Timeline: un nodo per giorno, la scottante in evidenza, le altre come titoli da aprire */
function timeline(groups) {
  let lastMonth = '';
  return [...groups].map(([day, items]) => {
    const d = new Date(day + 'T00:00:00'); const mk = `${d.getFullYear()}-${d.getMonth()}`;
    const monthHead = mk !== lastMonth ? `<div class="tl-month"><span>${esc(d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }))}</span></div>` : ''; lastMonth = mk;
    const hot = hottest(items); const rest = items.filter((n) => n !== hot);
    return `${monthHead}<section class="tl-day">
      <div class="tl-node"><b>${d.getDate()}</b><small>${MONTHS[d.getMonth()]}</small><i></i></div>
      <div class="tl-body">
        <a class="tl-hot" href="#/news/${esc(hot.id)}"><span class="tl-hot__img">${newsImgTag(hot)}</span><span class="tl-hot__text"><span class="tl-hot__kicker">🔥 La scottante · ${esc(SRC_LABEL[hot.source] || '')}${hot.outlet ? ' · ' + esc(hot.outlet) : ''}</span><span class="tl-hot__title">${spoiler.isHidden(hot) ? '⚠ Contiene spoiler' : esc(hot.title)}</span></span></a>
        ${rest.length ? `<div class="tl-rest">${rest.map((n) => `<a class="tl-item" href="#/news/${esc(n.id)}"><span class="tl-item__src tl-item__src--${esc(n.source)}">${esc((SRC_LABEL[n.source] || '').slice(0, 3))}</span><span>${spoiler.isHidden(n) ? '⚠ Contiene spoiler' : esc(n.title)}</span></a>`).join('')}</div>` : ''}
        <span class="tl-count">${items.length} notizi${items.length === 1 ? 'a' : 'e'}</span>
      </div></section>`;
  }).join('');
}
const newsRow = (n) => `<a class="newsrow" href="#/news/${esc(n.id)}">
    <span class="newsrow__img">${newsImgTag(n)}</span>
    <span class="newsrow__body"><span class="newsrow__kicker">${esc(SRC_LABEL[n.source] || '')} · ${esc(TOPIC_LABEL[n.topic] || n.topic)}${n.outlet ? ' · ' + esc(n.outlet) : ''}</span><span class="newsrow__title">${spoiler.isHidden(n) ? '⚠ Contiene spoiler' : esc(n.title)}</span><span class="newsrow__excerpt">${spoiler.isHidden(n) ? '' : esc((n.body || '').slice(0, 110))}…</span></span></a>`;

/** Fonti e ringraziamenti: un posto solo, invece della riga «Fonte» in fondo a ogni scheda */
const CREDITS = [
  ['Rockstar Games', 'rockstargames.com', 'Trailer, screenshot, artwork e testi ufficiali di GTA VI.'],
  ['GTA VI Mapping Community · YANIS v16', 'gtasixmap.com', 'La mappa di Leonida, le 44 schede dei luoghi, le tessere di dettaglio.'],
  ['gtadb.org e collaboratori', 'gtadb.org', 'Punti di riferimento ritagliati e abbinati al mondo reale (CC BY 4.0).'],
  ['Vice Central', 'vice-central.com', 'Personaggi, ruota delle armi, fauna, luoghi, teorie e analisi.'],
  ['GTA6Bible', 'gta6bible.com', 'Veicoli, personaggi, armi e attività.'],
  ['GTA Wiki', 'gta.fandom.com', 'Schede, scalette radio, foto dei veicoli.'],
  ['GTABase', 'gtabase.com', 'Animali, armi e veicoli identificati dalla community.'],
  ['La stampa', '', 'Game Informer, IGN, GameSpot, Eurogamer, PC Gamer, VG247, Push Square, Kotaku, Insider Gaming, Edge, Bloomberg, Multiplayer.it, Everyeye, Spaziogames.'],
  ['La community', '', 'r/GTA6, GTAForums e il Discord dei mappatori: rumor e leak sono sempre etichettati.'],
];
function creditsHtml() {
  const count = new Map();
  const add = (u) => { try { const h = new URL(u).hostname.replace(/^www\./, ''); count.set(h, (count.get(h) || 0) + 1); } catch {} };
  for (const k of ['missions', 'districts', 'collectibles', 'activities', 'characters', 'radio', 'brands', 'tips', 'vehicles', 'weapons', 'news', 'trophies', 'teorie']) for (const x of db[k] || []) if (x.sourceUrl) add(x.sourceUrl);
  for (const l of db.luoghi || []) { if (l.url) add(l.url); for (const so of l.sources || []) add(so.url); }
  const top = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
  return `<section class="block credits" id="fonti"><header class="section-head section-head--sub"><div><span class="kicker">In fondo, ma prima di tutto</span><h2>Fonti e ringraziamenti</h2></div></header>
    <p class="small muted">Questa guida esiste grazie al lavoro di altri. Qui c'è chi ringraziare, una volta sola, invece di una riga in fondo a ogni scheda.</p>
    <ul class="flist credits__list">${CREDITS.map(([n, h, t]) => `<li><b>${h ? `<a href="https://${h}" target="_blank" rel="noopener">${esc(n)}</a>` : esc(n)}</b><span>${esc(t)}</span></li>`).join('')}</ul>
    ${acc('Tutti i siti citati', `<div class="chips">${top.map(([h, n]) => `<a class="chip" href="https://${esc(h)}" target="_blank" rel="noopener">${esc(h)} · ${n}</a>`).join('')}</div>`)}
  </section>`;
}

export function render(params, query) {
  const it = params.id ? byId(params.id) : null;
  if (it) return { left: '', right: article(it), show: 'right', accent: section.accent, title: it.title };

  const tipo = query.tipo || 'tutto';           // tutto | notizie | guide | teorie
  if (tipo === 'teorie') return { left: `${sectionHead(section, `${(db.teorie || []).length} teorie`)}${segmented(tipo)}${teorieBoard()}`, right: '', show: 'left', accent: section.accent, title: 'Teorie' };
  const src = query.fonte || '';
  const topic = query.tema || '';
  const news = vis(db.news), tips = vis(db.tips).sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
  const guides = db.guide || [];
  const link = (k, v) => { const p = new URLSearchParams(); if (tipo !== 'tutto') p.set('tipo', tipo); if (src) p.set('fonte', src); if (topic) p.set('tema', topic); if (v) p.set(k, v); else p.delete(k); return `#/news${p.toString() ? '?' + p : ''}`; };

  const featured = tipo === 'guide' ? [...guides.slice(0, 1), ...tips.slice(0, 2)] : tipo === 'notizie' ? news.slice(0, 3) : [news.find((n) => n.source === 'trailer') || news[0], news[1], guides[0] || tips[0]].filter(Boolean);

  let body = '';
  if (tipo !== 'notizie') {
    const cats = [...new Set(tips.map((t) => t.category))];
    body += `<div class="block"><span class="kicker" style="display:block;margin-bottom:var(--s-2)">Guide da leggere</span>
      <div class="filters">${guides.length ? `<a class="filter" role="button" aria-pressed="${topic === 'mappa'}" href="${link('tema', topic === 'mappa' ? '' : 'mappa')}">Mappa e luoghi <span class="muted">${guides.length}</span></a>` : ''}${cats.map((c) => `<a class="filter" role="button" aria-pressed="${topic === c}" href="${link('tema', topic === c ? '' : c)}">${esc(CAT_LABEL[c] || c)} <span class="muted">${tips.filter((t) => t.category === c).length}</span></a>`).join('')}</div>
      ${(topic === 'mappa' || !topic) && guides.length ? `<div class="cards">${(topic ? guides : guides.slice(0, 2)).map((g) => card(g)).join('')}</div>` : ''}
      ${topic !== 'mappa' ? `<div class="cards">${tips.filter((t) => !topic || t.category === topic).slice(0, topic ? 99 : 4).map((t) => card(t)).join('')}</div>` : ''}
      ${!topic && tips.length > 4 ? `<a class="btn btn--ghost btn--block" href="${link('tipo', 'guide')}" style="margin-top:var(--s-3)">Tutte le ${tips.length + guides.length} guide</a>` : ''}</div>`;
  }
  if (tipo !== 'guide') {
    const list = news.filter((n) => (!src || n.source === src) && (!topic || n.topic === topic));
    const cs = news.reduce((m, n) => { m[n.source] = (m[n.source] || 0) + 1; return m; }, {});
    const groups = new Map(); for (const n of list) { if (!groups.has(n.date)) groups.set(n.date, []); groups.get(n.date).push(n); }
    body += `<div class="block"><span class="kicker" style="display:block;margin-bottom:var(--s-2)">Notizie, giorno per giorno</span>
      <div class="filters"><a class="filter" role="button" aria-pressed="${!src}" href="${link('fonte', '')}">Tutte</a>${['trailer', 'stampa', 'rumor', 'leak', 'community'].filter((s) => cs[s]).map((s) => `<a class="filter" role="button" aria-pressed="${src === s}" href="${link('fonte', s)}">${SRC_LABEL[s]} <span class="muted">${cs[s]}</span></a>`).join('')}</div>
      <div class="filters"><a class="filter" role="button" aria-pressed="${!topic}" href="${link('tema', '')}">Tutti i temi</a>${Object.keys(TOPIC_LABEL).filter((t) => news.some((n) => n.topic === t)).map((t) => `<a class="filter" role="button" aria-pressed="${topic === t}" href="${link('tema', t)}">${TOPIC_LABEL[t]}</a>`).join('')}</div>
      ${timeline(groups) || '<div class="placeholder"><strong>Niente qui</strong>Nessuna notizia corrisponde ai filtri.</div>'}</div>`;
  }
  const left = `${sectionHead(section, `${news.length} notizie · ${tips.length + guides.length} guide`)}
    ${segmented(tipo)}
    ${featured[0] ? frontpage(featured[0]) : ''}
    <div class="cards cards--feat">${featured.slice(1).map((x) => card(x)).join('')}</div>
    ${body}
    ${creditsHtml()}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'News' };
}
