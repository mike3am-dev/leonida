/** Home: la plancia del tuo avanzamento. Da qui non si cambia mai tab: tutto si apre in un foglio davanti. */
import { db, byId, actNum } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, fmtDate, relTime, statusChip } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { stats, districtStats, currentMission, nextMission, vis, sectionOf, missionActLabel, isMet, isFound } from './shared.js';
import { currentAct } from './missioni.js';
import { newsImgTag } from './novita.js';
import { cup } from './trofei.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('home');
const HERO = 'assets/img/sfondi/keyart.jpg';
const dayIndex = () => Math.floor(Date.now() / 86400000);

function countdown() {
  const ms = new Date(db.meta.releaseDate + 'T00:00:00') - Date.now();
  if (ms <= 0) return { after: true, days: Math.floor(-ms / 86400000) + 1 };
  return { after: false, d: Math.floor(ms / 86400000), h: Math.floor((ms % 86400000) / 3600000), m: Math.floor((ms % 3600000) / 60000), s: Math.floor((ms % 60000) / 1000) };
}
const two = (n) => String(n).padStart(2, '0');
function countdownHtml() {
  const c = countdown();
  if (c.after) return `<span class="home-hero__eyebrow">Giorno ${c.days} a Leonida</span>`;
  return `<span class="home-hero__eyebrow">Mancano</span><div class="countdown" data-countdown><b>${c.d}</b><span>giorni</span><b>${two(c.h)}</b><span>ore</span><b>${two(c.m)}</b><span>min</span><b class="countdown__sec">${two(c.s)}</b><span>sec</span></div>`;
}

/** Ordine di incontro nella storia: la missione in cui compare il personaggio, poi il resto */
function storyOrder(items, firstMission) {
  const order = new Map(vis(db.missions).map((m, i) => [m.id, i]));
  return [...items].sort((a, b) => (order.get(firstMission(a)) ?? 999) - (order.get(firstMission(b)) ?? 999));
}
function firstMissionOfDistrict(d) { return vis(db.missions).find((m) => m.districtId === d.id)?.id; }

export function render() {
  const s = stats();
  const cur = currentMission();
  const next = nextMission();
  const st = progress.get();
  const districts = vis(db.districts).filter((d) => d.id !== 'dis-da-collocare');
  const zones = storyOrder(districts, firstMissionOfDistrict).map((d) => ({ d, s: districtStats(d.id), found: isFound(d) }));
  const chars = storyOrder(vis(db.characters).filter((c) => c.image), (c) => c.firstMissionId);
  const met = isMet;
  const lockLabel = (c) => { const m = c.firstMissionId ? byId(c.firstMissionId) : null; const a = m ? db.acts.find((x) => x.id === m.actId) : null; return a ? (a.number === 0 ? 'Prologo' : `Cap. ${a.number}`) : '?'; };
  const latestNews = vis(db.news).slice(0, 3);
  const trophies = Object.keys(st.trophies || {}).length, trophyTotal = (db.trophies || []).length;
  const tpct = trophyTotal ? Math.round(trophies / trophyTotal * 100) : 0;
  const di = dayIndex();
  const tips = vis(db.tips); const tip = tips.length ? tips[di % tips.length] : null;
  const radios = vis(db.radio); const radio = radios.length ? radios[di % radios.length] : null;
  const circ = 2 * Math.PI * 54;
  const metCount = chars.filter(met).length, foundCount = zones.filter((z) => z.found).length;

  const left = `
    <section class="home-hero">
      <img src="${HERO}" alt="">
      <div class="home-hero__veil"></div>
      <div class="home-hero__text">
        <span class="kicker">Leonida · Guida di gioco</span>
        ${cur ? `<span class="home-hero__eyebrow"><span class="follow-bar__dot" aria-hidden="true"></span> Ora stai giocando · ${esc(missionActLabel(cur))}</span><h1 class="home-hero__title">${esc(cur.title)}</h1><a class="btn btn--accent" href="#/missioni/${esc(cur.id)}">Apri la missione</a>` : countdownHtml()}
      </div>
    </section>

    ${whereCard(st)}

    <section class="profile">
      <div class="profile__head"><span class="kicker kicker--accent">Profilo criminale</span><span class="small muted">${s.pct}% di Leonida</span></div>
      <div class="profile__grid">
        <div class="ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient></defs>
            <circle class="ring__track" cx="60" cy="60" r="54" fill="none" stroke-width="7"/>
            <circle class="ring__bar" cx="60" cy="60" r="54" fill="none" stroke-width="7" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - s.pct / 100)}"/>
          </svg>
          <div class="ring__label"><b>${s.pct}%</b><small>Totale</small></div>
        </div>
        <div class="tiles tiles--neon">
          <a class="tile tile--teal" href="#/missioni"><svg aria-hidden="true"><use href="#i-flag"/></svg><b>${s.missions.done}<span>/${s.missions.total}</span></b><small>Missioni</small><i class="progress"><i style="--p:${s.missions.total ? s.missions.done / s.missions.total * 100 : 0}%"></i></i></a>
          <a class="tile tile--orange" href="#/collezionabili"><svg aria-hidden="true"><use href="#i-star"/></svg><b>${s.collectibles.done}<span>/${s.collectibles.total}</span></b><small>Collezionabili</small><i class="progress"><i style="--p:${s.collectibles.total ? s.collectibles.done / s.collectibles.total * 100 : 0}%"></i></i></a>
          <a class="tile tile--gold" href="#/trofei">${cup('oro', 22)}<b>${trophies}<span>/${trophyTotal || '?'}</span></b><small>Trofei</small><i class="progress"><i style="--p:${tpct}%"></i></i></a>
          <a class="tile tile--magenta" href="#/mappa"><svg aria-hidden="true"><use href="#i-map"/></svg><b>${s.activities.done}<span>/${s.activities.total}</span></b><small>Attività</small><i class="progress"><i style="--p:${s.activities.total ? s.activities.done / s.activities.total * 100 : 0}%"></i></i></a>
        </div>
      </div>
      <dl class="facts facts--row">
        <dt>Zona attuale</dt><dd>${st.current.districtId && byId(st.current.districtId) ? esc(byId(st.current.districtId).name) : '—'}</dd>
        <dt>Prossima missione</dt><dd>${next ? `<a href="#/missioni/${esc(next.id)}">${esc(next.title)}</a>` : '—'}</dd>
        <dt>Appunti</dt><dd>${st.notes.length ? `<a href="#/diario">${st.notes.length}${st.notes.filter((n) => !n.exported).length ? `, ${st.notes.filter((n) => !n.exported).length} da passare` : ''}</a>` : '<a href="#/diario">scrivi il primo</a>'}</dd>
      </dl>
    </section>

    <section class="block">
      <div class="block__head"><span class="kicker">Personaggi incontrati · ${metCount} / ${chars.length}</span></div>
      <div class="stories">${chars.map((c) => { const ok = met(c); return `<button type="button" class="story ${ok ? 'is-met' : 'is-locked'}" data-home-char="${esc(c.id)}"><span class="story__ring"><img src="${esc(c.image)}" alt="" loading="lazy"></span><span class="story__name">${esc(c.name.split(' ')[0])}</span>${ok ? '' : `<span class="story__lock">${esc(lockLabel(c))}</span>`}</button>`; }).join('')}</div>
    </section>

    <section class="block">
      <div class="block__head"><span class="kicker">Regioni scoperte · ${foundCount} / ${zones.length}</span></div>
      <div class="zonestrip">${zones.map(({ d, s: z, found }) => `<button type="button" class="zcard ${found ? 'is-found' : 'is-locked'}" data-home-zone="${esc(d.id)}">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : ''}<span class="zcard__veil"></span><span class="zcard__text"><b>${esc(d.name.replace(' National Park', ''))}</b><small>${found ? (z.total ? `${z.done} / ${z.total} fatti` : 'scoperto') : 'da scoprire'}</small>${found ? `<i class="progress"><i style="--p:${z.pct}%"></i></i>` : ''}</span></button>`).join('')}</div>
    </section>

    <div class="duo">
      ${tip ? `<button type="button" class="card card--tip" data-home-tip="${esc(tip.id)}"><span class="kicker kicker--accent">Lo sapevi?</span><h3>${esc(tip.title)}</h3><p class="small">${spoiler.isHidden(tip) ? '⚠ Contiene spoiler' : esc(tip.body.slice(0, 140))}…</p></button>` : ''}
      ${radio ? `<a class="card card--radio" href="#/cultura/${esc(radio.id)}"><span class="vinyl vinyl--mini"><span class="vinyl__disc"></span>${radio.image ? `<img class="vinyl__label" src="${esc(radio.image)}" alt="">` : ''}</span><span><span class="kicker kicker--accent">In onda oggi</span><h3>${esc(radio.name)}</h3><p class="small muted">${esc(radio.genre || '')}${radio.host ? ' · ' + esc(radio.host) : ''}</p></span></a>` : ''}
    </div>

    <div class="actions actions--home"><button class="btn btn--solid" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto rapido</button><a class="btn btn--ghost" href="#/ricerca"><svg aria-hidden="true"><use href="#i-search"/></svg>Cerca nella guida</a></div>`;

  return { left, right: '', show: 'left', accent: section.accent, title: 'Home' };
}

/** Dove sei nella storia: fatta · in corso · prossima, con un pulsante per avanzare */
function whereCard(st) {
  const missions = vis(db.missions);
  const curIdx = missions.findIndex((m) => st.missions[m.id]?.state === 'in-corso');
  const lastDoneIdx = missions.reduce((acc, m, i) => (st.missions[m.id]?.state === 'completata' ? i : acc), -1);
  const cur = curIdx >= 0 ? missions[curIdx] : null;
  const prev = cur ? missions.slice(0, curIdx).reverse().find((m) => st.missions[m.id]?.state === 'completata') : (lastDoneIdx >= 0 ? missions[lastDoneIdx] : null);
  const next = cur ? missions[curIdx + 1] : missions[lastDoneIdx + 1];
  const shield = progress.settings().spoilerShield;
  const lab = (m) => { const a = db.acts.find((x) => x.id === m.actId); const i = missions.filter((x) => x.actId === m.actId).indexOf(m) + 1; return `${a ? (a.number === 0 ? 'Prologo' : 'Capitolo ' + a.number) : ''} · ${String(i).padStart(2, '0')}`; };
  const name = (m) => (st.missions[m.id]?.state || !shield) ? esc(m.title) : 'Missione bloccata';
  const step = (m, kind, label) => `<div class="step3 step3--${kind}"><small>${label}</small>${m ? `<b>${name(m)}</b><span class="small muted">${esc(lab(m))}</span>` : '<b class="muted">—</b>'}${kind !== 'next' ? '<svg class="step3__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>' : ''}</div>`;
  return `<section class="where"><div class="where__text"><span class="kicker kicker--accent">Dove sei nella storia</span>
      <p class="small muted">La guida accende personaggi, regioni e consigli fino alla missione in corso. Il resto resta bloccato.</p></div>
    <div class="steps3">${step(prev, 'done', 'Fatta')}${step(cur, 'cur', cur ? 'In corso' : 'Nessuna in corso')}${step(next, 'next', 'Prossima')}</div>
    <div class="actions">${cur ? `<button class="btn btn--accent" type="button" data-where-done="${esc(cur.id)}"><svg aria-hidden="true"><use href="#i-check"/></svg>Completata${next ? ', passo alla prossima' : ''}</button><a class="btn btn--ghost" href="#/missioni/${esc(cur.id)}">Apri la missione</a>` : next ? `<button class="btn btn--solid" type="button" data-where-start="${esc(next.id)}"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizio la prossima</button>` : '<span class="small muted">Storia completata.</span>'}</div></section>`;
}

/* ---------- Fogli davanti alla Home ---------- */
const discoverBtnLocal = (it, l, dl) => { const on = !!progress.get().discovered?.[it.id]; return `<button class="btn ${on ? 'btn--accent' : 'btn--ghost'}" type="button" data-discover="${esc(it.id)}"><svg aria-hidden="true"><use href="#i-${on ? 'check' : 'eye'}"/></svg>${esc(on ? dl : l)}</button>`; };
function charSheet(c) {
  const st = progress.get(); const ok = c.firstMissionId && st.missions[c.firstMissionId]?.state;
  const m = c.firstMissionId ? byId(c.firstMissionId) : null;
  const body = document.createElement('div');
  body.innerHTML = `${c.image ? `<img class="pop__img ${ok ? '' : 'is-locked'}" src="${esc(c.image)}" alt="">` : ''}
    <div class="chips" style="margin:var(--s-2) 0">${statusChip(c)}${c.role ? `<span class="chip">${esc(c.role)}</span>` : ''}</div>
    <p class="small">${ok ? esc((c.tagline || c.bio || '').slice(0, 220)) : (m ? `Lo incontri in una missione del ${esc(missionActLabel(m).replace(/:.*$/, ''))}. Si accende da solo quando la inizi, oppure segnalo tu.` : 'Non sappiamo ancora quando lo incontri: segnalo tu quando succede.')}</p>
    <div class="actions" style="margin-bottom:0"><a class="btn btn--solid" href="#/personaggi/${esc(c.id)}">Scheda completa</a>${ok && c.firstMissionId && st.missions[c.firstMissionId]?.state ? '' : discoverBtnLocal(c, 'Incontrato', 'Incontrato ✓')}</div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: c.name, body });
}
function zoneSheet(d, found) {
  const z = districtStats(d.id); const body = document.createElement('div');
  body.innerHTML = `${d.image ? `<img class="pop__img ${found ? '' : 'is-locked'}" src="${esc(d.image)}" alt="">` : ''}
    <p class="small" style="margin:var(--s-2) 0">${found ? esc(d.tagline || '') : 'Ancora da scoprire: si accende quando una missione ti porta qui, o quando lo apri dalla Mappa.'}</p>
    ${found && z.total ? `<div class="progress"><i style="--p:${z.pct}%"></i></div><p class="small muted">${z.done} / ${z.total} fatti</p>` : ''}
    <div class="actions" style="margin-bottom:0"><a class="btn btn--solid" href="#/mappa?zona=${esc(d.id)}">Vai sulla mappa</a>${discoverBtnLocal(d, 'Scoperta', 'Scoperta ✓')}</div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: d.name, body });
}
function articleSheet(n) {
  const body = document.createElement('div');
  body.innerHTML = `<div class="pop__imgwrap">${newsImgTag(n)}</div>
    <div class="chips" style="margin:var(--s-2) 0">${statusChip(n)}${n.outlet ? `<span class="chip">${esc(n.outlet)}</span>` : ''}${n.date ? `<span class="chip">${esc(fmtDate(n.date, { day: 'numeric', month: 'long' }))}</span>` : ''}</div>
    <div class="prose small">${spoiler.wrap(n, `<p>${esc(n.body || '')}</p>`)}</div>
    <div class="actions" style="margin-bottom:0">${n.sourceUrl ? `<a class="btn btn--solid" href="${esc(n.sourceUrl)}" target="_blank" rel="noopener">Leggi la fonte</a>` : ''}<a class="btn btn--ghost" href="#/news/${esc(n.id)}">Apri in News</a></div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: n.title, body });
}

let timer = null;
export function bind(root) {
  root.addEventListener('click', (e) => {
    const d = e.target.closest('[data-where-done]'); if (d) { const ms = vis(db.missions); const i = ms.findIndex((m) => m.id === d.dataset.whereDone); progress.setMissionState(d.dataset.whereDone, 'completata'); if (ms[i + 1]) progress.setMissionState(ms[i + 1].id, 'in-corso'); document.dispatchEvent(new CustomEvent('leonida:rerender')); return; }
    const s = e.target.closest('[data-where-start]'); if (s) { progress.setMissionState(s.dataset.whereStart, 'in-corso'); document.dispatchEvent(new CustomEvent('leonida:rerender')); }
  });
  root.addEventListener('click', (e) => {
    const ch = e.target.closest('[data-home-char]'); if (ch) { const c = byId(ch.dataset.homeChar); if (c) charSheet(c); return; }
    const z = e.target.closest('[data-home-zone]'); if (z) { const d = byId(z.dataset.homeZone); if (d) zoneSheet(d, z.classList.contains('is-found')); return; }
    const t = e.target.closest('[data-home-tip]'); if (t) { const tip = byId(t.dataset.homeTip); if (tip) articleSheet(tip); return; }
    const n = e.target.closest('[data-home-news]'); if (n) { const it = byId(n.dataset.homeNews); if (it) articleSheet(it); }
  });
  // Conto alla rovescia vivo, secondo per secondo
  clearInterval(timer);
  timer = setInterval(() => {
    const el = document.querySelector('[data-countdown]'); if (!el) return;
    const c = countdown(); if (c.after) { el.outerHTML = countdownHtml(); return; }
    const bs = el.querySelectorAll('b'); if (bs.length < 4) return;
    bs[0].textContent = c.d; bs[1].textContent = two(c.h); bs[2].textContent = two(c.m); bs[3].textContent = two(c.s);
  }, 1000);
}
