"""Alleggerisce le immagini di docs/assets/img senza perdita visibile (richiesta di Mike, 19/11: «mai sgranate, nemmeno sul Duo»).
- PNG da 200 KB in su → WebP di alta qualità (90; con la trasparenza conservata). Il file cambia estensione: lo script
  aggiorna da solo tutti i riferimenti in docs/data, docs/js, docs/css, docs/index.html, docs/sw.js e scripts/immagini.json.
- JPEG sopra 900 KB → ricompressi (qualità 88, progressivi), stesso nome.
- Lato lungo al massimo 2560 px (il Duo aperto ne usa circa 2100): quasi nessuna foto viene rimpicciolita.
- Controllo: se la differenza con l'originale è misurabile a occhio (PSNR sotto 40 dB) riprova a qualità più alta;
  se il file non scende almeno del 25%, lascia l'originale.
Non tocca le miniature, la mappa e le icone. Uso (dal repo, serve Pillow):  python3 scripts/ottimizza-immagini.py [--prova]
Va rilanciato dopo che Mike ha scaricato immagini nuove (poi `python3 scripts/miniature.py`)."""
import os, sys, json, math, io, glob
from PIL import Image, ImageChops, ImageStat

DRY = '--prova' in sys.argv
ROOT = 'docs/assets/img'; MAXSIDE = 2560
SKIP = ('/mini/', '/mini-m/', '/mappa/')

def psnr(a, b):
    a = a.convert('RGB'); b = b.convert('RGB')
    mse = sum(ImageStat.Stat(ImageChops.difference(a, b)).rms[i] ** 2 for i in range(3)) / 3
    return 99.0 if mse == 0 else 10 * math.log10(255 * 255 / mse)

def has_alpha(im):
    if im.mode in ('RGBA', 'LA'): return im.getchannel('A').getextrema()[0] < 250
    return im.mode == 'P' and 'transparency' in im.info

def encode(im, fmt, q, alpha):
    buf = io.BytesIO()
    if fmt == 'WEBP': im.save(buf, 'WEBP', quality=q, method=6, alpha_quality=100, exact=alpha)
    else: im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True, subsampling=0 if q >= 90 else 1)
    return buf.getvalue()

renamed, saved, n, kept = {}, 0, 0, 0
for r, _, fs in os.walk(ROOT):
    if any(s in r + '/' for s in SKIP): continue
    for f in sorted(fs):
        p = os.path.join(r, f); ext = f.rsplit('.', 1)[-1].lower(); size = os.path.getsize(p)
        if not ((ext == 'png' and size >= 200_000) or (ext in ('jpg', 'jpeg') and size > 900_000)): continue
        try: im = Image.open(p); im.load()
        except Exception as e: print('  non la apro:', p, e); continue
        if getattr(im, 'is_animated', False): continue
        alpha = ext == 'png' and has_alpha(im)
        src = im.convert('RGBA') if alpha else im.convert('RGB')
        if max(src.size) > MAXSIDE: src.thumbnail((MAXSIDE, MAXSIDE), Image.LANCZOS)
        fmt = 'WEBP' if ext == 'png' else 'JPEG'
        best = None
        for q in ((90, 94, 97) if fmt == 'WEBP' else (88, 92)):
            data = encode(src, fmt, q, alpha)
            if psnr(src, Image.open(io.BytesIO(data))) >= 40: best = data; break
        if best is None or len(best) > size * 0.75: kept += 1; continue
        out = p if fmt == 'JPEG' else p.rsplit('.', 1)[0] + '.webp'
        if fmt == 'WEBP' and os.path.exists(out): print('  esiste già, salto:', out); continue
        n += 1; saved += size - len(best)
        if DRY: continue
        open(out, 'wb').write(best)
        if out != p: os.remove(p); renamed[p[len('docs/'):]] = out[len('docs/'):]

print(f'{"PROVA: " if DRY else ""}{n} immagini alleggerite, {saved / 1e6:.1f} MB in meno; {kept} lasciate com\'erano; {len(renamed)} hanno cambiato estensione')
if renamed and not DRY:
    files = glob.glob('docs/data/*.json') + glob.glob('docs/js/**/*.js', recursive=True) + glob.glob('docs/css/*.css') + ['docs/index.html', 'docs/sw.js', 'scripts/immagini.json']
    tot = 0
    for f in files:
        t = open(f, encoding='utf8').read(); o = t
        for a, b in renamed.items():
            t = t.replace(a, b)                                   # assets/img/…  (dati, js, html, sw)
            t = t.replace('"' + a[len('assets/img/'):] + '"', '"' + b[len('assets/img/'):] + '"')   # scripts/immagini.json: "file" senza assets/img/
        if t != o: open(f, 'w', encoding='utf8').write(t); tot += 1
    json.dump(renamed, open('scripts/immagini-rinominate.json', 'w'), ensure_ascii=False, indent=1)
    print(f'riferimenti aggiornati in {tot} file; elenco in scripts/immagini-rinominate.json')
