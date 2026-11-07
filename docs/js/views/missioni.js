/**
 * Missioni: la storia, capitolo per capitolo, senza spoiler.
 * Regola: si vede solo ciò che stai facendo o hai già fatto. Il resto è «Missione 03 · bloccata».
 * La prossima missione si rivela quando tocchi «Inizio adesso».
 */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, protagonistChip, pad2 } from '../ui/dom.js';
import { sectionHead, backLink, row, acc, hero, vis, sectionOf, missionActLabel , extrasHtml} from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('missioni');

/** La missione è visibile se in corso o completata (o se il modo spoiler è spento) */
export function isRevealed(m) {
  const s = progress.get().missions[m.id]?.state;
  return !!s || !progress.settings().spoilerShield;
}
/** Il capitolo è «aperto» se contiene una missione in corso o completata */
function chapterState(a, missions) {
  const st = progress.get();
  const list = missions.filter((m) => m.actId === a.id);
  const done = list.filter((m) => st.missions[m.id]?.state === 'completata').length;
  const started = list.some((m) => st.missions[m.id]?.state);
  const cur = list.some((m) => st.missions[m.id]?.state === 'in-corso');
  return { list, done, started, cur, complete: list.length > 0 && done === list.length };
}
/** Capitolo corrente: quello con la missione in corso; altrimenti il primo non completato dopo l'ultimo iniziato */
export function currentAct(missions = vis(db.missions)) {
  const acts = db.acts;
  const withCur = acts.find((a) => chapterState(a, missions).cur); if (withCur) return withCur;
  const started = acts.filter((a) => chapterState(a, missions).started);
  const lastStarted = started[started.length - 1];
  if (lastStarted && !chapterState(lastStarted, missions).complete) return lastStarted;
  const idx = lastStarted ? acts.indexOf(lastStarted) + 1 : 0;
  return acts[idx] || acts[0];
}

function ringHtml(pct, label, sub) {
  const circ = 2 * Math.PI * 54;
  return `<div class="ring ring--story"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring__track" cx="60" cy="60" r="54" fill="none" stroke-width="8"/><circle class="ring__bar" cx="60" cy="60" r="54" fill="none" stroke-width="8" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct / 100)}"/></svg><div class="ring__label"><b>${pct}%</b><small>${esc(label)}</small></div></div>`;
}

function index() {
  const st = progress.get();
  const missions = vis(db.missions);
  const acts = db.acts;
  if (!missions.length) return `${sectionHead(section)}<div class="placeholder"><strong>Nessuna missione ancora</strong>Dopo il 19 novembre: gioca, prendi appunti, passa il Pacchetto a Claude e questo indice si riempie da solo.</div>`;
  const cur = currentAct(missions);
  const cs = chapterState(cur, missions);
  const chapterPct = cs.list.length ? Math.round(cs.done / cs.list.length * 100) : 0;
  const curMission = missions.find((m) => st.missions[m.id]?.state === 'in-corso');
  const totalDone = missions.filter((m) => st.missions[m.id]?.state === 'completata').length;
  const curLabel = cur.number === 0 ? 'Prologo' : `Capitolo ${cur.number}`;
  const shield = progress.settings().spoilerShield;

  return `${sectionHead(section, `${totalDone} fatte`)}
    ${db.synopsis ? `<blockquote class="synopsis"><span class="kicker kicker--accent">La storia</span><p>${esc(db.synopsis)}</p><span class="chips">${statusChip({ status: 'verificato' })}</span></blockquote>` : ''}
    <div class="storyboard"><div class="storyboard__ring">${ringHtml(chapterPct, curLabel, '')}</div>
      <div class="storyboard__text"><span class="kicker kicker--accent">${esc(curLabel)}${cs.started ? ' · ' + esc(cur.title) : ''}</span>
        <h2>${cs.list.length ? (cs.complete ? 'Capitolo completato' : `${cs.list.length - cs.done} mission${cs.list.length - cs.done === 1 ? 'e' : 'i'} da fare`) : 'In arrivo'}</h2>
        <p class="small muted">${curMission ? `In corso: <a href="#/missioni/${esc(curMission.id)}">${esc(curMission.title)}</a>` : cs.list.length ? 'Nessuna missione in corso: apri la prossima e tocca «Inizio adesso».' : 'Le missioni di questo capitolo arrivano giocando.'}</p>
        ${cs.list.length ? `<div class="storyboard__dots">${cs.list.map((m) => `<i class="dot ${st.missions[m.id]?.state === 'completata' ? 'is-done' : st.missions[m.id]?.state === 'in-corso' ? 'is-cur' : ''}"></i>`).join('')}</div>` : ''}
      </div></div>
    ${shield ? '' : '<p class="callout callout--warn small">Scudo spoiler spento: vedi tutti i nomi. Riaccendilo in Impostazioni.</p>'}
    ${extrasHtml({ extras: db.actsExtras })}
    <div class="chapters">${acts.map((a) => {
      const c = chapterState(a, missions);
      const isCur = a === cur;
      const named = c.started || !shield;
      const off = !c.list.length;
      const p = c.list.length ? Math.round(c.done / c.list.length * 100) : 0;
      const title = named ? a.title : (a.number === 0 ? 'Prologo' : `Capitolo ${a.number}`);
      return `<div class="acc chapter ${isCur ? 'is-open chapter--current' : ''} ${c.complete ? 'chapter--done' : ''} ${off || (!named && !isCur) ? 'chapter--off' : ''}">
        <button class="acc__btn chapter__btn" type="button" aria-expanded="${isCur}">
          <span class="chapter__num" aria-hidden="true">${pad2(a.number)}</span><span class="chapter__text"><span class="chapter__title">${esc(title)}</span><span class="chapter__meta">${off ? 'in arrivo' : named ? `${c.done} / ${c.list.length}${c.complete ? ' · completato' : ''}` : `${c.list.length} mission${c.list.length === 1 ? 'e' : 'i'} · bloccato`}</span>${off || !named ? '' : `<span class="progress"><i style="--p:${p}%"></i></span>`}</span>
          <span class="chapter__pct">${off || !named ? '' : p + '%'}</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
        <div class="acc__body">${off ? `<p class="small muted" style="padding:var(--s-2) 0 var(--s-3)">${esc(db.actsNote || 'Capitolo segnaposto.')}</p>` : ''}${c.list.map((m, i) => {
          const s = st.missions[m.id]?.state;
          const shown = !!s || !shield;
          const end = s === 'completata' ? '<svg aria-hidden="true" style="color:var(--teal)"><use href="#i-check"/></svg>' : s === 'in-corso' ? '<span class="follow-bar__dot" aria-hidden="true"></span>' : '<svg aria-hidden="true" style="color:var(--ink-3)"><use href="#i-lock"/></svg>';
          return row({ href: `#/missioni/${m.id}`, num: pad2(i + 1), done: s === 'completata', end,
            title: shown ? esc(m.title) : `<span class="muted">Missione ${pad2(i + 1)}</span>`,
            meta: shown ? `${esc(byId(m.districtId)?.name || '')}${m.protagonist ? ' · ' + esc({ jason: 'Jason', lucia: 'Lucia', entrambi: 'Jason & Lucia' }[m.protagonist]) : ''}${m.example ? ' · Esempio' : ''}` : 'Bloccata: si rivela quando la inizi' });
        }).join('')}</div></div>`; }).join('')}</div>`;
}

function detail(m) {
  const st = progress.get();
  const state = st.missions[m.id]?.state;
  const district = byId(m.districtId);
  const shown = !!state || !progress.settings().spoilerShield;
  const list = (arr, empty) => arr?.length ? `<ul>${arr.map((t) => `<li>${esc(typeof t === 'string' ? t : t.label || t.title || JSON.stringify(t))}</li>`).join('')}</ul>` : `<p class="muted small">${esc(empty)}</p>`;
  const idx = vis(db.missions).filter((x) => x.actId === m.actId).indexOf(m) + 1;
  const actLabel = (() => { const a = db.acts.find((x) => x.id === m.actId); return a ? (a.number === 0 ? 'Prologo' : `Capitolo ${a.number}`) : ''; })();
  // Niente paradossi: si comincia solo se la missione prima è completata
  const all = vis(db.missions); const pi = all.indexOf(m); const prevM = pi > 0 ? all[pi - 1] : null;
  const blocked = !state && prevM && st.missions[prevM.id]?.state !== 'completata';
  const prevLabel = prevM ? (() => { const a = db.acts.find((x) => x.id === prevM.actId); const i = all.filter((x) => x.actId === prevM.actId).indexOf(prevM) + 1; return `${a ? (a.number === 0 ? 'Prologo' : 'Capitolo ' + a.number) : ''} · Missione ${pad2(i)}`; })() : '';
  const blockedHtml = `<div class="callout callout--lock"><svg aria-hidden="true"><use href="#i-lock"/></svg><span><b>Prima finisci quella precedente.</b> Questa si sblocca quando segni come completata la ${esc(prevLabel)}.</span></div>
    <div class="actions"><a class="btn btn--ghost" href="#/missioni/${esc(prevM?.id || '')}">Vai alla missione precedente</a></div>`;
  if (!shown) {
    if (blocked) return `
    ${backLink('/missioni', 'Missioni')}
    <div class="hero hero--text hero--locked"><div class="hero__text"><span class="kicker">${esc(actLabel)} · Missione ${pad2(idx)}</span><h1>Bloccata</h1><p class="lede">Nome, luogo e personaggi restano nascosti finché non la cominci. Niente spoiler.</p></div></div>
    ${blockedHtml}`;
    return `
    ${backLink('/missioni', 'Missioni')}
    <div class="hero hero--text hero--locked"><div class="hero__text"><span class="kicker">${esc(actLabel)} · Missione ${pad2(idx)}</span><h1>Bloccata</h1><p class="lede">Nome, luogo e personaggi restano nascosti finché non la cominci. Niente spoiler.</p></div></div>
    <div class="actions">
      <button class="btn btn--solid" data-mission="${esc(m.id)}" data-set="in-corso"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizio adesso: rivela</button>
      <button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="completata">L'ho già fatta</button>
    </div>
    <p class="small muted">Toccando «Inizio adesso» la guida sa dove sei: si accendono personaggi, regioni e consigli di questa missione.</p>`;
  }
  return `
    ${backLink('/missioni', 'Missioni')}
    ${hero(m, { kicker: `${esc(actLabel)} · Missione ${pad2(idx)}${district ? ' · ' + district.name : ''}`, title: m.title, chips: statusChip(m) + protagonistChip(m.protagonist) })}
    <div class="prose">${spoiler.wrap(m, `<p class="lede">${esc(m.summary || 'Nessun riassunto ancora.')}</p>`)}</div>
    ${extrasHtml(m)}
    ${blocked ? blockedHtml : ''}
    <div class="actions">
      ${state === 'in-corso'
        ? `<button class="btn btn--accent" data-mission="${esc(m.id)}" data-set="completata"><svg aria-hidden="true"><use href="#i-check"/></svg>Completata</button>
           <button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="">Interrompi</button>`
        : state === 'completata'
        ? `<button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="in-corso">Rigioco</button><button class="btn btn--ghost" data-mission="${esc(m.id)}" data-set="">Segna non completata</button>`
        : blocked ? ''
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
`;
}

export function render(params) {
  const m = params.id ? byId(params.id) : null;
  const shown = m && isRevealed(m);
  return { left: m ? '' : index(), right: m ? detail(m) : '', show: m ? 'right' : 'left', accent: section.accent, title: m ? (shown ? m.title : 'Missione bloccata') : 'Missioni' };
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mission][data-set]');
    if (b) { progress.setMissionState(b.dataset.mission, b.dataset.set || null); rerender(); return; }
    const x = e.target.closest('[data-extra]');
    if (x) { progress.toggleExtra(x.dataset.mission, x.dataset.extra); rerender(); }
  });
}
