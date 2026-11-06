/** News: notizie (pillole) + guide (articoli), in formato rivista */
import { db, byId, TYPE_ROUTE } from '../data.js';
import { esc, statusChip, fmtDate } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('news');
export const SRC_LABEL = { trailer: 'Ufficiale', stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community', 'gioco-mike': 'Mike' };
export const TOPIC_LABEL = { gameplay: 'Gameplay', mappa: 'Mappa', personaggi: 'Personaggi', veicoli: 'Veicoli', armi: 'Armi', musica: 'Musica', uscita: 'Uscita', tecnica: 'Tecnica', business: 'Business', online: 'Online', community: 'Community' };
const CAT_LABEL = { 'prima-ora': 'Prima ora', generale: 'Da sapere', combattimento: 'Combattimento', soldi: 'Soldi', guida: 'Guida e veicoli', esplorazione: 'Esplorazione', online: 'Online', trasporti: 'Spostarsi', sistemi: 'Sistemi di gioco', tecnica: 'Console', storia: 'Storia' };

function article(it) {
  const isTip = it._type === 'tip';
  const kicker = isTip ? `Guida · ${CAT_LABEL[it.category] || it.category}` : `${fmtDate(it.date, { day: 'numeric', month: 'long', year: 'numeric' })} · ${TOPIC_LABEL[it.topic] || it.topic}${it.outlet ? ' · ' + it.outlet : ''}`;
  return `
    ${backLink('/news', 'News')}
    ${hero(it, { kicker, title: it.title, chips: statusChip(it) })}
    <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.body)}</p>`, 'Questa notizia contiene spoiler')}</div>
    ${it.relatedIds?.length ? `<div class="block"><span class="kicker">Nella guida</span><div class="chips" style="margin-top:var(--s-2)">${it.relatedIds.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#${TYPE_ROUTE[r._type]?.(r) || '/'}">${esc(r.name || r.title)}</a>` : ''; }).join('')}</div></div>` : ''}
    <div class="actions">${it.sourceUrl ? `<a class="btn btn--solid" href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">Leggi la fonte</a>` : ''}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>`;
}

export function render(params, query) {
  const it = params.id ? byId(params.id) : null;
  if (it) return { left: '', right: article(it), show: 'right', accent: section.accent, title: it.title };

  const tipo = query.tipo || 'tutto';           // tutto | notizie | guide
  const src = query.fonte || '';
  const topic = query.tema || '';
  const news = vis(db.news), tips = vis(db.tips).sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
  const link = (k, v) => { const p = new URLSearchParams(); if (tipo !== 'tutto') p.set('tipo', tipo); if (src) p.set('fonte', src); if (topic) p.set('tema', topic); if (v) p.set(k, v); else p.delete(k); return `#/news${p.toString() ? '?' + p : ''}`; };

  // In evidenza: l'ultima ufficiale, la guida più importante, la notizia più letta per tema
  const featured = tipo === 'guide' ? tips.slice(0, 3) : tipo === 'notizie' ? news.slice(0, 3) : [news.find((n) => n.source === 'trailer') || news[0], tips[0], tips[1]].filter(Boolean);
  const card = (x) => `<a class="cardx ${x === featured[0] ? 'cardx--wide' : ''}" href="#/news/${esc(x.id)}">
      <div class="cardx__img ${x.image ? '' : 'cardx__img--text'}">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : `<span class="cardx__big">${esc(x._type === 'tip' ? (CAT_LABEL[x.category] || 'Guida') : (TOPIC_LABEL[x.topic] || 'News'))}</span>`}<span class="cardx__badge chips">${statusChip(x)}</span></div>
      <div class="cardx__body"><div class="cardx__title">${spoiler.isHidden(x) ? '⚠ Contiene spoiler' : esc(x.title)}</div><div class="cardx__meta">${x._type === 'tip' ? 'Guida' : esc(fmtDate(x.date, { day: 'numeric', month: 'long' }))}${x.outlet ? ' · ' + esc(x.outlet) : ''}</div></div></a>`;

  let body = '';
  if (tipo !== 'notizie') {
    const cats = [...new Set(tips.map((t) => t.category))];
    body += `<div class="block"><span class="kicker" style="display:block;margin-bottom:var(--s-2)">Guide da leggere</span>
      <div class="filters">${cats.map((c) => `<a class="filter" role="button" aria-pressed="${topic === c}" href="${link('tema', topic === c ? '' : c)}">${esc(CAT_LABEL[c] || c)} <span class="muted">${tips.filter((t) => t.category === c).length}</span></a>`).join('')}</div>
      ${tips.filter((t) => !topic || t.category === topic).slice(0, topic ? 99 : 8).map((t) => row({ href: `#/news/${t.id}`, icon: 'i-bolt', title: esc(t.title), meta: `${esc(CAT_LABEL[t.category] || t.category)} · ${esc(t.body.slice(0, 90))}…` })).join('')}
      ${!topic && tips.length > 8 ? `<a class="btn btn--ghost btn--block" href="${link('tipo', 'guide')}" style="margin-top:var(--s-3)">Tutte le ${tips.length} guide</a>` : ''}</div>`;
  }
  if (tipo !== 'guide') {
    const list = news.filter((n) => (!src || n.source === src) && (!topic || n.topic === topic));
    const cs = news.reduce((m, n) => { m[n.source] = (m[n.source] || 0) + 1; return m; }, {});
    const groups = new Map(); for (const n of list) { if (!groups.has(n.date)) groups.set(n.date, []); groups.get(n.date).push(n); }
    body += `<div class="block"><span class="kicker" style="display:block;margin-bottom:var(--s-2)">Notizie, giorno per giorno</span>
      <div class="filters"><a class="filter" role="button" aria-pressed="${!src}" href="${link('fonte', '')}">Tutte</a>${['trailer', 'stampa', 'rumor', 'leak', 'community'].filter((s) => cs[s]).map((s) => `<a class="filter" role="button" aria-pressed="${src === s}" href="${link('fonte', s)}">${SRC_LABEL[s]} <span class="muted">${cs[s]}</span></a>`).join('')}</div>
      <div class="filters"><a class="filter" role="button" aria-pressed="${!topic}" href="${link('tema', '')}">Tutti i temi</a>${Object.keys(TOPIC_LABEL).filter((t) => news.some((n) => n.topic === t)).map((t) => `<a class="filter" role="button" aria-pressed="${topic === t}" href="${link('tema', t)}">${TOPIC_LABEL[t]}</a>`).join('')}</div>
      ${[...groups].map(([day, items]) => `<span class="kicker" style="display:block;margin:var(--s-4) 0 var(--s-1)">${esc(fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</span>
        ${items.map((n) => row({ href: `#/news/${n.id}`, thumb: n.image, num: (SRC_LABEL[n.source] || '').slice(0, 3).toUpperCase(), title: spoiler.isHidden(n) ? '⚠ Contiene spoiler' : esc(n.title), meta: `${esc(TOPIC_LABEL[n.topic] || n.topic)}${n.outlet ? ' · ' + esc(n.outlet) : ''}` })).join('')}`).join('') || '<div class="placeholder"><strong>Niente qui</strong>Nessuna notizia corrisponde ai filtri.</div>'}</div>`;
  }
  const left = `${sectionHead(section, `${news.length} notizie · ${tips.length} guide`)}
    <div class="segmented" role="group" aria-label="Tipo" style="margin-bottom:var(--s-4)">
      ${[['tutto', 'Tutto'], ['notizie', 'Notizie'], ['guide', 'Guide']].map(([k, l]) => `<a role="button" aria-pressed="${tipo === k}" href="#/news${k === 'tutto' ? '' : '?tipo=' + k}">${l}</a>`).join('')}
    </div>
    <div class="cards">${featured.map(card).join('')}</div>
    ${body}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'News' };
}
