/**
 * Radio: tutte le canzoni delle stazioni in un elenco, e «La mia playlist» (salvata nei progressi, quindi anche online).
 * Le canzoni vengono da radio.json (tracks + highlights); si possono aggiungere a mano quelle sentite in gioco.
 */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import { esc, toast } from '../ui/dom.js';
import { vis } from './shared.js';

export const appleSearch = (q) => `https://music.apple.com/it/search?term=${encodeURIComponent(q)}`;
export const spotifySearch = (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;
const slug = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fold = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const songId = (stationId, artist, title) => 'sng-' + slug(`${stationId || 'x'} ${artist} ${title}`).slice(0, 90);

/** Tutte le canzoni note, stazione per stazione */
export function allSongs() {
  const out = [], seen = new Set();
  for (const r of vis(db.radio)) {
    for (const h of [...(r.tracks || []), ...(r.highlights || [])]) {
      const t = typeof h === 'string' ? { title: h } : h;
      const title = t.title === '—' ? '' : (t.title || ''), artist = t.artist || '';
      if (!title && !artist) continue;
      const id = songId(r.id, artist, title); if (seen.has(id)) continue; seen.add(id);
      out.push({ id, title, artist, station: r.name, stationId: r.id, status: t.status || r.status, source: t.source || r.source });
    }
  }
  return out;
}

const heart = (on) => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
/** Una riga canzone: cuore (playlist), titolo/artista, stazione, Apple Music */
export function songRow(s, { showStation = true } = {}) {
  const on = progress.inPlaylist(s.id), q = `${s.artist} ${s.title}`.trim();
  return `<div class="song ${on ? 'is-on' : ''}">
    <button type="button" class="song__fav" data-song-fav="${esc(s.id)}" data-song="${esc(JSON.stringify({ id: s.id, title: s.title, artist: s.artist, station: s.station, stationId: s.stationId, custom: !!s.custom }))}" aria-pressed="${on}" aria-label="${on ? 'Togli dalla mia playlist' : 'Aggiungi alla mia playlist'}">${heart(on)}</button>
    <span class="song__text"><span class="song__title">${esc(s.title || s.artist)}</span><span class="song__meta">${esc(s.title ? s.artist : '')}${showStation && s.station ? `${s.title && s.artist ? ' · ' : ''}${s.stationId ? `<a href="#/cultura/${esc(s.stationId)}">${esc(s.station)}</a>` : esc(s.station)}` : ''}${s.status && s.status !== 'verificato' ? ' · da confermare' : ''}${s.custom ? ' · sentita da te' : ''}</span></span>
    <a class="song__go" href="${appleSearch(q)}" target="_blank" rel="noopener" aria-label="Cerca su Apple Music">Apple Music</a></div>`;
}

/** Le tre schede della Radio */
export function tabs(view, nSongs, nMine) {
  const t = (v, label, n) => `<a role="button" aria-pressed="${view === v}" href="#/cultura${v ? '?v=' + v : ''}">${label}${n != null ? ` <span class="muted">${n}</span>` : ''}</a>`;
  return `<div class="segmented radio-tabs" role="group" aria-label="Radio">${t('', 'Stazioni')}${t('canzoni', 'Canzoni', nSongs)}${t('playlist', 'La mia playlist', nMine)}</div>`;
}

export function songsView(query) {
  const all = allSongs(); const q = fold(query.q || '').trim();
  const list = q ? all.filter((s) => fold(`${s.title} ${s.artist} ${s.station}`).includes(q)) : all;
  return `<input class="input" type="search" placeholder="Cerca una canzone, un artista o una stazione…" value="${esc(query.q || '')}" data-song-q aria-label="Cerca una canzone" autocomplete="off" autocorrect="off" style="margin:var(--s-3) 0">
    <p class="small muted" style="margin:0 0 var(--s-2)">${list.length === all.length ? `${all.length} canzoni conosciute finora. Tocca il cuore per metterle nella tua playlist.` : `${list.length} su ${all.length}`}</p>
    <div class="songs">${list.map((s) => songRow(s)).join('') || `<p class="muted">Niente con «${esc(query.q)}».</p>`}</div>`;
}

export function playlistView() {
  const mine = progress.get().playlist || [];
  const stations = vis(db.radio).filter((r) => r.id !== 'rad-altre');
  return `${mine.length ? `<div class="btn-row" style="margin:var(--s-3) 0">
      <button class="btn btn--solid" type="button" data-pl-copy>Copia l'elenco</button>
      ${typeof navigator !== 'undefined' && navigator.share ? '<button class="btn" type="button" data-pl-share>Condividi</button>' : ''}
    </div>
    <p class="small muted" style="margin:0 0 var(--s-2)">${mine.length === 1 ? '1 canzone' : `${mine.length} canzoni`}. Per ognuna, «Apple Music» apre la ricerca: da lì la aggiungi a una tua playlist.</p>
    <div class="songs">${mine.map((s) => songRow(s)).join('')}</div>`
    : '<p class="muted" style="margin:var(--s-4) 0">La tua playlist è vuota. Nella scheda «Canzoni» o dentro una stazione, tocca il cuore accanto a un brano.</p>'}
    <details class="card pl-add"><summary><span class="kicker kicker--accent">Hai sentito una canzone in gioco?</span></summary>
      <form data-pl-add>
        <label class="field"><span>Titolo</span><input class="input" name="title" required autocomplete="off"></label>
        <label class="field"><span>Artista</span><input class="input" name="artist" autocomplete="off"></label>
        <label class="field"><span>Stazione</span><select class="select" name="station"><option value="">Non lo so</option>${stations.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('')}</select></label>
        <button class="btn btn--accent btn--block" type="submit">Aggiungi alla mia playlist</button>
      </form></details>`;
}

const listText = () => (progress.get().playlist || []).map((s) => `${s.artist ? s.artist + ' – ' : ''}${s.title}${s.station ? ` (${s.station})` : ''}`).join('\n');

export function bind(root, rerender) {
  root.addEventListener('click', async (e) => {
    const fav = e.target.closest('[data-song-fav]');
    if (fav) {
      let song; try { song = JSON.parse(fav.dataset.song); } catch { return; }
      const was = progress.inPlaylist(song.id); progress.togglePlaylist(song);
      toast(was ? 'Tolta dalla tua playlist' : 'Aggiunta alla tua playlist'); rerender(); return;
    }
    if (e.target.closest('[data-pl-copy]')) {
      try { await navigator.clipboard.writeText(listText()); toast('Elenco copiato: incollalo dove vuoi'); }
      catch { toast('Non riesco a copiare: usa «Condividi»'); }
      return;
    }
    if (e.target.closest('[data-pl-share]')) {
      try { await navigator.share({ title: 'La mia playlist di GTA VI', text: listText() }); } catch {}
    }
  });
  root.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-pl-add]'); if (!f) return;
    e.preventDefault();
    const title = f.title.value.trim(), artist = f.artist.value.trim(); if (!title) return;
    const r = vis(db.radio).find((x) => x.id === f.station.value);
    progress.togglePlaylist({ id: songId(r?.id || 'mia', artist, title) + '-' + Date.now().toString(36), title, artist, station: r?.name || '', stationId: r?.id || null, custom: true });
    toast(`«${title}» è nella tua playlist`); rerender();
  });
  let t = null;
  root.addEventListener('input', (e) => { const i = e.target.closest('[data-song-q]'); if (!i) return; clearTimeout(t); t = setTimeout(() => { const v = i.value.trim(); const pos = i.selectionStart; history.replaceState(history.state, '', v ? `#/cultura?v=canzoni&q=${encodeURIComponent(v)}` : '#/cultura?v=canzoni'); rerender(); const n = document.querySelector('[data-song-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250); });
}
