/** Home: la plancia di comando */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, fmtDate, relTime, statusChip } from '../ui/dom.js';
import { stats, districtStats, currentMission, nextMission, vis, sectionOf, missionActLabel, row, acc, hero } from './shared.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('home');

function countdownPill() {
  const rel = new Date(db.meta.releaseDate + 'T00:00:00');
  const ms = rel - Date.now();
  if (ms <= 0) return '';
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  return `<div class="pill-row"><span class="pill pill--accent"><b>${d}</b> giorni <b>${h}</b> ore al lancio</span><span class="pill">19 novembre · PS5 · Ultimate Edition</span></div>`;
}

export function render() {
  const s = stats();
  const cur = currentMission();
  const next = nextMission();
  const st = progress.get();
  const lastSession = st.sessions[0];
  const districts = vis(db.districts).filter((d) => d.id !== 'dis-da-collocare');
  const zones = districts.map((d) => ({ d, s: districtStats(d.id) })).sort((a, b) => (b.s.total - b.s.done) - (a.s.total - a.s.done));
  const met = vis(db.characters).filter((c) => c.firstMissionId && st.missions[c.firstMissionId]?.state);
  const lastDistrict = st.current.districtId ? byId(st.current.districtId) : null;
  const latestNews = vis(db.news).slice(0, 3);
  const notes = st.notes.slice(0, 2);
  const trophies = Object.keys(st.trophies || {}).length;
  const circ = 2 * Math.PI * 54;

  const left = `
    ${countdownPill()}

    ${cur ? `<a class="card card--link card--now" href="#/missioni/${esc(cur.id)}">
        <div class="kicker kicker--accent"><span class="follow-bar__dot" aria-hidden="true"></span> Ora stai giocando · ${esc(missionActLabel(cur))}</div>
        <h2>${esc(cur.title)}</h2>
        <p class="muted small">${spoiler.text(cur, cur.summary || '')}</p>
        <div class="btn-row"><span class="btn btn--accent">Apri la missione</span></div>
      </a>`
      : `<div class="card card--now">
        <div class="kicker kicker--accent">Da dove si comincia</div>
        <h2>${next ? esc(next.title) : 'Nessuna missione in corso'}</h2>
        <p class="muted small">${next ? 'Apri la missione e tocca «Inizio adesso»: la guida ti seguirà.' : 'Quando arrivano le missioni vere, qui vedrai sempre quella che stai facendo.'}</p>
        <div class="btn-row">${next ? `<a class="btn btn--solid" href="#/missioni/${esc(next.id)}">Apri la missione</a>` : ''}<button class="btn btn--ghost" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto rapido</button></div>
      </div>`}

    <div class="block">
      <span class="kicker">Avanzamento</span>
      <div class="dash">
        <div class="ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient></defs>
            <circle class="ring__track" cx="60" cy="60" r="54" fill="none" stroke-width="6"/>
            <circle class="ring__bar" cx="60" cy="60" r="54" fill="none" stroke-width="6" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - s.pct / 100)}"/>
          </svg>
          <div class="ring__label"><b>${s.pct}%</b><small>Totale</small></div>
        </div>
        <div class="tiles">
          <a class="tile" href="#/missioni"><b>${s.missions.done}<span>/${s.missions.total}</span></b><small>Missioni</small></a>
          <a class="tile" href="#/collezionabili"><b>${s.collectibles.done}<span>/${s.collectibles.total}</span></b><small>Collezionabili</small></a>
          <a class="tile" href="#/trofei"><b>${trophies}<span>/${db.trophies?.length || '?'}</span></b><small>Trofei</small></a>
          <a class="tile" href="#/mappa"><b>${s.activities.done}<span>/${s.activities.total}</span></b><small>Attività</small></a>
        </div>
      </div>
    </div>

    <div class="block">
      <span class="kicker">Dove ero rimasto</span>
      <dl class="facts">
        <dt>Sessione</dt><dd>${lastSession ? `${fmtDate(lastSession.start, { weekday: 'long', day: 'numeric', month: 'long' })} · ${relTime(lastSession.end)}` : 'Nessuna ancora'}</dd>
        <dt>Zona</dt><dd>${lastDistrict ? `<a href="#/mappa/${esc(lastDistrict.id)}">${esc(lastDistrict.name)}</a>` : '—'}</dd>
        <dt>Prossimo</dt><dd>${next ? `<a href="#/missioni/${esc(next.id)}">${esc(next.title)}</a>` : '—'}</dd>
        <dt>Appunti</dt><dd>${st.notes.length ? `${st.notes.length}, ${st.notes.filter((n) => !n.exported).length} da passare a Claude · <a href="#/diario">apri</a>` : 'nessuno · <a href="#/diario">scrivi</a>'}</dd>
      </dl>
      ${notes.length ? `<div class="notes-mini">${notes.map((n) => `<div class="note-mini"><span class="note__time">${relTime(n.ts)}</span>${esc(n.text.slice(0, 120))}${n.text.length > 120 ? '…' : ''}</div>`).join('')}</div>` : ''}
    </div>

    <div class="block">
      <span class="kicker">Zone da completare</span>
      ${zones.slice(0, 3).map(({ d, s }) => `<a class="progress-row" href="#/mappa/${esc(d.id)}"><span>${esc(d.name)}</span><span class="small muted tnum">${s.total ? `${s.done} / ${s.total}` : 'nessun dato'}</span><div class="progress"><i style="--p:${s.pct}%"></i></div></a>`).join('')}
      ${zones.length > 3 ? acc('Tutte le zone', zones.slice(3).map(({ d, s }) => `<a class="progress-row" href="#/mappa/${esc(d.id)}"><span>${esc(d.name)}</span><span class="small muted tnum">${s.total ? `${s.done} / ${s.total}` : 'nessun dato'}</span><div class="progress"><i style="--p:${s.pct}%"></i></div></a>`).join('')) : ''}
    </div>

    <div class="block">
      <span class="kicker">Personaggi incontrati</span>
      ${met.length ? `<div class="chips" style="margin-top:var(--s-2)">${met.map((c) => `<a class="chip" href="#/personaggi/${esc(c.id)}">${esc(c.name)}</a>`).join('')}</div>` : `<p class="muted small">Nessuno ancora: compaiono qui quando completi la missione in cui li incontri. Nel frattempo, <a href="#/personaggi">il cast</a>.</p>`}
    </div>

    <div class="block">
      <span class="kicker">Ultime news</span>
      ${latestNews.map((n) => row({ href: `#/news/${n.id}`, thumb: n.image, num: fmtDate(n.date, { day: 'numeric', month: 'short' }), title: spoiler.isHidden(n) ? '⚠ Contiene spoiler' : esc(n.title), meta: esc(n.outlet || '') })).join('')}
      <a class="btn btn--ghost btn--block" href="#/news" style="margin-top:var(--s-3)">Tutte le news</a>
    </div>`;

  return { left, right: '', show: 'left', accent: section.accent, title: 'Home' };
}
