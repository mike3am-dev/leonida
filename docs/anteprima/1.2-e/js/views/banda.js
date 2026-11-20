/**
 * La banda: classifica tra amici (chi ha il profilo online) e confronto «io e lui».
 * I dati arrivano dalla funzione Supabase `banda` (solo nick e progressi: niente email, niente appunti).
 * Spoiler: delle missioni degli altri si vedono solo i numeri; i nomi delle missioni mai.
 */
import { db } from '../data.js';
import * as progress from '../store/progress.js';
import * as cloud from '../store/cloud.js';
import { esc, toast } from '../ui/dom.js';
import { showSheet } from '../ui/sheet.js';
import { sectionHead, sectionOf, vis } from './shared.js';
import * as spoiler from '../spoiler.js';
import { galleryBlock } from './scatti.js';
import * as criminale from './criminale.js';

const section = sectionOf('banda');
let cache = null, loading = false, error = '';

/** Riassunto dei progressi di uno stato (il mio o quello di un amico), sui dati della guida */
export function summary(st) {
  const done = (id) => st.missions?.[id]?.state === 'completata';
  const main = vis(db.missions || []), side = vis(db.sideMissions || []);
  const acts = db.acts || [];
  let cap = 0;
  for (const m of main) if (st.missions?.[m.id]?.state) cap = Math.max(cap, acts.find((a) => a.id === m.actId)?.number || 0);
  const trophies = vis(db.trophies || []).filter((t) => st.trophies?.[t.id]);
  const colls = vis(db.collectibles || []).filter((c) => st.collectibles?.[c.id]);
  const actsDone = vis(db.activities || []).filter((a) => st.activities?.[a.id] === 'completata');
  const mainDone = main.filter((m) => done(m.id)).length, sideDone = side.filter((m) => done(m.id)).length;
  const nColl = vis(db.collectibles || []).length, nTro = vis(db.trophies || []).length;
  const tot = main.length + side.length + nTro + nColl;
  return {
    cap, mainDone, mainTot: main.length, sideDone, sideTot: side.length,
    tro: trophies.length, troTot: nTro, coll: colls.length, collTot: nColl, att: actsDone.length, attTot: vis(db.activities || []).length,
    pct: tot ? Math.round(((mainDone + sideDone + trophies.length + colls.length) / tot) * 1000) / 10 : 0,
  };
}

const when = (iso) => { try { const d = new Date(iso); const today = new Date().toDateString() === d.toDateString(); return today ? `oggi ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }); } catch { return ''; } };
/** Il profilo criminale dichiarato: il mio dai progressi di questo telefono, quello degli altri dalla banda */
const crimeOf = (r) => (r.sei_tu ? progress.get().crime : r.progressi?.crime) || '';
const bar = (n, t) => `<span class="bbar"><i style="width:${t ? Math.min(100, (n / t) * 100) : 0}%"></i></span>`;

async function load(rerender) {
  if (loading) return; loading = true; error = '';
  try {
    const rows = await cloud.call('banda');
    cache = { at: Date.now(), rows: (rows || []).map((r) => ({ ...r, s: summary(r.sei_tu ? progress.get() : r.progressi) })) };
  } catch (e) {
    error = /404|PGRST202/.test(String(e.message)) ? 'La banda non è ancora attiva: manca un passaggio in Supabase.' : 'Non riesco a leggere la banda. Controlla la rete e riprova.';
  } finally { loading = false; rerender?.(); }
}

export function render() {
  const a = cloud.account();
  const head = sectionHead(section, cache ? `${cache.rows.length} in banda` : '');
  if (!a) return { left: `${head}<div class="card banda-in"><h2>Entra per vedere la banda</h2><p>La banda mostra a che punto siete tu e i tuoi amici: storia, trofei, collezionabili. Serve il profilo online.</p><a class="btn btn--accent btn--block" href="#/impostazioni">Entra con la tua email</a></div>`, right: '', show: 'left', accent: section.accent, title: 'La banda' };
  if (!cache || Date.now() - cache.at > 60000) setTimeout(() => load(() => document.dispatchEvent(new CustomEvent('leonida:rerender'))), 0);
  const nick = progress.settings().nick;
  const off = progress.settings().banda === false;
  const rows = (cache?.rows || []).slice().sort((x, y) => y.s.pct - x.s.pct || y.s.tro - x.s.tro);
  const list = rows.map((r, i) => `<button type="button" class="brow ${r.sei_tu ? 'is-me' : ''}" data-banda="${i}">
      <span class="brow__pos">${i + 1}</span>
      <span class="brow__who"><span class="brow__name"><b>${esc(r.nick)}</b>${r.sei_tu ? '<span class="chip chip--tu">tu</span>' : ''}${criminale.tag(crimeOf(r))}</span><span class="small muted">${r.s.cap ? `Capitolo ${r.s.cap}` : 'Non ha ancora iniziato'} · 🏆 ${r.s.tro}/${r.s.troTot} · aggiornato ${esc(when(r.aggiornato))}</span>${bar(r.s.pct, 100)}</span>
      <span class="brow__pct">${r.s.pct.toLocaleString('it-IT')}%</span></button>`).join('');
  const left = `${head}
    <p class="lede">Chi è più avanti? Tocca un amico per confrontarti con lui e scoprire cosa ha trovato che a te manca.</p>
    ${!nick ? `<p class="callout small">Scegli un nick in <a href="#/impostazioni">Impostazioni › Profilo</a>, così gli altri ti riconoscono.</p>` : ''}
    ${off ? `<p class="callout small">Non sei visibile nella banda: lo cambi in <a href="#/impostazioni">Impostazioni › Profilo</a>.</p>` : ''}
    ${error ? `<p class="callout callout--warn small">${esc(error)}</p>` : ''}
    ${!cache && !error ? '<p class="muted">Carico la banda…</p>' : ''}
    ${rows.length ? `<div class="banda">${list}</div>` : (cache ? '<p class="muted">Per ora ci sei solo tu. Passa il link della guida agli amici.</p>' : '')}
    <p class="small muted" style="margin-top:var(--s-4)">La percentuale conta missioni, trofei e collezionabili segnati nella guida. Delle missioni degli altri vedi solo i numeri, mai i nomi: niente spoiler.</p>
    <div class="btn-row"><button class="btn btn--ghost" type="button" data-banda-reload>Aggiorna</button></div>
    ${galleryBlock()}`;
  return { left, right: '', show: 'left', accent: section.accent, title: 'La banda' };
}

function compare(r) {
  const me = progress.get(), mine = summary(me), his = r.s, o = r.progressi;
  const rowsCmp = [['Storia', mine.mainDone, his.mainDone, mine.mainTot], ['Facoltative e compiti', mine.sideDone, his.sideDone, mine.sideTot], ['Trofei', mine.tro, his.tro, mine.troTot], ['Collezionabili', mine.coll, his.coll, mine.collTot], ['Attività completate', mine.att, his.att, mine.attTot]];
  const colls = vis(db.collectibles || []).filter((c) => o.collectibles?.[c.id] && !me.collectibles?.[c.id]);
  const catName = (id) => (db.collectibleCategories || []).find((k) => k.id === id)?.name || '';
  const tros = vis(db.trophies || []).filter((t) => o.trophies?.[t.id] && !me.trophies?.[t.id]);
  const byAct = {};
  for (const m of vis(db.sideMissions || [])) if (o.missions?.[m.id]?.state === 'completata' && me.missions?.[m.id]?.state !== 'completata') { const n = (db.acts || []).find((a) => a.id === m.actId)?.number ?? 0; byAct[n] = (byAct[n] || 0) + 1; }
  const body = document.createElement('div');
  const crimes = me.crime || o.crime ? `<div class="cmpb__crime"><span>${criminale.tag(me.crime) || '<span class="small muted">non scelto</span>'}</span><span class="small muted">Profilo criminale</span><span>${criminale.tag(o.crime) || '<span class="small muted">non scelto</span>'}</span></div>` : '';
  body.innerHTML = `<div class="cmpb"><div class="cmpb__head"><span>Tu</span><span></span><span>${esc(r.nick)}</span></div>${crimes}
      ${rowsCmp.map(([l, a, b, t]) => `<div class="cmpb__row"><span class="cmpb__n ${a > b ? 'is-win' : ''}">${a}</span><span class="cmpb__mid"><span class="small">${esc(l)}</span><span class="cmpb__bars">${bar(a, t)}${bar(b, t)}</span></span><span class="cmpb__n ${b > a ? 'is-win' : ''}">${b}</span></div>`).join('')}
      <p class="small muted">${his.cap > mine.cap ? `È più avanti di te nella storia: capitolo ${his.cap} contro il tuo ${mine.cap || 'iniziale'}.` : his.cap < mine.cap ? `Sei più avanti tu nella storia: capitolo ${mine.cap} contro il suo ${his.cap || 'iniziale'}.` : 'Siete allo stesso capitolo.'}</p></div>
    ${colls.length ? `<h3 class="fsec__t">Ha trovato e a te manca · ${colls.length}</h3><ul class="banda-miss">${colls.slice(0, 40).map((c) => `<li><a href="#/collezionabili?cat=${esc(c.categoryId)}">${esc(c.name)}</a><span class="small muted">${esc(catName(c.categoryId))}${c.directions ? ' · ' + esc(c.directions) : ''}</span></li>`).join('')}</ul>${colls.length > 40 ? `<p class="small muted">E altri ${colls.length - 40}.</p>` : ''}` : ''}
    ${tros.length ? `<h3 class="fsec__t">Trofei suoi che non hai · ${tros.length}</h3><ul class="banda-miss">${tros.map((t) => `<li>${spoiler.isHidden(t) ? '<span class="muted">Trofeo nascosto</span>' : `<b>${esc(t.name)}</b>`}<span class="small muted">${spoiler.isHidden(t) ? '' : esc(t.description || '')}</span></li>`).join('')}</ul>` : ''}
    ${Object.keys(byAct).length ? `<h3 class="fsec__t">Missioni facoltative fatte da lui e non da te</h3><p class="small">${Object.entries(byAct).map(([n, k]) => `${n === '0' ? 'Prologo' : `Capitolo ${n}`}: ${k}`).join(' · ')}</p><p class="small muted">Senza nomi, per non rovinarti niente: le trovi nella pagina Missioni, capitolo per capitolo.</p>` : ''}
    ${!colls.length && !tros.length && !Object.keys(byAct).length ? '<p>Non ha niente che tu non abbia già. Ottimo lavoro.</p>' : ''}`;
  showSheet({ title: r.sei_tu ? 'Tu' : r.nick, body });
}

export function bind(root, rerender) {
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-banda-reload]')) { cache = null; load(rerender); toast('Aggiorno la banda'); return; }
    const b = e.target.closest('[data-banda]'); if (!b || !cache) return;
    const rows = cache.rows.slice().sort((x, y) => y.s.pct - x.s.pct || y.s.tro - x.s.tro);
    const r = rows[Number(b.dataset.banda)]; if (r && !r.sei_tu) compare(r); else if (r) toast('Sei tu');
  });
}
