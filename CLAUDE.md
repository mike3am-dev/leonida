# LEONIDA — istruzioni per Claude

**Prima cosa da fare in una sessione nuova: leggere `STATO.md`** (e `FABLE.md` se la sessione gira su Fable) (dove siamo, prossimi passi, come lavora Mike, cose da tenere d'occhio).

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
2. **Mappa e luoghi** — gtasixmap.com (schede e pagina Updates; le 44 schede sono in `luoghi.json`), map.stateofleonida.net, gtadb.org (github rolux/gtadb.org, CC BY), r/GTA6 flair Mapping (il Discord «GTA VI Mapping Community» è sparito il 12/11).
3. **Enciclopedia** — gta6bible.com (WordPress: Cloudflare blocca curl e le pagine con JS, ma la REST API `https://gta6bible.com/wp-json/wp/v2/` risponde con Playwright a JS spento, un contesto nuovo per richiesta: collezioni vehicles, characters, weapons, activities, locations, radio, gangs, posts; utile per modello reale/posti/trazione dei veicoli e per le news; il resto è un sottoinsieme delle altre fonti), gta.fandom.com (GTA Wiki; anche foto dei veicoli via `static.wikia.nocookie.net`), gtabase.com, gta.wiki.
4. **Collezionabili e trofei** — psnprofiles.com, playstationtrophies.org, exophase.com (lista trofei ufficiale appena entra nel database PSN: sostituire lo schema in `trophies.json` mantenendo gli id dove il nome coincide), powerpyx.com, IGN Wiki Guide, gamerguides.com, YouTube (GTA Series Videos, MrBossFTW, TGG).
5. **Stampa e siti di riferimento** — vice-central.com (francese: ruota delle armi, personaggi, fauna, luoghi, teorie, analisi; ispirazione grafica di Mike), Insider Gaming, GamingBolt, IGN, GameSpot, Eurogamer, PC Gamer, VG247, Push Square, Kotaku; Edge, Game Informer, Famitsu, Bloomberg; Multiplayer.it, Everyeye, Spaziogames, IGN Italia. Reddit r/GTA6 e GTAForums solo come Rumor/Leak/Community.
6. **Musica** — Apple Music e Spotify (playlist Rockstar), Shazam, GTA Wiki per le scalette.
7. **Mondo** — ogni notizia nuova che cita un marchio, un locale, un'app, una gang, un canale o una squadra del mondo di gioco va aggiunta a `brands.json` (categoria tra quelle esistenti, descrizione con dove è stato visto, `sourceUrl` della notizia). La sezione Mondo cresce con le news.
8. **Mike** — gli Appunti con il «Pacchetto per Claude» sono la fonte di verità dopo il 19: ciò che conferma lui diventa `verificato` con source `gioco-mike`.

Canali per allargare le fonti senza forzare blocchi (niente aggiramento di Cloudflare o controlli anti-bot): i feed RSS delle testate (elenco provato in `scripts/fonti-news.md`), Google News RSS (`https://news.google.com/rss/search?q=GTA+6+when:1d&hl=it&gl=IT&ceid=IT:it`, anche en-US) come indice dei titoli, la ricerca web. Attenzione: il feed di Everyeye ripubblica articoli vecchi con data nuova. Anti-bufale (regola di Mike, 12/11): ogni notizia risale a una fonte primaria; si scartano le fabbriche di contenuti fatte con l'IA (niente firma, titoli generici, dettagli inventati, immagini generate), le mappe/immagini «rifatte» e i conteggi riciclati. Gli eventi dal vivo (negozi, vetrine, «activation», pop-up) escono prima sui social: cercare anche «GTA VI activation / pop-up / store» su Google News e nella ricerca web, e ricontrollare le date annunciate in news.json (es. un'apertura «dal 9 novembre» va verificata quel giorno).

Date da tenere d'occhio: 9 novembre (risultati Take-Two), 10 novembre (preload), 18 novembre (fine embargo recensioni), 19 novembre (uscita), lista trofei (appena pubblicata).

## «Fai un giro guide» — dal 19 novembre, la routine principale
Dal giorno dell'uscita le guide esterne sono la fonte principale per riempire l'app (Mike gioca e manda solo Pacchetti brevi). Si parte sempre dalla lista qui sotto: chi dà cosa, in quale campo va. Raggiungibilità controllata l'8/11 con curl (UA Safari): ✓ = risponde, ✗ = blocca (passare da chi lo riprende).

| Dato | Campi | Fonti, in ordine |
|---|---|---|
| Elenco missioni, ordine, capitoli | `missions.items` (title, actId, order, protagonist, districtId), `acts` | PowerPyx «all missions» ✓, IGN Wiki walkthrough ✓, Game8 ✓, GamerGuides ✓, GTA Wiki via `gta.fandom.com/api.php` (l'HTML dà ✗) |
| Cosa fare in missione | `contact`, `objectives[]` (frasi brevi, parafrasate), `choice.irreversible`, `extraObjectives` (medaglie), `tips`, `unlocks` | IGN Wiki ✓, PowerPyx ✓, Game8 ✓; YouTube per controllo |
| Trofei | `trophies.json` con `node scripts/importa-trofei.mjs lista.tsv --url <fonte>` (prima `--dry`) | PowerPyx trophy guide/roadmap ✓, IGN ✓, Game8 ✓; PSNProfiles/Exophase/TrueTrophies/PlaystationTrophies ✗ |
| Collezionabili (posizioni, quanti per il 100%) | `collectibles.items` nelle categorie esistenti (Relitti, Riviste, Salti, Murales…), riga «zona: punto preciso», coordinate `xy` | PowerPyx ✓, IGN mappa ✓, MapGenie ✓ (pagina GTA VI non ancora creata l'8/11), gtasixmap (pagina Updates), Game8 ✓ |
| 100%: categorie e pesi | da decidere la struttura solo quando la lista è nota | PowerPyx/IGN «100% checklist», statistiche di gioco dai Pacchetti di Mike |
| Veicoli: prezzo, dove, statistiche | `price`, `whereToFind`, `stats` | gtabase ✓, GTA Wiki (api.php), IGN ✓ |
| Armi: prezzo, negozio, potenziamenti, statistiche | `price`, `whereToBuy`, `upgrades`, `stats`, `caliber`, `magazine` | gtabase ✓, GTA Wiki (api.php), IGN ✓ |
| Attività, incontri, personaggi secondari | `activities` (requirements, rewards, steps), `characters` (firstMissionId) | IGN Wiki ✓, Game8 ✓, GamerGuides ✓, GTA Wiki (api.php) |
| Radio | `radio.json` scalette | GTA Wiki (api.php), Apple Music/Spotify |
| Mappa e luoghi | `districts.pois`, `luoghi.json` | gtasixmap, gtadb, MapGenie ✓ |
| Notizie e recensioni | `news.json` | IGN ✓, Eurogamer ✓, VG247 ✓, PC Gamer ✓, Push Square ✓, GamesRadar ✓, Polygon ✓, Dexerto ✓, RPS ✓, Everyeye ✓, Multiplayer.it ✓; GameSpot ✗, Spaziogames ✗, Reddit ✗ |

Regole del giro guide:
- Etichette: guide di testate (IGN, PowerPyx, Game8…) → `source: stampa`, `status: da verificare`; diventa `verificato` quando due guide concordano o Mike lo conferma (`gioco-mike`). Mai copiare frasi intere: si riscrive breve, nello stile di STATO 4e.
- Spoiler: ogni missione e ogni campo che rivela la trama prende lo `spoilerLevel` dell'atto; i nomi delle missioni future non devono comparire da nessuna parte (testi di altre voci, `unlocks`, consigli).
- I campi si mostrano solo se pieni: niente segnaposto nuovi. Le strutture nuove (colpi, 100%, proprietà) si disegnano solo dopo aver visto come sono fatte nel gioco.
- Ordine di lavoro nei primi giorni: trofei → elenco missioni e capitoli → «cosa fare» delle missioni giocate da Mike e della prossima → collezionabili → veicoli/armi → attività.
- Fine giro: validazione, versione, commit, push, verifica live, riepilogo in chat con le 5 cose più importanti.

## Struttura
- `docs/js/app.js` router hash + render a colonna unica; `docs/js/views/*.js` una vista per sezione (`sessione` = Home, `atlante` = Mappa e luoghi, `novita` = News e guide, `editoriale` = Personaggi/Radio/Mondo, `veicoli` = Garage, `diario` = Appunti).
- `docs/js/store/progress.js` progressi in localStorage (`leonida:progress:v1`, migrazioni in `migrations.js`), export/import.
- `scripts/validate.mjs` valida i dati; `scripts/importa-trofei.mjs` sostituisce i trofei segnaposto con la lista ufficiale; `scripts/immagini.json` + `scripts/scarica-immagini.mjs` per le immagini.
- Ingestione massiva: script Python nello scratchpad della sessione (classe `DB` in `lib.py`), non nel repo.
