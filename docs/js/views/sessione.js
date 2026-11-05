import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, fmtDate, relTime } from '../ui/dom.js';
import { sectionHead, stats, districtStats, currentMission, nextMission, vis, sectionOf, missionActLabel, isOpen } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('sessione');

function countdown() {
  const rel = new Date(db.meta.releaseDate + 'T00:00:00');
  const ms = rel - Date.now();
  if (ms <= 0) return '';
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return `<div class="countdown" aria-label="Conto alla rovescia all'uscita">
    <div><b>${d}</b><span>giorni</span></div><div><b>${h}</b><span>ore</span></div><div><b>${m}</b><span>minuti</span></div>
  </div>`;
}

export function cover() {
  const released = new Date(db.meta.releaseDate + 'T00:00:00') <= Date.now();
  return `<section class="cover">
    <svg class="cover__sun" viewBox="0 0 200 200" aria-hidden="true">
      <defs><linearGradient id="sun-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient></defs>
      <circle cx="100" cy="100" r="80" fill="url(#sun-g)" opacity=".9"/>
      <g stroke="#0b0a0f" stroke-width="7"><line x1="10" y1="118" x2="190" y2="118"/><line x1="10" y1="138" x2="190" y2="138"/><line x1="10" y1="158" x2="190" y2="158"/></g>
    </svg>
    <span class="kicker">Guida di campo · Stato di Leonida</span>
    <h1>Vice City<br>al tramonto</h1>
    <p>${released ? 'Il gioco è uscito. Segna la missione in corso e la guida ti segue.' : 'Il 19 novembre 2026 su PS5 e Xbox Series X|S. Nel frattempo: studia il territorio, impara i nomi, prepara la console.'}</p>
    ${countdown()}
  </section>`;
}

export function render() {
  const s = stats();
  const cur = currentMission();
  const next = nextMission();
  const st = progress.get();
  const lastSession = st.sessions[0];
  const districts = vis(db.districts);
  const circ = 2 * Math.PI * 54;

  const left = `
    <div class="block" style="margin-top:0">
      <button class="btn-note" type="button" data-action="note">
        <svg aria-hidden="true"><use href="#i-pen"/></svg>
        <div><strong>Appunto rapido</strong><span>Scrivi ora, sistemiamo dopo. Finisce nel Diario.</span></div>
      </button>
    </div>

    <div class="block">
      <span class="kicker">Completamento</span>
      <div class="stats--ring">
        <div class="ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient></defs>
            <circle class="ring__track" cx="60" cy="60" r="54" fill="none" stroke-width="6"/>
            <circle class="ring__bar" cx="60" cy="60" r="54" fill="none" stroke-width="6" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - s.pct / 100)}"/>
          </svg>
          <div class="ring__label"><b>${s.pct}%</b><small>Globale</small></div>
        </div>
        <div class="stats" style="flex:1;min-width:200px">
          <div class="card"><div class="stat"><div class="stat__value tnum">${s.missions.done}<span class="muted" style="font-size:1rem"> / ${s.missions.total}</span></div><div class="stat__label">Missioni</div></div></div>
          <div class="card"><div class="stat"><div class="stat__value tnum">${s.collectibles.done}<span class="muted" style="font-size:1rem"> / ${s.collectibles.total}</span></div><div class="stat__label">Collezionabili</div></div></div>
          <div class="card"><div class="stat"><div class="stat__value tnum">${s.activities.done}<span class="muted" style="font-size:1rem"> / ${s.activities.total}</span></div><div class="stat__label">Attività</div></div></div>
        </div>
      </div>
    </div>

    <div class="block">
      <span class="kicker">Per zona</span>
      ${districts.map((d) => { const ds = districtStats(d.id); return `
        <a class="progress-row" href="#/atlante/${esc(d.id)}">
          <span>${esc(d.name)}</span>
          <span class="small muted tnum">${ds.total ? `${ds.done} / ${ds.total}` : 'nessun dato'}</span>
          <div class="progress"><i style="--p:${ds.pct}%"></i></div>
        </a>`; }).join('')}
    </div>`;

  const right = `
    <div class="block" style="margin-top:0">
      <span class="kicker">Missione in corso</span>
      ${cur ? `<a class="card card--link" href="#/missioni/${esc(cur.id)}">
          <div class="card__kicker kicker kicker--accent">${esc(missionActLabel(cur))} · Capitolo ${esc(cur.chapter ?? '—')}</div>
          <h2>${esc(cur.title)}</h2>
          <p class="muted small">${spoiler.text(cur, cur.summary || '')}</p>
        </a>`
        : `<div class="placeholder"><strong>Nessuna missione in corso</strong>Apri una missione e tocca «Inizio adesso»: la guida comincerà a seguirti.</div>`}
    </div>
    <div class="block">
      <span class="kicker">Prossimo obiettivo</span>
      ${next ? `<a class="card card--link" href="#/missioni/${esc(next.id)}">
          <div class="card__kicker kicker kicker--accent">${esc(missionActLabel(next))}</div>
          <h2>${esc(next.title)}</h2>
        </a>` : `<div class="placeholder"><strong>Niente in coda</strong>Quando aggiungi missioni ai dati, qui compare la prossima da fare.</div>`}
    </div>
    <div class="block">
      <span class="kicker">Ultima sessione</span>
      <dl class="facts">
        <dt>Quando</dt><dd>${lastSession ? `${fmtDate(lastSession.start, { weekday: 'long', day: 'numeric', month: 'long' })} · ${relTime(lastSession.end)}` : '—'}</dd>
        <dt>Appunti</dt><dd>${st.notes.length} in tutto${st.notes.filter((n) => !n.exported).length ? `, ${st.notes.filter((n) => !n.exported).length} da passare a Claude` : ''}</dd>
        <dt>Dati guida</dt><dd>v${esc(db.meta.dataVersion)} · ${fmtDate(db.meta.updatedAt, { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
      </dl>
    </div>`;

  return { top: cover(), left, right, show: 'left', accent: section.accent, title: 'Sessione' };
}
