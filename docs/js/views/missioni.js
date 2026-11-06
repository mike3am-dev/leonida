import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, protagonistChip, pad2 } from '../ui/dom.js';
import { sectionHead, backLink, row, acc, hero, vis, sectionOf, missionActLabel } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('missioni');

function index(activeId, filterAct) {
  const st = progress.get();
  const missions = vis(db.missions).filter((m) => !filterAct || m.actId === filterAct);
  const acts = db.acts.filter((a) => missions.some((m) => m.actId === a.id));
  const done = missions.filter((m) => st.missions[m.id]?.state === 'completata').length;
  if (!missions.length) {
    return `${sectionHead(section)}<div class="placeholder"><strong>Nessuna missione ancora</strong>Dopo il 19 novembre: gioca, prendi appunti, passa il Pacchetto a Claude e questo indice si riempie da solo.</div>`;
  }
  const pct = missions.length ? Math.round(done / missions.length * 100) : 0;
  // Capitolo «attivo»: quello con la missione in corso, altrimenti il primo con missioni da fare
  const curId = st.current.missionId;
  const activeAct = acts.find((a) => missions.some((m) => m.actId === a.id && m.id === curId)) || acts.find((a) => missions.some((m) => m.actId === a.id && st.missions[m.id]?.state !== 'completata')) || acts[0];
  return `${sectionHead(section, `${done} / ${missions.length}`)}
    <div class="card card--progress"><div class="stat"><div class="stat__value">${pct}%</div><div class="stat__label">${done === missions.length ? 'Storia completata' : `${missions.length - done} missioni da fare`}${curId && byId(curId) ? ` · in corso: <a href="#/missioni/${esc(curId)}">${esc(byId(curId).title)}</a>` : ''}</div></div><div class="progress" style="margin-top:var(--s-2)"><i style="--p:${pct}%"></i></div></div>
    <div class="chapters">${acts.map((a) => {
      const list = missions.filter((m) => m.actId === a.id);
      const d = list.filter((m) => st.missions[m.id]?.state === 'completata').length;
      const p = list.length ? Math.round(d / list.length * 100) : 0;
      const open = a === activeAct;
      return `<div class="acc chapter ${open ? 'is-open' : ''} ${d === list.length ? 'chapter--done' : ''}">
        <button class="acc__btn chapter__btn" type="button" aria-expanded="${open}">
          <span class="chapter__num" aria-hidden="true">${String(acts.indexOf(a) + 1).padStart(2, '0')}</span><span class="chapter__text"><span class="chapter__title">${esc(a.title)}</span><span class="chapter__meta">${d} / ${list.length}${d === list.length ? ' · completato' : ''}</span><span class="progress"><i style="--p:${p}%"></i></span></span>
          <span class="chapter__pct">${p}%</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
        <div class="acc__body">${list.map((m, i) => {
          const s = st.missions[m.id]?.state;
          const end = s === 'completata' ? '<svg aria-hidden="true" style="color:var(--teal)"><use href="#i-check"/></svg>' : s === 'in-corso' ? '<span class="follow-bar__dot" aria-hidden="true"></span>' : '';
          return row({ href: `#/missioni/${m.id}`, num: pad2(i + 1), active: m.id === activeId, done: s === 'completata', end,
            title: spoiler.isHidden(m) && !s ? '<span class="muted">⚠ Spoiler</span>' : esc(m.title),
            meta: `${esc(byId(m.districtId)?.name || '')}${m.protagonist ? ' · ' + esc({ jason: 'Jason', lucia: 'Lucia', entrambi: 'Jason & Lucia' }[m.protagonist]) : ''}${m.example ? ' · Esempio' : ''}` });
        }).join('')}</div></div>`; }).join('')}</div>`;
}

function detail(m) {
  const st = progress.get();
  const state = st.missions[m.id]?.state;
  const district = byId(m.districtId);
  const list = (arr, empty) => arr?.length ? `<ul>${arr.map((t) => `<li>${esc(typeof t === 'string' ? t : t.label || t.title || JSON.stringify(t))}</li>`).join('')}</ul>` : `<p class="muted small">${esc(empty)}</p>`;
  return `
    ${backLink('/missioni', 'Missioni')}
    ${hero(m, { kicker: `${missionActLabel(m)}${m.chapter && !/capitolo/i.test(missionActLabel(m)) ? ` · Capitolo ${m.chapter}` : ''}${district ? ' · ' + district.name : ''}`, title: m.title, chips: statusChip(m) + protagonistChip(m.protagonist) })}
    <div class="prose">${spoiler.wrap(m, `<p class="lede">${esc(m.summary || 'Nessun riassunto ancora.')}</p>`)}</div>
    <div class="actions">
      ${state === 'in-corso'
        ? `<button class="btn btn--accent" data-mission="${esc(m.id)}" data-set="completata"><svg aria-hidden="true"><use href="#i-check"/></svg>Completata</button>
           <button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="">Interrompi</button>`
        : state === 'completata'
        ? `<button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="">Segna non completata</button>`
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
    <div class="block">
      ${acc('Prerequisiti e sblocchi', `<div class="prose">${m.prerequisites?.length ? `<p class="kicker">Richiede</p><ul>${m.prerequisites.map((id) => { const p = byId(id); return `<li><a href="#/missioni/${esc(id)}">${esc(p?.title || id)}</a></li>`; }).join('')}</ul>` : '<p class="muted small">Nessun prerequisito.</p>'}<p class="kicker">Sblocca</p>${list(m.unlocks, 'Nulla di noto.')}</div>`, true)}
      ${acc('Ricompense', `<div class="prose">${list(m.rewards, 'Nessuna registrata.')}</div>`)}
      ${acc('Consigli', `<div class="prose">${list(m.tips, 'Nessun consiglio ancora: aggiungili dopo averla giocata.')}</div>`)}
      ${acc('Segreti', m.secrets?.length ? spoiler.wrap(m, `<div class="prose">${list(m.secrets)}</div>`, 'Segreti') : '<p class="muted small">Nessun segreto registrato.</p>')}
    </div>
    <p class="source-line">Fonte: ${esc(m.source)} · aggiornato ${esc(m.updatedAt || '—')}</p>`;
}

export function render(params, query) {
  const m = params.id ? byId(params.id) : null;
  return { left: m ? '' : index(null, query.atto), right: m ? detail(m) : '', show: m ? 'right' : 'left', accent: section.accent, title: m?.title || 'Missioni' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mission][data-set]');
    if (b) { progress.setMissionState(b.dataset.mission, b.dataset.set || null); rerender(); return; }
    const x = e.target.closest('[data-extra]');
    if (x) { progress.toggleExtra(x.dataset.mission, x.dataset.extra); rerender(); }
  });
}
