/**
 * Router con hash: #/sezione/id
 * - funziona su GitHub Pages senza configurazione
 * - ricorda la posizione di scroll di ogni pagina
 * - aprire/chiudere il Duo non ricarica nulla: cambia solo il layout
 */
const routes = [];
const scrollMemo = new Map();
let current = null;
let lastPath = '';

export function register(pattern, handler) {
  // pattern: '/missioni/:id?' -> regex
  const keys = [];
  const re = new RegExp('^' + pattern
    .replace(/\/:(\w+)\?/g, (_, k) => { keys.push(k); return '(?:/([^/]+))?'; })
    .replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ re, keys, handler, pattern });
}

export function parse(hash = location.hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = m[i + 1] ? decodeURIComponent(m[i + 1]) : undefined; });
      return { route: r, params, query, path };
    }
  }
  return null;
}

export function go(path, { replace = false } = {}) {
  const h = '#' + path;
  if (replace) history.replaceState(null, '', h); else location.hash = path;
  if (replace) dispatch();
}

export function back(fallback = '/') {
  if (history.length > 1 && document.referrer !== '') history.back();
  else go(fallback);
}

export function currentRoute() { return current; }

function rememberScroll() {
  for (const id of ['page-left', 'page-right']) {
    const el = document.getElementById(id);
    if (el) scrollMemo.set(lastPath + '|' + id, el.scrollTop);
  }
}
export function restoreScroll(path) {
  for (const id of ['page-left', 'page-right']) {
    const el = document.getElementById(id);
    const y = scrollMemo.get(path + '|' + id);
    if (el) el.scrollTop = y || 0;
  }
}

let onChange = null;
export function start(handler) {
  onChange = handler;
  addEventListener('hashchange', dispatch);
  dispatch();
}

function dispatch() {
  rememberScroll();
  const match = parse();
  const prev = current;
  current = match;
  const dir = prev && match && depth(match.path) < depth(prev.path) ? 'back' : 'forward';
  onChange?.(match, { prev, dir });
  lastPath = match?.path || '';
}
function depth(p) { return p.split('/').filter(Boolean).length; }
