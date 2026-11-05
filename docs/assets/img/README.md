# Immagini della guida

Questa cartella è vuota di proposito: le immagini le scarichi tu, sul tuo Mac.

## Il modo veloce

Dal Terminale, dentro la cartella del progetto:

```bash
node scripts/scarica-immagini.mjs
```

Lo script legge `scripts/immagini.json` (l'elenco delle immagini ufficiali Rockstar che la guida già aspetta), le scarica qui con i nomi giusti e salta quelle già presenti. Poi fai commit e push: l'app le mostra alla prossima apertura.

## A mano

1. Salva un'immagine (JPG o PNG) in questa cartella, con un nome semplice, senza spazi: `jason.jpg`, `vice-city.jpg`.
2. Nel JSON della voce corrispondente scrivi il percorso nel campo `image`: `"image": "assets/img/jason.jpg"`.
3. Per usare una mappa come sfondo dell'Atlante, in `docs/data/meta.json` imposta `"mapImage": "assets/img/map.jpg"` (immagine quadrata).

Se un'immagine manca, l'app la nasconde e usa la grafica SVG. Nessun errore.

Nota: il materiale di Rockstar Games è protetto da copyright. Usalo solo per questa guida personale e tieni il repository privato.
