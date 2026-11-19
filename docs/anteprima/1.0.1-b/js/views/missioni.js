/**
 * Missioni: la storia, capitolo per capitolo, senza spoiler.
 * Regola: si vede solo ciò che stai facendo o hai già fatto. Il resto è «Missione 03 · bloccata».
 * La prossima missione si rivela quando tocchi «Inizio adesso».
 */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, statusChip, protagonistChip, pad2 } from '../ui/dom.js';
import { sectionHead, backLink, row, acc, hero, vis, sectionOf, missionActLabel, extrasHtml, face } from './shared.js';
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
const isSide = (m) => !!(m.optional || m.kind);
function place(m) {
  if (isSide(m)) { const all = vis(db.sideMissions || []).filter((x) => x.actId === m.actId); return { i: all.indexOf(m) + 1, n: all.length, act: actName(db.acts.find((x) => x.id === m.actId)), side: m.kind === 'compito' ? 'Compito' : 'Facoltativa' }; }
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
  if (!missions.length) return `${sectionHead(section)}<div class="placeholder"><strong>Nessuna missione ancora</strong>L'elenco delle missioni non si è caricato. Chiudi e riapri la guida.</div>`;
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
    ${recap(missions, st)}
    <div class="storyboard"><div class="storyboard__ring">${ringHtml(chapterPct, curLabel, '')}</div>
      <div class="storyboard__text"><span class="kicker kicker--accent">${esc(curLabel)}${cs.started && cur.title.replace(/^Capitolo \d+:\s*/, '') !== cur.title ? ' · ' + esc(cur.title.replace(/^Capitolo \d+:\s*/, '')) : ''}</span>
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
        <div class="acc__body">${off ? `<p class="small muted" style="padding:var(--s-2) 0 var(--s-3)">${esc(db.actsNote || 'Capitolo segnaposto.')}</p>` : ''}${c.list.length ? `<ol class="mlist">${c.list.map((m, i) => missionRow(m, { n: i + 1, state: st.missions[m.id]?.state, next: nx && nx.id === m.id })).join('')}</ol>` : ''}${(() => {
          const side = vis(db.sideMissions || []).filter((m) => m.actId === a.id);
          if (!side.length || (!c.started && !isCur && shield)) return '';
          return `<p class="kicker side-head">Facoltative e compiti · ${side.filter((m) => st.missions[m.id]?.state === 'completata').length} di ${side.length}</p><ol class="mlist mlist--side">${side.map((m, i) => missionRow(m, { n: i + 1, state: st.missions[m.id]?.state, side: true })).join('')}</ol>`;
        })()}</div></div>`; }).join('')}</div>
    ${db.actsExtras?.length ? `<div class="block"><span class="kicker">Indiscrezioni sulla struttura</span>${spoiler.wrap({ spoilerLevel: 9 }, extrasHtml({ extras: db.actsExtras }))}</div>` : ''}`;
}

/** Titolo come nel gioco in italiano, con l'originale inglese tra parentesi (se diverso) */
export const titleHtml = (m) => `${esc(m.title)}${m.titleEn && m.titleEn !== m.title ? ` <span class="title-en">(${esc(m.titleEn)})</span>` : ''}`;
const WHO = { jason: 'Jason', lucia: 'Lucia', entrambi: 'Jason e Lucia' };

/** Una riga dell'elenco: numero, titolo in chiaro (se il capitolo è raggiunto), zona e protagonista, e lo stato detto a parole */
function missionRow(m, { n, state, next = false, side = false }) {
  const named = spoiler.missionNamed(m);
  const cls = state === 'completata' ? 'is-done' : state === 'in-corso' ? 'is-cur' : next ? 'is-next' : '';
  const tag = state === 'in-corso' ? '<span class="mrow__tag mrow__tag--cur"><i aria-hidden="true"></i>In corso</span>' : next ? '<span class="mrow__tag mrow__tag--next">La prossima</span>'
    : state === 'completata' ? '<span class="mrow__tag mrow__tag--done"><svg aria-hidden="true"><use href="#i-check"/></svg>Fatta</span>' : '';
  const kind = side ? (m.kind === 'compito' ? 'Compito' : 'Facoltativa') : '';
  const meta = named ? [kind, byId(m.districtId)?.name, WHO[m.protagonist], m.missable ? 'si può perdere' : ''].filter(Boolean).join(' · ') : (side ? 'Si scopre giocando' : 'Capitolo non ancora raggiunto');
  return `<li><a class="mrow ${cls}" href="#/missioni/${esc(m.id)}" ${state === 'in-corso' ? 'aria-current="true"' : ''}>
      <span class="mrow__n" aria-hidden="true">${side ? '·' : n}</span>
      <span class="mrow__text"><span class="mrow__title">${named ? titleHtml(m) : `<span class="muted">${side ? `${kind} ${n}` : `Missione ${n}`}</span>`}</span>${meta ? `<span class="mrow__meta">${esc(meta)}</span>` : ''}</span>
      ${tag}<svg class="mrow__go" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>`;
}

/** «Dove eravamo rimasti»: cosa è successo nelle ultime missioni fatte (solo quelle fatte: niente spoiler).
 *  Chi non ha ancora iniziato vede la presentazione ufficiale della storia. */
function recap(missions, st) {
  const done = missions.filter((m) => st.missions[m.id]?.state === 'completata');
  if (!done.length) return db.synopsis ? `<blockquote class="synopsis"><span class="kicker kicker--accent">La storia</span><p>${esc(db.synopsis)}</p></blockquote>` : '';
  const last = done[done.length - 1], before = done.slice(-4, -1).reverse();
  const dot = (t) => (/[.!?…]$/.test(t) ? t : t + '.');   // «Chi dorme…» ha già la sua punteggiatura
  const first = (t) => { const i = String(t || '').search(/[.!?](\s|$)/); return i > 0 ? t.slice(0, i + 1) : (t || ''); };
  return `<section class="recap"><span class="kicker kicker--accent">Dove eravamo rimasti</span>
      <p class="recap__last"><b>${esc(dot(last.title))}</b> ${esc(last.summary || '')}</p>
      ${before.length ? `<details class="recap__more"><summary>Prima ancora</summary><ul>${before.map((m) => `<li><b>${esc(dot(m.title))}</b> ${esc(first(m.summary))}</li>`).join('')}</ul></details>` : ''}
    </section>`;
}

/** Consigli della missione: quelli che anticipano la trama iniziano con «[spoiler] » nei dati e restano sotto l'inchiostro */
function tipsHtml(m) {
  const tips = (m.tips || []).filter((t) => typeof t === 'string' && t.trim());
  if (!tips.length) return '';
  return `<div class="notebook__part notebook__tips"><span class="kicker">Consigli prima di partire</span><ul>${tips.map((t) => (t.startsWith('[spoiler]')
    ? `<li class="is-spoiler">${spoiler.ink(esc(t.replace(/^\[spoiler\]\s*/, '')), { inline: true })}</li>` : `<li>${esc(t)}</li>`)).join('')}</ul>${tips.some((t) => t.startsWith('[spoiler]')) ? '<p class="small muted">I consigli coperti anticipano qualcosa della missione: toccali solo se vuoi saperlo prima.</p>' : ''}</div>`;
}

/* Platino: cose da fare PRIMA di questa missione (punto di non ritorno), senza spoiler */
function warnings(m, phase = 'any') {
  // prima di iniziarla non si mostra quello che succede «durante» (sarebbe uno spoiler)
  const w = (m.missables || []).filter((x) => phase !== 'before' || x.when !== 'durante');
  if (m.pointOfNoReturn?.text) w.unshift({ text: m.pointOfNoReturn.text });
  if (m.missableNote) w.push({ text: m.missableNote });
  return w;
}
function warnHtml(m, phase = 'any') {
  const w = warnings(m, phase);
  if (!w.length) return '';
  return `<div class="warnbox ${w.some((x) => x.ponr) ? 'warnbox--ponr' : ''}" role="note"><b>${w.some((x) => x.ponr) ? 'Da non perdere · punto di non ritorno' : 'Da non perdere in questa missione'}</b><ul>${w.map((x) => `<li>${esc(x.text)}${x.trophy ? ` <span class="small muted">· trofeo «${esc(x.trophy)}»</span>` : ''}</li>`).join('')}</ul></div>`;
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
    ${tipsHtml(m)}
    <div class="notebook__part"><span class="kicker">Cosa devi fare</span>
      ${obj.length ? obj.map((o, i) => checkHtml(m.id, `obj-${i + 1}`, o, !!ex[`obj-${i + 1}`])).join('') : '<p class="small muted">Nessuna guida ha ancora pubblicato i passi di questa missione: li aggiungiamo appena escono.</p>'}
    </div>
    ${people.length ? `<div class="notebook__part"><span class="kicker">Chi incontri</span><div class="notebook__people">${people.map((c) => `<a class="notebook__person" href="#/personaggi/${esc(c.id)}">${face(c, { small: true })}<span>${esc(c.name)}</span></a>`).join('')}</div></div>` : ''}
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
  const blocked = !isSide(m) && !state && prevM && st.missions[prevM.id]?.state !== 'completata';
  const next = isSide(m) ? null : all.slice(pi + 1).find((x) => st.missions[x.id]?.state !== 'completata');
  if (!shown) {
    return `
    ${backLink('/missioni', 'Missioni')}
    <div class="hero hero--text hero--locked"><div class="hero__text"><span class="kicker">${esc(pl.act)} · ${pl.side ? pl.side + ' ' + pl.i : pl.i + ' di ' + pl.n}</span><h1>${blocked ? 'Non ancora' : 'Pronta a partire'}</h1><p class="lede">${blocked ? 'Si sblocca quando finisci la missione prima.' : 'Il nome, il luogo e chi incontri si scoprono quando la inizi.'}</p></div></div>
    ${blocked ? '' : warnHtml(m, 'before')}
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
  // Nomi di ciò che si sblocca: le missioni già rivelate col titolo, le altre come «Una nuova missione» (una volta sola)
  const unlNames = [...new Set(unl.map((u) => (typeof u === 'string' ? u : u.label || (u?.type === 'mission' && byId(u.ref) ? byId(u.ref).title : ''))).filter(Boolean))];
  return `
    ${backLink('/missioni', 'Missioni')}
    ${hero(m, { kicker: `${pl.act} · ${pl.side ? pl.side : pl.i + ' di ' + pl.n}${district ? ' · ' + district.name : ''}`, title: m.title, lede: m.titleEn && m.titleEn !== m.title ? `(${m.titleEn})` : '', chips: statusChip(m) + protagonistChip(m.protagonist) })}
    ${state === 'completata' ? `<div class="passed">
        <span class="passed__title">Missione compiuta</span>
        <div class="actions">${next ? (st.missions[next.id]?.state ? `<a class="btn btn--solid" href="#/missioni/${esc(next.id)}">Vai alla prossima</a>` : `<button class="btn btn--solid" type="button" data-start-mission="${esc(next.id)}"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizia la prossima</button>`) : ''}<a class="btn btn--ghost" href="#/missioni">Torna alle missioni</a></div>
        <p class="passed__more"><button type="button" class="linkbtn" data-mission="${esc(m.id)}" data-set="in-corso">Rigiocala</button> · <button type="button" class="linkbtn" data-mission="${esc(m.id)}" data-set="">Non l'ho finita</button></p>
      </div>` : warnHtml(m) + stampHtml(m)}
    <div class="prose">${summary}</div>
    ${extrasHtml(m)}
    ${notebook(m)}
    ${state === 'in-corso' ? `<div class="actions mission-actions">
      <button class="btn btn--solid btn--big" type="button" data-mission="${esc(m.id)}" data-set="completata"><svg aria-hidden="true"><use href="#i-check"/></svg>Missione compiuta</button>
      <button class="btn btn--ghost" type="button" data-action="note" data-mission-ctx="${esc(m.id)}"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button>
    </div>
    <p class="small muted"><button type="button" class="linkbtn" data-mission="${esc(m.id)}" data-set="">Non la sto giocando</button></p>` : state === 'completata' ? `<div class="actions"><button class="btn btn--ghost" type="button" data-action="note" data-mission-ctx="${esc(m.id)}"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto</button></div>` : ''}
    ${m.rewards?.length ? `<div class="block"><span class="kicker">Ricompense</span><div class="prose">${list(m.rewards)}</div></div>` : ''}
    ${(() => { const a = db.acts.find((x) => x.id === m.actId); return a ? chapterMissables(a, st, progress.settings().spoilerShield, false, { title: a.number === 0 ? 'Da non perdere nel Prologo' : `Da non perdere nel capitolo ${a.number}`, skipMission: m.id }) : ''; })()}
    ${m.secrets?.length ? `<div class="block"><span class="kicker">Segreti</span><div class="prose">${spoiler.ink(list(m.secrets))}</div></div>` : ''}
    ${reqs.length || unlNames.length ? `<p class="small muted mission-links">${reqs.length ? `Dopo: ${reqs.map((p) => `<a href="#/missioni/${esc(p.id)}">${esc(spoiler.missionName(p, 'una missione precedente'))}</a>`).join(', ')}.` : ''} ${unlNames.length ? `Sblocca: ${unlNames.map(esc).join(', ')}.` : ''}</p>` : ''}
`;
}


/** «Da non perdere» del capitolo, come lista di cose da fare (v0.52.3):
 *  1) scadenze del capitolo (bonus, soldi, trofei, collezionabili che spariscono: quelli con lo stesso motivo stanno in una riga sola),
 *  2) avvisi delle missioni che conosci, 3) avvisi delle missioni non ancora iniziate, sotto l'inchiostro.
 *  Si spunta da sola: trofeo preso, collezionabile trovato, missione fatta. A mano solo i bonus del capitolo (progress.toggleCheck). */
const DNP_KIND = {
  bonus: ['i-gift', 'Bonus', 'magenta'], soldi: ['i-cash', 'Soldi', 'teal'], arma: ['i-crosshair', 'Arma', 'orange'],
  trofeo: ['i-trophy', 'Trofeo', 'gold'], collezionabile: ['i-star', 'Collezionabili', 'orange'],
  missione: ['i-flag', 'Missione', 'ink'], ponr: ['i-lock', 'Punto di non ritorno', 'red'],
};
const dnpOpen = (id, cur) => { try { const v = sessionStorage.getItem('leonida:dnp:' + id); return v === null ? false : v === '1'; } catch { return cur; } };
/** Prima frase in evidenza, il resto sotto: si legge a colpo d'occhio */
function dnpText(text) {
  const m = /^(.{24,}?[.!?])\s+(?=[A-ZÀ-Ý«])([\s\S]+)$/.exec(String(text || ''));
  return m ? `<span class="dnp__lead">${esc(m[1])}</span><span class="dnp__rest">${esc(m[2])}</span>` : `<span class="dnp__lead">${esc(text)}</span>`;
}
function chapterMissables(a, st, shield, cur = false, { title = 'Da non perdere', skipMission = null } = {}) {
  const n = a.number;
  const due = [], inMission = [], later = [], past = [];
  (a.missables || []).forEach((x, i) => {
    const key = `dnp:${a.id}:${x.id || x.kind + i}`;
    due.push({ kind: DNP_KIND[x.kind] ? x.kind : 'bonus', title: x.title || '', body: dnpText(x.text), done: progress.isChecked(key), check: key });
  });
  for (const t of vis(db.trophies || []).filter((x) => x.timing?.until === n)) {
    due.push({ kind: 'trofeo', title: spoiler.isHidden(t) ? 'Un trofeo' : t.name, href: '#/trofei', body: dnpText(t.timing.note || 'Va ottenuto entro la fine di questo capitolo.'), done: !!st.trophies?.[t.id] });
  }
  const groups = new Map();
  for (const c of vis(db.collectibles || []).filter((x) => x.missable && Number(x.chapter) === n)) {
    const k = c.categoryId + '|' + c.missable; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c);
  }
  for (const list of groups.values()) {
    const cat = (db.collectibleCategories || []).find((k) => k.id === list[0].categoryId);
    const got = list.filter((c) => st.collectibles?.[c.id]).length;
    due.push({ kind: 'collezionabile', title: `${cat?.name || 'Collezionabili'} · ${got}/${list.length}`, href: `#/collezionabili?cat=${esc(list[0].categoryId)}`, body: dnpText(list[0].missable),
      chips: list.map((c) => `<a class="dnp__chip ${st.collectibles?.[c.id] ? 'is-done' : ''}" href="#/collezionabili?cat=${esc(c.categoryId)}">${esc(c.name)}</a>`).join(''), done: got === list.length });
  }
  const WHEN = { 'prima di iniziare': 'Prima di iniziarla', durante: 'Durante la missione', 'fine capitolo': 'Prima di chiudere il capitolo' };
  const all = [...vis(db.missions || []), ...vis(db.sideMissions || [])].filter((m) => m.actId === a.id);
  for (const m of all) {
    if (m.id === skipMission) continue;   // gli avvisi di questa missione sono già in cima alla sua pagina
    const state = st.missions[m.id]?.state, known = !!state || !shield;
    for (const w of m.missables || []) {
      const o = { kind: w.ponr ? 'ponr' : 'missione', when: WHEN[w.when] || '', trophy: w.trophy || '', done: state === 'completata' };
      if (o.done) past.push({ ...o, title: m.title, href: `#/missioni/${esc(m.id)}`, body: dnpText(w.text) });
      else if (known) inMission.push({ ...o, title: m.title, href: `#/missioni/${esc(m.id)}`, body: dnpText(w.text) });
      else later.push({ ...o, title: '', extra: m.optional ? 'Missione facoltativa' : '', body: spoiler.ink(`<span class="dnp__lead">${esc(w.text)}</span>`, { inline: true }) });
    }
  }
  const total = due.length + inMission.length + later.length + past.length; if (!total) return '';
  const todo = due.filter((x) => !x.done).length + inMission.length + later.length, done = total - todo;
  const row = (o) => { const [icon, label, tone] = DNP_KIND[o.kind];
    return `<li class="dnp__row ${o.done ? 'is-done' : ''}" data-tone="${tone}">
      ${o.check ? `<button type="button" class="dnp__tick" role="checkbox" aria-checked="${o.done}" aria-label="Segna come fatto" data-dnp-check="${esc(o.check)}"><svg aria-hidden="true"><use href="#i-check"/></svg></button>`
        : `<span class="dnp__badge" aria-hidden="true"><svg><use href="#${o.done ? 'i-check' : icon}"/></svg></span>`}
      <div class="dnp__main"><div class="dnp__top">${o.kind === 'ponr' ? `<span class="dnp__tag">${esc(label)}</span>` : ''}<span class="dnp__tag">${esc(o.when || label)}</span>${o.extra ? `<span class="dnp__tag dnp__tag--soft">${esc(o.extra)}</span>` : ''}${o.trophy ? `<span class="dnp__tag dnp__tag--gold">Trofeo «${esc(o.trophy)}»</span>` : ''}</div>
        ${o.title ? `<div class="dnp__name">${o.href ? `<a href="${o.href}">${esc(o.title)}</a>` : esc(o.title)}</div>` : ''}
        <p class="dnp__text">${o.body}</p>${o.chips ? `<div class="dnp__chips">${o.chips}</div>` : ''}</div></li>`; };
  const sec = (title, sub, list) => (list.length ? `<section class="dnp__sec"><h4 class="dnp__h">${title}<span>${sub}</span></h4><ul>${list.map(row).join('')}</ul></section>` : '');
  const bits = [due.filter((x) => !x.done).length && `${due.filter((x) => !x.done).length} ${due.filter((x) => !x.done).length === 1 ? 'scadenza' : 'scadenze'}`, (inMission.length + later.length) && `${inMission.length + later.length} nelle missioni`, done && `${done} ${done === 1 ? 'fatta' : 'fatte'}`].filter(Boolean).join(' · ');
  return `<details class="dnp" data-dnp="${esc(a.id)}" ${dnpOpen(a.id, cur) ? 'open' : ''}>
    <summary><span class="dnp__mark" aria-hidden="true"><svg><use href="#i-alert"/></svg></span>
      <span class="dnp__headtext"><span class="dnp__title">${esc(title)}</span><span class="dnp__sub">${esc(bits || 'Tutto fatto')}</span></span>
      <span class="dnp__meter" aria-hidden="true"><i style="width:${total ? (done / total) * 100 : 0}%"></i></span>
      <span class="dnp__n" aria-label="${todo} da fare">${todo}</span><svg class="dnp__chev" aria-hidden="true"><use href="#i-arrow"/></svg></summary>
    <div class="dnp__body">
      ${sec('Prima che il capitolo finisca', 'Dopo non si può più', due.slice().sort((x, y) => x.done - y.done))}
      ${sec('Nelle missioni', 'Quando arrivi a queste missioni', inMission)}
      ${later.length ? `<details class="dnp__more"><summary><span>${later.length === 1 ? '1 avviso' : `${later.length} avvisi`} per le missioni che non hai ancora iniziato</span><small>Piccoli spoiler: il testo è coperto, lo leggi con un tocco</small></summary><ul>${later.map(row).join('')}</ul></details>` : ''}
      ${past.length ? `<details class="dnp__more dnp__more--past"><summary><span>${past.length === 1 ? '1 avviso' : `${past.length} avvisi`} di missioni già fatte</span></summary><ul>${past.map(row).join('')}</ul></details>` : ''}
    </div>
  </details>`;
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
        const nx = i < 0 ? null : list.slice(i + 1).find((x) => !progress.get().missions[x.id]?.state);
        openMissionDone(byId(b.dataset.mission), { next: nx, onNext: nx ? () => start(nx.id) : null });
      }
      return;
    }
    const x = e.target.closest('[data-extra]');
    if (x) { progress.toggleExtra(x.dataset.mission, x.dataset.extra); rerender(); }
  });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-dnp-check]'); if (!t) return;
    e.preventDefault(); progress.toggleCheck(t.dataset.dnpCheck); rerender();
  });
  // il riquadro «Da non perdere» resta aperto o chiuso come l'hai lasciato
  root.addEventListener('toggle', (e) => {
    const d = e.target; if (!d?.matches?.('details.dnp[data-dnp]')) return;
    try { sessionStorage.setItem('leonida:dnp:' + d.dataset.dnp, d.open ? '1' : '0'); } catch {}
  }, true);
}
