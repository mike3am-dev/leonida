/** Come si gioca: una scheda per ogni sistema di gioco (furto d'auto, polizia, relazione…) */
import { db, byId, TYPE_ROUTE } from '../data.js';
import { esc, statusChip } from '../ui/dom.js';
import { sectionHead, backLink, vis, sectionOf, extrasHtml } from './shared.js';

const section = sectionOf('meccaniche');
const GROUPS = [['Crimine', '🔫', 'Rubare, rapinare, sparare, scappare'], ['Personaggi', '👥', 'Jason, Lucia e come cambiano'], ['Mondo e vita', '🌴', 'Telefono, strade, animali, svaghi']];

function card(m) {
  return `<a class="mcard" href="#/meccaniche/${esc(m.id)}"><span class="mcard__emoji" aria-hidden="true">${esc(m.emoji || '•')}</span>
    <span class="mcard__body"><span class="mcard__title">${esc(m.title)}</span><span class="mcard__short">${esc(m.short || '')}</span><span class="chips">${statusChip(m)}</span></span>
    <svg class="mcard__go" aria-hidden="true"><use href="#i-arrow"/></svg></a>`;
}

function index(q) {
  const all = vis(db.meccaniche || []);
  const needle = (q || '').toLowerCase().trim();
  const list = needle ? all.filter((m) => JSON.stringify([m.title, m.short, m.steps, m.details, m.tips]).toLowerCase().includes(needle)) : all;
  const body = !all.length ? '<div class="placeholder"><strong>In preparazione</strong>Le schede dei sistemi di gioco arrivano a breve.</div>'
    : needle ? `<div class="mgrid">${list.map(card).join('') || '<p class="muted small">Niente con questa parola.</p>'}</div>`
    : GROUPS.map(([g, emoji, sub]) => { const l = list.filter((m) => m.group === g); return l.length ? `<div class="group-head"><span class="group-head__emoji" aria-hidden="true">${emoji}</span><div><h2>${esc(g)}</h2><p>${esc(sub)}</p></div></div><div class="mgrid">${l.map(card).join('')}</div>` : ''; }).join('')
      + (() => { const rest = list.filter((m) => !GROUPS.some(([g]) => g === m.group)); return rest.length ? `<div class="mgrid">${rest.map(card).join('')}</div>` : ''; })();
  return `${sectionHead(section, `${all.length} schede`)}
    <input class="input" type="search" placeholder="Cerca: furto, polizia, palestra…" value="${esc(q || '')}" data-mec-q aria-label="Cerca nelle meccaniche" style="margin-bottom:var(--s-3)">
    ${body}`;
}

function detail(m) {
  const rel = (m.relatedIds || []).map((id) => byId(id)).filter(Boolean);
  const link = (it) => { const r = TYPE_ROUTE[it._type]; const href = it._type === 'news' ? `/news/${it.id}` : it._type === 'tip' ? `/news/${it.id}` : r ? r(it) : null; return href ? `<a class="chip chip--btn" href="#${esc(href)}">${esc(it.title || it.name)}</a>` : ''; };
  return `${backLink('/meccaniche', 'Come si gioca')}
    <header class="mhero"><span class="mhero__emoji" aria-hidden="true">${esc(m.emoji || '•')}</span><div><span class="kicker kicker--accent">${esc(m.group || 'Come si gioca')}</span><h1>${esc(m.title)}</h1><div class="chips">${statusChip(m)}</div></div></header>
    ${m.short ? `<p class="lede">${esc(m.short)}</p>` : ''}
    ${m.steps?.length ? `<section class="msteps"><h3 class="fsec__t">Passo per passo</h3><ol>${m.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>` : ''}
    ${(m.details || []).map((d) => `<section class="fsec"><h3 class="fsec__t">${esc(d.title)}</h3><p>${esc(d.text)}</p></section>`).join('')}
    ${m.tips?.length ? `<section class="mtips"><h3 class="fsec__t">Consigli</h3><ul>${m.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
    ${extrasHtml(m)}
    ${rel.length ? `<section class="fsec"><h3 class="fsec__t">Ne parla anche</h3><div class="chips">${rel.map(link).join('')}</div></section>` : ''}
    <div class="actions"><button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>`;
}

export function render(params, query = {}) {
  const m = params.id ? byId(params.id) : null;
  if (m) return { left: '', right: detail(m), show: 'right', accent: section.accent, title: m.title };
  return { left: index(query.q), right: '', show: 'left', accent: section.accent, title: 'Come si gioca' };
}

export function bind(root, rerender) {
  let t = null;
  root.addEventListener('input', (e) => {
    const q = e.target.closest('[data-mec-q]'); if (!q) return;
    clearTimeout(t); t = setTimeout(() => { const v = q.value.trim(); const pos = q.selectionStart; history.replaceState(history.state, '', v ? `#/meccaniche?q=${encodeURIComponent(v)}` : '#/meccaniche'); rerender(); const n = document.querySelector('[data-mec-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250);
  });
}
