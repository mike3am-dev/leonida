"""Applica le riscritture: python3 -I applica-testi.py patch1.json patch2.json ... [--dry]
Ogni patch: [{"file": "collectibles.json", "key": "<id o slug della voce>", "old": "<testo esatto>", "new": "<testo nuovo>"}]
Oppure, per cambiare i metadati di una voce: {"file", "key", "set": {"status": "da verificare", "sourceUrl": "...", "updatedAt": "2026-11-18"}} (si può unire a old/new).
Controlla tutto prima di scrivere: il testo vecchio deve comparire UNA volta dentro la voce indicata."""
import json, sys
D = 'docs/data/'
args = [a for a in sys.argv[1:] if not a.startswith('--')]; dry = '--dry' in sys.argv
files, problems, done = {}, [], 0
def load(f):
    if f not in files: files[f] = json.load(open(D + f))
    return files[f]
def find(o, key):
    """in ampiezza: vince la voce meno annidata (le liste «nei dintorni» ripetono slug di altre schede)"""
    q = [o]
    while q:
        nxt = []
        for x in q:
            if isinstance(x, dict):
                if x.get('id') == key or x.get('slug') == key: return x
                nxt.extend(v for v in x.values() if isinstance(v, (dict, list)))
            elif isinstance(x, list):
                nxt.extend(v for v in x if isinstance(v, (dict, list)))
        q = nxt
    return None
def slots(o):
    """tutti i posti (contenitore, chiave) che contengono una stringa"""
    if isinstance(o, dict):
        for k, v in o.items():
            if isinstance(v, str): yield (o, k)
            else: yield from slots(v)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            if isinstance(v, str): yield (o, i)
            else: yield from slots(v)
SETTABLE = {'status', 'source', 'sourceUrl', 'updatedAt', 'total'}
SKIP = {'id', 'slug', 'status', 'source', 'sourceUrl', 'updatedAt', 'image', 'imageUrl', 'url', 'src', 'local', 'categoryId', 'actId', 'districtId'}
for p in args:
    for ch in json.load(open(p)):
        f = ch['file'].replace('docs/data/', '')
        try: d = load(f)
        except Exception as e: problems.append(f'{p}: file {f}: {e}'); continue
        it = find(d, ch['key'])
        if it is None: problems.append(f'{p}: {f} voce {ch["key"]} non trovata'); continue
        if 'set' in ch:
            bad = [k for k in ch['set'] if k not in SETTABLE]
            if bad: problems.append(f'{p}: {ch["key"]}: campi non ammessi in set: {bad}'); continue
            if ch['set'].get('status') not in (None, 'verificato', 'da verificare'): problems.append(f'{p}: {ch["key"]}: status non valido'); continue
            it.update(ch['set']); done += 1
            if 'old' not in ch: continue
        hit = [(c, k) for c, k in slots(it) if c[k] == ch['old'] and not (isinstance(k, str) and k in SKIP)]
        if len(hit) != 1: problems.append(f'{p}: {f} {ch["key"]}: testo trovato {len(hit)} volte: {ch["old"][:70]}'); continue
        if not isinstance(ch.get('new'), str) or not ch['new'].strip(): problems.append(f'{p}: {ch["key"]}: testo nuovo vuoto'); continue
        c, k = hit[0]; c[k] = ch['new']; done += 1
if problems:
    print('PROBLEMI (', len(problems), '):'); print('\n'.join(problems))
    if not dry: print('FERMO: niente scritto'); sys.exit(1)
print(done, 'testi riscritti')
if not dry:
    for f, d in files.items(): open(D + f, 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
