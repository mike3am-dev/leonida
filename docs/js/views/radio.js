/**
 * Radio, scheda «Stazioni»: un giradischi in cima con il disco della stazione scelta (gira, con la scaletta accanto)
 * e sotto la cassa dei dischi: una copertina per stazione, con il vinile che esce.
 */
import { db } from '../data.js';
import { esc, statusChip } from '../ui/dom.js';
import { vis } from './shared.js';
import * as spoiler from '../spoiler.js';
import { allSongs, songRow } from './playlist.js';

const LAST = 'leonida:radio:last';
/* Colore di ogni stazione (lo sovrascrive il campo `color` nei dati) */
const COLORS = {
  'rad-flash-fm': '#ff3d8b', 'rad-cocoteo': '#ff6f91', 'rad-back-country': '#4f7df0', 'rad-afro-bank': '#e08a2c', 'rad-the-chamber': '#e52b2b',
  'rad-dirty-south': '#e3b34a', 'rad-vice-city-fm': '#2ec4b6', 'rad-v-rock': '#f0562f', 'rad-honey-fm': '#f2b632', 'rad-emotion-98-3': '#c05cff',
  'rad-stockyard-fm': '#7cd45a', 'rad-symphony-fm': '#c9b176', 'rad-circoloco': '#ffd400', 'rad-radio-on-u': '#2fbf71', 'rad-worldwide-fm': '#2aa7e0',
  'rad-kaleidoscope-fm': '#b05cff', 'rad-la-ola': '#ff7a3d', 'rad-the-wipe': '#9aa3ad', 'rad-vcrr': '#ffb000', 'rad-gloriana-blues': '#5b7fe0',
  'rad-leonida-jazz': '#a36bd8', 'rad-wktt': '#8a94a0', 'rad-the-vault': '#00e0c6',
};
const colorOf = (r) => (/^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : COLORS[r.id] || '#ff3d8b');
const initials = (name) => name.replace(/\b(FM|Radio|The)\b/gi, '').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase() || name.slice(0, 2).toUpperCase();
const logo = (r) => (r.image ? `<img src="${esc(r.image)}" ${r.imageUrl ? `data-fallback="${esc(r.imageUrl)}"` : ''} alt="" loading="lazy">` : '');

/** Le stazioni vere (la voce di riepilogo «Altre stazioni e podcast» sta a parte) */
export const stations = () => vis(db.radio).filter((r) => r.id !== 'rad-altre');

/** Il disco: solchi, etichetta col logo (o le iniziali), foro */
const disc = (r, cls = '') => `<span class="disc ${cls}" aria-hidden="true"><span class="disc__label">${logo(r)}<b>${esc(initials(r.name))}</b></span></span>`;

function deck(r, list, songs) {
  const i = list.indexOf(r), prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const first = songs.slice(0, 8), rest = songs.slice(8);
  return `<section class="deck" style="--st:${colorOf(r)}" data-deck>
    <div class="deck__platter">
      ${disc(r, 'disc--big is-spinning')}
      <span class="deck__arm" aria-hidden="true"><i></i></span>
    </div>
    <div class="deck__info">
      <span class="deck__onair"><span class="eq" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b></span>In onda</span>
      <h2 class="deck__name">${esc(r.name)}</h2>
      <p class="deck__genre">${esc(r.genre || '')}</p>
      ${r.host ? `<p class="deck__host">Con ${esc(r.host)}</p>` : ''}
      ${r.description ? `<div class="deck__desc">${spoiler.wrap(r, `<p>${esc(r.description)}</p>`)}</div>` : ''}
      <div class="chips">${statusChip(r)}</div>
      <nav class="tuner" aria-label="Cambia stazione">
        <a class="tuner__btn" href="#/cultura?st=${esc(prev.id)}" data-station="${esc(prev.id)}" aria-label="Stazione precedente: ${esc(prev.name)}"><svg aria-hidden="true"><use href="#i-back"/></svg></a>
        <span class="tuner__band" aria-hidden="true"><i style="left:${list.length > 1 ? (i / (list.length - 1)) * 100 : 50}%"></i></span>
        <a class="tuner__btn" href="#/cultura?st=${esc(next.id)}" data-station="${esc(next.id)}" aria-label="Stazione successiva: ${esc(next.name)}"><svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
      </nav>
    </div>
    <div class="deck__tracks">
      <div class="deck__side"><span>In scaletta</span><span>${songs.length ? (songs.length === 1 ? '1 canzone' : `${songs.length} canzoni`) : ''}</span></div>
      ${songs.length ? `<div class="songs">${first.map((s) => songRow(s, { showStation: false })).join('')}</div>
        ${rest.length ? `<details class="deck__more"><summary>Altre ${rest.length} canzoni</summary><div class="songs">${rest.map((s) => songRow(s, { showStation: false })).join('')}</div></details>` : ''}`
      : `<p class="deck__empty">${/talk|parlat/i.test(r.genre || '') ? 'È una radio parlata: niente canzoni, solo voci.' : 'La scaletta non è ancora nota. Se senti una canzone qui, aggiungila da «La mia playlist».'}</p>`}
    </div>
  </section>`;
}

const sleeve = (r, cur, n) => `<a class="sleeve ${cur ? 'is-on' : ''}" href="#/cultura?st=${esc(r.id)}" data-station="${esc(r.id)}" style="--st:${colorOf(r)}" ${cur ? 'aria-current="true"' : ''}>
    <span class="sleeve__art">${disc(r)}<span class="sleeve__cover">${logo(r)}<b>${esc(r.name)}</b></span></span>
    <span class="sleeve__name">${esc(r.name)}</span>
    <span class="sleeve__meta">${esc(r.genre || '')}${n ? ` · ${n} ${n === 1 ? 'canzone' : 'canzoni'}` : ''}</span></a>`;

export function stationsView(query, music) {
  const list = stations(); if (!list.length) return '<p class="muted">Nessuna stazione.</p>';
  let last = null; try { last = localStorage.getItem(LAST); } catch {}
  const cur = list.find((r) => r.id === query.st) || list.find((r) => r.id === last) || list[0];
  const songs = allSongs(); const count = {}; for (const s of songs) count[s.stationId] = (count[s.stationId] || 0) + 1;
  const altre = vis(db.radio).find((r) => r.id === 'rad-altre');
  return `${deck(cur, list, songs.filter((s) => s.stationId === cur.id))}
    <div class="crate__head"><span class="kicker">Tutte le stazioni</span><span class="small muted">Tocca un disco per metterlo sul piatto</span></div>
    <div class="crate">${list.map((r) => sleeve(r, r === cur, count[r.id] || 0)).join('')}</div>
    ${altre?.description ? `<div class="card" style="margin-top:var(--s-5)"><span class="kicker kicker--accent">${esc(altre.name)}</span><p class="small" style="margin:var(--s-2) 0 0">${esc(altre.description)}</p></div>` : ''}
    ${music.length ? `<div class="crate__head" style="margin-top:var(--s-6)"><span class="kicker">Dischi e canzoni</span></div>
    <div class="cards">${music.map((b) => `<a class="cardx" href="#/cultura/${esc(b.id)}"><div class="cardx__img cardx__img--logo">${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy">` : '<svg aria-hidden="true"><use href="#i-star"/></svg>'}</div><div class="cardx__body"><div class="cardx__title">${esc(b.name)}</div><div class="cardx__meta">${esc(b.category || '')}</div></div></a>`).join('')}</div>` : ''}`;
}

export function bind(root) {
  root.addEventListener('click', (e) => {
    const s = e.target.closest('[data-station]'); if (!s) return;
    try { localStorage.setItem(LAST, s.dataset.station); } catch {}
    // dopo il cambio di disco, il giradischi torna in vista
    setTimeout(() => document.querySelector('[data-deck]')?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
  });
}
