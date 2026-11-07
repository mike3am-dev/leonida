/** Foglio modale: dal basso quando il Duo è chiuso, flottante sulla pagina destra quando è aperto */
import { esc } from './dom.js';

let open = null;

export function showSheet({ title, body, side = 'right', onClose }) {
  closeSheet();
  const root = document.getElementById('sheet-root');
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'sheet' + (side === 'left' ? ' sheet--left' : '');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', title);
  sheet.innerHTML = `<div class="sheet__grip" aria-hidden="true"></div>
    <div class="sheet__head"><h2>${esc(title)}</h2>
      <button class="icon-btn" type="button" data-close aria-label="Chiudi"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
    </div><div class="sheet__body"></div>`;
  const bodyEl = sheet.querySelector('.sheet__body');
  if (typeof body === 'string') bodyEl.innerHTML = body; else bodyEl.append(body);
  root.append(backdrop, sheet);
  const close = () => { backdrop.remove(); sheet.remove(); open = null; onClose?.(); };
  backdrop.onclick = close;
  sheet.addEventListener('click', (e) => { const d = e.target.closest('[data-discover]'); if (d) { import('../store/progress.js').then((p) => { p.toggleDiscovered(d.dataset.discover); close(); document.dispatchEvent(new CustomEvent('leonida:rerender')); }); } });
  sheet.querySelector('[data-close]').onclick = close;
  const onKey = (e) => { if (e.key === 'Escape') { close(); removeEventListener('keydown', onKey); } };
  addEventListener('keydown', onKey);
  open = { close, el: sheet };
  const first = sheet.querySelector('textarea, input, select, button:not([data-close])');
  first?.focus({ preventScroll: true });
  return open;
}

export function closeSheet() { open?.close(); }
