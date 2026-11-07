/**
 * Pan e zoom con le dita (e col mouse), senza librerie.
 * viewport: il riquadro fisso; content: l'elemento che si sposta e si ingrandisce.
 * Le coordinate "di contenuto" sono in pixel del contenuto a scala 1.
 */
export function panzoom(viewport, content, { minScale = 0.2, maxScale = 6, margin = 0.12, onChange } = {}) {
  let x = 0, y = 0, s = 1;
  let cw = content.offsetWidth, ch = content.offsetHeight;
  const pointers = new Map();
  let pinch = null, lastTap = 0, moved = false, raf = null;

  const apply = () => {
    content.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    content.style.setProperty('--s', s);
    if (!raf) raf = requestAnimationFrame(() => { raf = null; onChange?.(state()); });
  };
  const clamp = () => {
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const w = cw * s, h = ch * s;
    // il contenuto copre sempre il riquadro: se è più piccolo sta al centro
    x = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, x));
    y = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, y));
  };
  const state = () => ({ x, y, s });
  const zoomAt = (px, py, ns) => {
    ns = Math.min(maxScale, Math.max(minScale, ns));
    const k = ns / s;
    x = px - (px - x) * k; y = py - (py - y) * k; s = ns;
    clamp(); apply();
  };
  const fit = ({ animate = false } = {}) => {
    cw = content.offsetWidth; ch = content.offsetHeight;
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    s = Math.max(vw / cw, vh / ch); // copri il riquadro
    s = Math.max(minScale, Math.min(maxScale, s));
    x = (vw - cw * s) / 2; y = Math.min(0, (vh - ch * s) / 2); clamp();
    if (animate) animateTo(x, y, s); else apply();
  };
  let anim = null;
  const animateTo = (tx, ty, ts, ms = 600) => {
    cancelAnimationFrame(anim);
    const x0 = x, y0 = y, s0 = s, t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => { const t = Math.min(1, (now - t0) / ms), e = ease(t); x = x0 + (tx - x0) * e; y = y0 + (ty - y0) * e; s = s0 + (ts - s0) * e; apply(); if (t < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  };
  /** Porta il punto (cx, cy) del contenuto al centro del riquadro, alla scala voluta */
  const flyTo = (cx, cy, ns = s, { animate = true } = {}) => {
    ns = Math.min(maxScale, Math.max(minScale, ns));
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const tx = vw / 2 - cx * ns, ty = vh / 2 - cy * ns;
    const px = x, py = y, ps = s; x = tx; y = ty; s = ns; clamp(); const [fx, fy, fs] = [x, y, s]; x = px; y = py; s = ps;
    if (animate) animateTo(fx, fy, fs); else { x = fx; y = fy; s = fs; apply(); }
  };
  const toScreen = (cx, cy) => ({ x: x + cx * s, y: y + cy * s });
  const toContent = (px, py) => ({ x: (px - x) / s, y: (py - y) / s });

  const pos = (e) => { const r = viewport.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cancelAnimationFrame(anim);
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, pos(e)); moved = false;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s0: s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId), cur = pos(e); pointers.set(e.pointerId, cur);
    if (pointers.size === 1) {
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      x += dx; y += dy; clamp(); apply();
    } else if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      x += mx - pinch.mx; y += my - pinch.my; pinch.mx = mx; pinch.my = my; moved = true;
      zoomAt(mx, my, pinch.s0 * (d / pinch.d));
    }
  });
  const up = (e) => {
    if (!pointers.has(e.pointerId)) return;
    const p = pointers.get(e.pointerId); pointers.delete(e.pointerId); pinch = null;
    if (!moved && pointers.size === 0 && e.pointerType !== 'mouse') {
      const now = Date.now(); if (now - lastTap < 320) { zoomAt(p.x, p.y, s * 2); lastTap = 0; } else lastTap = now;
    }
  };
  viewport.addEventListener('pointerup', up); viewport.addEventListener('pointercancel', up);
  viewport.addEventListener('wheel', (e) => { e.preventDefault(); const p = pos(e); zoomAt(p.x, p.y, s * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); }, { passive: false });
  viewport.addEventListener('dblclick', (e) => { const p = pos(e); zoomAt(p.x, p.y, s * 2); });
  const ro = new ResizeObserver(() => { clamp(); apply(); });
  ro.observe(viewport);

  return { fit, flyTo, zoomAt, state, toScreen, toContent, wasDragging: () => moved, destroy: () => ro.disconnect(), setContentSize: (w, h) => { cw = w; ch = h; } };
}
