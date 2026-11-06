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
  ['🌴', 'Le Keys: la famiglia di Jason', 'Contrabbando, barche e vita di provincia tra le isole.', ['chr-brian', 'chr-lori', 'chr-cal']],
  ['🎤', 'Vice City: la scena musicale', 'Rapper, produttori e leggende dei club.', ['chr-boobie', 'chr-drequan', 'chr-real-dimez', 'chr-dwnply', 'chr-travis-scott', 'chr-kodak-black']],
  ['💰', 'Il colpo grosso', 'Chi vive di rapine.', ['chr-raul']],
  ['🏢', 'Megamundo', 'Soldi, potere e sorrisi di plastica.', ['chr-andres', 'chr-petra', 'chr-valentina', 'chr-cesar']],
  ['🏁', 'Strada, gang e corse', 'San4San, corse clandestine e quartieri caldi.', ['chr-raymond', 'chr-ernesto', 'chr-yago', 'chr-aunt-tee']],
  ['🚔', 'La legge e lo Stato', 'Polizia, penitenziario e politica.', ['chr-mendez', 'chr-stefanie', 'chr-erin-henshaw']],
  ['🔧', 'Affari e mezzi', 'Meccanici, ricettatori e club di fango.', ['chr-wyman', 'chr-randy', 'chr-billy']],
  ['📺', 'Voci, schermi e cult', 'Streamer, mascotte, comparse diventate meme.', ['chr-camillo', 'chr-n3on', 'chr-phil', 'chr-mud-dog-mike', 'chr-macca', 'chr-hammer-lady', 'chr-rudi', 'chr-leonida-joker']],
  ['🕵️', 'Dai leak (da verificare)', 'Nomi emersi dal leak del 2022: prendili con le pinze.', ['chr-kai', 'chr-shanese', 'chr-leak-names']],
];
const HUES = [340, 24, 174, 265, 200, 48, 300, 120];
const monogram = (x) => { const h = HUES[[...x.id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length]; const ini = x.name.split(/[\s(]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join(''); return `<span class="monogram" style="--h:${h}">${esc(ini.toUpperCase())}</span>`; };
export function renderPersonaggi(params) {
  const chars = vis(db.characters);
  const c = params.id ? byId(params.id) : null;
  if (c) {
    const right = `
      ${backLink('/personaggi', 'Personaggi')}
      ${c.image ? hero(c, { kicker: `${c.role || 'Personaggio'}${c.districtId ? ' · ' + (byId(c.districtId)?.name || '') : ''}`, title: c.name, lede: c.tagline || '', chips: statusChip(c) })
        : `<div class="hero hero--mono">${monogram(c)}<div class="hero__text"><span class="kicker">${esc(c.role || 'Personaggio')}${c.districtId ? ' · ' + esc(byId(c.districtId)?.name || '') : ''}</span><h1>${esc(c.name)}</h1>${c.tagline ? `<p class="lede">${esc(c.tagline)}</p>` : ''}<div class="chips">${statusChip(c)}</div></div></div>`}
      <div class="prose">${spoiler.wrap(c, `<p class="dropcap">${esc(c.bio || 'Scheda in arrivo.')}</p>`)}</div>
      ${galleryHtml(c)}
      ${c.relations?.length ? `<div class="block"><span class="kicker">Legami</span><div class="chips" style="margin-top:var(--s-2)">${c.relations.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#/personaggi/${esc(id)}">${esc(r.name)}</a>` : ''; }).join('')}</div></div>` : ''}
      ${c.firstMissionId ? `<div class="block"><span class="kicker">Prima apparizione</span><a class="btn" href="#/missioni/${esc(c.firstMissionId)}">${esc(byId(c.firstMissionId)?.title || c.firstMissionId)}</a></div>` : ''}
      ${fonte(c)}`;
    return { left: '', right, show: 'right', accent: secP.accent, title: c.name };
  }
  const card = (x) => `<a class="cardx cardx--person" href="#/personaggi/${esc(x.id)}">
    <div class="cardx__img cardx__img--face">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : monogram(x)}</div>
    <div class="cardx__body"><div class="cardx__title">${esc(x.name)}</div><div class="cardx__meta">${esc(x.role || '')}${srcNote(x)}</div></div></a>`;
  const used = new Set();
  const groupHtml = GROUPS.map(([emoji, title, sub, ids]) => {
    const list = ids.map((id) => chars.find((x) => x.id === id)).filter(Boolean);
    list.forEach((x) => used.add(x.id));
    if (!list.length) return '';
    return `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">${emoji}</span><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div><span class="count">${list.length}</span></div><div class="cards">${list.map(card).join('')}</div>`;
  }).join('');
  const rest = chars.filter((x) => !x.isProtagonist && !used.has(x.id));
  const left = `${sectionHead(secP, `${chars.length} schede`)}
    <div class="group-head"><span class="group-head__emoji" aria-hidden="true">⭐</span><div><h2>Protagonisti</h2><p>Jason e Lucia: due vite legate da un colpo andato storto.</p></div></div>
    <div class="cards cards--2 cards--big">${chars.filter((x) => x.isProtagonist).map(card).join('')}</div>
    ${groupHtml}
    ${rest.length ? `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">👥</span><div><h2>Altri</h2></div></div><div class="cards">${rest.map(card).join('')}</div>` : ''}`;
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
