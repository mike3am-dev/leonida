/**
 * Il tavolo della mappa: la mappa della community (YANIS v16, via gtasixmap) con pan e zoom,
 * livelli accendibili (territori, luoghi, foto), giorno/notte, poster, filo rosso dalle Polaroid ai punti.
 * Coordinate di gioco (x, y in [-6000, 6000]) → pixel della base: vedi toPx.
 */
import { db, byId } from '../data.js';
import * as progress from '../store/progress.js';
import { esc } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { panzoom } from '../ui/panzoom.js';
import { img, TERRITORY_SLUGS } from './atlante.js';
import { currentMission, isFound } from './shared.js';

const BASES = {
  giorno: { src: 'assets/img/mappa/leonida-giorno.jpg', w: 2896, h: 3700, geo: true, tiles: 'standard' },
  poster: { src: 'assets/img/mappa-leonida.jpg', w: 1640, h: 2048, geo: false },
};
const WORLD = 4096, X0 = 1200, Y0 = 260;        // ritaglio fatto sulla mappa intera a zoom 3 (@2x)
const TILE_HOST = 'https://tiles.gtasixmap.com/tiles';
export const toPx = (x, y) => ({ x: WORLD * (x + 6000) / 12000 - X0, y: WORLD * (6000 - y) / 12000 - Y0 });

const luoghi = () => (db.luoghi || []).filter((l) => l.xy);
const subPlaces = () => luoghi().filter((l) => !TERRITORY_SLUGS[l.slug]);
/** Dove sei: la regione della missione in corso; prima dell'inizio, il penitenziario di Hamlet */
function youAreHere() {
  const m = currentMission(); const centers = districtCenters();
  if (m?.districtId && centers[m.districtId]) return { ...centers[m.districtId], label: byId(m.districtId)?.name || '' };
  const hamlet = luoghi().find((l) => l.slug === 'hamlet');
  return hamlet ? { ...toPx(hamlet.xy[0], hamlet.xy[1]), label: 'Leonida Penitentiary (Hamlet)' } : null;
}
function districtCenters() {
  const acc = {};
  for (const l of luoghi()) { if (!l.districtId) continue; const p = toPx(l.xy[0], l.xy[1]); (acc[l.districtId] ||= []).push(p); }
  const out = {};
  for (const [id, pts] of Object.entries(acc)) out[id] = { x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length };
  return out;
}

const prefs = () => { try { return JSON.parse(localStorage.getItem('leonida:mappa') || '{}'); } catch { return {}; } };
const savePref = (k, v) => { const p = prefs(); p[k] = v; localStorage.setItem('leonida:mappa', JSON.stringify(p)); };

/** HTML del tavolo */
export function boardHtml(districts) {
  const p = prefs();
  const style = p.style === 'poster' ? 'poster' : 'giorno';
  const layers = { territori: p.territori ?? true, luoghi: p.luoghi ?? true, foto: p.foto ?? true };
  const centers = districtCenters();
  const base = BASES[style] || BASES.giorno;
  const ds = districts.filter((d) => centers[d.id]);
  const badges = ds.map((d, i) => { const c = centers[d.id]; return `<button type="button" class="mb-badge ${isFound(d) ? 'is-found' : ''}" style="left:${c.x}px;top:${c.y}px" data-mb-district="${esc(d.id)}" aria-label="${esc(d.name)}"><span>${String(i + 1).padStart(2, '0')}</span></button>`; }).join('');
  const here = youAreHere();
  const hereHtml = here ? `<div class="mb-here" style="left:${here.x}px;top:${here.y}px" title="Tu sei qui"><span class="mb-here__pulse"></span><span class="mb-here__dot"></span><span class="mb-here__label">Tu sei qui</span></div>` : '';
  const pins = subPlaces().map((l) => { const c = toPx(l.xy[0], l.xy[1]); return `<button type="button" class="mb-pin" style="left:${c.x}px;top:${c.y}px" data-mb-luogo="${esc(l.slug)}" aria-label="${esc(l.name)}">${img(l.hero?.local, l.hero?.src)}</button>`; }).join('');
  const polaroidsArr = ds.map((d, i) => `<button type="button" class="polaroid" style="--rot:${((i * 7) % 11) - 5}deg;--i:${i}" data-mb-fly="${esc(d.id)}"><span class="polaroid__tape"></span><span class="polaroid__img">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : ''}</span><span class="polaroid__cap">${esc(d.name.replace(' National Park', ''))}</span></button>`);
  const tool = (k, icon, label, on) => `<button type="button" class="mb-tool ${on ? 'is-on' : ''}" data-mb-tool="${k}" aria-pressed="${on}" aria-label="${esc(label)}" title="${esc(label)}"><svg aria-hidden="true"><use href="#i-${icon}"/></svg><span class="mb-tool__label">${esc(label)}</span></button>`;
  return `<div class="mapboard ${base.geo ? '' : 'is-poster'} is-locked" data-style="${style}" data-layers="${Object.entries(layers).filter(([, v]) => v).map(([k]) => k).join(' ')}">
    <div class="mapboard__viewport">
      <div class="mapboard__content" style="width:${base.w}px;height:${base.h}px">
        <img class="mapboard__base" src="${base.src}" alt="Mappa di Leonida" draggable="false" width="${base.w}" height="${base.h}">
        <div class="mapboard__tiles" aria-hidden="true"></div>
        <div class="mapboard__layer mapboard__layer--territori">${badges}</div>
        <div class="mapboard__layer mapboard__layer--luoghi">${pins}</div>
        <div class="mapboard__layer mapboard__layer--here">${hereHtml}</div>
      </div>
      <div class="mapboard__photos">${polaroidsArr.join('')}</div>
      <svg class="mapboard__string" aria-hidden="true"><path d=""/><circle r="5"/><circle r="5"/></svg>
      <button type="button" class="mb-explore" data-mb-tool="explore"><svg aria-hidden="true"><use href="#i-expand"/></svg><span>Esplora</span></button>
    </div>
    <div class="mapboard__tools">
      ${tool('territori', 'map', 'Regioni', layers.territori)}${tool('luoghi', 'pin', 'Punti d’interesse', layers.luoghi)}${tool('foto', 'photo', 'Foto', layers.foto)}
      <span class="mb-tool__sep"></span>
      ${tool('here', 'target', 'Tu sei qui', false)}${tool('full', 'expand', 'Schermo intero', false)}
    </div>
  </div>`;
}

let pz = null, board = null, stringFrom = null;
function lock(on) { if (!board) return; board.classList.toggle('is-locked', on); const b = board.querySelector('.mb-explore'); if (b) { b.querySelector('span').textContent = on ? 'Esplora' : 'Fine'; b.querySelector('use').setAttribute('href', on ? '#i-expand' : '#i-check'); } }
function drawString() {
  if (!board) return;
  const svg = board.querySelector('.mapboard__string');
  if (!stringFrom || !pz) { svg.classList.remove('is-on'); return; }
  const vp = board.querySelector('.mapboard__viewport'); const r = vp.getBoundingClientRect();
  const pol = board.querySelector(`[data-mb-fly="${stringFrom.id}"]`); if (!pol) return;
  const pr = pol.getBoundingClientRect();
  const a = { x: pr.left + pr.width / 2 - r.left, y: pr.top + 6 - r.top };
  const b = pz.toScreen(stringFrom.x, stringFrom.y);
  b.x = Math.max(6, Math.min(r.width - 6, b.x)); b.y = Math.max(6, Math.min(r.height - 6, b.y));
  const cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - 30;
  svg.querySelector('path').setAttribute('d', `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`);
  const [c1, c2] = svg.querySelectorAll('circle'); c1.setAttribute('cx', a.x); c1.setAttribute('cy', a.y); c2.setAttribute('cx', b.x); c2.setAttribute('cy', b.y);
  svg.classList.add('is-on');
}

/** Tessere a zoom alto (z5) scaricate al volo da gtasixmap quando ti avvicini */
function updateTiles() {
  if (!board || !pz) return;
  const base = BASES[board.dataset.style]; const layer = board.querySelector('.mapboard__tiles');
  if (!base?.geo) { layer.innerHTML = ''; return; }
  const { s } = pz.state();
  if (s < 2.2 || !navigator.onLine) { layer.innerHTML = ''; return; }
  const vp = board.querySelector('.mapboard__viewport');
  const tl = pz.toContent(0, 0), br = pz.toContent(vp.clientWidth, vp.clientHeight);
  const Z = 5, T = 512, F = (T * 2 ** Z) / WORLD;           // 4: i pixel a z5 sono 4 volte quelli della base
  const size = T / F;                                        // 128px di base per tessera
  const x0 = Math.max(0, Math.floor((tl.x + X0) / size)), x1 = Math.min(2 ** Z - 1, Math.floor((br.x + X0) / size));
  const y0 = Math.max(0, Math.floor((tl.y + Y0) / size)), y1 = Math.min(2 ** Z - 1, Math.floor((br.y + Y0) / size));
  const want = new Set();
  for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) want.add(`${tx},${ty}`);
  for (const el of [...layer.children]) if (!want.has(el.dataset.t)) el.remove();
  for (const key of want) {
    if (layer.querySelector(`[data-t="${key}"]`)) continue;
    const [tx, ty] = key.split(',').map(Number);
    const im = document.createElement('img'); im.dataset.t = key; im.decoding = 'async'; im.referrerPolicy = 'no-referrer'; im.draggable = false;
    im.style.cssText = `left:${tx * size - X0}px;top:${ty * size - Y0}px;width:${size}px;height:${size}px`;
    im.src = `${TILE_HOST}/${base.tiles}/${Z}/${tx}/${ty}@2x.webp?v=13`;
    im.onerror = () => im.remove();
    layer.append(im);
  }
}

function districtSheet(d) {
  const body = document.createElement('div');
  const places = (db.luoghi || []).filter((l) => l.districtId === d.id);
  body.innerHTML = `${d.image ? `<img class="pop__img" src="${esc(d.image)}" alt="">` : ''}
    <p class="small" style="margin:var(--s-2) 0">${esc(d.tagline || d.description?.slice(0, 160) || '')}</p>
    ${places.length ? `<div class="chips" style="margin-bottom:var(--s-3)">${places.slice(0, 6).map((l) => `<a class="chip" href="#/mappa/luogo/${esc(l.slug)}">${esc(l.name)}</a>`).join('')}${places.length > 6 ? `<span class="chip">+${places.length - 6}</span>` : ''}</div>` : ''}
    <div class="actions" style="margin-bottom:0"><button class="btn btn--solid" type="button" data-zone-go="${esc(d.id)}">Apri il territorio</button><a class="btn btn--ghost" href="#/mappa/${esc(d.id)}">Scheda completa</a></div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a, [data-zone-go]')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: d.name, body });
}
function luogoSheet(l) {
  const body = document.createElement('div');
  body.innerHTML = `${img(l.hero?.local, l.hero?.src, 'pop__img')}
    <div class="chips" style="margin:var(--s-2) 0">${(l.badges || []).slice(0, 2).map((b) => `<span class="chip ${/Confermato/.test(b) ? 'chip--ok' : ''}">${esc(b)}</span>`).join('')}</div>
    <p class="small">${esc(l.lead || '')}</p>
    <div class="actions" style="margin-bottom:0"><a class="btn btn--solid" href="#/mappa/luogo/${esc(l.slug)}">Apri la scheda</a>${l.landmarks?.length ? `<span class="small muted" style="align-self:center">${l.landmarks.length} punti da trovare</span>` : ''}</div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: l.name, body });
}

/** Da chiamare dopo ogni render della pagina Mappa */
export function mount(root) {
  board = root.querySelector('.mapboard'); if (!board) { pz = null; return; }
  const vp = board.querySelector('.mapboard__viewport'), content = board.querySelector('.mapboard__content');
  stringFrom = null;
  pz = panzoom(vp, content, { minScale: 0.08, maxScale: 8, onChange: () => { drawString(); updateTiles(); } });
  const baseImg = board.querySelector('.mapboard__base');
  const start = () => { pz.fit(); const p = prefs(); if (p.view && board.dataset.style !== 'poster') { pz.flyTo(p.view.cx, p.view.cy, p.view.s, { animate: false }); } };
  // Blocco: finché è bloccata, il dito scorre la pagina; un tocco la sblocca, un tocco fuori la riblocca
  document.addEventListener('pointerdown', (e) => { if (board && !board.contains(e.target) && !board.classList.contains('is-full') && !e.target.closest('.sheet, .sheet-backdrop, #dossier')) lock(true); }, { passive: true });
  if (baseImg.complete) start(); else baseImg.addEventListener('load', start, { once: true });
  // ricorda dove eri
  let t = null; vp.addEventListener('pointerup', () => { clearTimeout(t); t = setTimeout(() => { const st = pz.state(); const c = pz.toContent(vp.clientWidth / 2, vp.clientHeight / 2); savePref('view', { cx: c.x, cy: c.y, s: st.s }); }, 400); });
}

function setStyle(style) {
  const base = BASES[style]; const content = board.querySelector('.mapboard__content'), im = board.querySelector('.mapboard__base');
  board.dataset.style = style; board.classList.toggle('is-poster', !base.geo);
  content.style.width = base.w + 'px'; content.style.height = base.h + 'px'; im.src = base.src; im.width = base.w; im.height = base.h;
  pz.setContentSize(base.w, base.h); pz.fit({ animate: true }); stringFrom = null; drawString(); updateTiles();
  const pb = board.querySelector('[data-mb-tool="poster"]'); pb.classList.toggle('is-on', !base.geo); pb.setAttribute('aria-pressed', !base.geo);
  savePref('style', style);
}

export function bind(root) {
  root.addEventListener('click', (e) => {
    if (!board || !root.contains(board)) return;
    const tool = e.target.closest('[data-mb-tool]');
    if (tool) {
      const k = tool.dataset.mbTool;
      if (['territori', 'luoghi', 'foto'].includes(k)) {
        const on = !tool.classList.contains('is-on'); tool.classList.toggle('is-on', on); tool.setAttribute('aria-pressed', on);
        const set = new Set(board.dataset.layers.split(' ').filter(Boolean)); on ? set.add(k) : set.delete(k); board.dataset.layers = [...set].join(' '); savePref(k, on);
        if (k === 'foto' && !on) { stringFrom = null; drawString(); }
      } else if (k === 'stile') { setStyle(board.dataset.style === 'notte' ? 'giorno' : 'notte'); }
      else if (k === 'explore') { lock(!board.classList.contains('is-locked')); }
      else if (k === 'here') { const h = youAreHere(); if (h) { lock(false); stringFrom = null; drawString(); const vw = board.querySelector('.mapboard__viewport').clientWidth; pz.flyTo(h.x, h.y, Math.max(pz.state().s, (vw / 2896) * 2.6)); } }
      else if (k === 'full') { const on = board.classList.toggle('is-full'); document.body.classList.toggle('has-map-full', on); tool.querySelector('use').setAttribute('href', on ? '#i-close' : '#i-expand'); tool.querySelector('.mb-tool__label').textContent = on ? 'Chiudi' : 'Schermo intero'; lock(!on); setTimeout(() => { pz.fit(); drawString(); }, 50); }
      return;
    }
    if (pz?.wasDragging()) return;
    const fly = e.target.closest('[data-mb-fly]');
    if (fly) {
      const c = districtCenters()[fly.dataset.mbFly]; if (!c) return;
      board.querySelectorAll('.polaroid.is-active').forEach((p) => p.classList.remove('is-active')); fly.classList.add('is-active');
      board.querySelectorAll('.mb-badge.is-active').forEach((p) => p.classList.remove('is-active')); board.querySelector(`[data-mb-district="${fly.dataset.mbFly}"]`)?.classList.add('is-active');
      const vw = board.querySelector('.mapboard__viewport').clientWidth; const target = Math.max(pz.state().s, (vw / 2896) * 2.6);
      stringFrom = { id: fly.dataset.mbFly, ...c }; pz.flyTo(c.x, c.y, target); return;
    }
    const bd = e.target.closest('[data-mb-district]'); if (bd) { const d = byId(bd.dataset.mbDistrict); if (d) districtSheet(d); return; }
    const pin = e.target.closest('[data-mb-luogo]'); if (pin) { const l = (db.luoghi || []).find((x) => x.slug === pin.dataset.mbLuogo); if (l) luogoSheet(l); }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && board?.classList.contains('is-full')) board.querySelector('[data-mb-tool="full"]')?.click(); });
}
