/** Piccole utilità per costruire HTML in sicurezza */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export const html = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (i < vals.length ? (Array.isArray(vals[i]) ? vals[i].join('') : vals[i] ?? '') : ''), '');
export function el(tag, attrs = {}, children = '') {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v; else if (k.startsWith('on')) node.addEventListener(k.slice(2), v); else node.setAttribute(k, v);
  }
  node.innerHTML = children;
  return node;
}
export function pad2(n) { return String(n).padStart(2, '0'); }
export function fmtDate(iso, opts = { day: 'numeric', month: 'short' }) {
  try { return new Date(iso).toLocaleDateString('it-IT', opts); } catch { return ''; }
}
export function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}
export function relTime(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'adesso';
  if (d < 3600) return `${Math.floor(d / 60)} min fa`;
  if (d < 86400) return `${Math.floor(d / 3600)} h fa`;
  if (d < 86400 * 7) return `${Math.floor(d / 86400)} g fa`;
  return fmtDate(iso);
}
export function statusChip(item) {
  const map = { verificato: 'Verificato', 'da verificare': 'Da verificare', segnaposto: 'Segnaposto' };
  const cls = (item.status || 'segnaposto').replace(/\s+/g, '-');
  const ex = item.example ? `<span class="chip chip--esempio">Esempio</span>` : '';
  const src = { stampa: 'Stampa', rumor: 'Rumor', leak: 'Leak', community: 'Community', trailer: 'Ufficiale' }[item.source];
  const srcChip = src && item.status !== 'verificato' ? `<span class="chip chip--src-${esc(item.source)}">${src}</span>` : (item.source === 'trailer' && item.status === 'verificato' ? '' : '');
  return `${ex}<span class="chip chip--${cls}">${esc(map[item.status] || item.status)}</span>${srcChip}`;
}
export function protagonistChip(p) {
  const label = { jason: 'Jason', lucia: 'Lucia', entrambi: 'Jason & Lucia' }[p] || p;
  return p ? `<span class="chip chip--${esc(p)}">${esc(label)}</span>` : '';
}
export function toast(msg, { action, onAction, ms = 3200 } = {}) {
  const t = document.getElementById('toast');
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  t.hidden = false;
  if (action) t.querySelector('button').onclick = () => { onAction?.(); t.hidden = true; };
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, ms);
}
export function imageOrFallback(src, alt, fallbackSvg = '') {
  if (!src) return fallbackSvg;
  return `<figure class="figure"><img src="${esc(src)}" alt="${esc(alt || '')}" loading="lazy" onerror="this.closest('figure').remove()"></figure>`;
}
