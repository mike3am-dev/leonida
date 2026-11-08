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
  const rel = new Date(db.meta.releaseDate + 'T00:00:00');
  const playSessions = (st.sessions || []).filter((x) => new Date(x.start) >= rel);
  const playDays = new Set(playSessions.map((x) => x.start.slice(0, 10))).size;
  const circ = 2 * Math.PI * 54;
  const metCount = chars.filter(met).length, foundCount = zones.filter((z) => z.found).length;

  const left = `
    <section class="home-hero">
      <img src="${HERO}" alt="">
      <div class="home-hero__veil"></div>
      <div class="home-hero__text">
        <span class="kicker">GTA VI · Guida di gioco</span>
        ${cur ? `<span class="home-hero__eyebrow"><span class="follow-bar__dot" aria-hidden="true"></span> Ora stai giocando · ${esc(missionActLabel(cur))}</span><h1 class="home-hero__title">${esc(cur.title)}</h1><a class="btn btn--accent" href="#/missioni/${esc(cur.id)}">Apri la missione</a>` : countdownHtml()}
      </div>
    </section>

    ${whereCard(st)}

    <section class="profile">
      <div class="profile__head"><span class="kicker kicker--accent">Profilo criminale</span><span class="small muted">${s.pct}% di GTA VI</span></div>
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
        <dt>Zona attuale</dt><dd>${(() => { const zid = (st.current.districtId && byId(st.current.districtId)) ? st.current.districtId : currentMission()?.districtId; return zid && byId(zid) ? esc(byId(zid).name) : '—'; })()}</dd>
        <dt>Prossima missione</dt><dd>${next ? `<a href="#/missioni/${esc(next.id)}">${progress.settings().spoilerShield ? esc(`${(() => { const a = db.acts.find((x) => x.id === next.actId); return a ? (a.number === 0 ? 'Prologo' : 'Capitolo ' + a.number) : ''; })()} · bloccata`) : esc(next.title)}</a>` : '—'}</dd>
        <dt>Giorni di gioco</dt><dd>${Date.now() < rel ? 'dal 19 novembre' : `${playDays}${playSessions[0] ? ` · ultima volta ${esc(relTime(playSessions[0].end || playSessions[0].start))}` : ''}`}</dd>
        <dt>Appunti</dt><dd>${st.notes.length ? `<a href="#/diario">${st.notes.length}${st.notes.filter((n) => !n.exported).length ? `, ${st.notes.filter((n) => !n.exported).length} da passare` : ''}</a>` : '<a href="#/diario">scrivi il primo</a>'}</dd>
      </dl>
    </section>

    <section class="block">
      <div class="block__head"><span class="kicker">Personaggi incontrati · ${metCount} / ${chars.length}</span></div>
      <div class="stories">${chars.map((c) => { const ok = met(c); return `<button type="button" class="story ${ok ? 'is-met' : 'is-locked'}" data-home-char="${esc(c.id)}"><span class="story__ring">${!ok && spoiler.virgin() ? '<span class="story__unknown" aria-hidden="true">?</span>' : `<img src="${esc(c.image)}" alt="" loading="lazy">`}</span><span class="story__name">${!ok && spoiler.virgin() ? '???' : esc(c.name.split(' ')[0])}</span>${ok ? '' : `<span class="story__lock">${esc(lockLabel(c))}</span>`}</button>`; }).join('')}</div>
    </section>

    <section class="block">
      <div class="block__head"><span class="kicker">Regioni scoperte · ${foundCount} / ${zones.length}</span></div>
      <div class="zonestrip">${zones.map(({ d, s: z, found }) => `<button type="button" class="zcard ${found ? 'is-found' : 'is-locked'}" data-home-zone="${esc(d.id)}">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : ''}<span class="zcard__veil"></span><span class="zcard__text"><b>${esc(d.name.replace(' National Park', ''))}</b><small>${found ? (z.total ? `${z.done} / ${z.total} fatti` : 'scoperto') : 'da scoprire'}</small>${found ? `<i class="progress"><i style="--p:${z.pct}%"></i></i>` : ''}</span></button>`).join('')}</div>
    </section>

    ${notesCard(st)}

    <div class="actions actions--home"><a class="btn btn--ghost" href="#/ricerca"><svg aria-hidden="true"><use href="#i-search"/></svg>Cerca nella guida</a></div>`;

  return { left, right: '', show: 'left', accent: section.accent, title: 'Home' };
}

/** Dove sei nella storia: una riga sola che ti porta dove serve */
function whereCard(st) {
  const missions = vis(db.missions);
  const any = missions.some((m) => st.missions[m.id]?.state);
  if (!any && new Date(db.meta.releaseDate + 'T00:00:00') > Date.now()) {
    return `<section class="where-mini"><svg aria-hidden="true"><use href="#i-lock"/></svg><span><b>La storia parte il 19 novembre.</b> Da quel giorno qui trovi la missione che stai giocando.</span></section>`;
  }
  const cur = missions.find((m) => st.missions[m.id]?.state === 'in-corso');
  const lastDone = missions.reduce((acc, m, i) => (st.missions[m.id]?.state === 'completata' ? i : acc), -1);
  const next = cur ? null : missions.slice(lastDone + 1).find((m) => !st.missions[m.id]?.state);
  const lab = (m) => { const a = db.acts.find((x) => x.id === m.actId); const l = missions.filter((x) => x.actId === m.actId); return `${a ? (a.number === 0 ? 'Prologo' : 'Capitolo ' + a.number) : ''} · ${l.indexOf(m) + 1} di ${l.length}`; };
  if (cur) return `<section class="where2 where2--cur"><div class="where2__text"><span class="kicker kicker--accent">Ora stai giocando · ${esc(lab(cur))}</span><b>${esc(cur.title)}</b></div>
    <div class="where2__actions"><a class="btn btn--solid" href="#/missioni/${esc(cur.id)}"><svg aria-hidden="true"><use href="#i-book"/></svg>Taccuino</a><button class="btn btn--ghost" type="button" data-mission="${esc(cur.id)}" data-set="completata"><svg aria-hidden="true"><use href="#i-check"/></svg>Compiuta</button></div></section>`;
  if (next) return `<section class="where2"><div class="where2__text"><span class="kicker kicker--accent">La prossima · ${esc(lab(next))}</span><b>${esc(spoiler.missionName(next, 'Si scopre quando parti'))}</b></div>
    <div class="where2__actions"><button class="btn btn--solid" type="button" data-start-mission="${esc(next.id)}"><svg aria-hidden="true"><use href="#i-flag"/></svg>Inizia</button></div></section>`;
  return `<section class="where2"><div class="where2__text"><span class="kicker kicker--accent">La storia</span><b>Completata. Bravo.</b></div></section>`;
}

/** Taccuino in Home: compatto, con la «i» che spiega */
function notesCard(st) {
  const notes = st.notes || []; const pending = notes.filter((n) => !n.exported);
  return `<section class="notesbox"><div class="block__head"><span class="kicker">Appunti${notes.length ? ` · ${notes.length}` : ''}</span><button type="button" class="info-btn" data-home-notes-info aria-label="Come funzionano gli appunti">i</button></div>
    <div class="actions" style="margin:0 0 var(--s-3)"><button class="btn btn--solid" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Nuovo appunto</button>${progress.settings().creatorTools ? `<a class="btn ${pending.length ? 'btn--accent' : 'btn--ghost'}" href="#/diario${notes.length ? '?pacchetto=1' : ''}">Pacchetto per Claude${pending.length ? ` · ${pending.length}` : ''}</a>` : ''}</div>
    ${notes.slice(0, 3).map((n) => `<div class="note-mini"><span class="note__time">${esc(relTime(n.ts))}</span>${esc(n.text.slice(0, 110))}${n.text.length > 110 ? '…' : ''}</div>`).join('') || '<p class="small muted">Scrivi mentre giochi: posti, trucchi, domande con «?». Poi il pacchetto li porta a Claude e diventano guida.</p>'}
    ${notes.length > 3 ? `<a class="small" href="#/diario">Tutti gli appunti</a>` : ''}</section>`;
}
function notesInfoSheet() {
  const body = document.createElement('div');
  body.innerHTML = `<ol class="steps">
      <li><b>Giochi e scrivi.</b> Un appunto per ogni cosa che scopri: una missione, un posto, un collezionabile, un trucco. Metti un «?» se è da verificare. L’appunto si aggancia da solo alla missione in corso e alla regione.</li>
      <li><b>Tocchi «Pacchetto per Claude».</b> L’app impacchetta gli appunti non ancora inviati in un testo già formattato, con le istruzioni e gli id della guida.</li>
      <li><b>Copi e incolli in chat con Claude.</b> Claude trasforma gli appunti in schede vere: missioni, luoghi, collezionabili, consigli. Non inventa nulla: solo quello che hai scritto tu.</li>
      <li><b>Claude aggiorna la guida e fa il push.</b> Alla riapertura dell’app i tuoi appunti sono diventati contenuto. Poi tocchi «Segna come inviati».</li></ol>`;
  showSheet({ title: 'Come funzionano gli appunti', body });
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
    if (e.target.closest('[data-home-notes-info]')) { notesInfoSheet(); return; }
    const ch = e.target.closest('[data-home-char]'); if (ch) { const c = byId(ch.dataset.homeChar); if (c && spoiler.virgin() && !isMet(c)) { import('../ui/dom.js').then(({ toast }) => toast('Lo scopri quando lo incontri')); return; } if (c) charSheet(c); return; }
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
