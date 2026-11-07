# LEONIDA — istruzioni per Claude

Guida di gioco privata per GTA VI (uscita 19 novembre 2026, PS5, Ultimate Edition) di Mike, installata come web app sul suo iPhone. Si parla **in italiano**. Mike non è un tecnico: quando deve fare qualcosa nel Terminale, dagli i comandi uno alla volta, in blocchi separati.

## Regole fisse
- Vanilla HTML/CSS/JS (moduli ES), nessuna build. Tutti i contenuti stanno in `docs/data/*.json`; l'interfaccia non contiene testi di gioco.
- Ogni voce ha `status` (`verificato` | `da verificare` | `segnaposto`), `source` (`trailer` | `stampa` | `rumor` | `leak` | `community` | `gioco-mike`), `spoilerLevel` (atto dopo il quale si può leggere; 9 = rumor/leak sulla trama), `updatedAt`, `sourceUrl`. Nell'app compare **una sola etichetta**: Ufficiale / Stampa / Rumor / Leak / Community / Da verificare / Segnaposto.
- Si inserisce tutto quello che esce, anche rumor e leak, ma etichettato; gli spoiler stanno dietro l'avviso esplicito (`spoilerLevel`).
- Immagini: non si copiano nel repo durante la sessione. Si aggiungono a `scripts/immagini.json` (file, url, for) e Mike lancia `node scripts/scarica-immagini.mjs` sul Mac. Finché mancano, l'app usa `data-fallback` con l'URL originale.
- A ogni release: alzare `VERSION` in `docs/sw.js` e `window.__LEONIDA_VERSION__` in `docs/js/app.js` (stesso numero), `dataVersion` + `changelog` in `docs/data/meta.json`. Il numero di versione è l'unico modo che Mike ha per capire cosa sta vedendo.
- Prima del commit: `node scripts/validate.mjs`, controllo sintassi (`node --input-type=module --check < file`), screenshot con Playwright (`/opt/node-tools/node_modules/playwright/index.js`, server locale `python3 -m http.server 8080 --directory docs`).
- Commit con `git -c user.name="Mike" -c user.email="frodob1987@gmail.com"`, push su `main`; GitHub Pages pubblica da `/docs`. Verifica live: `curl -s https://mike3am-dev.github.io/leonida/js/app.js | grep __LEONIDA_VERSION__`.
- Mike dice «ho finito» dopo un giro di impressioni: fino ad allora si assorbe e non si agisce.

## «Fai un giro di aggiornamento news» — la routine
Quando Mike lo chiede (mai da soli), setacciare le fonti in quest'ordine e inserire tutto in `news.json` (data, topic, outlet, source, relatedIds, sourceUrl) e, quando serve, nelle altre collezioni (missions, districts/pois, collectibles, characters, vehicles, weapons, radio, brands, tips, trophies, luoghi). Poi `meta.json`, validazione, commit, push, verifica live, e un riepilogo in chat con le 5 cose più importanti.

1. **Ufficiali** — rockstargames.com/VI, rockstargames.com/newswire, support.rockstargames.com (patch notes), YouTube/X/Instagram di Rockstar, store.playstation.com (prezzo, dimensione, versione), take2games.com/ir.
2. **Mappa e luoghi** — gtasixmap.com (schede e pagina Updates; le 44 schede sono in `luoghi.json`), map.stateofleonida.net, gtadb.org (github rolux/gtadb.org, CC BY), Discord «GTA VI Mapping Community», r/GTA6 flair Mapping.
3. **Enciclopedia** — gta.fandom.com (GTA Wiki; anche foto dei veicoli via `static.wikia.nocookie.net`), gtabase.com, gta.wiki.
4. **Collezionabili e trofei** — psnprofiles.com, playstationtrophies.org, exophase.com (lista trofei ufficiale appena entra nel database PSN: sostituire lo schema in `trophies.json` mantenendo gli id dove il nome coincide), powerpyx.com, IGN Wiki Guide, gamerguides.com, YouTube (GTA Series Videos, MrBossFTW, TGG).
5. **Stampa e siti di riferimento** — vice-central.com (francese: ruota delle armi, personaggi, fauna, luoghi, teorie, analisi; ispirazione grafica di Mike), Insider Gaming, GamingBolt, IGN, GameSpot, Eurogamer, PC Gamer, VG247, Push Square, Kotaku; Edge, Game Informer, Famitsu, Bloomberg; Multiplayer.it, Everyeye, Spaziogames, IGN Italia. Reddit r/GTA6 e GTAForums solo come Rumor/Leak/Community.
6. **Musica** — Apple Music e Spotify (playlist Rockstar), Shazam, GTA Wiki per le scalette.
7. **Mondo** — ogni notizia nuova che cita un marchio, un locale, un'app, una gang, un canale o una squadra del mondo di gioco va aggiunta a `brands.json` (categoria tra quelle esistenti, descrizione con dove è stato visto, `sourceUrl` della notizia). La sezione Mondo cresce con le news.
8. **Mike** — gli Appunti con il «Pacchetto per Claude» sono la fonte di verità dopo il 19: ciò che conferma lui diventa `verificato` con source `gioco-mike`.

Date da tenere d'occhio: 9 novembre (risultati Take-Two), 10 novembre (preload), 18 novembre (fine embargo recensioni), 19 novembre (uscita), lista trofei (appena pubblicata).

## Struttura
- `docs/js/app.js` router hash + render a colonna unica; `docs/js/views/*.js` una vista per sezione (`sessione` = Home, `atlante` = Mappa e luoghi, `novita` = News e guide, `editoriale` = Personaggi/Radio/Mondo, `veicoli` = Garage, `diario` = Appunti).
- `docs/js/store/progress.js` progressi in localStorage (`leonida:progress:v1`, migrazioni in `migrations.js`), export/import.
- `scripts/validate.mjs` valida i dati; `scripts/immagini.json` + `scripts/scarica-immagini.mjs` per le immagini.
- Ingestione massiva: script Python nello scratchpad della sessione (classe `DB` in `lib.py`), non nel repo.
