/**
 * Avvio di Leonida.
 */
import { loadAll, db, byId } from './data.js';
import * as progress from './store/progress.js';
import * as router from './router.js';
import { buildIndex } from './search.js';
import * as spoiler from './spoiler.js';
import { startPosture, isOpen } from './posture.js';
import { esc, toast } from './ui/dom.js';
import { SECTIONS } from './views/shared.js';
import * as sessione from './views/sessione.js';
import * as missioni from './views/missioni.js';
import * as atlante from './views/atlante.js';
import * as collezionabili from './views/collezionabili.js';
import * as editoriale from './views/editoriale.js';
import * as diario from './views/diario.js';
import * as impostazioni from './views/impostazioni.js';
import * as ricerca from './views/ricerca.js';
import * as veicoli from './views/veicoli.js';
import * as novita from './views/novita.js';

window.__LEONIDA_VERSION__ = 'v0.6.2';

const $ = (id) => document.getElementById(id);
let currentRender = null;
let lastKey = '';

function applyTheme() {
  const t = progress.settings().theme || 'dark';
  const resolved = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute('content', resolved === 'light' ? '#efe8dc' : '#0b0a0f');
}

function navHtml(activePath, forRail) {
  const items = forRail ? SECTIONS : SECTIONS.filter((s) => s.tab);
  const tabs = items.map((s) => {
    const active = activePath === s.path || (s.path !== '/' && activePath.startsWith(s.path));
    const label = forRail ? s.title.replace('Radio e Cultura', 'Radio') : s.title.split(' ')[0];
    return `<a class="tab ${s.disabled ? 'is-disabled' : ''}" href="#${s.path}" ${active ? 'aria-current="page"' : ''} ${s.disabled ? 'aria-disabled="true"' : ''}>
      <svg aria-hidden="true"><use href="#i-${s.icon}"/></svg><span>${esc(label)}</span></a>`;
  });
  if (!forRail) {
    const moreActive = !SECTIONS.filter((s) => s.tab).some((s) => activePath === s.path || (s.path !== '/' && activePath.startsWith(s.path)));
    tabs.push(`<a class="tab" href="#/altro" ${moreActive ? 'aria-current="page"' : ''}><svg aria-hidden="true"><use href="#i-more"/></svg><span>Altro</span></a>`);
  }
  return tabs.join('');
}

function renderAltro() {
  const left = `<header class="chapter-head"><span class="kicker">Indice generale</span><h1>Altro</h1></header>
    <ol class="toc">${SECTIONS.map((s) => `<li><a class="toc__row ${s.disabled ? 'is-disabled' : ''}" href="#${s.path}"><span class="toc__num">${String(s.num).padStart(2, '0')}</span><span class="toc__title">${esc(s.title)}${s.disabled ? ' <span class="soon">v2</span>' : ''}</span><span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a></li>`).join('')}
    <li><a class="toc__row" href="#/impostazioni"><span class="toc__num">12</span><span class="toc__title">Impostazioni</span><span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a></li>
    <li><a class="toc__row" href="#/ricerca"><span class="toc__num">—</span><span class="toc__title">Ricerca</span><span class="toc__end"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></a></li></ol>`;
  return { left, right: '', show: 'left', accent: 'magenta', title: 'Altro' };
}

const views = {
  '/': sessione.render,
  '/missioni/:id?': missioni.render,
  '/atlante/:id?/:poi?': atlante.render,
  '/veicoli/:id?': veicoli.render,
  '/novita/:id?': novita.render,
  '/collezionabili': collezionabili.render,
  '/personaggi/:id?': editoriale.renderPersonaggi,
  '/cultura/:id?': editoriale.renderCultura,
  '/prima-ora': editoriale.renderPrimaOra,
  '/online': editoriale.renderOnline,
  '/diario': diario.render,
  '/impostazioni': impostazioni.render,
  '/ricerca': ricerca.render,
  '/altro': renderAltro,
};
for (const [pattern, fn] of Object.entries(views)) router.register(pattern, fn);

function followBar() {
  const bar = $('follow-bar');
  const id = progress.get().current.missionId;
  const m = id ? byId(id) : null;
  if (!m) { bar.hidden = true; bar.innerHTML = ''; return; }
  bar.hidden = false;
  bar.innerHTML = `<a class="follow-bar" href="#/missioni/${esc(m.id)}" style="padding:0;background:none;border:0;min-height:0;flex:1"><span class="follow-bar__dot" aria-hidden="true"></span><span class="follow-bar__text">Ora stai giocando <b>${esc(m.title)}</b></span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
    <button class="icon-btn" type="button" data-action="note" aria-label="Appunto rapido"><svg aria-hidden="true"><use href="#i-pen"/></svg></button>`;
}

function render(match, { dir } = {}) {
  if (!match) { router.go('/', { replace: true }); return; }
  currentRender = () => render(match, {});
  const out = match.route.handler(match.params, match.query);
  const spread = $('main');
  const left = $('page-left'), right = $('page-right');
  document.documentElement.dataset.accent = out.accent || 'magenta';
  document.title = `${out.title ? out.title + ' — ' : ''}Leonida`;

  // Una sola colonna: in dettaglio mostro solo la scheda; in indice mostro top + indice (+ contenuto extra, mai le "aperture" vuote)
  const isOpener = (h) => !h || /class="opener"/.test(h);
  const detail = out.show === 'right';
  $('page-top').innerHTML = !detail && out.top ? `<div class="page__inner">${out.top}</div>` : '';
  left.innerHTML = !detail ? `<div class="page__inner">${out.left || ''}</div>` : '';
  right.innerHTML = detail ? `<div class="page__inner">${out.right || ''}</div>` : (isOpener(out.right) ? '' : `<div class="page__inner">${out.right}</div>`);
  spread.dataset.show = out.show || 'left';
  const sec = SECTIONS.find((s) => match.path === s.path || (s.path !== '/' && match.path.startsWith(s.path)));
  $('folio').innerHTML = `<span>${sec ? `<b>${String(sec.num).padStart(2, '0')}</b> · ${esc(sec.title)}` : `<b>${esc(out.title || '')}</b>`}</span><span>App ${esc(window.__LEONIDA_VERSION__)}${db.meta?.dataVersion ? ` · dati v${esc(db.meta.dataVersion)}` : ''}</span>`;
  spread.scrollTop = 0;

  // Animazione "voltare pagina" solo quando cambia pagina, non su ogni refresh
  const key = match.path;
  if (key !== lastKey) {
    const target = $('sheet-page');
    target.classList.remove('turn-in', 'turn-back'); void target.offsetWidth;
    target.classList.add(dir === 'back' ? 'turn-back' : 'turn-in');
  }
  lastKey = key;

  $('tabbar').innerHTML = navHtml(match.path, false);
  $('rail').innerHTML = `<a class="rail__brand" href="#/" aria-label="Leonida, inizio"><svg aria-hidden="true"><use href="#i-sun"/></svg><span>Leonida</span></a>${navHtml(match.path, true)}<span class="rail__spacer"></span>`;
  followBar();
}

function bindGlobal() {
  const root = $('app');
  const ver = document.createElement('span'); ver.className = 'masthead__ver'; ver.textContent = window.__LEONIDA_VERSION__; document.querySelector('.masthead__tools').prepend(ver);
  // Immagini mancanti: spariscono senza icona rotta
  document.addEventListener('error', (e) => { if (e.target?.tagName === 'IMG') e.target.remove(); }, true);
  spoiler.bind(root);
  const rerender = () => currentRender?.();
  missioni.bind(root, rerender);
  atlante.bind(root, rerender);
  collezionabili.bind(root, rerender);
  diario.bind(root, rerender);
  impostazioni.bind(root, rerender, { applyTheme, checkUpdate });
  ricerca.bind(root);
  veicoli.bind(root, rerender);
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    if (a.dataset.action === 'search') { router.go('/ricerca'); }
    if (a.dataset.action === 'note') {
      const m = router.currentRoute();
      const ctx = { onSaved: rerender };
      if (a.dataset.missionCtx) ctx.missionId = a.dataset.missionCtx;
      else if (m?.path.startsWith('/missioni/') && m.params.id) ctx.missionId = m.params.id;
      if (m?.path.startsWith('/atlante/') && m.params.id) ctx.districtId = m.params.id;
      diario.openNoteSheet(ctx);
    }
  });
  // Cambio di postura (apri/chiudi il Duo): ridisegna conservando pagina e scroll
  let wasOpen = isOpen();
  addEventListener('resize', () => { const now = isOpen(); if (now !== wasOpen) { wasOpen = now; rerender(); } });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
  progress.subscribe(followBar);
  // Tocco di sessione
  progress.touchSession();
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') progress.touchSession(); });
}

/* ---------- Service worker e aggiornamenti ---------- */
let swReg = null;
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register('sw.js');
    swReg.addEventListener('updatefound', () => {
      const nw = swReg.installing;
      nw?.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('Aggiornamento disponibile', { action: 'Ricarica', onAction: () => { nw.postMessage({ type: 'SKIP_WAITING' }); }, ms: 15000 });
        }
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
  } catch (e) { console.warn('[sw] registrazione fallita', e); }
}
async function checkUpdate() {
  try { await swReg?.update(); toast('Controllo fatto: se c’è una versione nuova compare un avviso.'); }
  catch { toast('Non riesco a controllare ora'); }
}

/* ---------- Avvio ---------- */
(async function main() {
  await progress.init();
  applyTheme();
  startPosture();
  try {
    await loadAll();
  } catch (e) {
    $('page-left').innerHTML = `<div class="page__inner"><div class="empty"><h2>Dati non disponibili</h2><p>${esc(e.message)}</p><p class="small">Se sei offline, riapri l’app quando torni in rete: la prossima volta i dati resteranno salvati.</p></div></div>`;
    return;
  }
  buildIndex();
  bindGlobal();
  router.start(render);
  registerSW();
})();
