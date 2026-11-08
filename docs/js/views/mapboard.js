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
  giorno: { src: 'assets/img/mappa/leonida-giorno-media.jpg', w: 2896, h: 3700, geo: true, tiles: 'standard' },
  poster: { src: 'assets/img/mappa-leonida.jpg', w: 1640, h: 2048, geo: false },
};
const WORLD = 4096, X0 = 1200, Y0 = 260;        // ritaglio fatto sulla mappa intera a zoom 3 (@2x)
const TILE_HOST = 'https://tiles.gtasixmap.com/tiles';
export const toPx = (x, y) => ({ x: WORLD * (x + 6000) / 12000 - X0, y: WORLD * (6000 - y) / 12000 - Y0 });

/** Dove stanno le Polaroid: sul mare, vicino alla regione (pixel della mappa base 2896×3700) */
const PHOTO_POS = {
  'dis-mount-kalaga': [2440, 450], 'dis-port-gellhorn': [300, 640], 'dis-ambrosia': [270, 1330], 'dis-waning-sands': [2690, 1020],
  'dis-capri': [250, 1980], 'dis-vice-city': [2720, 1600], 'dis-vice-beach': [2720, 2180], 'dis-grassrivers': [380, 2640],
  'dis-hamlet': [2380, 2820], 'dis-keys': [2330, 3300],
};
const PW = 340, PH = 410;
const luoghi = () => (db.luoghi || []).filter((l) => l.xy);
/** Dove sei: la regione della missione in corso; prima dell'inizio, il penitenziario di Hamlet */
function youAreHere() {
  const m = currentMission(); const centers = districtCenters();
  if (m?.districtId && centers[m.districtId]) return { ...centers[m.districtId], label: byId(m.districtId)?.name || '' };
  const pen = (db.luoghi || []).flatMap((l) => l.landmarks || []).find((k) => k.xy && /Penitentiary/i.test(k.name));
  if (pen) return { ...toPx(pen.xy[0], pen.xy[1]), label: 'Leonida Penitentiary' };
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

/* ---------- Punti sulla mappa: luoghi, punti d'interesse, punti di riferimento ---------- */
const lmkId = (slug, i) => `lmk-${slug}-${i + 1}`;
/** Tutti i punti con coordinate, con lo stato «visitato/trovato» */
/** Nasconde le etichette che si sovrappongono (prima i punti d'interesse, poi i punti di riferimento) */
let clashT = null;
function declutter() {
  clearTimeout(clashT); clashT = setTimeout(() => {
    if (!board || board.dataset.z !== 'hi') return;
    const vp = board.querySelector('.mapboard__viewport').getBoundingClientRect();
    const labels = [...board.querySelectorAll('.mapboard__layer--poi .mb-pin__label, .mapboard__layer--lmk .mb-pin__label')];
    labels.forEach((l) => l.classList.remove('is-clash'));
    const placed = [];
    for (const l of labels) {
      if (l.closest('.mb-pin.is-hidden') || !l.offsetParent) continue;
      const r = l.getBoundingClientRect(); if (r.right < vp.left || r.left > vp.right || r.bottom < vp.top || r.top > vp.bottom) continue;
      if (placed.some((p) => !(r.right < p.left - 2 || r.left > p.right + 2 || r.bottom < p.top - 1 || r.top > p.bottom + 1))) l.classList.add('is-clash'); else placed.push(r);
    }
  }, 120);
}
export function mapPoints() {
  const st = progress.get(); const out = [];
  for (const l of db.luoghi || []) {
    if (l.xy && !TERRITORY_SLUGS[l.slug]) out.push({ key: `luogo:${l.slug}`, kind: 'luogo', name: l.name, xy: l.xy, districtId: l.districtId, img: [l.hero?.local, l.hero?.src], seen: !!st.discovered?.[`luogo-${l.slug}`], ref: l });
    (l.landmarks || []).forEach((k, i) => { if (k.xy) out.push({ key: `lmk:${l.slug}:${i}`, kind: 'lmk', name: k.name, xy: k.xy, districtId: l.districtId, img: [k.local, k.image], seen: !!st.collectibles?.[lmkId(l.slug, i)], ref: k, luogo: l, idx: i }); });
  }
  for (const d of db.districts || []) for (const p of d.pois || []) if (p.xy) out.push({ key: `poi:${p.id}`, kind: 'poi', name: p.name, xy: p.xy, districtId: d.id, img: [p.image, null], seen: !!st.discovered?.[p.id], ref: p });
  return out;
}
/** In modalità Gioco una regione è «aperta» se scoperta con la storia, segnata, o è dove sei ora */
function regionOpen(id) {
  if (!id) return false; const d = byId(id); if (d && isFound(d)) return true;
  return currentMission()?.districtId === id;
}
/** Icona del punto d'interesse in base al tipo: così sulla mappa si distinguono polizia, armi, cibo… */
export function poiIcon(p) {
  const k = ((p.kind || '') + ' ' + (p.name || '')).toLowerCase();
  const R = [[/polizia|police|sceriff|pd\b|penitenz|carcer|prigion/, '🚓'], [/ammu|armer|armi\b|gun/, '🔫'], [/stazion|metro|mover|train|treno|fermata/, '🚇'], [/aeroport|airport|airfield|aerodrom/, '✈️'], [/hotel|motel|resort|cabins/, '🏨'],
    [/officin|garage|custom|carrozz|gomm|tire|body shop|pay|autolavag|car wash/, '🔧'], [/banca|bank|fleeca|atm|lombank/, '🏦'], [/ristor|diner|fast food|burger|waffle|cafe|caff|bar\b|deli|food|grill|pizz|taco|shrimp/, '🍔'],
    [/club|strip|locale|disco|nightclub|cabaret|lounge/, '🍸'], [/negoz|store|market|shop|mall|minimarket|abbigliam|moda|fashion|gallery|pawn|pegni/, '🛍️'], [/marina|porto|cantiere|barca|boat|molo/, '⚓'],
    [/ponte|bridge|causeway|strada|autostrada/, '🌉'], [/stadio|arena|field|raceway|speedway|autodromo|golf/, '🏟️'], [/ospedal|hospital/, '🏥'], [/parco|park|spiaggia|beach|isola|riserva/, '🌴'], [/rifugio|casa|apartment|appartam/, '🏠']];
  for (const [re, e] of R) if (re.test(k)) return e;
  return '📍';
}
const KIND_LABEL = { luogo: 'Luogo', poi: "Punto d'interesse", lmk: 'Punto di riferimento' };
const prefs = () => { try { return JSON.parse(localStorage.getItem('leonida:mappa') || '{}'); } catch { return {}; } };
const savePref = (k, v) => { const p = prefs(); p[k] = v; localStorage.setItem('leonida:mappa', JSON.stringify(p)); };

/** HTML del tavolo */
export function boardHtml(districts) {
  const p = prefs();
  const style = p.style === 'poster' ? 'poster' : 'giorno';
  const layers = { territori: p.territori ?? true, luoghi: p.luoghi ?? true, poi: p.poi ?? true, lmk: p.lmk ?? true, foto: p.foto ?? true };
  const mode = p.mode === 'gioco' ? 'gioco' : 'anteprima';
  const centers = districtCenters();
  const base = BASES[style] || BASES.giorno;
  const ds = districts.filter((d) => centers[d.id]);
  const badges = ds.map((d, i) => { const c = centers[d.id]; return `<button type="button" class="mb-badge ${isFound(d) ? 'is-found' : ''}" style="left:${c.x}px;top:${c.y}px" data-mb-district="${esc(d.id)}" aria-label="${esc(d.name)}"><span>${String(i + 1).padStart(2, '0')}</span></button>`; }).join('');
  const here = youAreHere();
  const hereHtml = here ? `<div class="mb-here" style="left:${here.x}px;top:${here.y}px" title="Tu sei qui"><span class="mb-here__pulse"></span><span class="mb-here__dot"></span><span class="mb-here__label">Tu sei qui</span></div>` : '';
  const pts = mapPoints();
  const pinOf = (q) => { const c = toPx(q.xy[0], q.xy[1]); const gameCls = mode === 'gioco' ? (q.seen ? 'is-seen' : regionOpen(q.districtId) ? 'is-unseen' : 'is-hidden') : ''; return `<button type="button" class="mb-pin mb-pin--${q.kind} ${gameCls}" style="left:${c.x}px;top:${c.y}px" data-mb-point="${esc(q.key)}" aria-label="${esc(q.name)}">${q.kind === 'poi' ? `<span class="mb-pin__ico" aria-hidden="true">${poiIcon(q.ref)}</span>` : !q.img[0] && !q.img[1] ? `<svg aria-hidden="true"><use href="#i-${q.kind === 'lmk' ? 'eye' : 'pin'}"/></svg>` : img(q.img[0], q.img[1])}${q.seen ? '<i class="mb-pin__tick"></i>' : ''}<span class="mb-pin__label">${esc(q.name)}</span></button>`; };
  const pins = pts.filter((q) => q.kind === 'luogo').map(pinOf).join('');
  const poiPins = pts.filter((q) => q.kind === 'poi').map(pinOf).join('');
  const lmkPins = pts.filter((q) => q.kind === 'lmk').map(pinOf).join('');
  // Polaroid appiccicate sul mare, con il filo rosso fino al centro della regione (coordinate della mappa)
  const photos = ds.filter((d) => PHOTO_POS[d.id]).map((d, i) => {
    const [px, py] = PHOTO_POS[d.id], c = centers[d.id];
    return { d, i, px, py, c, rot: ((i * 7) % 11) - 5 };
  });
  const threads = photos.map(({ px, py, c }) => { const ax = px, ay = py - PH / 2 + 18; const mx = (ax + c.x) / 2, my = Math.max(ay, c.y) + 90; return `<path d="M${ax} ${ay} Q${mx} ${my} ${c.x} ${c.y}"/><circle class="mb-thread__end" cx="${c.x}" cy="${c.y}" r="11"/>`; }).join('');
  const photoHtml = photos.map(({ d, px, py, rot }) => `<button type="button" class="mb-photo" style="left:${px - PW / 2}px;top:${py - PH / 2}px;width:${PW}px;--rot:${rot}deg" data-mb-fly="${esc(d.id)}" aria-label="${esc(d.name)}"><span class="mb-photo__pin"></span><span class="mb-photo__img">${d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : ''}</span><span class="mb-photo__cap">${esc(d.name.replace(' National Park', ''))}</span></button>`).join('');
  const tool = (k, icon, label, on) => `<button type="button" class="mb-tool ${on ? 'is-on' : ''}" data-mb-tool="${k}" aria-pressed="${on}" aria-label="${esc(label)}" title="${esc(label)}"><svg aria-hidden="true"><use href="#i-${icon}"/></svg><span class="mb-tool__label">${esc(label)}</span></button>`;
  return `<div class="mapboard ${base.geo ? '' : 'is-poster'} is-locked" data-mode="${mode}" data-z="lo" data-style="${style}" data-layers="${Object.entries(layers).filter(([, v]) => v).map(([k]) => k).join(' ')}">
    <div class="mapboard__viewport">
      <div class="mapboard__content" style="width:${base.w}px;height:${base.h}px">
        <img class="mapboard__base" src="${base.src}" alt="Mappa di Leonida" draggable="false" width="${base.w}" height="${base.h}">
        <div class="mapboard__tiles" aria-hidden="true"></div>
        <div class="mapboard__layer mapboard__layer--foto"><svg class="mb-threads" width="${base.w}" height="${base.h}" viewBox="0 0 ${base.w} ${base.h}" aria-hidden="true">${threads}</svg>${photoHtml}</div>
        <div class="mapboard__layer mapboard__layer--lmk">${lmkPins}</div>
        <div class="mapboard__layer mapboard__layer--poi">${poiPins}</div>
        <div class="mapboard__layer mapboard__layer--luoghi">${pins}</div>
        <div class="mapboard__layer mapboard__layer--territori">${badges}</div>
        <div class="mapboard__layer mapboard__layer--here">${hereHtml}</div>
      </div>
      <div class="mb-banner" aria-live="polite">Stai esplorando: trascina e pizzica per muoverti</div>
      <button type="button" class="mb-explore" data-mb-tool="explore"><svg aria-hidden="true"><use href="#i-lock"/></svg><span>Tocca per esplorare la mappa</span></button>
    </div>
    <div class="mapboard__tools">
      <div class="mb-mode" role="group" aria-label="Cosa mostrare"><button type="button" data-mb-mode="anteprima" aria-pressed="${mode === 'anteprima'}">Anteprima</button><button type="button" data-mb-mode="gioco" aria-pressed="${mode === 'gioco'}">Gioco</button></div>
      <span class="mb-mode__hint">${mode === 'gioco' ? 'Gioco: vedi solo quello che hai segnato come trovato (con la spunta). Nelle regioni che la storia ti ha aperto compare in grigio anche quello che ti manca.' : 'Anteprima: tutto quello che si sa, per studiare.'}</span>
      ${tool('territori', 'map', 'Regioni', layers.territori)}${tool('luoghi', 'photo', 'Luoghi', layers.luoghi)}${tool('poi', 'pin', 'Punti d’interesse', layers.poi)}${tool('lmk', 'eye', 'Punti di riferimento', layers.lmk)}${tool('foto', 'bookmark', 'Polaroid', layers.foto)}
      <span class="mb-tool__sep"></span>
      ${tool('here', 'target', 'Tu sei qui', false)}${tool('fit', 'map', 'Centra', false)}${tool('full', 'expand', 'Schermo intero', false)}
    </div>
  </div>`;
}

let pz = null, board = null;
function lock(on) { if (!board) return; board.classList.toggle('is-locked', on); const b = board.querySelector('.mb-explore'); if (b) { b.querySelector('span').textContent = on ? 'Tocca per esplorare la mappa' : 'Blocca la mappa'; b.querySelector('use').setAttribute('href', on ? '#i-lock' : '#i-check'); } }
/** Tessere a zoom alto (z5) scaricate al volo da gtasixmap quando ti avvicini */
function updateTiles() {
  if (!board || !pz) return;
  const base = BASES[board.dataset.style]; const layer = board.querySelector('.mapboard__tiles');
  if (!base?.geo) { layer.innerHTML = ''; return; }
  const { s } = pz.state();
  // La base è leggera (metà risoluzione: Safari la disegna sempre intera); i dettagli arrivano a quadratini appena ingrandisci
  if (s < 0.45 || !navigator.onLine) { layer.innerHTML = ''; return; }
  const vp = board.querySelector('.mapboard__viewport');
  const tl = pz.toContent(0, 0), br = pz.toContent(vp.clientWidth, vp.clientHeight);
  const Z = s < 0.95 ? 3 : s < 1.9 ? 4 : s < 3.8 ? 5 : 6, T = 512;
  const size = WORLD / 2 ** Z;                               // pixel di base coperti da una tessera
  const x0 = Math.max(0, Math.floor((tl.x + X0) / size)), x1 = Math.min(2 ** Z - 1, Math.floor((br.x + X0) / size));
  const y0 = Math.max(0, Math.floor((tl.y + Y0) / size)), y1 = Math.min(2 ** Z - 1, Math.floor((br.y + Y0) / size));
  const want = new Set();
  for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) want.add(`${Z},${tx},${ty}`);
  for (const el of [...layer.children]) if (!want.has(el.dataset.t)) el.remove();
  for (const key of want) {
    if (layer.querySelector(`[data-t="${key}"]`)) continue;
    const [, tx, ty] = key.split(',').map(Number);
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
    <div class="actions" style="margin-bottom:0"><button class="btn btn--solid" type="button" data-zone-go="${esc(d.id)}">Apri la regione</button></div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a, [data-zone-go]')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: d.name, body });
}

function pointSheet(q) {
  const body = document.createElement('div');
  const toggle = q.kind === 'lmk' ? `data-seen-collect="${esc(lmkId(q.luogo.slug, q.idx))}"` : `data-seen-discover="${esc(q.kind === 'luogo' ? 'luogo-' + q.ref.slug : q.ref.id)}"`;
  const d = q.districtId ? byId(q.districtId) : null;
  const text = q.kind === 'lmk' ? q.ref.text : q.kind === 'luogo' ? q.ref.lead : q.ref.description;
  const link = q.kind === 'lmk' ? `#/mappa/luogo/${q.luogo.slug}` : q.kind === 'luogo' ? `#/mappa/luogo/${q.ref.slug}` : `#/mappa/${q.districtId}/${q.ref.id}`;
  body.innerHTML = `${q.img[0] || q.img[1] ? img(q.img[0], q.img[1], 'pop__img') : ''}
    <div class="chips" style="margin:var(--s-2) 0"><span class="chip">${KIND_LABEL[q.kind]}</span>${d ? `<span class="chip">${esc(d.name)}</span>` : ''}${q.kind === 'lmk' && q.ref.real ? `<span class="chip">Nel mondo reale: ${esc(q.ref.real)}</span>` : ''}</div>
    ${text ? `<p class="small">${esc(text.slice(0, 260))}${text.length > 260 ? '…' : ''}</p>` : ''}
    <div class="actions" style="margin-bottom:0"><button class="btn ${q.seen ? 'btn--accent' : 'btn--ghost'}" type="button" data-mb-seen ${toggle}><svg aria-hidden="true"><use href="#i-${q.seen ? 'check' : 'eye'}"/></svg>${q.seen ? 'Trovato ✓' : 'Trovato / visitato'}</button><a class="btn btn--solid" href="${link}">${q.kind === 'lmk' ? 'Apri la guida del luogo' : 'Apri la scheda'}</a></div>`;
  body.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => document.querySelector('.sheet-backdrop')?.click(), 0); });
  showSheet({ title: q.name, body });
}
/** Porta la mappa su un punto (da «Mostra sulla mappa»), lo fa lampeggiare e lo apre */
export function focusPoint(key) {
  if (!board || !pz) return;
  const q = mapPoints().find((x) => x.key === key);
  const xy = q?.xy || (key.startsWith('luogo:') || key.startsWith('lmk:') ? (db.luoghi || []).find((l) => l.slug === key.split(':')[1])?.xy : null);
  if (!xy) return;
  const c = toPx(xy[0], xy[1]);
  const kind = key.split(':')[0]; if (kind !== 'luogo' && !board.dataset.layers.includes(kind)) board.querySelector(`[data-mb-tool="${kind}"]`)?.click();
  board.scrollIntoView({ block: 'start' });
  const vw = board.querySelector('.mapboard__viewport').clientWidth;
  pz.flyTo(c.x, c.y, Math.max(pz.state().s, (vw / 2896) * 4.5));
  board.querySelectorAll('.mb-pin.is-target').forEach((x) => x.classList.remove('is-target'));
  const el = board.querySelector(`[data-mb-point="${CSS.escape(key)}"]`); el?.classList.add('is-target');
}

/** Da chiamare dopo ogni render della pagina Mappa */
export function mount(root) {
  board = root.querySelector('.mapboard'); if (!board) { pz = null; return; }
  const vp = board.querySelector('.mapboard__viewport'), content = board.querySelector('.mapboard__content');
  pz = panzoom(vp, content, { minScale: 0.08, maxScale: 7, enabled: () => !board?.classList.contains('is-locked'), cover: true, onChange: (st) => { updateTiles(); if (board) board.dataset.z = st.s > 1 ? 'hi' : st.s > 0.55 ? 'mid' : 'lo'; declutter(); } });
  const baseImg = board.querySelector('.mapboard__base');
  const start = () => { pz.fit(); const p = prefs(); if (p.view && board.dataset.style !== 'poster') { pz.flyTo(p.view.cx, p.view.cy, p.view.s, { animate: false }); } };
  // Blocco: finché è bloccata, il dito scorre la pagina; un tocco la sblocca, un tocco fuori la riblocca
  document.addEventListener('pointerdown', (e) => { if (board && !board.contains(e.target) && !board.classList.contains('is-full') && !e.target.closest('.sheet, .sheet-backdrop, #dossier')) lock(true); }, { passive: true });
  // Pizzico con due dita sulla mappa bloccata: il tasto «Tocca per esplorare» sobbalza per farsi notare (la pagina non si blocca)
  const nudge = () => { if (!board?.classList.contains('is-locked')) return; const b = board.querySelector('.mb-explore'); if (!b || b.classList.contains('is-nudge')) return; b.classList.add('is-nudge'); setTimeout(() => b.classList.remove('is-nudge'), 1300); };
  vp.addEventListener('touchstart', (e) => { if (e.touches.length >= 2) nudge(); }, { passive: true });
  vp.addEventListener('gesturestart', nudge, { passive: true });
  vp.addEventListener('wheel', (e) => { if (e.ctrlKey) nudge(); }, { passive: true });
  start(); // la misura del contenuto è nello stile: non serve aspettare l'immagine
  // ricorda dove eri
  let t = null; vp.addEventListener('pointerup', () => { clearTimeout(t); t = setTimeout(() => { const st = pz.state(); const c = pz.toContent(vp.clientWidth / 2, vp.clientHeight / 2); savePref('view', { cx: c.x, cy: c.y, s: st.s }); }, 400); });
}

function setStyle(style) {
  const base = BASES[style]; const content = board.querySelector('.mapboard__content'), im = board.querySelector('.mapboard__base');
  board.dataset.style = style; board.classList.toggle('is-poster', !base.geo);
  content.style.width = base.w + 'px'; content.style.height = base.h + 'px'; im.src = base.src; im.width = base.w; im.height = base.h;
  pz.setContentSize(base.w, base.h); pz.fit({ animate: true }); updateTiles();
  const pb = board.querySelector('[data-mb-tool="poster"]'); pb.classList.toggle('is-on', !base.geo); pb.setAttribute('aria-pressed', !base.geo);
  savePref('style', style);
}

export function bind(root) {
  // «Trovato / visitato» dal foglio del punto (il foglio vive fuori da #app)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mb-seen]'); if (!b) return;
    if (b.dataset.seenCollect) progress.toggleCollected(b.dataset.seenCollect); else progress.toggleDiscovered(b.dataset.seenDiscover);
    const on = b.dataset.seenCollect ? !!progress.get().collectibles[b.dataset.seenCollect] : !!progress.get().discovered?.[b.dataset.seenDiscover];
    import('../ui/dom.js').then(({ toast }) => toast(on ? 'Segnato come trovato' : 'Tolto dai trovati'));
    document.querySelector('.sheet-backdrop')?.click(); document.dispatchEvent(new CustomEvent('leonida:rerender'));
  });
  root.addEventListener('click', (e) => {
    if (!board || !root.contains(board)) return;
    const md = e.target.closest('[data-mb-mode]');
    if (md) { savePref('mode', md.dataset.mbMode); document.dispatchEvent(new CustomEvent('leonida:rerender')); return; }
    const tool = e.target.closest('[data-mb-tool]');
    if (tool) {
      const k = tool.dataset.mbTool;
      if (['territori', 'luoghi', 'poi', 'lmk', 'foto'].includes(k)) {
        const on = !tool.classList.contains('is-on'); tool.classList.toggle('is-on', on); tool.setAttribute('aria-pressed', on);
        const set = new Set(board.dataset.layers.split(' ').filter(Boolean)); on ? set.add(k) : set.delete(k); board.dataset.layers = [...set].join(' '); savePref(k, on);
      } else if (k === 'stile') { setStyle(board.dataset.style === 'notte' ? 'giorno' : 'notte'); }
      else if (k === 'explore') { lock(!board.classList.contains('is-locked')); }
      else if (k === 'fit') { pz.fit({ animate: true }); }
      else if (k === 'here') { const h = youAreHere(); if (h) { const vw = board.querySelector('.mapboard__viewport').clientWidth; pz.flyTo(h.x, h.y, Math.max(pz.state().s, (vw / 2896) * 2.6)); } }
      else if (k === 'full') { const on = board.classList.toggle('is-full'); document.body.classList.toggle('has-map-full', on); tool.querySelector('use').setAttribute('href', on ? '#i-close' : '#i-expand'); tool.querySelector('.mb-tool__label').textContent = on ? 'Chiudi' : 'Schermo intero'; lock(!on); setTimeout(() => { pz.fit(); }, 50); }
      return;
    }
    if (pz?.wasDragging()) return;
    const fly = e.target.closest('[data-mb-fly]');
    if (fly) {
      const c = districtCenters()[fly.dataset.mbFly]; if (!c) return;
      board.querySelectorAll('.mb-photo.is-active').forEach((p) => p.classList.remove('is-active')); fly.classList.add('is-active');
      board.querySelectorAll('.mb-badge.is-active').forEach((p) => p.classList.remove('is-active')); board.querySelector(`[data-mb-district="${fly.dataset.mbFly}"]`)?.classList.add('is-active');
      const vw = board.querySelector('.mapboard__viewport').clientWidth; const target = Math.max(pz.state().s, (vw / 2896) * 2.6);
      pz.flyTo(c.x, c.y, target); return;
    }
    const bd = e.target.closest('[data-mb-district]'); if (bd) { const d = byId(bd.dataset.mbDistrict); if (d) districtSheet(d); return; }
    const pin = e.target.closest('[data-mb-point]'); if (pin) { const q = mapPoints().find((x) => x.key === pin.dataset.mbPoint); if (q) pointSheet(q); }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && board?.classList.contains('is-full')) board.querySelector('[data-mb-tool="full"]')?.click(); });
}
