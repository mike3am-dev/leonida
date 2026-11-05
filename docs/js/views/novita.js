import { db, byId, TYPE_ROUTE } from '../data.js';
import { esc, statusChip, fmtDate } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('novita');
export const SRC_LABEL = { trailer: 'Ufficiale', stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community', 'gioco-mike': 'Mike' };
export const TOPIC_LABEL = { gameplay: 'Gameplay', mappa: 'Mappa', personaggi: 'Personaggi', veicoli: 'Veicoli', armi: 'Armi', musica: 'Musica', uscita: 'Uscita', tecnica: 'Tecnica', business: 'Business', online: 'Online', community: 'Community' };

export function render(params, query) {
  const all = vis(db.news);
  const src = query.fonte || '';
  const topic = query.tema || '';
  const it = params.id ? byId(params.id) : null;
  if (it) {
    const right = `
      ${backLink('/novita', 'Novità')}
      ${hero(it, { kicker: `${fmtDate(it.date, { day: 'numeric', month: 'long', year: 'numeric' })} · ${TOPIC_LABEL[it.topic] || it.topic}${it.outlet ? ' · ' + it.outlet : ''}`, title: it.title, chips: statusChip(it) })}
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.body)}</p>`, 'Questa notizia contiene spoiler')}</div>
      ${it.relatedIds?.length ? `<div class="block"><span class="kicker">Nella guida</span><div class="chips" style="margin-top:var(--s-2)">${it.relatedIds.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#${TYPE_ROUTE[r._type]?.(r) || '/'}">${esc(r.name || r.title)}</a>` : ''; }).join('')}</div></div>` : ''}
      <div class="actions">${it.sourceUrl ? `<a class="btn btn--solid" href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">Leggi la fonte</a>` : ''}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>`;
    return { left: '', right, show: 'right', accent: section.accent, title: it.title };
  }
  const list = all.filter((n) => (!src || n.source === src) && (!topic || n.topic === topic));
  const link = (k, v) => { const p = new URLSearchParams(); if (src) p.set('fonte', src); if (topic) p.set('tema', topic); if (v) p.set(k, v); else p.delete(k); return `#/novita${p.toString() ? '?' + p : ''}`; };
  const groups = new Map();
  for (const n of list) { if (!groups.has(n.date)) groups.set(n.date, []); groups.get(n.date).push(n); }
  const counts = (key) => all.reduce((m, n) => { m[n[key]] = (m[n[key]] || 0) + 1; return m; }, {});
  const cs = counts('source'), ct = counts('topic');
  const left = `${sectionHead(section, `${list.length} notizie`)}
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
    ${list.length ? [...groups].map(([day, items]) => `<div class="block" style="margin-top:var(--s-4)"><span class="kicker" style="display:block;margin-bottom:var(--s-1)">${esc(fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</span>
      ${items.map((n) => row({ href: `#/novita/${n.id}${src || topic ? '?' + new URLSearchParams({ ...(src ? { fonte: src } : {}), ...(topic ? { tema: topic } : {}) }) : ''}`, thumb: n.image, num: (SRC_LABEL[n.source] || '').slice(0, 3).toUpperCase(),
        title: spoiler.isHidden(n) ? '<span class="muted">⚠ Contiene spoiler</span> ' + esc(n.title.split(':')[0]) : esc(n.title),
        meta: `${esc(TOPIC_LABEL[n.topic] || n.topic)}${n.outlet ? ' · ' + esc(n.outlet) : ''}` })).join('')}</div>`).join('')
      : '<div class="placeholder"><strong>Nessuna novità</strong>Niente corrisponde ai filtri.</div>'}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Novità' };
}
