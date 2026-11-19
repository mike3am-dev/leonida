"""Dopo applica.py: sistema ciò che le patch non fanno da sole.  Uso (dal repo): python3 -I scripts/caccia/dopo.py <cartella del giro>
1) porta in testa a news.json le notizie nuove del giro (la più recente per prima);
2) mette `image` (percorso locale) + `imageUrl` (copia online) nelle voci dei file `*-immagini.json` e le elenca in scripts/immagini.json
   (salta le voci che hanno già il file in docs/, tranne quelle elencate in --sostituisci id,id);
3) stampa gli spostamenti e le cancellazioni chiesti nei file `*-togliere.json`: quelli si fanno a mano."""
import json, re, os, sys, glob

S = sys.argv[1]; D = 'docs/data/'
force = set(sys.argv[sys.argv.index('--sostituisci') + 1].split(',')) if '--sostituisci' in sys.argv else set()
L = lambda f: json.load(open(D + f))
def W(f, d): open(D + f, 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

# 1) news in testa
p = os.path.join(S, 'news.json')
if os.path.exists(p):
    n = L('news.json'); ids = {x['id'] for x in json.load(open(p)) if x.get('action') == 'add'}
    new = sorted([x for x in n['items'] if x['id'] in ids], key=lambda x: x['date'], reverse=True)
    n['items'] = new + [x for x in n['items'] if x['id'] not in ids]; W('news.json', n); print(f'news in testa: {len(new)}')

# 2) immagini
CONF = {'chr': ('characters.json', 'vice/personaggi'), 'brd': ('brands.json', 'mondo'), 'rad': ('radio.json', 'radio'), 'wpn': ('weapons.json', 'vice/armi'), 'veh': ('vehicles.json', 'veicoli'), 'col': ('collectibles.json', 'vice/collezionabili')}
def ext(u):
    m = re.search(r'\.(png|jpe?g|webp)(?:\?|$)', u, re.I); return (m.group(1).lower() if m else 'png').replace('jpeg', 'jpg')
im = json.load(open('scripts/immagini.json')); cache = {}; n_img = 0
for f in sorted(glob.glob(os.path.join(S, '*-immagini.json'))):
    for it in json.load(open(f)):
        pre = it['for'].split('-')[0]
        if pre not in CONF: print('  tipo non previsto, a mano:', it['for']); continue
        fn, folder = CONF[pre]; d = cache.setdefault(fn, L(fn)); x = next((q for q in d['items'] if q['id'] == it['for']), None)
        if not x: print('  voce non trovata:', it['for']); continue
        cur = x.get('image')
        if cur and os.path.exists('docs/' + cur) and it['for'] not in force: print('  ha già la foto, salto:', it['for']); continue
        rel = f"{folder}/{it['for']}.{ext(it['url'])}"
        drop = {rel} | ({cur.replace('assets/img/', '')} if cur and not os.path.exists('docs/' + cur) else set())
        im['items'] = [i for i in im['items'] if i['file'] not in drop]
        x['image'] = 'assets/img/' + rel; x['imageUrl'] = it['url']
        if it.get('credit'): x['imageCredit'] = it['credit']
        im['items'].append({'file': rel, 'url': it['url'], 'for': it['for']}); n_img += 1
for fn, d in cache.items(): W(fn, d)
open('scripts/immagini.json', 'w').write(json.dumps(im, ensure_ascii=False, indent=2) + '\n'); print(f'immagini: {n_img}')

# 3) da fare a mano
for f in sorted(glob.glob(os.path.join(S, '*-togliere.json'))):
    for x in json.load(open(f)): print('  DA FARE A MANO', os.path.basename(f), x.get('file'), x.get('id'), '|', str(x.get('why'))[:110])
