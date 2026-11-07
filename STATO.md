# LEONIDA — stato dei lavori e passaggio di consegne

Aggiornato il 7 novembre 2026, versione live **v0.15.0** (dati 0.11.1). Da leggere insieme a `CLAUDE.md` (regole e routine). Questo file dice **dove siamo, cosa manca, come lavora Mike**.

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
1. **Giro di impressioni sulla v0.15.0**: Mike lo farà; aspettare la lista.
2. **Lista trofei ufficiale** (appena esce, probabilmente a ridosso del 19): sostituire `trophies.json` (nomi italiani ufficiali, descrizione come su PlayStation, livello), tenere gli id dove il nome coincide. Fonti: psnprofiles, exophase, playstationtrophies (bloccano i bot: passare da chi li riprende).
3. **Giri news** solo quando Mike dice «fai un giro di aggiornamento news» (routine in CLAUDE.md). Date: 9/11 risultati Take-Two (call 22:30 it), 10/11 preload, 18/11 fine embargo recensioni, 19/11 uscita. Ogni giro aggiunge anche i marchi citati a `brands.json`.
4. **Dal 19**: gli Appunti con il «Pacchetto per Claude» diventano la fonte di verità (source `gioco-mike`, status `verificato`). Popolare missioni vere, nomi dei capitoli, prima missione di ogni personaggio (`firstMissionId`) e regione (`districtId` delle missioni): è ciò che accende cast e regioni in Home.
5. **Supabase** (opzionale): Mike ha chiesto se i progressi «si salvano». Oggi solo localStorage; `docs/js/store/adapter.js` è pronto per un adapter remoto. Serve un progetto Supabase gratuito e la chiave; sincronizzerebbe iPhone e Mac.
6. **Foto mancanti**: DWNPLY, Randy, Kai, N3on, Mud Dog Mike (nessuna fonte); 4 pin di regione senza luoghi gtasixmap (Waning Sands e Vice Beach hanno il badge solo se un luogo ci cade dentro).

## 5. Aree da tenere d'occhio / debito
- **Mappa**: le Polaroid appese sono a posizioni fisse (CSS `nth-child`): se le regioni cambiano numero vanno ricalcolate. Il «Tu sei qui» prima del 19 punta al penitenziario di Hamlet. Le tessere di dettaglio vengono da `tiles.gtasixmap.com` (servizio terzo, può sparire).
- **Spoiler**: tutto ruota su `progress.settings().spoilerShield` e sullo stato delle missioni; `spoilerLevel` 9 = rumor/leak di trama. Non mostrare MAI nomi di missioni future.
- **Dati da verificare**: 669 voci «da verificare» su 859; solo 144 «verificato» (ufficiali). Dopo il 19 molte cose andranno confermate o cancellate (es. capitoli segnaposto, trofei, missioni dal leak `mis-leak-hanks`).
- **Performance**: `components.css` è cresciuto per strati (~1500 righe, molte regole che sovrascrivono le precedenti); se si tocca la grafica a fondo conviene consolidare. `news.json` è grande ma va bene.
- **Fonti che bloccano i robot**: IGN, Eurogamer, VG247, GameSpot, PSNProfiles, Exophase; gta6bible solo via REST API con Playwright (vedi CLAUDE.md). vice-central e gtasixmap sono già integrati per intero (ricontrollare la loro pagina Updates).
- **Licenza Pricedown**: uso web non coperto dalla licenza gratuita; scelta consapevole di Mike, repo privato.

## 6. Strumenti e verifiche prima di ogni push
`node scripts/validate.mjs` · `node --input-type=module --check < file.js` per ogni JS toccato · screenshot con Playwright (`/opt/node-tools/node_modules/playwright/index.js`, server locale `python3 -m http.server 8080 --directory docs`, script di esempio nello scratchpad della sessione, viewport 703×1000) · commit `git -c user.name="Mike" -c user.email="frodob1987@gmail.com"` · push su main · attesa del deploy e verifica con `curl -s https://mike3am-dev.github.io/leonida/js/app.js | grep __LEONIDA_VERSION__` (GitHub Pages a volte fallisce: `gh run rerun --failed`). Se il push è rifiutato, Mike ha fatto commit di foto: `git pull --no-rebase` e ripush.
