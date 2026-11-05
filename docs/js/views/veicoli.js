import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip } from '../ui/dom.js';
import { chapterHead, runningHead, backLink, opener, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('veicoli');
export const CLASS_LABEL = { super: 'Super', sportiva: 'Sportive', berlina: 'Berline', suv: 'SUV', fuoristrada: 'Fuoristrada', muscle: 'Muscle', classica: 'Classiche', moto: 'Moto', barca: 'Barche', elicottero: 'Elicotteri', aereo: 'Aerei', altro: 'Altro' };

export function render(params, query) {
  const all = vis(db.vehicles);
  const cls = query.classe || '';
  const list = all.filter((v) => !cls || v.class === cls);
  const classes = [...new Set(all.map((v) => v.class))];
  const v = params.id ? byId(params.id) : null;
  const favs = progress.get().favorites || {};

  const left = `${chapterHead(section, { kicker: 'Capitolo quinto', title: 'Veicoli' })}
    <div class="filters" role="group" aria-label="Classe">
      <a class="filter" role="button" aria-pressed="${!cls}" href="#/veicoli">Tutti <span class="muted">${all.length}</span></a>
      ${classes.map((c) => `<a class="filter" role="button" aria-pressed="${cls === c}" href="#/veicoli?classe=${esc(c)}">${esc(CLASS_LABEL[c] || c)} <span class="muted">${all.filter((x) => x.class === c).length}</span></a>`).join('')}
    </div>
    ${list.length ? `<ol class="toc">${list.map((x) => `<li><a class="toc__row" href="#/veicoli/${esc(x.id)}${cls ? '?classe=' + esc(cls) : ''}" ${x.id === v?.id ? 'aria-current="page"' : ''}>
        <span class="toc__num"><svg style="width:18px;height:18px;margin-left:auto;color:${favs[x.id] ? 'var(--accent)' : 'inherit'}" aria-hidden="true"><use href="#${favs[x.id] ? 'i-bookmark' : 'i-car'}"/></svg></span>
        <span><span class="toc__title">${esc(x.name)}</span><span class="toc__meta">${esc(x.manufacturer || '')}${x.manufacturer ? ' · ' : ''}${esc(CLASS_LABEL[x.class] || x.class)}</span></span>
        <span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a></li>`).join('')}</ol>`
      : '<div class="placeholder"><strong>Nessun veicolo</strong>Le schede arrivano dai dati: aggiungile con il Pacchetto per Claude.</div>'}`;

  const right = v ? `
    ${backLink('/veicoli', 'Veicoli')}
    ${runningHead(CLASS_LABEL[v.class] || v.class, v.manufacturer || '')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(v)}</div>
    <h1>${esc(v.name)}</h1>
    ${v.manufacturer ? `<p class="lede" style="margin-top:var(--s-2)">${esc(v.manufacturer)}</p>` : ''}
    ${v.image ? `<img src="${esc(v.image)}" alt="${esc(v.name)}" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    <div class="btn-row" style="margin:var(--s-4) 0">
      <button class="btn ${favs[v.id] ? 'btn--accent' : ''}" type="button" data-fav="${esc(v.id)}"><svg aria-hidden="true"><use href="#i-bookmark"/></svg>${favs[v.id] ? 'Nei preferiti' : 'Preferito'}</button>
    </div>
    <hr class="rule">
    <div class="prose">${spoiler.wrap(v, `<p class="dropcap">${esc(v.description || 'Scheda in arrivo.')}</p>`)}</div>
    ${v.howToGet ? `<div class="block"><span class="kicker">Come ottenerlo</span><div class="prose">${spoiler.wrap(v, `<p>${esc(v.howToGet)}</p>`)}</div></div>` : ''}
    <p class="source-line">Fonte: ${esc(v.source)}${v.sourceUrl ? ` · <a href="${esc(v.sourceUrl)}" target="_blank" rel="noopener">pagina ufficiale</a>` : ''}</p>`
    : opener(section, 'Il garage di Leonida: auto, moto, barche e mezzi aerei. Oggi solo i veicoli nominati ufficialmente da Rockstar; il resto lo aggiungi guidandoli.');
  return { left, right, show: v ? 'right' : 'left', accent: section.accent, title: v?.name || 'Veicoli' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fav]');
    if (f) { progress.toggleFavorite(f.dataset.fav); rerender(); }
  });
}
