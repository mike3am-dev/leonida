import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, galleryHtml, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('veicoli');
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
  const list = all.filter((v) => !cls || v.class === cls);
  const classes = [...new Set(all.map((v) => v.class))];
  const it = params.id ? byId(params.id) : null;
  const favs = progress.get().favorites || {};
  const q = (c) => `#/veicoli?tipo=${tipo}${c ? '&classe=' + esc(c) : ''}`;

  if (it) {
    const back = '/veicoli' + (tipo === 'armi' ? '?tipo=armi' : '');
    const right = `
      ${backLink(back, 'Garage')}
      ${hero(it, { kicker: `${CLASS_LABEL[it.class] || it.class}${it.manufacturer ? ' · ' + it.manufacturer : ''}`, title: it.name, chips: statusChip(it) })}
      <div class="actions">
        <button class="btn ${favs[it.id] ? 'btn--accent' : 'btn--ghost'}" type="button" data-fav="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-bookmark"/></svg>${favs[it.id] ? 'Nei preferiti' : 'Aggiungi ai preferiti'}</button>
        <button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
      </div>
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Scheda in arrivo.')}</p>`)}</div>
      ${galleryHtml(it)}
      ${it.howToGet ? `<div class="block"><span class="kicker">Come ottenerlo</span><div class="prose">${spoiler.wrap(it, `<p>${esc(it.howToGet)}</p>`)}</div></div>` : ''}
      <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
    return { left: '', right, show: 'right', accent: section.accent, title: it.name };
  }

  const left = `${sectionHead(section, `${list.length} ${tipo}`)}
    <div class="segmented" role="group" aria-label="Tipo" style="margin-bottom:var(--s-3)">
      <a role="button" aria-pressed="${tipo === 'veicoli'}" href="#/veicoli">Veicoli <span class="muted">${vis(db.vehicles).length}</span></a>
      <a role="button" aria-pressed="${tipo === 'armi'}" href="#/veicoli?tipo=armi">Arsenale <span class="muted">${vis(db.weapons).length}</span></a>
    </div>
    <div class="filters" role="group" aria-label="Classe">
      <a class="filter" role="button" aria-pressed="${!cls}" href="${q('')}">Tutti</a>
      ${classes.map((c) => `<a class="filter" role="button" aria-pressed="${cls === c}" href="${q(c)}">${esc(CLASS_LABEL[c] || c)} <span class="muted">${all.filter((x) => x.class === c).length}</span></a>`).join('')}
    </div>
    ${list.length ? list.map((x) => row({ href: `#/veicoli/${x.id}?tipo=${tipo}${cls ? '&classe=' + esc(cls) : ''}`, thumb: x.image, icon: tipo === 'armi' ? 'i-bolt' : 'i-car',
        title: esc(x.name), meta: `${esc(x.manufacturer || '')}${x.manufacturer ? ' · ' : ''}${esc(CLASS_LABEL[x.class] || x.class)}${x.status !== 'verificato' ? ' · ' + (SRC[x.source] || 'da verificare') : ''}`,
        end: favs[x.id] ? '<svg aria-hidden="true" style="color:var(--accent)"><use href="#i-bookmark"/></svg>' : '' })).join('')
      : '<div class="placeholder"><strong>Niente qui</strong>Le schede arrivano dai dati.</div>'}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'Garage' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fav]');
    if (f) { progress.toggleFavorite(f.dataset.fav); rerender(); }
  });
}
