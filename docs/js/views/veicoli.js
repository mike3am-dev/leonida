import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { galleryHtml, chapterHead, runningHead, backLink, opener, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('veicoli');
export const CLASS_LABEL = {
  super: 'Super', sportiva: 'Sportive', berlina: 'Berline', suv: 'SUV', fuoristrada: 'Fuoristrada', muscle: 'Muscle', classica: 'Classiche', coupe: 'Coupé',
  moto: 'Moto', barca: 'Barche', elicottero: 'Elicotteri', aereo: 'Aerei', servizio: 'Servizio', industriale: 'Industriali', militare: 'Militari', furgone: 'Furgoni', altro: 'Altro',
  pistola: 'Pistole', 'fucile-assalto': "Fucili d'assalto", mitra: 'Mitra', 'fucile-pompa': 'Fucili a pompa', cecchino: 'Cecchino', pesante: 'Pesanti', lancio: 'Da lancio', 'corpo-a-corpo': 'Corpo a corpo', equipaggiamento: 'Equipaggiamento',
};

export function render(params, query) {
  const tipo = query.tipo === 'armi' ? 'armi' : 'veicoli';
  const all = vis(tipo === 'armi' ? db.weapons : db.vehicles);
  const cls = query.classe || '';
  const list = all.filter((v) => !cls || v.class === cls);
  const classes = [...new Set(all.map((v) => v.class))];
  const it = params.id ? byId(params.id) : null;
  const favs = progress.get().favorites || {};
  const q = (c) => `#/veicoli?tipo=${tipo}${c ? '&classe=' + esc(c) : ''}`;
  const icon = tipo === 'armi' ? 'i-bolt' : 'i-car';

  const left = `${chapterHead(section, { kicker: 'Capitolo quinto', title: 'Garage' })}
    <div class="segmented" role="group" aria-label="Tipo" style="margin-bottom:var(--s-3)">
      <a role="button" aria-pressed="${tipo === 'veicoli'}" href="#/veicoli" style="text-decoration:none;display:inline-flex;align-items:center">Veicoli <span class="muted" style="margin-left:6px">${vis(db.vehicles).length}</span></a>
      <a role="button" aria-pressed="${tipo === 'armi'}" href="#/veicoli?tipo=armi" style="text-decoration:none;display:inline-flex;align-items:center">Arsenale <span class="muted" style="margin-left:6px">${vis(db.weapons).length}</span></a>
    </div>
    <div class="filters" role="group" aria-label="Classe">
      <a class="filter" role="button" aria-pressed="${!cls}" href="${q('')}">Tutti <span class="muted">${all.length}</span></a>
      ${classes.map((c) => `<a class="filter" role="button" aria-pressed="${cls === c}" href="${q(c)}">${esc(CLASS_LABEL[c] || c)} <span class="muted">${all.filter((x) => x.class === c).length}</span></a>`).join('')}
    </div>
    ${list.length ? `<ol class="toc">${list.map((x) => `<li><a class="toc__row" href="#/veicoli/${esc(x.id)}?tipo=${tipo}${cls ? '&classe=' + esc(cls) : ''}" ${x.id === it?.id ? 'aria-current="page"' : ''}>
        <span class="toc__num"><svg style="width:18px;height:18px;margin-left:auto;color:${favs[x.id] ? 'var(--accent)' : 'inherit'}" aria-hidden="true"><use href="#${favs[x.id] ? 'i-bookmark' : icon}"/></svg></span>
        <span><span class="toc__title">${esc(x.name)}</span><span class="toc__meta">${esc(x.manufacturer || '')}${x.manufacturer ? ' · ' : ''}${esc(CLASS_LABEL[x.class] || x.class)}${x.status !== 'verificato' ? ' · da verificare' : ''}</span></span>
        <span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a></li>`).join('')}</ol>`
      : '<div class="placeholder"><strong>Niente qui</strong>Le schede arrivano dai dati: aggiungile con il Pacchetto per Claude.</div>'}`;

  const right = it ? `
    ${backLink('/veicoli' + (tipo === 'armi' ? '?tipo=armi' : ''), 'Garage')}
    ${runningHead(CLASS_LABEL[it.class] || it.class, it.manufacturer || '')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(it)}</div>
    <h1>${esc(it.name)}</h1>
    ${it.manufacturer ? `<p class="lede" style="margin-top:var(--s-2)">${esc(it.manufacturer)}</p>` : ''}
    ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.name)}" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    ${galleryHtml(it)}
    <div class="btn-row" style="margin:var(--s-4) 0">
      <button class="btn ${favs[it.id] ? 'btn--accent' : ''}" type="button" data-fav="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-bookmark"/></svg>${favs[it.id] ? 'Nei preferiti' : 'Preferito'}</button>
    </div>
    <hr class="rule">
    <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Scheda in arrivo.')}</p>`)}</div>
    ${it.howToGet ? `<div class="block"><span class="kicker">Come ottenerlo</span><div class="prose">${spoiler.wrap(it, `<p>${esc(it.howToGet)}</p>`)}</div></div>` : ''}
    <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`
    : opener(section, tipo === 'armi'
      ? "L'arsenale di Leonida, per classe. Oggi è la lista compilata dalla community dai trailer e dall'Extended Look: la confermi arma per arma."
      : 'Il garage di Leonida: auto, moto, barche e mezzi aerei. I veicoli nominati da Rockstar sono «verificati»; quelli identificati dalla community nei video, «da verificare».');
  return { left, right, show: it ? 'right' : 'left', accent: section.accent, title: it?.name || 'Garage' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fav]');
    if (f) { progress.toggleFavorite(f.dataset.fav); rerender(); }
  });
}
