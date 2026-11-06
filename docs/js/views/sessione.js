/** Home: la plancia di comando, con il carattere di Leonida */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, fmtDate, relTime } from '../ui/dom.js';
import { stats, districtStats, currentMission, nextMission, vis, sectionOf, missionActLabel } from './shared.js';
import { newsImgTag } from './novita.js';
import { cup } from './trofei.js';
import * as spoiler from '../spoiler.js';

const section = sectionOf('home');
const HERO_IMGS = ['assets/img/ss-jason-lucia-14.jpg', 'assets/img/ss-vice-city-27.jpg', 'assets/img/cover-art.jpg', 'assets/img/ss-leonida-keys-07.jpg', 'assets/img/ss-lucia-caminos-11.jpg', 'assets/img/ss-jason-duval-11.jpg', 'assets/img/ss-grassrivers-07.jpg'];
const dayIndex = () => Math.floor(Date.now() / 86400000);

function countdown() {
  const rel = new Date(db.meta.releaseDate + 'T00:00:00');
  const ms = rel - Date.now();
  if (ms <= 0) return { after: true, days: Math.floor(-ms / 86400000) + 1 };
  return { after: false, days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) };
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
  const cast = (met.length ? met : vis(db.characters).filter((c) => c.image)).slice(0, 12);
  const lastDistrict = st.current.districtId ? byId(st.current.districtId) : null;
  const latestNews = vis(db.news).slice(0, 3);
  const trophies = Object.keys(st.trophies || {}).length, trophyTotal = (db.trophies || []).length;
  const tpct = trophyTotal ? Math.round(trophies / trophyTotal * 100) : 0;
  const cd = countdown();
  const di = dayIndex();
  const heroImg = cur?.image || HERO_IMGS[di % HERO_IMGS.length];
  const tips = vis(db.tips); const tip = tips.length ? tips[di % tips.length] : null;
  const radios = vis(db.radio); const radio = radios.length ? radios[di % radios.length] : null;
  const circ = 2 * Math.PI * 54;
  const luoghi = db.luoghi || [];

  const left = `
    <section class="home-hero">
      <img src="${esc(heroImg)}" alt="">
      <div class="home-hero__veil"></div>
      <div class="home-hero__text">
        <span class="kicker">Leonida · Guida di campo</span>
        ${cur ? `<span class="home-hero__eyebrow"><span class="follow-bar__dot" aria-hidden="true"></span> Ora stai giocando · ${esc(missionActLabel(cur))}</span><h1 class="home-hero__title">${esc(cur.title)}</h1><a class="btn btn--accent" href="#/missioni/${esc(cur.id)}">Apri la missione</a>`
          : cd.after ? `<span class="home-hero__eyebrow">Giorno ${cd.days} a Leonida</span><h1 class="home-hero__title">${next ? esc(next.title) : 'Benvenuto a Leonida'}</h1>${next ? `<a class="btn btn--accent" href="#/missioni/${esc(next.id)}">Comincia da qui</a>` : ''}`
          : `<span class="home-hero__eyebrow">Mancano</span><div class="countdown"><b>${cd.days}</b><span>giorni</span><b>${cd.hours}</b><span>ore</span></div><span class="home-hero__sub">al 19 novembre · PS5 · Ultimate Edition</span>`}
      </div>
    </section>

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
        <dt>Zona</dt><dd>${lastDistrict ? `<a href="#/mappa?zona=${esc(lastDistrict.id)}">${esc(lastDistrict.name)}</a>` : '—'}</dd>
        <dt>Prossima</dt><dd>${next ? `<a href="#/missioni/${esc(next.id)}">${esc(next.title)}</a>` : '—'}</dd>
        <dt>Appunti</dt><dd>${st.notes.length ? `<a href="#/diario">${st.notes.length}${st.notes.filter((n) => !n.exported).length ? `, ${st.notes.filter((n) => !n.exported).length} da passare` : ''}</a>` : '<a href="#/diario">scrivi il primo</a>'}</dd>
      </dl>
    </section>

    <section class="block">
      <div class="block__head"><span class="kicker">${met.length ? 'Personaggi incontrati' : 'Il cast'}</span><a class="small" href="#/personaggi">Tutti</a></div>
      <div class="stories">${cast.map((c) => `<a class="story ${met.includes(c) ? 'is-met' : ''}" href="#/personaggi/${esc(c.id)}"><span class="story__ring"><img src="${esc(c.image)}" alt="" loading="lazy"></span><span class="story__name">${esc(c.name.split(' ')[0])}</span></a>`).join('')}</div>
      ${met.length ? '' : '<p class="small muted" style="margin-top:var(--s-2)">Quando completi la missione in cui li incontri, qui restano solo quelli conosciuti davvero.</p>'}
    </section>

    <section class="block">
      <div class="block__head"><span class="kicker">Territori</span><a class="small" href="#/mappa">Mappa</a></div>
      <div class="zonestrip">${zones.map(({ d, s: z }) => `<a class="zcard" href="#/mappa?zona=${esc(d.id)}">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : ''}<span class="zcard__veil"></span><span class="zcard__text"><b>${esc(d.name.replace(' National Park', ''))}</b><small>${z.total ? `${z.done} / ${z.total}` : `${luoghi.filter((l) => l.districtId === d.id).length || (d.pois || []).length} luoghi`}</small><i class="progress"><i style="--p:${z.pct}%"></i></i></span></a>`).join('')}</div>
    </section>

    <div class="duo">
      ${tip ? `<a class="card card--tip" href="#/news/${esc(tip.id)}"><span class="kicker kicker--accent">Lo sapevi?</span><h3>${esc(tip.title)}</h3><p class="small">${spoiler.isHidden(tip) ? '⚠ Contiene spoiler' : esc(tip.body.slice(0, 140))}…</p></a>` : ''}
      ${radio ? `<a class="card card--radio" href="#/cultura/${esc(radio.id)}"><span class="vinyl vinyl--mini"><span class="vinyl__disc"></span>${radio.image ? `<img class="vinyl__label" src="${esc(radio.image)}" alt="">` : ''}</span><span><span class="kicker kicker--accent">In onda oggi</span><h3>${esc(radio.name)}</h3><p class="small muted">${esc(radio.genre || '')}${radio.host ? ' · ' + esc(radio.host) : ''}</p></span></a>` : ''}
    </div>

    <section class="block">
      <div class="block__head"><span class="kicker">Ultime news</span><a class="small" href="#/news">Tutte</a></div>
      <div class="cards cards--feat">${latestNews.map((n, i) => `<a class="cardx ${i === 0 ? 'cardx--wide' : ''}" href="#/news/${esc(n.id)}"><div class="cardx__img">${newsImgTag(n)}</div><div class="cardx__body"><div class="cardx__kicker">${esc(fmtDate(n.date, { day: 'numeric', month: 'long' }))}${n.outlet ? ' · ' + esc(n.outlet) : ''}</div><div class="cardx__title">${spoiler.isHidden(n) ? '⚠ Contiene spoiler' : esc(n.title)}</div></div></a>`).join('')}</div>
    </section>

    <div class="actions actions--home"><button class="btn btn--solid" type="button" data-action="note"><svg aria-hidden="true"><use href="#i-pen"/></svg>Appunto rapido</button><a class="btn btn--ghost" href="#/ricerca"><svg aria-hidden="true"><use href="#i-search"/></svg>Cerca nella guida</a></div>`;

  return { left, right: '', show: 'left', accent: section.accent, title: 'Home' };
}
