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
import { closeSheet } from './ui/sheet.js';
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
import * as trofei from './views/trofei.js';
import * as armi from './views/armi.js';

window.__LEONIDA_VERSION__ = 'v0.20.1';

const $ = (id) => document.getElementById(id);
let currentRender = null;
let lastKey = '';

function applyTheme() {
  const t = progress.settings().theme || 'auto';
  const resolved = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute('content', resolved === 'light' ? '#efe8dc' : '#0b0a0f');
}

function navHtml(activePath, forRail) {
  const items = (forRail ? SECTIONS : SECTIONS.filter((s) => s.tab)).filter((s) => !s.hidden);
  const tabs = items.map((s) => {
    const active = activePath === s.path || (s.path !== '/' && activePath.startsWith(s.path));
    const label = s.title;
    const home = s.path === '/';
    return `<a class="tab ${home ? 'tab--home' : ''} ${s.disabled ? 'is-disabled' : ''}" href="#${s.path}" ${active ? 'aria-current="page"' : ''} ${s.disabled ? 'aria-disabled="true"' : ''}>
      <svg aria-hidden="true"><use href="#i-${home ? 'sun' : s.icon}"/></svg><span>${esc(label)}</span></a>`;
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
  '/mappa/:id?/:poi?': atlante.render,
  '/veicoli/:id?': veicoli.render,
  '/armi/:id?': armi.render,
  '/news/:id?': novita.render,
  '/mondo/:id?': (p, q) => editoriale.renderMondo(p, q),
  '/trofei': (p, q) => trofei.render(p, q),
  '/collezionabili': collezionabili.render,
  '/personaggi/:id?': (p, q) => editoriale.renderPersonaggi(p, q),
  '/cultura/:id?': editoriale.renderCultura,
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

const REDIRECT = { '/atlante': '/mappa', '/novita': '/news', '/prima-ora': '/news', '/online': '/' };
let lastMatch = null, dossierPath = null, lastLeftHtml = '';
/* Posizione di ogni voce nella cronologia: serve a chiudere TUTTO il fascicolo con un tocco fuori,
   anche dopo aver navigato dentro (si torna all'indice da cui l'avevi aperto, non alla scheda prima). */
let curPos = 0, dossierStart = 0;
function trackPos() {
  if (history.state && typeof history.state.pos === 'number') curPos = history.state.pos;
  else { curPos += 1; history.replaceState({ ...(history.state || {}), pos: curPos }, '', location.href); }
}
function closeAllDossier() { const n = curPos - dossierStart + 1; if (n >= 1) history.go(-n); else history.back(); }
const sectionOfPath = (p) => SECTIONS.find((s) => p === s.path || (s.path !== '/' && p.startsWith(s.path)));

/* ---------- Fascicolo: la scheda scivola da destra sopra l'indice, che resta dov'è ---------- */
function openDossier(html, { replace = false } = {}) {
  let d = $('dossier');
  if (!d) {
    d = document.createElement('aside'); d.id = 'dossier'; d.className = 'dossier';
    d.innerHTML = `<div class="dossier__backdrop"></div><div class="dossier__panel" role="dialog" aria-modal="true"><div class="dossier__inner page__inner"></div></div>`;
    d.querySelector('.dossier__backdrop').addEventListener('click', closeAllDossier);
    $('app').append(d);
  }
  const inner = d.querySelector('.dossier__inner');
  const keep = replace ? d.querySelector('.dossier__panel').scrollTop : 0;
  inner.innerHTML = html;
  const panel = d.querySelector('.dossier__panel'); panel.scrollTop = keep;
  if (!replace) { dossierStart = curPos; d.classList.remove('is-closing'); void d.offsetWidth; d.classList.add('is-open'); }
  document.body.classList.add('has-dossier'); kickImages();
}
function closeDossier() {
  const d = $('dossier'); if (!d) return;
  d.classList.add('is-closing'); d.classList.remove('is-open'); document.body.classList.remove('has-dossier');
  setTimeout(() => { if (!d.classList.contains('is-open')) d.remove(); }, 280);
}

function render(match, { dir, refresh } = {}) {
  if (!match) {
    const raw = location.hash.replace(/^#/, '');
    const hit = Object.keys(REDIRECT).find((k) => raw === k || raw.startsWith(k + '/') || raw.startsWith(k + '?'));
    router.go(hit ? raw.replace(hit, REDIRECT[hit]) : '/', { replace: true }); return;
  }
  if (!refresh) { trackPos(); closeSheet(); }
  currentRender = () => render(router.parse() || match, { refresh: true });
  const out = match.route.handler(match.params, match.query);
  const spread = $('main');
  const left = $('page-left'), right = $('page-right');
  document.documentElement.dataset.accent = out.accent || 'magenta';
  document.title = `${out.title ? out.title + ' — ' : ''}Leonida`;
  const sec = sectionOfPath(match.path);
  const detail = out.show === 'right';
  const prevSec = lastMatch ? sectionOfPath(lastMatch.path) : null;
  const indexBeneath = !!left.innerHTML.trim() && prevSec && sec && prevSec.id === sec.id && sec.path !== '/';

  // Scheda aperta come fascicolo sopra l'indice della stessa sezione
  if (detail && (dossierPath || indexBeneath) && !refresh) {
    openDossier(`<div class="page__inner">${out.right || ''}</div>`, { replace: !!dossierPath });
    dossierPath = match.path; lastMatch = match; followBar(); return;
  }
  if (detail && refresh && dossierPath) { openDossier(`<div class="page__inner">${out.right || ''}</div>`, { replace: true }); followBar(); return; }

  // Si torna all'indice da un fascicolo: lo chiudo e l'indice resta fermo dov'era (ridisegnato per i progressi)
  const closing = !detail && dossierPath;
  if (closing) { closeDossier(); dossierPath = null; }
  const samePage = lastMatch && lastMatch.path === match.path && !detail;
  const keepScroll = (refresh || closing || samePage) ? spread.scrollTop : null;

  const isOpener = (h) => !h || /class="opener"/.test(h);
  $('page-top').innerHTML = !detail && out.top ? `<div class="page__inner">${out.top}</div>` : '';
  // Se l'indice sotto non è cambiato (chiusura di una scheda senza modifiche) non lo ridisegno: niente lampo delle foto
  const newLeft = !detail ? `<div class="page__inner">${out.left || ''}</div>` : '';
  const leftChanged = newLeft !== lastLeftHtml || !left.innerHTML;
  if (leftChanged) { left.innerHTML = newLeft; lastLeftHtml = newLeft; }
  right.innerHTML = detail ? `<div class="page__inner">${out.right || ''}</div>` : (isOpener(out.right) ? '' : `<div class="page__inner">${out.right}</div>`);
  spread.dataset.show = out.show || 'left';
  spread.scrollTop = keepScroll !== null ? keepScroll : 0;

  const key = match.path;
  if (key !== lastKey && !closing) {
    const target = $('sheet-page');
    target.classList.remove('turn-in', 'turn-back'); void target.offsetWidth;
    target.classList.add(dir === 'back' ? 'turn-back' : 'turn-in');
  }
  lastKey = key; lastMatch = match;

  if (match.path.startsWith('/mappa') && !detail && (leftChanged || /[?&]punto=/.test(location.hash))) atlante.afterRender($('app'), { remount: leftChanged });
  $('tabbar').innerHTML = navHtml(match.path, false);
  $('rail').innerHTML = `${navHtml(match.path, true)}<span class="rail__spacer"></span>`;
  followBar(); kickImages();
}

/* Safari su iPhone a volte non carica le immagini «lazy» dentro riquadri che scorrono (pagina, fascicolo, strisce orizzontali):
   quando entrano nello schermo (con un margine) le carichiamo noi. */
let kickT = null;
function kickImages() {
  clearTimeout(kickT); kickT = setTimeout(() => {
    for (const im of document.querySelectorAll('img:not(.is-loaded)')) if (im.complete && im.naturalWidth) im.classList.add('is-loaded');
    const H = innerHeight, W = innerWidth;
    for (const im of document.querySelectorAll('img[loading="lazy"]')) {
      if (im.complete && im.naturalWidth) continue;
      const r = im.getBoundingClientRect(); if (!r.width && !r.height) continue;
      if (r.bottom > -600 && r.top < H + 600 && r.right > -W && r.left < W * 2) { im.loading = 'eager'; if (!im.complete) { const src = im.src; im.src = ''; im.src = src; } }
    }
  }, 150);
}

function bindGlobal() {
  const root = $('app');
  const ver = document.createElement('span'); ver.className = 'masthead__ver'; ver.textContent = window.__LEONIDA_VERSION__; document.querySelector('.masthead__tools').prepend(ver);
  // Immagini mancanti: spariscono senza icona rotta
  // (se ha un'alternativa online in data-fallback, prima prova quella)
  // Le foto compaiono solo quando sono arrivate per intero (Safari altrimenti ne lascia disegnata solo una parte)
  document.addEventListener('load', (e) => { if (e.target?.tagName === 'IMG') e.target.classList.add('is-loaded'); }, true);
  document.addEventListener('error', (e) => {
    const im = e.target; if (im?.tagName !== 'IMG') return;
    if (im.dataset.fallback && im.src !== im.dataset.fallback) { im.src = im.dataset.fallback; delete im.dataset.fallback; return; }
    im.closest('figure, .placecard__img, .nearcard__img, .lmk__photo')?.classList.add('is-empty'); im.remove();
  }, true);
  spoiler.bind(root);
  const rerender = () => currentRender?.();
  sessione.bind(root);
  missioni.bind(root, rerender);
  atlante.bind(root, rerender);
  collezionabili.bind(root, rerender);
  diario.bind(root, rerender);
  impostazioni.bind(root, rerender, { applyTheme, checkUpdate });
  ricerca.bind(root);
  veicoli.bind(root, rerender);
  trofei.bind(root, rerender);
  armi.bind(root, rerender);
  let qt = null;
  root.addEventListener('input', (e) => { const q = e.target.closest('[data-char-q]'); if (!q) return; clearTimeout(qt); qt = setTimeout(() => { const v = q.value.trim(); const pos = q.selectionStart; history.replaceState(history.state, '', v ? `#/personaggi?q=${encodeURIComponent(v)}` : '#/personaggi'); rerender(); const n = document.querySelector('[data-char-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250); });
  let mq = null;
  root.addEventListener('input', (e) => { const q = e.target.closest('[data-mondo-q]'); if (!q) return; clearTimeout(mq); mq = setTimeout(() => { const v = q.value.trim(); const pos = q.selectionStart; history.replaceState(history.state, '', v ? `#/mondo?q=${encodeURIComponent(v)}` : '#/mondo'); rerender(); const n = document.querySelector('[data-mondo-q]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch {} } }, 250); });
  root.addEventListener('click', (e) => {
    const d = e.target.closest('[data-discover]'); if (d) { progress.toggleDiscovered(d.dataset.discover); rerender(); return; }
    const a = e.target.closest('[data-action]');
    if (!a) return;
    if (a.dataset.action === 'search') { router.go('/ricerca'); }
    if (a.dataset.action === 'note') {
      const m = router.currentRoute();
      const ctx = { onSaved: rerender };
      if (a.dataset.missionCtx) ctx.missionId = a.dataset.missionCtx;
      else if (m?.path.startsWith('/missioni/') && m.params.id) ctx.missionId = m.params.id;
      if (m?.path.startsWith('/mappa/') && m.params.id) ctx.districtId = m.params.id;
      diario.openNoteSheet(ctx);
    }
  });
  // Swipe verso destra, da qualsiasi punto della pagina = indietro (tutta l'app).
  // Si ignora se il dito parte da un elemento che scorre in orizzontale (gallerie, filtri, mappa).
  let sx = null, sy = null, st = 0, sOk = false;
  const scrollsX = (el) => { for (let n = el; n && n !== document.body; n = n.parentElement) { if (n.scrollWidth > n.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(n).overflowX)) return true; } return false; };
  addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); sOk = !scrollsX(e.target) && !e.target.closest('input,textarea,select,.map-full,.map-frame,.mapboard,.wheel'); }, { passive: true });
  addEventListener('touchend', (e) => {
    if (sx === null) return; const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
    if (sOk && dx > 80 && dy < 60 && dx > dy * 2 && Date.now() - st < 800) {
      const sheet = document.querySelector('.sheet-backdrop');
      if (sheet) { sheet.click(); }
      else { const back = document.querySelector('#dossier .back-link') || document.querySelector('.back-link'); if (back) { location.hash = back.getAttribute('href'); } else if (location.hash && location.hash !== '#/' && location.hash !== '') history.back(); }
    }
    sx = null;
  }, { passive: true });
  // Cambio di postura (apri/chiudi il Duo): ridisegna conservando pagina e scroll
  let wasOpen = isOpen();
  addEventListener('resize', () => { const now = isOpen(); if (now !== wasOpen) { wasOpen = now; rerender(); } });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && dossierPath && !document.querySelector('.sheet')) closeAllDossier(); });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
  progress.subscribe(followBar);
  document.addEventListener('leonida:rerender', rerender);
  document.addEventListener('scroll', kickImages, { capture: true, passive: true });
  addEventListener('resize', kickImages);
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
    // Si ricarica solo quando una versione nuova prende il posto di quella vecchia, non alla prima installazione
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) location.reload(); });
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
