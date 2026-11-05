/** Personaggi, Radio e Cultura, Prima ora: le pagine "da rivista". */
import { db, byId } from '../data.js';
import { esc, statusChip } from '../ui/dom.js';
import { chapterHead, runningHead, backLink, opener, vis, sectionOf } from './shared.js';
import * as spoiler from '../spoiler.js';

/* ---------- Personaggi ---------- */
const secP = sectionOf('personaggi');
export function renderPersonaggi(params) {
  const chars = vis(db.characters);
  const c = params.id ? byId(params.id) : null;
  const row = (x) => `<a class="toc__row" href="#/personaggi/${esc(x.id)}" ${x.id === c?.id ? 'aria-current="page"' : ''}>
    <span class="toc__num">${x.isProtagonist ? '★' : '·'}</span>
    <span><span class="toc__title">${esc(x.name)}</span><span class="toc__meta">${esc(x.role || '')}</span></span>
    <span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`;
  const left = `${chapterHead(secP, { kicker: 'Capitolo quinto', title: 'Personaggi' })}
    <div class="toc__section"><span class="kicker">Protagonisti</span>${chars.filter((x) => x.isProtagonist).map(row).join('')}</div>
    <div class="toc__section"><span class="kicker">Il cast di Leonida</span>${chars.filter((x) => !x.isProtagonist).map(row).join('') || '<p class="muted small">Nessuno ancora.</p>'}</div>`;
  const right = c ? `
    ${backLink('/personaggi', 'Personaggi')}
    ${runningHead(c.role || 'Personaggio', byId(c.districtId)?.name || '')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(c)}</div>
    <h1>${esc(c.name)}</h1>
    ${c.tagline ? `<p class="lede" style="margin-top:var(--s-2)"><em>${esc(c.tagline)}</em></p>` : ''}
    ${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)}" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    <hr class="rule">
    <div class="prose">${spoiler.wrap(c, `<p class="dropcap">${esc(c.bio || 'Scheda in arrivo: la scrivi dopo averlo incontrato.')}</p>`)}</div>
    ${c.relations?.length ? `<div class="block"><span class="kicker">Legami</span><div class="chips">${c.relations.map((id) => { const r = byId(id); return r ? `<a class="chip" href="#/personaggi/${esc(id)}">${esc(r.name)}</a>` : ''; }).join('')}</div></div>` : ''}
    ${c.firstMissionId ? `<div class="block"><span class="kicker">Prima apparizione</span><a class="btn" href="#/missioni/${esc(c.firstMissionId)}">${esc(byId(c.firstMissionId)?.title || c.firstMissionId)}</a></div>` : ''}
    <p class="source-line">Fonte: ${esc(c.source)}${c.sourceUrl ? ` · <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">pagina ufficiale</a>` : ''}</p>`
    : opener(secP, 'Schede in stile rivista: chi sono, cosa vogliono, con chi sono legati. Oggi contengono solo ciò che Rockstar ha presentato ufficialmente.');
  return { left, right, show: c ? 'right' : 'left', accent: secP.accent, title: c?.name || 'Personaggi' };
}

/* ---------- Radio e Cultura ---------- */
const secC = sectionOf('cultura');
export function renderCultura(params) {
  const radio = vis(db.radio), brands = vis(db.brands);
  const it = params.id ? byId(params.id) : null;
  const row = (x, meta) => `<a class="toc__row" href="#/cultura/${esc(x.id)}" ${x.id === it?.id ? 'aria-current="page"' : ''}>
    <span class="toc__num"><svg style="width:18px;height:18px;margin-left:auto" aria-hidden="true"><use href="#${x._type === 'radio' ? 'i-radio' : 'i-star'}"/></svg></span>
    <span><span class="toc__title">${esc(x.name)}</span><span class="toc__meta">${esc(meta)}</span></span>
    <span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`;
  const left = `${chapterHead(secC, { kicker: 'Capitolo sesto', title: 'Radio e Cultura' })}
    <div class="toc__section"><span class="kicker">In onda su Leonida</span>${radio.map((r) => row(r, `${r.genre || ''}${r.host ? ' · ' + r.host : ''}`)).join('')}</div>
    <div class="toc__section"><span class="kicker">Marchi, musica, cultura</span>${brands.map((b) => row(b, b.category || '')).join('') || '<p class="muted small">Nulla ancora.</p>'}</div>`;
  const right = it ? `
    ${backLink('/cultura', 'Radio e Cultura')}
    ${runningHead(it._type === 'radio' ? 'Stazione radio' : it.category || 'Cultura', it.genre || '')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(it)}</div>
    <h1>${esc(it.name)}</h1>
    ${it.host ? `<p class="lede" style="margin-top:var(--s-2)">Con ${esc(it.host)}</p>` : ''}
    ${it.image ? `<img src="${esc(it.image)}" alt="" style="border-radius:var(--radius);margin:var(--s-3) 0" loading="lazy">` : ''}
    <hr class="rule">
    <div class="prose">${spoiler.wrap(it, `<p class="dropcap">${esc(it.description || 'Descrizione in arrivo.')}</p>`)}</div>
    ${it.highlights?.length ? `<div class="block prose"><span class="kicker">Da ascoltare</span><ul>${it.highlights.map((h) => `<li>${esc(typeof h === 'string' ? h : `${h.artist ? h.artist + ' — ' : ''}${h.title}`)}</li>`).join('')}</ul></div>` : (it._type === 'radio' ? '<p class="muted small">La scaletta la compili tu, un brano alla volta, quando lo riconosci alla radio.</p>' : '')}
    <p class="source-line">Fonte: ${esc(it.source)}${it.sourceUrl ? ` · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">pagina ufficiale</a>` : ''}</p>`
    : opener(secC, 'Le sei stazioni annunciate da Rockstar con i loro conduttori, le colonne sonore e i marchi di Leonida. Scrivila come una rivista.');
  return { left, right, show: it ? 'right' : 'left', accent: secC.accent, title: it?.name || 'Radio e Cultura' };
}

/* ---------- Prima ora ---------- */
const secT = sectionOf('prima-ora');
const CAT_LABEL = { 'prima-ora': 'Prima ora', generale: 'Generale', combattimento: 'Combattimento', soldi: 'Soldi', guida: 'Guida', esplorazione: 'Esplorazione', online: 'Online' };
export function renderPrimaOra() {
  const tips = vis(db.tips).sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
  const cats = [...new Set(tips.map((t) => t.category))];
  const first = tips.filter((t) => t.category === 'prima-ora');
  const left = `${chapterHead(secT, { kicker: 'Capitolo settimo', title: 'Prima ora', lede: 'Quello che conviene sapere al giorno uno, prima ancora di prendere il pad.' })}
    ${first.map((t, i) => `<div class="card" style="margin-top:var(--s-3)"><div class="kicker kicker--accent">${String(i + 1).padStart(2, '0')}</div><h2>${esc(t.title)}</h2><div class="prose">${spoiler.wrap(t, `<p>${esc(t.body)}</p>`)}</div>${statusChip(t)}</div>`).join('')}`;
  const others = cats.filter((c) => c !== 'prima-ora');
  const right = others.length ? others.map((c) => `<div class="block"><span class="kicker">${esc(CAT_LABEL[c] || c)}</span>
      ${tips.filter((t) => t.category === c).map((t) => `<div class="card" style="margin-top:var(--s-3)"><h2 style="font-size:1.2rem">${esc(t.title)}</h2><div class="prose small">${spoiler.wrap(t, `<p>${esc(t.body)}</p>`)}</div>${statusChip(t)}</div>`).join('')}</div>`).join('')
    : opener(secT, 'I consigli generali (combattimento, soldi, guida, esplorazione) compaiono qui man mano che li aggiungi.');
  return { left, right, show: 'left', accent: secT.accent, title: 'Prima ora' };
}

/* ---------- Online (disattivata) ---------- */
const secO = sectionOf('online');
export function renderOnline() {
  const left = `${chapterHead(secO, { kicker: 'Capitolo nono', title: 'Online' })}
    <div class="placeholder is-disabled"><strong>In arrivo <span class="soon">v2</span></strong>Questa sezione è prevista per la componente online e per il sync dei progressi tra dispositivi (Supabase). Oggi è spenta.</div>`;
  return { left, right: opener(secO, 'Spazio riservato alla versione 2.'), show: 'left', accent: secO.accent, title: 'Online' };
}
