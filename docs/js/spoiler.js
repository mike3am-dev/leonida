/**
 * Scudo spoiler.
 * spoilerLevel = numero dell'atto dopo il quale la voce si può leggere.
 * La progressione è l'atto più alto in cui hai una missione iniziata o completata,
 * oppure quello fissato a mano nelle Impostazioni.
 */
import { db, actNum } from './data.js';
import * as progress from './store/progress.js';
import { esc } from './ui/dom.js';

export function currentAct() {
  const manual = progress.settings().manualAct;
  if (manual !== null && manual !== undefined) return Number(manual);
  let max = 0;
  for (const [id, v] of Object.entries(progress.get().missions)) {
    if (!v.state) continue;
    const m = db.byId.get(id);
    if (m) max = Math.max(max, actNum(m.actId));
  }
  return max;
}

/** Modalità vergine: nasconde anche i personaggi non ancora incontrati, le teorie e i dettagli di trama nella ricerca */
export function virgin() { return !!progress.settings().virginMode; }
/** Regola unica: il nome di una missione si vede solo se l'hai iniziata o completata (o se lo scudo è spento). */
export function missionRevealed(m) {
  if (!m) return false;
  return !!progress.get().missions[m.id]?.state || !progress.settings().spoilerShield;
}
/** Nome della missione o «Missione bloccata» */
export function missionName(m, locked = 'Missione bloccata') { return missionRevealed(m) ? m.title : locked; }

export function isHidden(item) {
  if (virgin() && item?._type === 'teoria') return true;
  if (!progress.settings().spoilerShield) return false;
  if (item?._type === 'mission' && !missionRevealed(item)) return true;
  const lvl = Number(item?.spoilerLevel || 0);
  return lvl > currentAct();
}

/**
 * Inchiostro invisibile (come in iMessage): il testo spoiler è coperto da un pulviscolo che si muove;
 * un tocco lo fa esplodere e le parole compaiono. Niente banner.
 */
export function ink(html, { inline = false } = {}) {
  const tag = inline ? 'span' : 'div';
  return `<${tag} class="ink${inline ? ' ink--inline' : ''}" data-ink role="button" tabindex="0" aria-label="Spoiler: tocca per leggere"><${tag} class="ink__body" aria-hidden="true">${html}</${tag}></${tag}>`;
}

/** Contenuto oltre il punto della storia: coperto dall'inchiostro invisibile */
export function wrap(item, html) {
  return isHidden(item) ? ink(html) : html;
}

/** Testo breve dentro una riga */
export function text(item, str) {
  return isHidden(item) ? ink(esc(str), { inline: true }) : esc(str);
}

/* ---------- motore delle particelle ---------- */
const inks = new Map();   // elemento -> stato
let raf = 0;
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function rectsOf(el) {
  const box = el.getBoundingClientRect(); const out = [];
  const body = el.querySelector('.ink__body');
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) out.push({ x: r.left - box.left, y: r.top - box.top + r.height * 0.18, w: r.width, h: r.height * 0.64 });
  }
  body.querySelectorAll('img').forEach((im) => { const r = im.getBoundingClientRect(); if (r.width) out.push({ x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }); });
  if (!out.length) out.push({ x: 0, y: 0, w: box.width, h: Math.max(18, box.height) });
  return { box, rects: out };
}

function setup(el) {
  if (inks.has(el) || el.classList.contains('is-open')) return;
  const cv = document.createElement('canvas'); cv.className = 'ink__dust'; cv.setAttribute('aria-hidden', 'true');
  el.append(cv);
  const st = { el, cv, ctx: cv.getContext('2d'), parts: [], visible: false, out: null, color: '#3a2f45' };
  inks.set(el, st);
  layout(st);
  io?.observe(el); ro?.observe(el);
}

function layout(st) {
  const { box, rects } = rectsOf(st.el);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  st.w = box.width; st.h = box.height;
  st.cv.width = Math.max(1, Math.round(box.width * dpr)); st.cv.height = Math.max(1, Math.round(box.height * dpr));
  st.cv.style.width = box.width + 'px'; st.cv.style.height = box.height + 'px';
  st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  st.color = getComputedStyle(st.el).color || st.color;
  const area = rects.reduce((a, r) => a + r.w * r.h, 0);
  const n = Math.min(900, Math.max(24, Math.round(area / 9)));
  st.parts = [];
  for (let i = 0; i < n; i++) {
    let pick = Math.random() * area, r = rects[0];
    for (const q of rects) { pick -= q.w * q.h; if (pick <= 0) { r = q; break; } }
    const x = r.x + Math.random() * r.w, y = r.y + Math.random() * r.h;
    st.parts.push({ x, y, hx: x, hy: y, r: r, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, a: Math.random(), da: (Math.random() * .02 + .008) * (Math.random() < .5 ? -1 : 1), s: Math.random() * .9 + .55 });
  }
}

function frame(t) {
  raf = 0; let alive = false;
  for (const st of inks.values()) {
    if (!st.visible && !st.out) continue;
    const { ctx } = st; ctx.clearRect(0, 0, st.w, st.h); ctx.fillStyle = st.color;
    if (st.out) {
      const k = Math.min(1, (t - st.out.t0) / 650);
      for (const p of st.parts) {
        p.x += p.ox * (1 - k) * 2.2; p.y += p.oy * (1 - k) * 2.2;
        ctx.globalAlpha = Math.max(0, (1 - k) * (.35 + p.a * .6)); ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 + k), 0, 6.283); ctx.fill();
      }
      if (k >= 1) { st.cv.remove(); inks.delete(st.el); io?.unobserve(st.el); ro?.unobserve(st.el); continue; }
      alive = true; continue;
    }
    for (const p of st.parts) {
      p.x += p.vx; p.y += p.vy; p.a += p.da;
      if (p.a > 1 || p.a < .1) p.da = -p.da;
      if (p.x < p.r.x || p.x > p.r.x + p.r.w) p.vx = -p.vx;
      if (p.y < p.r.y || p.y > p.r.y + p.r.h) p.vy = -p.vy;
      ctx.globalAlpha = .25 + p.a * .7; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
    }
    alive = true;
  }
  if (alive && !reduce()) raf = requestAnimationFrame(frame);
}
const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((ents) => { for (const e of ents) { const st = inks.get(e.target); if (st) st.visible = e.isIntersecting; } kick(); }, { rootMargin: '80px' }) : null;
const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((ents) => { for (const e of ents) { const st = inks.get(e.target); if (st && !st.out && Math.abs(e.contentRect.width - st.w) > 1) layout(st); } kick(); }) : null;

function reveal(el, x, y) {
  if (el.classList.contains('is-open')) return;
  el.classList.add('is-open'); el.removeAttribute('role'); el.removeAttribute('tabindex'); el.removeAttribute('aria-label');
  el.querySelector('.ink__body')?.removeAttribute('aria-hidden');
  const st = inks.get(el);
  if (!st || reduce()) { st?.cv.remove(); inks.delete(el); return; }
  const b = el.getBoundingClientRect(); const cx = x != null ? x - b.left : b.width / 2, cy = y != null ? y - b.top : b.height / 2;
  for (const p of st.parts) { const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1; const f = 1.2 + Math.random() * 2.4; p.ox = dx / d * f; p.oy = dy / d * f - .4; }
  st.out = { t0: performance.now() }; kick();
}

/** Monta l'inchiostro su tutto ciò che compare nella pagina (pagine, fascicoli, fogli) */
export function mountInk() {
  const scan = () => { document.querySelectorAll('[data-ink]:not(.is-open)').forEach(setup); kick(); };
  scan();
  new MutationObserver(() => { clearTimeout(mountInk.t); mountInk.t = setTimeout(scan, 30); }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', (e) => { const el = e.target.closest('[data-ink]:not(.is-open)'); if (!el) return; e.preventDefault(); e.stopPropagation(); reveal(el, e.clientX, e.clientY); }, true);
  document.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const el = e.target.closest?.('[data-ink]:not(.is-open)'); if (el) { e.preventDefault(); reveal(el); } });
  window.addEventListener('pageshow', kick);
  document.fonts?.ready.then(() => { for (const st of inks.values()) if (!st.out) layout(st); kick(); });
}

export function bind(root) {
  root.addEventListener('click', (e) => {
    const acc = e.target.closest('.acc__btn');
    if (acc) { const open = acc.closest('.acc').classList.toggle('is-open'); acc.setAttribute('aria-expanded', open); }
  });
}
