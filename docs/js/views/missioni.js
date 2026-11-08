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
import { openMissionDone } from './diario.js';

const section = sectionOf('missioni');

/** La missione è visibile se in corso o completata (o se il modo spoiler è spento) */
export function isRevealed(m) { return spoiler.missionRevealed(m); }
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

/** La prossima missione da giocare: la prima senza stato dopo l'ultima completata */
export function nextUp(missions = vis(db.missions)) {
  const st = progress.get();
  if (missions.some((m) => st.missions[m.id]?.state === 'in-corso')) return null;
  const last = missions.reduce((acc, m, i) => (st.missions[m.id]?.state === 'completata' ? i : acc), -1);
  return missions.slice(last + 1).find((m) => !st.missions[m.id]?.state) || null;
}
const actName = (a) => (a ? (a.number === 0 ? 'Prologo' : `Capitolo ${a.number}`) : '');
function place(m) {
  const all = vis(db.missions).filter((x) => x.actId === m.actId);
  return { i: all.indexOf(m) + 1, n: all.length, act: actName(db.acts.find((x) => x.id === m.actId)) };
}
const checkHtml = (missionId, id, label, done) => `
  <div class="check" data-done="${done}">
    <button class="check__box" role="checkbox" aria-checked="${done}" data-extra="${esc(id)}" data-mission="${esc(missionId)}" aria-label="${esc(label)}"><i><svg aria-hidden="true"><use href="#i-check"/></svg></i></button>
    <div class="check__body"><div class="check__title">${esc(label)}</div></div>
  </div>`;

function index() {
  const st = progress.get();
  const missions = vis(db.missions);
  const acts = db.acts;
  if (!missions.length) return `${sectionHead(section)}<div class="placeholder"><strong>Nessuna missione ancora</strong>Dopo il 19 novembre: gioca, prendi appunti, passa il Pacchetto a Claude e questo indice si riempie da solo.</div>`;
  const cur = currentAct(missions);
  const cs = chapterState(cur, missions);
  const chapterPct = cs.list.length ? Math.round(cs.done / cs.list.length * 100) : 0;
  const curMission = missions.find((m) => st.missions[m.id]?.state === 'in-corso');
  const nx = nextUp(missions);
  const totalDone = missions.filter((m) => st.missions[m.id]?.state === 'completata').length;
  const curLabel = actName(cur);
  const shield = progress.settings().spoilerShield;
  const left = cs.list.length - cs.done;
  const cta = curMission
    ? `<a class="btn btn--solid" href="#/missioni/${esc(curMission.id)}"><svg aria-hidden="true"><use href="#i-book"/></svg>Apri il taccuino</a>`
    : nx ? `<button class="btn btn--solid" type="button" data-start-mission="${esc(nx.id)}"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizia la prossima</button>` : '';

  return `${sectionHead(section, `${totalDone} fatte`)}
    ${db.synopsis ? `<blockquote class="synopsis"><span class="kicker kicker--accent">La storia</span><p>${esc(db.synopsis)}</p><span class="chips">${statusChip({ status: 'verificato' })}</span></blockquote>` : ''}
    <div class="storyboard"><div class="storyboard__ring">${ringHtml(chapterPct, curLabel, '')}</div>
      <div class="storyboard__text"><span class="kicker kicker--accent">${esc(curLabel)}${cs.started ? ' · ' + esc(cur.title) : ''}</span>
        <h2>${curMission ? esc(curMission.title) : cs.list.length ? (cs.complete ? 'Capitolo completato' : `${left} mission${left === 1 ? 'e' : 'i'} da fare`) : 'In arrivo'}</h2>
        <p class="small muted">${curMission ? 'La stai giocando adesso.' : nx ? 'Un tocco e ci sei: il nome si scopre quando parti.' : cs.list.length ? '' : 'Le missioni di questo capitolo arrivano giocando.'}</p>
        ${cs.list.length ? `<div class="storyboard__dots">${cs.list.map((m) => `<i class="dot ${st.missions[m.id]?.state === 'completata' ? 'is-done' : st.missions[m.id]?.state === 'in-corso' ? 'is-cur' : ''}"></i>`).join('')}</div>` : ''}
        ${cta ? `<div class="storyboard__cta">${cta}</div>` : ''}
      </div></div>
    ${shield ? '' : '<p class="callout callout--warn small">Scudo spoiler spento: vedi tutti i nomi. Riaccendilo in Impostazioni.</p>'}
    <div class="chapters">${acts.map((a) => {
      const c = chapterState(a, missions);
      const isCur = a === cur;
      const named = c.started || !shield;
      const off = !c.list.length;
      const p = c.list.length ? Math.round(c.done / c.list.length * 100) : 0;
      const title = named ? a.title : actName(a);
      return `<div class="acc chapter ${isCur ? 'is-open chapter--current' : ''} ${c.complete ? 'chapter--done' : ''} ${off || (!named && !isCur) ? 'chapter--off' : ''}">
        <button class="acc__btn chapter__btn" type="button" aria-expanded="${isCur}">
          <span class="chapter__num" aria-hidden="true">${pad2(a.number)}</span><span class="chapter__text"><span class="chapter__title">${esc(title)}</span><span class="chapter__meta">${off ? 'in arrivo' : `${c.done} di ${c.list.length}${c.complete ? ' · completato' : ''}`}</span>${off || !c.started ? '' : `<span class="progress"><i style="--p:${p}%"></i></span>`}</span>
          <span class="chapter__pct">${off || !c.started ? '' : p + '%'}</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
        <div class="acc__body">${off ? `<p class="small muted" style="padding:var(--s-2) 0 var(--s-3)">${esc(db.actsNote || 'Capitolo segnaposto.')}</p>` : ''}${c.list.map((m, i) => {
          const s = st.missions[m.id]?.state;
          const shown = !!s || !shield;
          const isNext = nx && nx.id === m.id;
          const end = s === 'completata' ? '<svg aria-hidden="true" style="color:var(--teal)"><use href="#i-check"/></svg>' : s === 'in-corso' ? '<span class="follow-bar__dot" aria-hidden="true"></span>' : isNext ? '' : '<svg aria-hidden="true" style="color:var(--ink-3)"><use href="#i-lock"/></svg>';
          return row({ href: `#/missioni/${m.id}`, num: String(i + 1), done: s === 'completata', end,
            title: shown ? esc(m.title) : isNext ? '<b>La prossima</b>' : '<span class="muted">Bloccata</span>',
            meta: shown ? `${esc(byId(m.districtId)?.name || '')}${m.protagonist ? ' · ' + esc({ jason: 'Jason', lucia: 'Lucia', entrambi: 'Jason & Lucia' }[m.protagonist]) : ''}${s === 'in-corso' ? ' · in corso' : ''}` : isNext ? 'Tocca per iniziarla' : '' });
        }).join('')}</div></div>`; }).join('')}</div>
    ${db.actsExtras?.length ? `<div class="block"><span class="kicker">Indiscrezioni sulla struttura</span>${spoiler.wrap({ spoilerLevel: 9 }, extrasHtml({ extras: db.actsExtras }))}</div>` : ''}`;
}

/* Timbro «Scelta senza ritorno» */
function stampHtml(m) {
  return m.choice?.irreversible ? `<div class="noreturn" role="note"><b>Scelta senza ritorno</b><span>Salva prima di iniziare: in questa missione prendi una decisione che non si può cambiare.</span></div>` : '';
}

/** Il taccuino: tutto quello che serve per chiudere la missione al 100%, da spuntare mentre giochi */
function notebook(m) {
  const ex = progress.get().missions[m.id]?.extras || {};
  const obj = (m.objectives || []).filter(Boolean);
  const extra = m.extraObjectives || [];
  const contact = m.contact ? (byId(m.contact) ? `<a href="#/personaggi/${esc(m.contact)}">${esc(byId(m.contact).name)}</a>` : esc(m.contact)) : '';
  const d = byId(m.districtId);
  const people = vis(db.characters).filter((c) => c.firstMissionId === m.id);
  const total = obj.length + extra.length;
  const done = obj.filter((_, i) => ex[`obj-${i + 1}`]).length + extra.filter((o) => ex[o.id]).length;
  return `<section class="notebook">
    <header class="notebook__head"><span class="notebook__title">Taccuino</span>${total ? `<span class="notebook__count">${done} / ${total}</span>` : ''}</header>
    ${contact || d ? `<div class="notebook__where">
      ${contact ? `<div><span class="kicker">Chi te la dà</span><b>${contact}</b></div>` : ''}
      ${d ? `<div><span class="kicker">Dove</span><b>${esc(d.name)}</b></div><a class="btn btn--ghost btn--sm" href="#/mappa?zona=${esc(d.id)}"><svg aria-hidden="true"><use href="#i-map"/></svg>Mappa</a>` : ''}
    </div>` : ''}
    <div class="notebook__part"><span class="kicker">Cosa devi fare</span>
      ${obj.length ? obj.map((o, i) => checkHtml(m.id, `obj-${i + 1}`, o, !!ex[`obj-${i + 1}`])).join('') : '<p class="small muted">I passi della missione arrivano dalle guide dal 19 novembre.</p>'}
    </div>
    ${people.length ? `<div class="notebook__part"><span class="kicker">Chi incontri</span><div class="notebook__people">${people.map((c) => `<a class="notebook__person" href="#/personaggi/${esc(c.id)}">${c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy">` : '<i></i>'}<span>${esc(c.name)}</span></a>`).join('')}</div></div>` : ''}
    ${extra.length ? `<div class="notebook__part"><span class="kicker">Per il 100%</span>${extra.map((o) => checkHtml(m.id, o.id, o.label, !!ex[o.id])).join('')}</div>` : ''}
  </section>`;
}

function detail(m) {
  const st = progress.get();
  const state = st.missions[m.id]?.state;
  const district = byId(m.districtId);
  const shown = isRevealed(m);
  const list = (arr) => `<ul>${arr.map((t) => `<li>${esc(typeof t === 'string' ? t : t.label || t.title || JSON.stringify(t))}</li>`).join('')}</ul>`;
  const pl = place(m);
  const all = vis(db.missions); const pi = all.indexOf(m); const prevM = pi > 0 ? all[pi - 1] : null;
  const blocked = !state && prevM && st.missions[prevM.id]?.state !== 'completata';
  const next = all.slice(pi + 1).find((x) => st.missions[x.id]?.state !== 'completata');
  if (!shown) {
    return `
    ${backLink('/missioni', 'Missioni')}
    <div class="hero hero--text hero--locked"><div class="hero__text"><span class="kicker">${esc(pl.act)} · ${pl.i} di ${pl.n}</span><h1>${blocked ? 'Non ancora' : 'Pronta a partire'}</h1><p class="lede">${blocked ? 'Si sblocca quando finisci la missione prima.' : 'Il nome, il luogo e chi incontri si scoprono quando la inizi.'}</p></div></div>
    ${stampHtml(m)}
    <div class="actions">${blocked
      ? `<a class="btn btn--solid" href="#/missioni/${esc(prevM?.id || '')}">Vai alla missione prima</a>`
      : `<button class="btn btn--solid btn--big" type="button" data-start-mission="${esc(m.id)}"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizia</button>
         <button class="btn btn--ghost" type="button" data-mission="${esc(m.id)}" data-set="completata">L'ho già fatta</button>`}</div>`;
  }
  const sum = m.summary || '';
  const cut = state !== 'completata' ? sum.search(/[.!?](\s|$)/) : -1;
  const summary = !sum ? '' : (cut > 0 && cut < sum.length - 2)
    ? `<p class="lede">${esc(sum.slice(0, cut + 1))}</p>${spoiler.ink(`<p>${esc(sum.slice(cut + 1).trim())}</p>`)}`
    : `<p class="lede">${esc(sum)}</p>`;
  const reqs = (m.prerequisites || []).map((id) => byId(id)).filter(Boolean);
  const unl = (m.unlocks || []).map((u) => (u?.type === 'mission' && u.ref && byId(u.ref) && !spoiler.missionRevealed(byId(u.ref))) ? 'Una nuova missione' : u);
  return `
    ${backLink('/missioni', 'Missioni')}
    ${hero(m, { kicker: `${pl.act} · ${pl.i} di ${pl.n}${district ? ' · ' + district.name : ''}`, title: m.title, chips: statusChip(m) + protagonistChip(m.protagonist) })}
    ${state === 'completata' ? `<div class="passed">
        <span class="passed__title">Missione compiuta</span>
        <div class="actions">${next ? (st.missions[next.id]?.state ? `<a class="btn btn--solid" href="#/missioni/${esc(next.id)}">Vai alla prossima</a>` : `<button class="btn btn--solid" type="button" data-start-mission="${esc(next.id)}"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizia la prossima</button>`) : ''}<a class="btn btn--ghost" href="#/missioni">Torna alle missioni</a></div>
        <p class="passed__more"><button type="button" class="linkbtn" data-mission="${esc(m.id)}" data-set="in-corso">Rigiocala</button> · <button type="button" class="linkbtn" data-mission="${esc(m.id)}" data-set="">Non l'ho finita</button></p>
      </div>` : stampHtml(m)}
    <div class="prose">${summary}</div>
    ${extrasHtml(m)}
    ${notebook(m)}
    ${state === 'in-corso' ? `<div class="actions mission-actions">
      <button class="btn btn--solid btn--big" type="button" data-mission="${esc(m.id)}" data-set="completata"><svg aria-hidden="true"><use href="#i-check"/></svg>Missione compiuta</button>
      <button class="btn btn--ghost" type="button" data-action="note" data-mission-ctx="${esc(m.id)}"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
    </div>
    <p class="small muted"><button type="button" class="linkbtn" data-mission="${esc(m.id)}" data-set="">Non la sto giocando</button></p>` : state === 'completata' ? `<div class="actions"><button class="btn btn--ghost" type="button" data-action="note" data-mission-ctx="${esc(m.id)}"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>` : ''}
    ${m.rewards?.length ? `<div class="block"><span class="kicker">Ricompense</span><div class="prose">${list(m.rewards)}</div></div>` : ''}
    ${m.tips?.length ? `<div class="block"><span class="kicker">Consigli</span><div class="prose">${list(m.tips)}</div></div>` : ''}
    ${m.secrets?.length ? `<div class="block"><span class="kicker">Segreti</span><div class="prose">${spoiler.ink(list(m.secrets))}</div></div>` : ''}
    ${reqs.length || unl.length ? `<p class="small muted mission-links">${reqs.length ? `Dopo: ${reqs.map((p) => `<a href="#/missioni/${esc(p.id)}">${esc(spoiler.missionName(p, 'una missione precedente'))}</a>`).join(', ')}.` : ''} ${unl.length ? `Sblocca: ${unl.map((u) => esc(typeof u === 'string' ? u : u.label || '')).join(', ')}.` : ''}</p>` : ''}
`;
}

export function render(params) {
  const m = params.id ? byId(params.id) : null;
  const shown = m && isRevealed(m);
  return { left: m ? '' : index(), right: m ? detail(m) : '', show: m ? 'right' : 'left', accent: section.accent, title: m ? (shown ? m.title : 'Missione bloccata') : 'Missioni' };
}

export function bind(root, rerender) {
  const start = (id) => {
    progress.setMissionState(id, 'in-corso');
    const target = `#/missioni/${id}`;
    if (location.hash === target) rerender(); else location.hash = target;
  };
  root.addEventListener('click', (e) => {
    const go = e.target.closest('[data-start-mission]');
    if (go) { start(go.dataset.startMission); return; }
    const b = e.target.closest('[data-mission][data-set]');
    if (b) {
      progress.setMissionState(b.dataset.mission, b.dataset.set || null); rerender();
      if (b.dataset.set === 'completata') {
        const list = vis(db.missions), i = list.findIndex((x) => x.id === b.dataset.mission);
        const nx = list.slice(i + 1).find((x) => !progress.get().missions[x.id]?.state);
        openMissionDone(byId(b.dataset.mission), { next: nx, onNext: nx ? () => start(nx.id) : null });
      }
      return;
    }
    const x = e.target.closest('[data-extra]');
    if (x) { progress.toggleExtra(x.dataset.mission, x.dataset.extra); rerender(); }
  });
}
