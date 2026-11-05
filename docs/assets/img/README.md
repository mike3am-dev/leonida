# Immagini della guida

Questa cartella è vuota di proposito: le immagini le aggiungi tu.

Come si usa:
1. Salva un'immagine (JPG o PNG) in questa cartella, con un nome semplice, senza spazi: `jason.jpg`, `vice-city.jpg`, `flash-fm.jpg`.
2. Nel JSON della voce corrispondente scrivi il percorso nel campo `image`, per esempio:
   `"image": "assets/img/jason.jpg"`
3. Per usare una mappa come sfondo dell'Atlante aggiungi in `docs/data/meta.json`:
   `"mapImage": "assets/img/map.jpg"` (immagine quadrata: i distretti disegnati sopra usano una griglia 1000×1000).
4. Commit e push: l'app le mostra alla prossima apertura.

Se un'immagine manca, l'app usa la grafica SVG originale al suo posto. Nessun errore.

Nota: il materiale di Rockstar Games è protetto da copyright. Usalo solo per questa guida personale e tieni il repository privato.
