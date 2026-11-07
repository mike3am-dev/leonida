# LEONIDA — stato dei lavori e passaggio di consegne

Aggiornato il 7 novembre 2026, versione live **v0.18.1** (dati 0.15.0). Da leggere insieme a `CLAUDE.md` (regole e routine). Questo file dice **dove siamo, cosa manca, come lavora Mike**.

## 1. Cos'è, in una riga
Guida di gioco privata per GTA VI (uscita 19 novembre 2026, PS5, Ultimate Edition), web app installata sull'iPhone Duo di Mike (usata aperta, verticale), pubblicata da GitHub Pages: https://mike3am-dev.github.io/leonida/ . Vanilla HTML/CSS/JS, dati in `docs/data/*.json`, zero build.

## 2. Dove siamo arrivati (fatto e online)
- **Home**: sfondo keyart, conto alla rovescia al secondo, «Dove sei nella storia» (bloccata col lucchetto fino al 19, poi fatta · in corso · prossima con pulsante di avanzamento), Profilo criminale (anello + 4 riquadri), cast e regioni in scala di grigi che si accendono con la storia o con «Incontrato / Scoperta», «Lo sapevi?», radio in onda, Appunti compatti con la «i». Tutto si apre in un foglio davanti: dalla Home non si cambia tab.
- **Missioni**: anti-spoiler totale. Si vede solo la missione in corso e quelle fatte; le future sono «Missione 03 · bloccata» senza nome, luogo o protagonista; i capitoli futuri sono «Capitolo N · in arrivo». Plancia del capitolo con anello. Dati: prologo (2) + capitolo 1 (5) ricostruiti dai video ufficiali, capitoli 2-6 segnaposto.
- **Mappa**: mappa vera della community (YANIS v16 via gtasixmap, tessere di dettaglio live oltre un certo zoom), tasto **Esplora** (la pagina scorre finché non lo tocchi), livelli Regioni (badge numerati, in ordine di storia) / Punti d'interesse (pin con foto) / Foto (Polaroid appese sulla mappa che volano sulla regione con il filo rosso), **Tu sei qui** collegato alla missione in corso, schermo intero. Sotto: schede delle 10 regioni che si aprono sul posto («Da fare qui» con tre barre, guida della regione, luoghi, galleria, chi ci vive, punti d'interesse), catalogo dei 44 luoghi di gtasixmap per regione.
- **Terminologia fissata**: Regioni (le 10 aree) · Luoghi (quartieri, isole, paesi: le 44 schede) · Punti d'interesse (edifici e posti singoli).
- **Personaggi**: cast board Jason/Lucia, gruppi con emoji, 53 schede (foto per quasi tutti, gallerie con didascalia, scheda d'identità, approfondimento vice-central con tabella di affidabilità), ricerca, fili dei legami, «Incontrato».
- **Armi**: ruota a 8 spicchi su sfondo, 62 voci con foto, modello reale, dove viste.
- **Garage**: 312 veicoli come concessionario (foto per quasi tutti, modello reale, posti, trazione, screenshot ufficiali), «le tue chiavi».
- **Collezionabili**: 8 categorie; album di figurine (grigie → a colori) per Animali (58, con habitat e regioni), Wyman, rifugi; si apre vuoto finché non scegli la categoria.
- **Trofei**: 32 trofei **segnaposto** (schema da GTA V/RDR2), bacheca con coppe toccabili, «prossima coppa», ricerca. La lista ufficiale NON è ancora uscita.
- **Radio**: 7 stazioni con vinile che gira, scalette, link Apple Music, logo Vice City. **Mondo**: 110 marchi/locali/app/gang in categorie chiuse. **News**: 191 notizie + 58 guide + 11 teorie (tavolo a post-it), timeline per giorno con «la scottante».
- **Scheda-fascicolo**: ogni dettaglio arriva come un foglio trascinato sulla scrivania sopra la pagina, che resta ferma; swipe a destra, tocco fuori o indietro lo chiudono.
- **Grafica**: Pricedown SOLO per numeri e titoloni di sezione (licenza desktop Typodermic: Mike ha scelto di usarlo lo stesso, uso privato); Fraunces corsivo per tutte le frasi; sfondi ufficiali Rockstar dietro app e testate; spunte al neon; tema che segue il sistema.
- **Progressi**: localStorage `leonida:progress:v1` (schema v3: missions, collectibles, activities, trophies, favorites, discovered, notes, sessions), export/import in Impostazioni.

## 3. Come lavora Mike (importante)
- Italiano, diretto, feedback a raffica con screenshot; voti («5/10», «orrendo», «WOW») e dice «ho finito» a fine giro: fino ad allora si assorbe, non si agisce. Poi si fa TUTTA la lista e si pubblica una versione nuova.
- Non è un tecnico: comandi del Terminale uno alla volta, in blocchi separati, mai più di tre.
- Vuole: stile GTA/Vice City, interattività, «dettagli vivi», niente muri di parole, niente doppioni, niente testo in font fantasia, niente spoiler sulla storia. Detesta: tendine (select) native, scritte in maiuscoletto che escono dai riquadri, elementi che coprono scritte utili, pagine che saltano in cima.
- Il numero di versione in alto a destra è l'unico modo che ha per capire cosa sta vedendo: a ogni push alzare `VERSION` in `docs/sw.js` e `__LEONIDA_VERSION__` in `docs/js/app.js` (stesso numero) e dirgli «vedi vX.Y.Z».
- Le immagini le scarica lui sul Mac (`git pull` → `node scripts/scarica-immagini.mjs` → commit/push): noi mettiamo le URL in `scripts/immagini.json`; finché mancano l'app le mostra online con `data-fallback`.
- Fino a giovedì lavora con Opus 5.5 (Fable esaurito).

## 4. Prossimi passi (in ordine)
1. **Giro di impressioni sulla v0.18.1**: Mike lo farà; aspettare la lista.
2. **Lista trofei ufficiale** (appena esce, probabilmente a ridosso del 19): sostituire `trophies.json` (nomi italiani ufficiali, descrizione come su PlayStation, livello), tenere gli id dove il nome coincide. Fonti: psnprofiles, exophase, playstationtrophies (bloccano i bot: passare da chi li riprende).
3. **Giri news** solo quando Mike dice «fai un giro di aggiornamento news» (routine in CLAUDE.md). Date: 9/11 risultati Take-Two (call 22:30 it), 10/11 preload, 18/11 fine embargo recensioni, 19/11 uscita. Ogni giro aggiunge anche i marchi citati a `brands.json`.
4. **Dal 19**: gli Appunti con il «Pacchetto per Claude» diventano la fonte di verità (source `gioco-mike`, status `verificato`). Popolare missioni vere, nomi dei capitoli, prima missione di ogni personaggio (`firstMissionId`) e regione (`districtId` delle missioni): è ciò che accende cast e regioni in Home.
5. **Supabase** (opzionale): Mike ha chiesto se i progressi «si salvano». Oggi solo localStorage; `docs/js/store/adapter.js` è pronto per un adapter remoto. Serve un progetto Supabase gratuito e la chiave; sincronizzerebbe iPhone e Mac.
6. **Foto mancanti**: DWNPLY, Randy, Kai, N3on, Mud Dog Mike (nessuna fonte); 4 pin di regione senza luoghi gtasixmap (Waning Sands e Vice Beach hanno il badge solo se un luogo ci cade dentro).

## 4b. Cosa è cambiato nella v0.16.0
- Home senza «Lo sapevi?» e «In onda oggi»; nella plancia «Giorni di gioco» (dal 19). «Prossima missione» non rivela più il nome.
- Missioni: non si può iniziare una missione se la precedente non è completata.
- Mappa: ferma finché non tocchi Esplora (`panzoom` con `enabled`), zoom minimo = riempie il riquadro (`cover`), tasto «Centra», legenda sotto la mappa, Polaroid dentro la mappa sul mare (`PHOTO_POS` in `mapboard.js`) con filo e puntina fino al badge della regione.
- Regioni: quartieri e «Chi ci vive» in alto, guida alla regione come scheda, foto in striscia, niente «Scheda completa» (`/mappa/:id` reindirizza a `?zona=`), catalogo dei luoghi sostituito da una ricerca.
- Fascicolo: un tocco fuori chiude tutta la pila (posizione in `history.state.pos`); i fogli si chiudono a ogni cambio di pagina. Righe «Fonte» nascoste ovunque: tutto in News › Fonti e ringraziamenti.
- Animali: campi `short, behavior, actions, danger, dangerNote, varieties, seen, trivia, emoji, imageFocus, photos`; Cani/Serpenti/Squali/Anatre accorpati (le voci assorbite sono sparite). Figurine che si accendono senza ridisegnare la pagina.
- Mondo: niente numeri/filtri/«Edizione», categorie alfabetiche, ricerca; 42 foto nuove (GTA Wiki, vice-central) in `scripts/immagini.json`, cartella `mondo/`.

## 4c. v0.17 (mappa granulare)
- Coordinate: `xy` nei `landmarks` di `luoghi.json` (marker gtasixmap, endpoint pubblico `https://gta6-map-data.lukas-holzmann-horizonapps.workers.dev/markers`, 232 marker) e nei `pois` di `districts.json` (gtasixmap o gtadb convertito: x ≈ 0.5705·X + 3712, y ≈ 0.5719·Y − 571). 33 POI ancora senza coordinate.
- Legenda: Anteprima/Gioco (`prefs.mode` in `leonida:mappa`), livelli Regioni · Luoghi · Punti d'interesse · Punti di riferimento · Polaroid. In Gioco: solo regioni scoperte o dove sei; grigio = non visitato, spunta = trovato (luoghi/POI in `discovered`, punti di riferimento in `collectibles` come `lmk-slug-N`).
- «Mostra sulla mappa» → `#/mappa?punto=lmk:slug:i | luogo:slug | poi:id` (`mapboard.focusPoint`). gtasixmap non si apre più.
- Mappa base: `leonida-giorno-media.jpg` (1448×1850, metà risoluzione, mostrata a 2896×3700: Safari la disegna sempre intera). Tessere gtasixmap z3/z4/z5 da zoom 0,45 / 0,95 / 1,9. I 4 pezzi della v0.17.1 sono stati tolti (su iPhone mostravano una linea di confine e l'anteprima stirata).
- Zoom: `data-z` lo/mid/hi; da lontano POI e punti di riferimento sono pallini, i nomi solo in «hi». Esplora: «Tocca per esplorare la mappa» / «Blocca la mappa» + striscia «Stai esplorando».
- Ruota armi: numeri in Fraunces corsivo dentro un bollino (Pricedown piccolo è illeggibile).
- Armi: campi `facts`, `seen`, `moreSources`. Mancano nel database: Duke assault sniper rifle, serramanico e coltello Hawk & Little, Fire Bottle e Heavy Machine Gun (leak), Pugni.

## 4d. v0.17.5
- Modalità Gioco: si vede solo ciò che è segnato come trovato; in grigio quello che manca nelle regioni dove c'è la missione in corso. Prima del 19 la mappa in Gioco è vuota (è voluto).
- «Tu sei qui» prima della storia = cancello del Leonida Penitentiary. Zoom massimo 3. Etichette in pillola scura, solo da vicino, quelle sovrapposte si nascondono (`declutter`).
- Immagini «lazy» che Safari non carica: `kickImages()` in app.js le forza quando entrano nello schermo.
- Il service worker ricarica la pagina solo agli aggiornamenti, non alla prima installazione (prima faceva perdere «Mostra sulla mappa»).
- Collezionabili: le schede delle categorie non si portano dietro i filtri della categoria precedente (era la causa dei «0/0»).

## 4e. v0.18 — stile dei testi (REGOLA per tutto ciò che si scrive d'ora in poi)
- I testi sono scritti come una guida ufficiale: si afferma il fatto. NIENTE «secondo la community», «la stampa dice», «visto nel Trailer 2», «identificato da…», «(Edge)», minutaggi dei video, commenti sul lavoro della guida. L'affidabilità la dice SOLO l'etichetta (statusChip / srcBadge negli elenchi). Il trailer si cita solo se è il contenuto (es. data di uscita di un trailer).
- Nelle news la testata sta nel campo `outlet`, non nel testo.
- Collezionabili: si tocca la figurina/riga e si apre la scheda; il tasto «Segna come trovato» sta nella scheda (niente «i», niente spunte cliccabili fuori).
- Le foto compaiono solo a caricamento completo (classe `is-loaded`, rete di sicurezza a 3 s).
- Da sistemare nei dati: l'`insight` di Hamlet parla di Kelly County/Port Gellhorn (già così prima); `mis-leak-hanks` ha «(dal leak)» nel titolo.

## 5. Aree da tenere d'occhio / debito
- **Font Pricedown**: lo «0» sembra un blocco pieno; per i contatori piccoli usare Fraunces corsivo (fatto per «Da fare qui» e album).
- **Mappa**: le Polaroid appese sono a posizioni fisse (CSS `nth-child`): se le regioni cambiano numero vanno ricalcolate. Il «Tu sei qui» prima del 19 punta al penitenziario di Hamlet. Le tessere di dettaglio vengono da `tiles.gtasixmap.com` (servizio terzo, può sparire).
- **Spoiler**: tutto ruota su `progress.settings().spoilerShield` e sullo stato delle missioni; `spoilerLevel` 9 = rumor/leak di trama. Non mostrare MAI nomi di missioni future.
- **Dati da verificare**: 669 voci «da verificare» su 859; solo 144 «verificato» (ufficiali). Dopo il 19 molte cose andranno confermate o cancellate (es. capitoli segnaposto, trofei, missioni dal leak `mis-leak-hanks`).
- **Performance**: `components.css` è cresciuto per strati (~1500 righe, molte regole che sovrascrivono le precedenti); se si tocca la grafica a fondo conviene consolidare. `news.json` è grande ma va bene.
- **Fonti che bloccano i robot**: IGN, Eurogamer, VG247, GameSpot, PSNProfiles, Exophase; gta6bible solo via REST API con Playwright (vedi CLAUDE.md). vice-central e gtasixmap sono già integrati per intero (ricontrollare la loro pagina Updates).
- **Licenza Pricedown**: uso web non coperto dalla licenza gratuita; scelta consapevole di Mike, repo privato.

## 6. Strumenti e verifiche prima di ogni push
`node scripts/validate.mjs` · `node --input-type=module --check < file.js` per ogni JS toccato · screenshot con Playwright (`/opt/node-tools/node_modules/playwright/index.js`, server locale `python3 -m http.server 8080 --directory docs`, script di esempio nello scratchpad della sessione, viewport 703×1000) · commit `git -c user.name="Mike" -c user.email="frodob1987@gmail.com"` · push su main · attesa del deploy e verifica con `curl -s https://mike3am-dev.github.io/leonida/js/app.js | grep __LEONIDA_VERSION__` (GitHub Pages a volte fallisce: rilanciare i job falliti del run «pages build and deployment»; se il rilancio resta «queued» a lungo, un nuovo commit fa partire un build nuovo che lo sostituisce). Se il push è rifiutato, Mike ha fatto commit di foto: `git pull --no-rebase` e ripush.
