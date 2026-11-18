"""Applica un giro news: python3 applica.py news.json extra.json  (dalla cartella del repo).
Prima controlla TUTTO, poi scrive: se qualcosa non torna, non tocca niente."""
import json, sys, copy

news_path, extra_path = sys.argv[1], sys.argv[2]
D = 'docs/data/'
files = {}
def load(f):
    if f not in files: files[f] = json.load(open(D + f))
    return files[f]

def find(d, i):
    for x in d['items']:
        if x.get('id') == i: return x
        for q in x.get('pois', []) if isinstance(x.get('pois'), list) else []:
            if q.get('id') == i: return q
    for x in d.get('categories', []):
        if x.get('id') == i: return x
    return None

def legacy_append(v):
    """«append: …» delle proposte vecchie: lista di id, testo o oggetto JSON"""
    t = v[len('append:'):].strip()
    if t.startswith('{') or t.startswith('['):
        o = json.loads(t); return o if isinstance(o, list) else [o]
    return t

problems, log = [], []
news = load('news.json'); have = {x['id'] for x in news['items']}
new = json.load(open(news_path))
for e in new:
    if not isinstance(e, dict) or not e.get('id'): problems.append(f'notizia senza id: {str(e)[:60]}'); continue
    if not isinstance(e.get('body'), str): problems.append(f'{e["id"]}: body non è testo')
    e.setdefault('example', False); e.setdefault('relatedIds', []); e.setdefault('spoilerLevel', 0)
fresh = [e for e in new if isinstance(e, dict) and e.get('id') and e['id'] not in have]
news['items'][:0] = fresh; log.append(f'{len(fresh)} notizie nuove')

for ch in json.load(open(extra_path)):
    f = ch['file'].replace('docs/data/', ''); d = load(f)
    if ch['action'] == 'add':
        e = dict(ch['fields']); e.setdefault('id', ch['id']); e.setdefault('example', False)
        key = 'categories' if e['id'].startswith('cat-') else 'items'
        if find(d, e['id']): log.append(f'già c\'è {e["id"]}'); continue
        d[key].append(e); log.append(f'+ {f} {e["id"]}'); continue
    x = find(d, ch['id'])
    if x is None: problems.append(f'non trovato {f} {ch["id"]}'); continue
    for k, v in ch['fields'].items():
        if k.endswith('_add') or k.endswith('_append') or (isinstance(v, str) and v.startswith('append:')):
            base = k.rsplit('_', 1)[0] if (k.endswith('_add') or k.endswith('_append')) else k
            if isinstance(v, str) and v.startswith('append:'): v = legacy_append(v)
            if base == 'body' and 'body' not in x and 'description' in x: base = 'description'
            cur = x.get(base)
            if isinstance(cur, str) or (cur is None and isinstance(v, str)):
                x[base] = ((cur or '').rstrip() + ('\n\n' if cur else '') + str(v).strip()) if isinstance(v, str) else cur
            else:
                cur = list(cur or []); add = v if isinstance(v, list) else [v]
                for a in add:
                    if isinstance(a, str): a = a.strip()
                    if a and a not in cur: cur.append(a)
                x[base] = cur
        else:
            x[k] = v
    x['updatedAt'] = x.get('updatedAt') if 'updatedAt' in ch['fields'] else x.get('updatedAt')
    log.append(f'~ {f} {ch["id"]}')

if problems:
    print('FERMO, niente scritto:'); print('\n'.join(problems)); sys.exit(1)
for f, d in files.items():
    open(D + f, 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('\n'.join(log))
