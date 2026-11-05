import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, protagonistChip, pad2 } from '../ui/dom.js';
import { chapterHead, runningHead, backLink, opener, vis, sectionOf, missionActLabel, isOpen } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('missioni');

function tocList(activeId, filterAct) {
  const st = progress.get();
  const missions = vis(db.missions).filter((m) => !filterAct || m.actId === filterAct);
  const acts = db.acts.filter((a) => missions.some((m) => m.actId === a.id));
  if (!missions.length) {
    return `<div class="placeholder"><strong>Nessuna missione ancora</strong>Dopo il 19 novembre: gioca, prendi appunti, passa il Pacchetto a Claude e questo indice si riempie da solo.</div>`;
  }
  return `<ol class="toc">${acts.map((a) => `
    <li class="toc__section">
      <span class="kicker">${esc(a.title)}</span>
      <ol class="toc">${missions.filter((m) => m.actId === a.id).map((m, i) => {
        const s = st.missions[m.id]?.state;
        const icon = s === 'completata' ? '<svg aria-hidden="true" style="color:var(--teal)"><use href="#i-check"/></svg>' : s === 'in-corso' ? '<span class="follow-bar__dot" aria-hidden="true"></span>' : '';
        return `<li><a class="toc__row" href="#/missioni/${esc(m.id)}" ${m.id === activeId ? 'aria-current="page"' : ''}>
          <span class="toc__num">${pad2(i + 1)}</span>
          <span><span class="toc__title">${spoiler.isHidden(m) && !s ? '<span class="muted">• • •</span>' : esc(m.title)}</span>
          <span class="toc__meta">${esc(byId(m.districtId)?.name || '')}${m.example ? ' · Esempio' : ''}</span></span>
          <span class="toc__end">${icon}<svg aria-hidden="true"><use href="#i-arrow"/></svg></span>
        </a></li>`; }).join('')}</ol>
    </li>`).join('')}</ol>`;
}

function detail(m) {
  if (!m) return opener(section, 'Un indice come quello di un libro: scegli un capitolo a sinistra. Ogni missione ha prerequisiti, ricompense, obiettivi extra da spuntare e segreti protetti dallo scudo spoiler.');
  const st = progress.get();
  const state = st.missions[m.id]?.state;
  const district = byId(m.districtId);
  const hidden = spoiler.isHidden(m);
  const list = (arr, empty) => arr?.length ? `<ul>${arr.map((t) => `<li>${esc(typeof t === 'string' ? t : t.label || t.title || JSON.stringify(t))}</li>`).join('')}</ul>` : `<p class="muted small">${esc(empty)}</p>`;

  return `
    ${backLink('/missioni')}
    ${runningHead(missionActLabel(m) + (m.chapter ? ` · Capitolo ${m.chapter}` : ''), district?.name || '')}
    <div class="chips" style="margin-bottom:var(--s-3)">${statusChip(m)}${protagonistChip(m.protagonist)}</div>
    <h1 style="margin-bottom:var(--s-3)">${esc(m.title)}</h1>
    ${m.image ? `<img src="${esc(m.image)}" alt="" style="border-radius:var(--radius);margin-bottom:var(--s-4)" loading="lazy">` : ''}
    ${spoiler.wrap(m, `<p class="lede">${esc(m.summary || 'Nessun riassunto ancora.')}</p>`)}

    <div class="btn-row" style="margin:var(--s-4) 0 var(--s-5)">
      ${state === 'in-corso'
        ? `<button class="btn btn--accent" data-mission="${esc(m.id)}" data-set="completata"><svg aria-hidden="true"><use href="#i-check"/></svg>Completata</button>
           <button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="">Interrompi</button>`
        : state === 'completata'
        ? `<button class="btn" data-mission="${esc(m.id)}" data-set="">Segna come non completata</button>`
        : `<button class="btn btn--solid" data-mission="${esc(m.id)}" data-set="in-corso"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizio adesso</button>
           <button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="completata">Già fatta</button>`}
      <button class="btn btn--ghost" data-action="note" data-mission-ctx="${esc(m.id)}"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
    </div>

    ${m.extraObjectives?.length ? `<div class="block"><span class="kicker">Obiettivi extra</span>
      ${m.extraObjectives.map((o) => { const done = progress.hasExtra(m.id, o.id); return `
        <div class="check" data-done="${done}">
          <button class="check__box" role="checkbox" aria-checked="${done}" data-extra="${esc(o.id)}" data-mission="${esc(m.id)}" aria-label="${esc(o.label)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
          <div class="check__body"><div class="check__title">${esc(o.label)}</div></div>
        </div>`; }).join('')}</div>` : ''}

    <div class="block prose">
      <span class="kicker">Prerequisiti</span>
      ${m.prerequisites?.length ? `<ul>${m.prerequisites.map((id) => { const p = byId(id); return `<li><a href="#/missioni/${esc(id)}">${esc(p?.title || id)}</a></li>`; }).join('')}</ul>` : '<p class="muted small">Nessuno.</p>'}
      <span class="kicker">Sblocca</span>${list(m.unlocks, 'Nulla di noto.')}
      <span class="kicker">Ricompense</span>${list(m.rewards, 'Nessuna registrata.')}
    </div>

    <div class="block prose">
      <span class="kicker">Consigli</span>${list(m.tips, 'Nessun consiglio ancora: aggiungili dopo averla giocata.')}
    </div>
    <div class="block prose">
      <span class="kicker">Segreti</span>
      ${m.secrets?.length ? spoiler.wrap(m, list(m.secrets), 'Segreti: tocca per rivelare') : '<p class="muted small">Nessun segreto registrato.</p>'}
    </div>
    <p class="source-line">Fonte: ${esc(m.source)} · aggiornato ${esc(m.updatedAt || '—')}${hidden ? ' · protetto dallo scudo spoiler' : ''}</p>`;
}

export function render(params, query) {
  const id = params.id;
  const m = id ? byId(id) : null;
  const left = `${chapterHead(section, { kicker: 'Capitolo secondo', title: 'Missioni' })}${tocList(id, query.atto)}`;
  return { left, right: detail(m), show: id ? 'right' : 'left', accent: section.accent, title: m?.title || 'Missioni' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mission][data-set]');
    if (b) { progress.setMissionState(b.dataset.mission, b.dataset.set || null); rerender(); return; }
    const x = e.target.closest('[data-extra]');
    if (x) { progress.toggleExtra(x.dataset.mission, x.dataset.extra); rerender(); }
  });
}
