#!/usr/bin/env node
/**
 * Sostituisce i trofei segnaposto con la lista ufficiale, in un colpo.
 *
 * Uso:  node scripts/importa-trofei.mjs lista.tsv [--url https://fonte] [--dry]
 *
 * lista.tsv: una riga per trofeo, campi separati da TAB:
 *   livello <TAB> nome <TAB> descrizione [<TAB> nascosto] [<TAB> nome inglese]
 *   livello: platino | oro | argento | bronzo (vanno bene anche platinum/gold/silver/bronze)
 *   nascosto: "si" / "hidden" se il trofeo è segreto (va dietro l'avviso spoiler)
 * Righe vuote e righe che iniziano con # sono ignorate.
 *
 * Regole: tiene l'id e la categoria del segnaposto quando il nome coincide (anche col nome inglese);
 * gli altri prendono un id nuovo e una categoria indovinata dalle parole della descrizione.
 * Tiene il campo `guide` dei vecchi solo se il nome coincide. Stato «verificato», fonte «stampa».
 */
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const url = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
const dry = args.includes('--dry');
if (!file) { console.error('Uso: node scripts/importa-trofei.mjs lista.tsv [--url https://fonte] [--dry]'); process.exit(1); }

const PATH = new URL('../docs/data/trophies.json', import.meta.url);
const data = JSON.parse(readFileSync(PATH, 'utf8'));
const old = data.items;
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (s) => norm(s).replace(/ /g, '-').slice(0, 40);
const TIER = { platino: 'platino', platinum: 'platino', oro: 'oro', gold: 'oro', argento: 'argento', silver: 'argento', bronzo: 'bronzo', bronze: 'bronzo' };
const guessCat = (t) => {
  const s = norm(t);
  if (/(missione|storia|capitolo|prologo|epilogo|mission|story|chapter)/.test(s)) return 'storia';
  if (/(trova|raccogli|colleziona|tutti i|tutte le|collect|find all)/.test(s)) return 'collezionabili';
  if (/(100|completa|complet|platino)/.test(s)) return 'completamento';
  if (/(gara|attivita|sfida|vinci|race|activity|challenge|win)/.test(s)) return 'attivita';
  return 'mondo';
};
const today = new Date().toISOString().slice(0, 10);
const used = new Set();
const items = [];
for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith('#')) continue;
  const [tierRaw, name, description = '', hidden = '', nameEn = ''] = line.split('\t').map((x) => x.trim());
  const tier = TIER[norm(tierRaw)];
  if (!tier || !name) { console.error(`Riga saltata (livello o nome mancanti): ${line}`); continue; }
  const match = old.find((o) => !used.has(o.id) && (norm(o.name) === norm(name) || (nameEn && norm(o.name) === norm(nameEn))));
  let id = match?.id || `tro-${slug(nameEn || name)}`;
  while (used.has(id)) id += '-2';
  used.add(id);
  items.push({
    id, name, description, tier,
    category: match?.category || guessCat(`${name} ${description}`),
    guide: match?.guide && !/Schema da|RDR2|GTA V/.test(match.guide) ? match.guide : '',
    image: null, status: 'verificato', source: 'stampa', sourceUrl: url || match?.sourceUrl || '',
    spoilerLevel: /^(si|sì|yes|hidden|nascosto)$/i.test(hidden) ? 9 : 0,
    example: false, updatedAt: today,
  });
}
const kept = items.filter((t) => old.some((o) => o.id === t.id)).length;
const count = (k) => items.filter((t) => t.tier === k).length;
console.log(`${items.length} trofei (platino ${count('platino')}, oro ${count('oro')}, argento ${count('argento')}, bronzo ${count('bronzo')}) · ${kept} id ripresi dai segnaposto · ${old.length - kept} segnaposto tolti`);
console.log('ATTENZIONE: i progressi salvati sui trofei con id cambiato non si vedranno più (sono solo spunte).');
if (dry) { console.log('(--dry: nessun file scritto)'); process.exit(0); }
data.items = items;
writeFileSync(PATH, JSON.stringify(data, null, 2) + '\n');
console.log('Scritto docs/data/trophies.json. Ora: node scripts/validate.mjs');
