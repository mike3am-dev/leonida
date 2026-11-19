import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, galleryHtml, vis, sectionOf, extrasHtml, haveFilter, passHave } from './shared.js';
import * as spoiler from '../spoiler.js';
import { specSheet } from './specs.js';

const section = sectionOf('garage');
export const CLASS_LABEL = {
  super: 'Super', sportiva: 'Sportive', berlina: 'Berline', suv: 'SUV', fuoristrada: 'Fuoristrada', muscle: 'Muscle', classica: 'Classiche', coupe: 'Coupé',
  moto: 'Moto', barca: 'Barche', elicottero: 'Elicotteri', aereo: 'Aerei', servizio: 'Servizio', industriale: 'Industriali', militare: 'Militari', furgone: 'Furgoni', altro: 'Altro',
  pistola: 'Pistole', 'fucile-assalto': "Fucili d'assalto", mitra: 'Mitra', 'fucile-pompa': 'Fucili a pompa', cecchino: 'Cecchino', pesante: 'Pesanti', lancio: 'Da lancio', 'corpo-a-corpo': 'Corpo a corpo', equipaggiamento: 'Equipaggiamento',
};
const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };

export function render(params, query) {
  const tipo = query.tipo === 'armi' ? 'armi' : 'veicoli';
  const all = vis(tipo === 'armi' ? db.weapons : db.vehicles);
  const cls = query.classe || '';
  const have = query.have || '';
  const favs = progress.get().owned || {};
  const list = all.filter((v) => (!cls || v.class === cls) && passHave(have, favs[v.id]));
  const nOwn = all.filter((v) => favs[v.id]).length;
  const classes = [...new Set(all.map((v) => v.class))];
  const it = params.id ? byId(params.id) : null;
  const q = (c, h = have) => `#/veicoli?tipo=${tipo}${c ? '&classe=' + esc(c) : ''}${h ? '&have=' + h : ''}`;

  if (it) {
    const back = '/veicoli' + (tipo === 'armi' ? '?tipo=armi' : '');
    const right = `
      ${backLink(back, 'Garage')}
      ${hero(it, { kicker: `${CLASS_LABEL[it.class] || it.class}${it.manufacturer ? ' · ' + it.manufacturer : ''}`, title: it.name, chips: statusChip(it) })}
      <div class="actions">
        <button class="btn ${favs[it.id] ? 'btn--accent' : 'btn--solid'} own-btn" type="button" data-own="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-key"/></svg>${favs[it.id] ? 'Nel garage ✓' : 'Mettilo nel garage'}</button>
        <button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
      </div>
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Scheda in arrivo.')}</p>`)}</div>
      ${extrasHtml(it)}
      ${specSheet(it, 'vehicle')}
      ${galleryHtml(it)}
      ${it.howToGet && !/^Da verificare\.?$/.test(it.howToGet.trim()) ? `<div class="block"><span class="kicker">Come ottenerlo</span><div class="prose">${spoiler.wrap(it, `<p>${esc(it.howToGet)}</p>`)}</div></div>` : ''}
      <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
    return { left: '', right, show: 'right', accent: section.accent, title: it.name };
  }

  const left = `${sectionHead(section, `${nOwn} / ${all.length} nel garage`)}
    ${haveFilter(have, (v) => q(cls, v), { yes: 'Nel garage', no: 'Mi mancano' })}
    <div class="filters" role="group" aria-label="Classe">
      <a class="filter" role="button" aria-pressed="${!cls}" href="${q('')}">Tutti</a>
      ${classes.map((c) => `<a class="filter" role="button" aria-pressed="${cls === c}" href="${q(c)}">${esc(CLASS_LABEL[c] || c)} <span class="muted">${all.filter((x) => x.class === c).length}</span></a>`).join('')}
    </div>
    ${(() => { const mine = all.filter((x) => favs[x.id]); return mine.length && !cls && !have ? `<div class="block"><span class="kicker">Le tue chiavi · ${mine.length}</span><div class="keys">${mine.map((x) => `<a class="key" href="#/veicoli/${x.id}"><span class="key__ring"></span>${esc(x.name)}</a>`).join('')}</div></div>` : ''; })()}
    ${list.length ? `<div class="dealer">${list.map((x) => `<a class="dcard ${x.image ? '' : 'dcard--noimg'}" href="#/veicoli/${x.id}?tipo=${tipo}${cls ? '&classe=' + esc(cls) : ''}">
        <span class="dcard__img">${x.image ? `<img src="${esc(x.image)}" ${x.imageUrl ? `data-fallback="${esc(x.imageUrl)}"` : ''} alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-car"/></svg>'}</span>
        <span class="dcard__brand">${esc(x.manufacturer || '')}</span>
        ${favs[x.id] ? '<span class="dcard__fav"><svg aria-hidden="true"><use href="#i-key"/></svg></span>' : ''}
        <span class="dcard__body"><span class="dcard__name">${esc(x.name)}</span><span class="plate">${esc(CLASS_LABEL[x.class] || x.class)}</span>${x.status !== 'verificato' ? `<span class="dcard__src">${esc(SRC[x.source] || 'da verificare')}</span>` : ''}</span></a>`).join('')}</div>`
      : '<div class="placeholder"><strong>Niente qui</strong>Le schede arrivano dai dati.</div>'}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Garage' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-own]');
    if (f && location.hash.startsWith('#/veicoli')) { progress.toggleOwned(f.dataset.own); rerender(); }
  });
}
