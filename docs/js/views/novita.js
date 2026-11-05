import { db, byId, TYPE_ROUTE } from '../data.js';
import { esc, statusChip, fmtDate } from '../ui/dom.js';
import { chapterHead, runningHead, backLink, opener, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('novita');
export const SRC_LABEL = { trailer: 'Ufficiale', stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community', 'gioco-mike': 'Mike' };
export const TOPIC_LABEL = { gameplay: 'Gameplay', mappa: 'Mappa', personaggi: 'Personaggi', veicoli: 'Veicoli', armi: 'Armi', musica: 'Musica', uscita: 'Uscita', tecnica: 'Tecnica', business: 'Business', online: 'Online', community: 'Community' };

export function render(params, query) {
  const all = vis(db.news);
  const src = query.fonte || '';
  const topic = query.tema || '';
  const list = all.filter((n) => (!src || n.source === src) && (!topic || n.topic === topic));
  const it = params.id ? byId(params.id) : null;
  const link = (k, v) => { const p = new URLSearchParams(); if (src) p.set('fonte', src); if (topic) p.set('tema', topic); if (v) p.set(k, v); else p.delete(k); return `#/novita${p.toString() ? '?' + p : ''}`; };
  const groups = new Map();
  for (const n of list) { const k = n.date; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(n); }
  const counts = (key) => all.reduce((m, n) => { m[n[key]] = (m[n[key]] || 0) + 1; return m; }, {});
  const cs = counts('source'), ct = counts('topic');

  const left = `${chapterHead(section, { kicker: 'Capitolo nono', title: 'Novità', lede: 'Tutto quello che è uscito, giorno per giorno. Ogni voce dice da dove viene.' })}
    <span class="kicker">Affidabilità</span>
    <div class="filters" role="group">
      <a class="filter" role="button" aria-pressed="${!src}" href="${link('fonte', '')}">Tutte <span class="muted">${all.length}</span></a>
      ${['trailer', 'stampa', 'rumor', 'leak', 'community'].filter((s) => cs[s]).map((s) => `<a class="filter" role="button" aria-pressed="${src === s}" href="${link('fonte', s)}">${SRC_LABEL[s]} <span class="muted">${cs[s]}</span></a>`).join('')}
    </div>
    <span class="kicker">Tema</span>
    <div class="filters" role="group">
      <a class="filter" role="button" aria-pressed="${!topic}" href="${link('tema', '')}">Tutti</a>
      ${Object.keys(TOPIC_LABEL).filter((t) => ct[t]).map((t) => `<a class="filter" role="button" aria-pressed="${topic === t}" href="${link('tema', t)}">${TOPIC_LABEL[t]} <span class="muted">${ct[t]}</span></a>`).join('')}
    </div>
    ${list.length ? [...groups].map(([day, items]) => `<div class="toc__section"><span class="kicker">${esc(fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</span>
      ${items.map((n) => `<a class="toc__row" href="#/novita/${esc(n.id)}${src || topic ? '?' + new URLSearchParams({ ...(src ? { fonte: src } : {}), ...(topic ? { tema: topic } : {}) }) : ''}" ${n.id === it?.id ? 'aria-current="page"' : ''}>
        <span class="toc__num" style="font-size:.7rem;font-style:normal;letter-spacing:.08em">${esc((SRC_LABEL[n.source] || '').slice(0, 3).toUpperCase())}</span>
        <span><span class="toc__title">${spoiler.isHidden(n) ? '<span class="muted">• • •</span>' : esc(n.title)}</span><span class="toc__meta">${esc(TOPIC_LABEL[n.topic] || n.topic)}${n.outlet ? ' · ' + esc(n.outlet) : ''}</span></span>
        <span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`).join('')}</div>`).join('')
      : '<div class="placeholder"><strong>Nessuna novità</strong>Niente corrisponde ai filtri.</div>'}`;

  const right = it ? `
    ${backLink('/novita', 'Novità')}
    ${runningHead(fmtDate(it.date, { day: 'numeric', month: 'long', year: 'numeric' }), TOPIC_LABEL[it.topic] || it.topic)}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(it)}</div>
    <h1>${esc(it.title)}</h1>
    ${it.image ? `<img src="${esc(it.image)}" alt="" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    <hr class="rule">
    <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.body)}</p>`)}</div>
    ${it.relatedIds?.length ? `<div class="block"><span class="kicker">Nella guida</span><div class="chips">${it.relatedIds.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#${TYPE_ROUTE[r._type]?.(r) || '/'}">${esc(r.name || r.title)}</a>` : ''; }).join('')}</div></div>` : ''}
    <p class="source-line">${esc(SRC_LABEL[it.source] || it.source)}${it.outlet ? ` · ${esc(it.outlet)}` : ''}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">leggi la fonte</a>` : ''}</p>`
    : opener(section, 'Un registro di tutto ciò che è uscito su GTA VI, in ordine di tempo. «Ufficiale» è Rockstar; «Stampa» chi ha giocato o intervistato; «Rumor» gli insider; «Leak» il materiale trapelato; «Community» le analisi dei fan.');
  return { left, right, show: it ? 'right' : 'left', accent: section.accent, title: it?.title || 'Novità' };
}
