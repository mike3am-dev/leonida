"""Crea le miniature leggere delle foto già presenti in docs/assets/img, per i punti dove la foto si vede piccola
(segnaposto della mappa, cerchi dei personaggi in Home, Polaroid). Senza miniature l'iPhone caricava le foto intere:
sulla mappa erano circa 315 MB in memoria e l'app si chiudeva (segnalazione del 19/11).

Uso (dal repo, serve Pillow):  python3 scripts/miniature.py
Scrive docs/assets/img/mini/<stesso percorso>.jpg (lato lungo 160 px) e docs/assets/img/mini-m/<stesso percorso>.jpg (480 px)
solo per le foto usate in quei punti, e salta quelle già fatte. L'app prova la miniatura e, se manca, mette un'icona."""
import json, os, sys
from PIL import Image

D = 'docs/'; IMG = 'assets/img/'
def L(f): 
    d = json.load(open(D + 'data/' + f)); return d['items'] if isinstance(d, dict) else d
small, medium = set(), set()
for x in L('luoghi.json'):
    if x.get('xy') and (x.get('hero') or {}).get('local'): small.add(x['hero']['local'])
    for k in x.get('landmarks') or []:
        if k.get('xy') and k.get('local'): small.add(k['local'])
for x in L('districts.json'):
    if x.get('image'): medium.add(x['image'])
for x in L('characters.json'):
    if x.get('image'): small.add(x['image'])

def make(src, folder, side, q):
    if not src.startswith(IMG): return 0
    f = D + src
    if not os.path.exists(f): return 0
    out = D + IMG + folder + '/' + os.path.splitext(src[len(IMG):])[0] + '.jpg'
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f): return 0
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(f).convert('RGB'); im.thumbnail((side, side), Image.LANCZOS); im.save(out, 'JPEG', quality=q, optimize=True)
    return 1
n = sum(make(s, 'mini', 160, 72) for s in sorted(small)) + sum(make(s, 'mini-m', 480, 76) for s in sorted(medium))
tot = sum(os.path.getsize(os.path.join(r, f)) for folder in ('mini', 'mini-m') for r, _, fs in os.walk(D + IMG + folder) for f in fs)
print(f'miniature nuove: {n} · in tutto {tot / 1e6:.1f} MB')
