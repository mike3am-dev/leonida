/** Personaggi, Radio, Mondo */
import { db, byId } from '../data.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };
const srcNote = (x) => x.status !== 'verificato' ? ' · ' + (SRC[x.source] || 'da verificare') : '';
const fonte = (x) => `<p class="source-line">Fonte: ${esc(x.source)}${x.sourceUrl ? ` · <a href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;

/* ---------- Personaggi ---------- */
const secP = sectionOf('personaggi');
const GROUPS = [
  ['Le Keys: la famiglia di Jason', ['chr-brian', 'chr-lori', 'chr-cal']],
  ['Vice City: la scena musicale', ['chr-boobie', 'chr-drequan', 'chr-real-dimez', 'chr-dwnply', 'chr-travis-scott', 'chr-kodak-black']],
  ['Il colpo grosso', ['chr-raul']],
  ['Megamundo', ['chr-andres', 'chr-petra', 'chr-valentina', 'chr-cesar']],
  ['Strada, gang e corse', ['chr-raymond', 'chr-ernesto', 'chr-yago', 'chr-aunt-tee']],
  ['La legge e lo Stato', ['chr-mendez', 'chr-stefanie', 'chr-erin-henshaw']],
  ['Affari e mezzi', ['chr-wyman', 'chr-randy', 'chr-billy']],
  ['Voci, schermi e cult', ['chr-camillo', 'chr-n3on', 'chr-phil', 'chr-mud-dog-mike', 'chr-macca', 'chr-hammer-lady', 'chr-rudi', 'chr-leonida-joker']],
  ['Dai leak (da verificare)', ['chr-kai', 'chr-shanese', 'chr-leak-names']],
];
export function renderPersonaggi(params) {
  const chars = vis(db.characters);
  const c = params.id ? byId(params.id) : null;
  if (c) {
    const right = `
      ${backLink('/personaggi', 'Personaggi')}
      ${hero(c, { kicker: `${c.role || 'Personaggio'}${c.districtId ? ' · ' + (byId(c.districtId)?.name || '') : ''}`, title: c.name, lede: c.tagline || '', chips: statusChip(c) })}
      <div class="prose">${spoiler.wrap(c, `<p class="dropcap">${esc(c.bio || 'Scheda in arrivo.')}</p>`)}</div>
      ${galleryHtml(c)}
      ${c.relations?.length ? `<div class="block"><span class="kicker">Legami</span><div class="chips" style="margin-top:var(--s-2)">${c.relations.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#/personaggi/${esc(id)}">${esc(r.name)}</a>` : ''; }).join('')}</div></div>` : ''}
      ${c.firstMissionId ? `<div class="block"><span class="kicker">Prima apparizione</span><a class="btn" href="#/missioni/${esc(c.firstMissionId)}">${esc(byId(c.firstMissionId)?.title || c.firstMissionId)}</a></div>` : ''}
      ${fonte(c)}`;
    return { left: '', right, show: 'right', accent: secP.accent, title: c.name };
  }
  const card = (x) => `<a class="cardx" href="#/personaggi/${esc(x.id)}">
    <div class="cardx__img cardx__img--face">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-person"/></svg>'}</div>
    <div class="cardx__body"><div class="cardx__title">${esc(x.name)}</div><div class="cardx__meta">${esc(x.role || '')}${srcNote(x)}</div></div></a>`;
  const used = new Set();
  const groupHtml = GROUPS.map(([title, ids]) => {
    const list = ids.map((id) => chars.find((x) => x.id === id)).filter(Boolean);
    list.forEach((x) => used.add(x.id));
    if (!list.length) return '';
    return `<span class="kicker" style="display:block;margin:var(--s-5) 0 var(--s-2)">${esc(title)}</span><div class="cards">${list.map(card).join('')}</div>`;
  }).join('');
  const rest = chars.filter((x) => !x.isProtagonist && !used.has(x.id));
  const left = `${sectionHead(secP, `${chars.length} schede`)}
    <span class="kicker" style="display:block;margin-bottom:var(--s-2)">Protagonisti</span>
    <div class="cards cards--2">${chars.filter((x) => x.isProtagonist).map(card).join('')}</div>
    ${groupHtml}
    ${rest.length ? `<span class="kicker" style="display:block;margin:var(--s-5) 0 var(--s-2)">Altri</span><div class="cards">${rest.map(card).join('')}</div>` : ''}`;
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
  const order = ['Edizione', 'Bonus di acquisto', 'App', 'Gang', "Forze dell'ordine", 'Azienda', 'Etichetta discografica', 'TV', 'Pubblicità', 'Arma', 'Abbonamento'];
  const keys = [...new Set([...order.filter((k) => groups[k]), ...Object.keys(groups)])];
  const left = `${sectionHead(secM, `${all.length} voci`)}
    <p class="lede">Marchi, app, gang, polizia, TV: tutto ciò che fa Leonida un posto vero.</p>
    ${keys.map((k, i) => `<div class="block">${acc(`${k} (${groups[k].length})`, groups[k].map((b) => row({ href: `#/mondo/${b.id}`, thumb: b.image, icon: 'i-globe', title: esc(b.name), meta: `${esc(b.description.slice(0, 90))}…${srcNote(b)}` })).join(''), i < 3)}</div>`).join('')}`;
  return { left, right: '', show: 'left', accent: secM.accent, title: 'Mondo' };
}
