/** Personaggi, Radio e Cultura, Prima ora, Online */
import { db, byId } from '../data.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, hero, row, acc, galleryHtml, opener, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

const SRC = { stampa: 'stampa', rumor: 'rumor', leak: 'leak', community: 'community' };
const srcNote = (x) => x.status !== 'verificato' ? ' · ' + (SRC[x.source] || 'da verificare') : '';

/* ---------- Personaggi ---------- */
const secP = sectionOf('personaggi');
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
      <p class="source-line">Fonte: ${esc(c.source)}${c.sourceUrl ? ` · <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
    return { left: '', right, show: 'right', accent: secP.accent, title: c.name };
  }
  const prot = chars.filter((x) => x.isProtagonist), cast = chars.filter((x) => !x.isProtagonist);
  const card = (x, wide) => `<a class="cardx ${wide ? 'cardx--wide' : ''}" href="#/personaggi/${esc(x.id)}">
    <div class="cardx__img">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-person"/></svg>'}</div>
    <div class="cardx__body"><div class="cardx__title">${esc(x.name)}</div><div class="cardx__meta">${esc(x.role || '')}${srcNote(x)}</div></div></a>`;
  const left = `${sectionHead(secP, `${chars.length} schede`)}
    <span class="kicker" style="display:block;margin-bottom:var(--s-2)">Protagonisti</span>
    <div class="cards" style="grid-template-columns:repeat(2,1fr)">${prot.map((x) => card(x)).join('')}</div>
    <span class="kicker" style="display:block;margin:var(--s-5) 0 var(--s-2)">Il cast di Leonida</span>
    <div class="cards">${cast.filter((x) => x.image).map((x) => card(x)).join('')}</div>
    <div class="block">${cast.filter((x) => !x.image).map((x) => row({ href: `#/personaggi/${x.id}`, icon: 'i-person', title: esc(x.name), meta: `${esc(x.role || '')}${srcNote(x)}` })).join('')}</div>`;
  return { left, right: '', show: 'left', accent: secP.accent, title: 'Personaggi' };
}

/* ---------- Radio e Cultura ---------- */
const secC = sectionOf('cultura');
export function renderCultura(params) {
  const radio = vis(db.radio), brands = vis(db.brands);
  const it = params.id ? byId(params.id) : null;
  if (it) {
    const right = `
      ${backLink('/cultura', 'Radio e Cultura')}
      ${hero(it, { kicker: it._type === 'radio' ? `Stazione radio${it.genre ? ' · ' + it.genre : ''}` : it.category || 'Cultura', title: it.name, lede: it.host ? `Con ${it.host}` : '', chips: statusChip(it) })}
      <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Descrizione in arrivo.')}</p>`)}</div>
      ${it.highlights?.length ? `<div class="block"><span class="kicker">In scaletta</span>${it.highlights.map((h) => row({ href: '#/cultura/' + it.id, icon: 'i-radio', title: esc(typeof h === 'string' ? h : h.title === '—' ? h.artist : h.title), meta: typeof h === 'string' ? '' : (h.title === '—' ? '' : esc(h.artist)) + (h.status === 'verificato' ? '' : ' · community') })).join('')}</div>` : (it._type === 'radio' ? '<p class="muted small">La scaletta la compili tu, un brano alla volta.</p>' : '')}
      <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">fonte</a>` : ''}</p>`;
    return { left: '', right, show: 'right', accent: secC.accent, title: it.name };
  }
  const groups = {};
  for (const b of brands) (groups[b.category || 'Altro'] ||= []).push(b);
  const left = `${sectionHead(secC, `${radio.length} radio · ${brands.length} voci`)}
    <span class="kicker" style="display:block;margin-bottom:var(--s-2)">In onda su Leonida</span>
    <div class="cards">${radio.map((r) => `<a class="cardx" href="#/cultura/${esc(r.id)}"><div class="cardx__img cardx__img--logo">${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-radio"/></svg>'}</div><div class="cardx__body"><div class="cardx__title">${esc(r.name)}</div><div class="cardx__meta">${esc(r.genre || '')}</div></div></a>`).join('')}</div>
    ${Object.entries(groups).map(([cat, list]) => `<div class="block">${acc(`${cat} (${list.length})`, list.map((b) => row({ href: `#/cultura/${b.id}`, thumb: b.image, icon: 'i-star', title: esc(b.name), meta: `${esc(b.category || '')}${srcNote(b)}` })).join(''), ['Colonna sonora', 'Edizione', 'Bonus di acquisto', 'App'].includes(cat))}</div>`).join('')}`;
  return { left, right: '', show: 'left', accent: secC.accent, title: 'Radio e Cultura' };
}

/* ---------- Prima ora ---------- */
const secT = sectionOf('prima-ora');
const CAT_LABEL = { 'prima-ora': 'Prima ora', generale: 'Generale', combattimento: 'Combattimento', soldi: 'Soldi', guida: 'Guida e veicoli', esplorazione: 'Esplorazione', online: 'Online', trasporti: 'Spostarsi per Leonida', sistemi: 'Sistemi di gioco', tecnica: 'Tecnica e console', storia: 'Storia (senza spoiler)' };
export function renderPrimaOra() {
  const tips = vis(db.tips).sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
  const cats = [...new Set(tips.map((t) => t.category))];
  const tipCard = (t, i) => `<div class="card" style="margin-top:var(--s-3)">${i !== undefined ? `<div class="kicker kicker--accent">${String(i + 1).padStart(2, '0')}</div>` : ''}<h2 style="font-size:1.3rem">${esc(t.title)}</h2><div class="prose">${spoiler.wrap(t, `<p>${esc(t.body)}</p>`)}</div><div class="chips">${statusChip(t)}</div></div>`;
  const first = tips.filter((t) => t.category === 'prima-ora');
  const left = `${sectionHead(secT, `${tips.length} consigli`)}
    <p class="lede">Quello che conviene sapere al giorno uno, prima ancora di prendere il pad.</p>
    ${first.map((t, i) => tipCard(t, i)).join('')}
    ${cats.filter((c) => c !== 'prima-ora').map((c) => `<div class="block">${acc(`${CAT_LABEL[c] || c} (${tips.filter((t) => t.category === c).length})`, tips.filter((t) => t.category === c).map((t) => tipCard(t)).join(''), c === 'trasporti')}</div>`).join('')}`;
  return { left, right: '', show: 'left', accent: secT.accent, title: 'Prima ora' };
}

/* ---------- Online (disattivata) ---------- */
const secO = sectionOf('online');
export function renderOnline() {
  const left = `${sectionHead(secO, 'v2')}
    <div class="placeholder is-disabled"><strong>In arrivo</strong>Rockstar chiama GTA VI «un'esperienza single player»: l'online è atteso nel 2027. Questa sezione ospiterà anche il sync dei progressi tra dispositivi.</div>`;
  return { left, right: '', show: 'left', accent: secO.accent, title: 'Online' };
}
