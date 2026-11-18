"""Prova un file di uscita di una squadra su una COPIA dei dati, con il controllo anti-spoiler.
Uso (dalla cartella del repo): python3 -I scripts/caccia/prova.py <file.json>"""
import json, sys, os, shutil, subprocess, tempfile, re
S = os.path.dirname(os.path.abspath(__file__))
f = os.path.abspath(sys.argv[1]); repo = os.getcwd()
t = tempfile.mkdtemp(prefix='prova-')
shutil.copytree(repo + '/docs/data', t + '/docs/data'); os.makedirs(t + '/scripts'); [shutil.copy(repo + '/scripts/' + x, t + '/scripts/') for x in os.listdir(repo + '/scripts') if x.endswith('.mjs')]
probs = []
try: ch = json.load(open(f))
except Exception as e: print('PROBLEMI: il file non è JSON valido:', e); sys.exit(1)
for c in ch:
    if c.get('action') not in ('add', 'update') or not c.get('id') or not c.get('file') or not isinstance(c.get('fields'), dict): probs.append(f'voce malformata: {str(c)[:100]}')
    if c.get('action') == 'add':
        for k in ('status', 'source', 'sourceUrl', 'spoilerLevel', 'updatedAt'):
            if k not in c['fields']: probs.append(f'{c["id"]}: manca {k}')
r = subprocess.run(['python3', '-I', S + '/applica.py', S + '/vuoto.json', f], cwd=t, capture_output=True, text=True)
out = r.stdout + r.stderr
if r.returncode: probs.append('applica.py: ' + out[-800:])
v = subprocess.run(['node', 'scripts/validate.mjs'], cwd=t, capture_output=True, text=True)
if v.returncode: probs.append('validate: ' + (v.stdout + v.stderr)[-1500:])
# spoiler: nessun titolo di missione dentro i testi di un'altra missione o di altre collezioni (salvo il titolo della missione stessa)
m = json.load(open(t + '/docs/data/missions.json'))
titles = {x['id']: [x[k] for k in ('title', 'titleEn') if x.get(k) and len(x[k]) > 6] for x in m['items']}
for c in ch:
    if c.get('file') != 'missions.json' and c.get('file') is not None:
        txt = json.dumps(c['fields'], ensure_ascii=False)
        for mid, ts in titles.items():
            for tt in ts:
                if tt in txt: probs.append(f'SPOILER? {c["id"]} nomina la missione «{tt}»')
    elif c.get('file') == 'missions.json':
        txt = json.dumps({k: v for k, v in c['fields'].items() if k not in ('title', 'titleEn', 'unlocks', 'prerequisites')}, ensure_ascii=False)
        for mid, ts in titles.items():
            if mid == c['id']: continue
            for tt in ts:
                if re.search(r'(?<![\w])' + re.escape(tt) + r'(?![\w])', txt): probs.append(f'SPOILER? {c["id"]} nomina un\'altra missione «{tt}»')
shutil.rmtree(t)
if probs: print('PROBLEMI (', len(probs), '):'); print('\n'.join(probs[:60])); sys.exit(1)
print('OK —', out.strip().splitlines()[-1] if out.strip() else '', f'({len(ch)} voci)')
