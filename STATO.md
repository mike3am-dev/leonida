# LEONIDA — stato dei lavori e passaggio di consegne

Aggiornato il 20 novembre 2026 sera, versione live **v1.1.0**; il lavoro della 1.2 è sul ramo **`sviluppo`** (anteprima `1.2-b`). Da leggere insieme a `CLAUDE.md` (regole, routine, «Le chat di Leonida»). Questo file dice **dove siamo, cosa manca, come lavora Mike**. Le sezioni 2 e 4b-4m sono storiche (prima dell'uscita): lo stato di oggi è nella sezione 0 e nelle sezioni 4, 4o-4z, 5-5e.

## 0. Da dove ripartire (passaggio di consegne del 20/11 sera)
Da qui Mike lavora con più chat (Caccia e news · Dal gioco · Grafica e nuove funzioni · Bug · Pubblicazione: CLAUDE.md «Le chat di Leonida»). Tutte partono dal ramo `sviluppo`.
- **Online**: v1.1.0 (barra a 4 tasti su iPhone, pagina Game, mappa ufficiale, dati del giro 4).
- **Su `sviluppo`, non online (la 1.2 si pubblica solo quando Mike dice «pubblica»; non chiederglielo)**:
  - sezione **Veicoli** come nel gioco (STATO 5e): 6 schede, classi con «Scoperti X / Y», ricerca, chiave del garage, «Aggiungi al garage» per i veicoli che mancano (`progress.myVehicles`, nel Pacchetto per Claude);
  - Home: il riquadro si chiama **«I tuoi progressi»** (non più «Profilo criminale», che è il sistema del gioco);
  - **giro di caccia 5** applicato (README della caccia, «Cosa manca alla fine del giro del 19/11 sera» + rapporti riassunti in chat): veicoli puliti e nelle classi giuste (classi Auto e quasi tutte quelle di Servizio al totale esatto del gioco), 26 veicoli di spicco, prezzi di 62 armi, capitolo 4 (9 missioni), avviso del capitolo 1 sul conto BuckMe corretto, 21 personaggi, 30 news, radio (29 brani, 14 loghi), palestre (8 abbonamenti), termini italiani del gioco in tutta la guida (stelle di sospetto, allerta, concentrazione, refurtiva, profilo Professionale/Senza scrupoli/Violento/Folle);
  - Come si gioca: le statistiche del gioco scritte come spiegazioni nelle schede.
  - **Missioni in qualsiasi ordine** (chat Dal gioco, 20/11 sera; Mike ha fatto «Chi ti si intuba» saltando Cal): nel capitolo in cui sei (`spoiler.reachedAct()`) nessuna missione è più «Non ancora»; «la prossima» (Home, Missioni, «Missione compiuta») è la prima non toccata, così quella saltata non si perde; le missioni dei capitoli dopo hanno «L'ho trovata nel gioco»; il Pacchetto per Claude elenca le missioni giocate fuori ordine (`outOfOrderPacket` in diario.js). Da riportare nel changelog della 1.2.
  - **Trofei a fine missione** (chat Dal gioco, 20/11 sera, richiesta di Mike): la schermata «Missione compiuta» mostra da sola i trofei legati alla missione: *Trofeo sbloccato* con il tasto «Preso?» (segna il trofeo), *Adesso puoi fare / Dal capitolo N puoi fare* (al massimo 4, poi «e altri N») e *Prima che finisca il capitolo* (trofei che scadono, quando mancano 3 missioni o meno). Campi nuovi in `trophies.json`: `missions` (missioni che danno il trofeo), `chapterDone` (capitolo che lo dà, quando tutte le sue missioni principali sono fatte), `openedBy` (missioni dopo cui si può fare); in più usa `timing.from` / `timing.until`. Collegati 19 trofei (storia, capitoli, Billy, Andy, Tyrone, Kenton, Randy, Banshee, pesca con Cal): **chi trova altri legami (Caccia, Dal gioco) li aggiunge in questi tre campi**. I trofei coperti dallo scudo spoiler si scoprono con un tocco; quello appena preso si vede in chiaro. Codice: `trophyHint` in diario.js. Da riportare nel changelog della 1.2.
- **Decisioni di Mike del 20/11**: il suo gioco batte ogni fonte; niente coordinate esterne e la mappa non si tocca; niente pagina «Statistiche» né contatori da compilare (tutto va in «Come si gioca»); non chiedere l'OK per pubblicare.
- **Da fare nel prossimo giro di caccia** (oltre al README): capitolo 5 e le 15 missioni del capitolo 4 senza passi; seconda fonte per i capitoli 3-4; veicoli di spicco (26/280: Game8 ha un archivio, GTABase solo controlli puntuali); varianti uniche di armi (130: IGN `Unique_Weapon_Variants` ne ha 123, struttura da decidere con Mike); nome italiano del quinto livello del profilo («Irredeemable»).
- **Da Mike sul Mac**: scaricare le immagini nuove (`git pull`, `node scripts/scarica-immagini.mjs`, `python3 scripts/ottimizza-immagini.py`, `python3 scripts/miniature.py`); finché mancano l'app usa le foto online.


## 1. Cos'è, in una riga
Guida di gioco privata per GTA VI (uscita 19 novembre 2026, PS5, Ultimate Edition), web app installata sull'iPhone Duo di Mike (usata aperta, verticale), pubblicata da GitHub Pages: https://mike3am-dev.github.io/leonida/ . Vanilla HTML/CSS/JS, dati in `docs/data/*.json`, zero build.

## 2. Dove siamo arrivati (fatto e online)
- **Home**: sfondo keyart, conto alla rovescia al secondo, «Dove sei nella storia» (bloccata col lucchetto fino al 19, poi fatta · in corso · prossima con pulsante di avanzamento), I tuoi progressi (anello + 4 riquadri; fino al 20/11 si chiamava «Profilo criminale», rinominato per non confonderlo con il sistema del gioco), cast e regioni in scala di grigi che si accendono con la storia o con «Incontrato / Scoperta», «Lo sapevi?», radio in onda, Appunti compatti con la «i». Tutto si apre in un foglio davanti: dalla Home non si cambia tab.
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

## 4. Cose da fare (taccuino, aggiornato al 19/11 sera, dopo la v1.0.0)
Elenco unico: quando una voce è fatta, si toglie da qui e si racconta nella sezione della versione. **Regola di Mike (19/11 sera): queste voci si segnano e basta; si lavora solo quando lui dice di partire.**

### Dopo la 1.0.1: risposte di Mike (19/11 sera)
1. **Mappa su iPhone**: Dada (17 Pro Max, iOS 27.2) il 20/11 sera ha ancora il crash di Safari sulla mappa sbloccata e in Veicoli: corretto dalla chat Bug (STATO 5f). Se torna ancora: nascondere le Polaroid a zoom alto e aggiornare `--s` dei segnaposto solo a fine gesto.
2. **Titoli italiani del capitolo 1**: «Armi in spalla» resta, per ora (Mike). 6 titoli hanno una fonte sola (`titleNote`). Facoltative del capitolo 1 e capitoli 2-5 ancora quasi tutti in inglese: cercarli nei feed RSS dei canali italiani (IosonoOtakuman, PANZA MARANZA GAMING, Jugin Gamer, ATLAS, Gameataly, Playstream Chronicles).
3. **Foto degli Scatti**: per Mike va bene così. La cancellazione del file dal bucket non è stata provata sul Supabase vero: se una foto cancellata resta raggiungibile dal suo indirizzo, guardare le due policy di `scatti-admin.sql`.
4. **Consigli e spoiler**: i passi («Cosa devi fare») sono in chiaro per scelta.

### Versione 1.1 (funzioni nuove)
5. **«Thread»: un social dentro l'app** (idea di Lollo, screenshot di Threads del 19/11). Ognuno scrive impressioni e commenti, mette «mi piace», risponde; un flusso unico con il più recente in alto, come Threads. Per ora **solo testo**. Le foto ci sono già negli Scatti: se un giorno servono anche nei thread, si riusa lo stesso bucket. Peso su Supabase (piano gratuito: 500 MB di database e 1 GB di file): un messaggio di testo pesa circa 1 KB, cioè centinaia di migliaia di messaggi; una foto rimpicciolita circa 300 KB, cioè circa 3.000 foto. Il limite vero sono le foto, non il testo. Stesse regole di banda e Scatti: tabelle chiuse da RLS, funzioni RPC, scudo spoiler (capitolo nel post, sfocato per chi è più indietro), l'autore cancella il suo e l'admin tutto (voce 5).
6. ~~Fatto con la 1.1.0 (STATO 5d).~~ **Riordinare i pulsanti della barra** (proposta di Lollo, voce «snellire le icone» di Mike). Sul Duo aperto resta la fila completa a sinistra, che a Mike piace. Sugli iPhone (Pro e Pro Max) solo **4 voci fisse in basso: Home, Game, Social, News**. «Game» apre una pagina di tasselloni grandi con tutte le sezioni del gioco (Missioni, Come si gioca, Mappa, Personaggi, Armi, Garage, Collezionabili, Trofei, Radio, Mondo…). Da chiarire con Mike: cosa vuol dire «ogni utente ne sceglie una» (forse un tassello preferito messo in evidenza o fissato in barra?); dove finiscono La banda, gli Appunti e le Impostazioni (probabilmente Social = Thread + La banda + Scatti). Prima di pubblicare, provarla con Mike e Lollo.
7. **Confronto anche per le auto**, come quello delle armi (STATO 4q: pulsante «Confronta» visibile ovunque, ricerca, fino a 3 insieme, pochi tocchi). Da fare appena i veicoli hanno abbastanza dati: oggi 133 su 339 hanno le 5 barre (`speed, accel, handling, offroad, strength`) e 41 il prezzo (registrazione + vendita). Confrontare solo veicoli della stessa famiglia (auto con auto, moto con moto); barche e aerei quando arrivano le loro barre. Insieme: «Ordina per» in Garage e Armi (FABLE.md, «Altre idee»).

### Più avanti
8. **Trofei PSN automatici** con Supabase e il codice NPSSO di Mike (idea già approvata; il codice Mike lo mette da solo, mai in chat).

### Da Mike
9. ~~Immagini sul Mac~~ fatto il 19/11 sera: tutte le 1.059 immagini dell'elenco sono nel repo (push di 128 MB) e le miniature sono state rifatte. Da fare (tecnico): fatto con la 1.0.1 (`scripts/ottimizza-immagini.py`: PNG grandi → WebP, 120 MB in meno, `docs/assets` a 110 MB). Dopo ogni scaricamento di immagini nuove: `python3 scripts/ottimizza-immagini.py` e poi `python3 scripts/miniature.py`.
10. **Decisione sulle mappe IGN e MapGenie**: le coordinate di tutti i punti stanno nei loro servizi interni (GraphQL). Non vanno interrogati senza il suo sì. Con il sì: `xy` per i ~390 POI che non le hanno, nomi di palestre e club, stazioni doppie.
11. **Conferme dal gioco** (diventano `verificato` con source `gioco-mike`): conti in banca separati (solo il Risparmio Familiare in comune); RydeMe dal capitolo 1 o 2; motoscafo Squalo solo nel capitolo 4; Arnold risparmiato vale 10.000 $?; chi riceve la caccia a Mr. Mangrove; nome «Radio La Ola».

**Contenuti da riempire (giro di caccia ogni 12 ore, solo col sì di Mike; dettagli e fonti in `scripts/caccia/README.md`, «Cosa manca alla fine del giro del 19/11 sera»)**
- Missioni: soluzioni del capitolo 5; seconda fonte per i capitoli 3-4; titoli italiani (27 su 168).
- Trofei: metodo di Sfortuna forse e Strike!; 41 sequenze dei trucchi.
- Collezionabili: fenicotteri, stili, animali (e gli 8 di Bret), scoperte subacquee, 4 riviste, 5 murales 1010, 1 salto. Garage: 15 in guida contro 12 dichiarati, ricontare.
- Arsenale: prezzi delle armi comuni e degli accessori; auto 11-22 di Randy; barre di barche e aerei; veicoli «Standout»; 18 `imageUrl` ancora su Fandom.
- Personaggi: 35 ritratti, schede dei capitoli 4-5 (il cast è completo dai titoli di coda). Radio: 13 loghi, 3 stazioni senza scaletta.

**Tecnico**
- Riordino di `docs/css/components.css` (FABLE.md voce 4, senza cambiare un pixel).
- ~~Controllo automatico delle pagine nel repo~~ fatto il 20/11: `scripts/controlli/` (pagine, grafica, screenshot) con la procedura di rilascio nel README.

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
- Sistemato: tolto da Hamlet l'approfondimento che parlava di Kelly County; «Hank's Waffles» senza «(dal leak)» (l'etichetta Leak basta).

## 4f. v0.19
- Titoli in Fraunces con `font-optical-sizing: auto` (prima «opsz» 96 forzato: su Safari f e J sembravano tagliate e i titoli piccoli stretti). Niente capolettera (`dropcap` neutralizzato).
- Chiudendo un fascicolo l'indice sotto NON si ridisegna se l'HTML è identico (`lastLeftHtml` in app.js): niente lampo delle foto.
- Pizzico a due dita sulla mappa bloccata → il tasto «Tocca per esplorare» sobbalza (`is-nudge`).
- Tolte 11 foto senza senso (Shanese, Aunt Tee, Gutless Wonders, Kenny Brewster; Shipping, Benzinai, Peekhole, Delights; Pegassi X, canyon del Kalaga, ponte di Bocamar): ora iniziali o icona.

## 4g. Scheda tecnica (armi e veicoli)
- `docs/js/views/specs.js`: barre Danno/Cadenza/Precisione/Gittata (armi) e Velocità/Frenata/Accelerazione/Aderenza (veicoli). Valori veri nel campo `stats` (0–10: armi `damage, rate, accuracy, range`; veicoli `speed, braking, accel, traction`). Finché manca, barre grigie tratteggiate con profilo di esempio per classe e scritta «Esempio · dati veri dal 19».
- Campi previsti da riempire dal 19: armi `caliber, magazine, fireMode, price, whereToBuy, upgrades[{name,note,price}]`; veicoli `price, whereToFind`.
- «Da fare qui» nelle regioni → «Completamento della regione»: anello %, «Ti manca: …», «Prossima cosa da trovare» (primo punto di riferimento non trovato).
- Su telefono niente zoom/schiacciamento al tocco (`@media (hover: none)`).

## 4h. Regole di affidabilità (decise con Mike il 7/11)
- Vince la fonte primaria (sito Rockstar, Newswire, video ufficiali, interviste dirette a Edge/IGN/Game Informer/Famitsu); se manca, la versione più ricorrente. Tutto ciò che si vede nell'Extended Look è Ufficiale. Si raccoglie TUTTO, anche community/leak, purché etichettato.
- Testo della guida sempre definitivo; tono giornalistico (attese, si parla di) solo nelle News. Niente fonti né date in vista.
- Schede miste: campo `extras: [{source: community|rumor|leak|stampa, text}]` → seconda etichetta accanto alla principale (statusChip la aggiunge da sola) e riquadro tratteggiato nella scheda (`extrasHtml`).
- Sinossi ufficiale in `missions.json` → `synopsis`, mostrata in cima alle Missioni.

## 4i. Come si gioca
- `docs/data/meccaniche.json` (19 schede, campi: id `mec-*`, title, emoji, group Crimine|Personaggi|Mondo e vita, short, steps, details[{title,text}], tips, extras, relatedIds), vista `docs/js/views/meccaniche.js`, rotta `/meccaniche/:id?`, seconda voce della barra. Indicizzata nella ricerca.
- Dal 19: è il posto dove finiscono le meccaniche scoperte giocando (dai Pacchetti per Claude).

## 4j. Benchmark leonidastate.guide (7/11)
- Il sito blocca i bot (Cloudflare) e nel robots.txt vieta l'uso per addestramento: NON aggirarlo. Usata solo la sitemap pubblica come lista di cose da cercare altrove (gta.wiki, gtadb, gtasixmap). Molte sue voci sono inventate o di GTA V: scartate.
- Animali: campi `scientificName`, `temperament` (innocuo/territoriale/aggressivo/predatore, dedotto dalla specie reale), `habitat`, `districtIds`, `protectedReal`. Attività: campo `group` per i filtri in Come si gioca. Missioni: `actsExtras` (nota Leak sui capitoli).
- Stazioni = POI con id `poi-st-*`; fermate bus solo nella scheda `mec-rete-trasporti` (34, non sulla mappa per non affollarla).

## 4k. v0.23 — giro 1.0 (feedback dei 10 giocatori, 7/11)
- Backup prima del giro: ramo `backup-duo-v0.22.0` su GitHub (il Duo aperto in verticale, ~703×1000, è il riferimento: non va cambiato; le correzioni per iPhone stanno sotto `@media (max-width: 599px)`).
- Impostazioni nuove: `virginMode` (Modalità vergine: nasconde personaggi non incontrati, teorie, estratti ricerca) e `creatorTools` (Pacchetto per Claude; migrazione v4: acceso per chi aveva già dati, spento per i nuovi).
- Teorie con spoilerLevel 9 dietro avviso; actsExtras dietro avviso; riassunto missione in corso: solo la prima frase.
- Legenda delle etichette al tocco (app.js, LEGEND); srcBadge negli elenchi = solo etichetta principale.
- Mappa: `poiIcon()` in mapboard.js; ricerca sotto la mappa include POI e landmark; i landmark contano in stats()/districtStats/zoneBreakdown (`landmarkIds()` in shared.js).
- Rimandati alla fine: schermata di benvenuto, supporto orizzontale.

## 4l. v0.24 — dalla guida ufficiale di GTA V (8/11)
- Mike ha dato la guida ufficiale cartacea di GTA V (PDF di 745 MB su Google Drive, solo nello scratchpad della sessione, MAI nel repo). Tre esperti l'hanno letta, confronto con i 10 giocatori e un arbitro. Mike ha scelto la linea dell'arbitro: poche strutture ora, il resto quando il gioco dice com'è fatto.
- Fatto: pagina **Benvenuto** (`docs/js/views/benvenuto.js`, rotta `/benvenuto`): una volta sola al primo avvio (`settings.welcomeSeen`; migrazione v5 la segna come vista per chi aveva già dati), installazione su Home, scudo spoiler e modalità vergine, etichette, progressi. Si riapre da Impostazioni › Come funziona.
- Missioni: campi `contact` (id personaggio o nome), `objectives[]` (cosa fare, frasi brevi), `choice: {irreversible: true}` → timbro rosso «Scelta senza ritorno — salva prima» (visibile anche sulla missione successiva bloccata: non rivela le opzioni). Si vedono solo se pieni; il validatore li controlla.
- A fine missione, solo con gli strumenti del curatore: foglio «Com'è andata?» (chi te l'ha data · dove · scelta senza ritorno · altro) → appunto con `kind: 'scheda-missione'` e `fields`, che il Pacchetto passa a Claude con le istruzioni per riempire `contact`, `districtId`, `choice`.
- Tolte tutte le voci ESEMPIO (6) e l'interruttore «voci di prova».
- `scripts/importa-trofei.mjs`: lista ufficiale in TSV → trophies.json (tiene id e categorie dove il nome coincide).
- Routine **«giro guide»** in CLAUDE.md: fonti per tipo di dato, verificate raggiungibili l'8/11.
- v0.24.1 — **regola unica sui nomi delle missioni**: `spoiler.missionRevealed(m)` / `spoiler.missionName(m)` in `docs/js/spoiler.js`. Il nome si vede solo se la missione è iniziata/completata o lo scudo è spento: ricerca (le missioni bloccate non compaiono), menu dell'Appunto, Pacchetto per Claude (solo missioni e capitoli sbloccati), «Prima apparizione» dei personaggi, missioni collegate dei collezionabili, prerequisiti e «Sblocca» («Una nuova missione»). Ogni vista nuova che mostra un titolo di missione DEVE passare da `missionName`.
- Rimandati per scelta (dall'arbitro): colpi/lavagna, pagina 100%, proprietà, passi delle missioni, soglie medaglie. Dalla 2ª settimana: «Ordina per» in Garage e Armi.

## 4m. v0.25 — giro di Mike sulla simulazione missione (8/11)
- **Spoiler = inchiostro invisibile** (`spoiler.ink(html, {inline})`, motore a particelle su canvas in `docs/js/spoiler.js`, montato una volta con `mountInk()` e un MutationObserver). `spoiler.wrap` e `spoiler.text` lo usano da soli: niente più `spoiler-box` con banner. Tocco = esplosione delle particelle, il testo compare. Rispetta «riduci movimento».
- **Missioni**: `nextUp()`, `data-start-mission` (imposta in corso e apre la scheda; gestito in `missioni.bind`, vale anche dalla Home). Scheda: hero «Prologo · 1 di 2», timbro, contesto (prima frase + resto a inchiostro), **Taccuino** (`notebook()`: contatto, regione con «Mappa», `objectives` spuntabili con chiavi `obj-N` in `missions[id].extras`, personaggi con `firstMissionId` = missione, `extraObjectives` per il 100%), «Missione compiuta» / «Non la sto giocando». Completata → foglio `openMissionDone` (diario.js, classe `sheet--passed`, stile GTA; per il curatore anche le tre domande) e banner `.passed` con «Inizia la prossima».
- **Home**: `whereCard` = riga `where-mini` prima del 19 (se nessuna missione è iniziata), poi `where2` con Taccuino/Compiuta o Inizia.
- **Font**: Fraunces tagliato a `opsz` 9–72 con fontTools (`instancer`): oltre 72 la J diventava quella «spezzata» con la pallina sotto la riga. Se si riscaricano i font, rifare il taglio.
- **Mappa**: `maxScale` 7, tessere gtasixmap fino a z6 (oltre s 3,8).
- **Trofei**: niente «coppe»; plurali giusti.
- **Proposta aperta (da decidere con Mike)**: trofei PSN automatici. Serve un piccolo servizio (Cloudflare Worker o Supabase) con il codice NPSSO di Mike (scade ~2 mesi), profilo PSN coi trofei visibili; solo dopo la lista ufficiale. PSNProfiles blocca i bot.
- **v0.26 icone**: Mike ha scelto i pittogrammi pieni (proposta B) con il riquadro rosa attuale. Simboli `n-<id sezione>` in `docs/index.html` (fori veri con `<mask id="nm-…">`), usati da `navHtml` (app.js) e `sectionHead` (shared.js); `n-altro` per «Altro». Le icone `i-*` restano per pulsanti e mappa.

## 4n. GTABase (9/11)
- Si legge con curl normale (manca solo il feed RSS). Giro fatto il 9/11: armi, equipaggiamento, veicoli, gang, rifugi, POI, attività, personaggi.
- **Diritti sul database**: la pagina veicoli di GTABase vieta di copiare una parte sostanziale del database (direttiva UE 96/9). NON importare in blocco campi come `realModel` da lì (207 proposte scartate): prenderli voce per voce da GTA Wiki o fonti incrociate. Singoli fatti e correzioni puntuali sì, con etichetta Community.
- Dubbi aperti: Zorrusso (GTABase: Pegassi, noi GranForma), Contender (Karin vs Vapid); `realModel` che contraddice la descrizione in Sea Sparrow, Verus, Manchez, Rancher; molti `drivetrain` «AWD» anche su elicotteri e camion (sembra un default sbagliato); Wyman a Port Gellhorn (GTABase) o Ambrosia (brands); PTT Compound a Hamlet o «Southside».
- Niente aggiramento di blocchi anti-bot: per i siti protetti feed RSS, Google News, ricerca web (`scripts/fonti-news.md`).
 / debito
- **Font Pricedown**: lo «0» sembra un blocco pieno; per i contatori piccoli usare Fraunces corsivo (fatto per «Da fare qui» e album).
- **Mappa**: le Polaroid appese sono a posizioni fisse (CSS `nth-child`): se le regioni cambiano numero vanno ricalcolate. Il «Tu sei qui» prima del 19 punta al penitenziario di Hamlet. Le tessere di dettaglio vengono da `tiles.gtasixmap.com` (servizio terzo, può sparire).
- **Spoiler**: tutto ruota su `progress.settings().spoilerShield` e sullo stato delle missioni; `spoilerLevel` 9 = rumor/leak di trama. Non mostrare MAI nomi di missioni future.
- **Dati da verificare**: 669 voci «da verificare» su 859; solo 144 «verificato» (ufficiali). Dopo il 19 molte cose andranno confermate o cancellate (es. capitoli segnaposto, trofei, missioni dal leak `mis-leak-hanks`).
- **Performance**: `components.css` è cresciuto per strati (~1500 righe, molte regole che sovrascrivono le precedenti); se si tocca la grafica a fondo conviene consolidare. `news.json` è grande ma va bene.
- **Fonti che bloccano i robot**: IGN, Eurogamer, VG247, GameSpot, PSNProfiles, Exophase; gta6bible solo via REST API con Playwright (vedi CLAUDE.md). vice-central e gtasixmap sono già integrati per intero (ricontrollare la loro pagina Updates).
- **Licenza Pricedown**: uso web non coperto dalla licenza gratuita; scelta consapevole di Mike, repo privato.

## 4o. Profili online con l'email (v0.38.0, 18/11)
- Mike ha dato la guida ai colleghi: ognuno entra **solo con l'email** (niente password, niente codice, scelta di Mike consapevole del compromesso: chi conosce l'email di un altro entra nel suo profilo; dati di gioco, rischio basso).
- Supabase: progetto **separato** `leonida` (ref `geuppepguqzhjwiqbvwl`), NON quello dell'altra app nelle variabili d'ambiente. Tabella `profili(email, dati jsonb, aggiornato)` con RLS e nessuna policy: dalla chiave pubblica si passa solo da `leggi_profilo(p_email)` e `salva_profilo(p_email, p_dati)` (security definer, email minuscola, controllo formato, max 500 KB). Niente elenco delle email.
- `docs/js/store/cloud.js`: il telefono resta la copia principale (offline); `dati = { savedAt, state }`; vince la copia modificata per ultima. Sessioni e «dove sei» non contano come modifica (se no riaprire l'app su un telefono vecchio sovrascriverebbe l'altro). Salva 1,5 s dopo ogni modifica e quando l'app va in background; riallinea quando torna in primo piano o torna la rete.
- Primo ingresso: profilo nuovo → carica i progressi del telefono; profilo esistente e telefono vuoto → li riprende; tutti e due pieni → foglio «Due copie dei progressi» con la scelta.
- UI: `docs/js/views/profilo.js` (classi `.acct`, non `.profile` che è il «Profilo criminale» della Home); passo 4 del Benvenuto e blocco «Profilo» in Impostazioni.
- v0.38.1: nick scelto da ognuno in `settings.nick` (viaggia con il profilo; se manca si usa la parte dell'email prima della @) e pallino in alto a destra `.who` (verde salvato, arancio senza rete/errore, vuoto = «Entra»). Sotto 560 px sparisce «Guida di gioco» per fare spazio.
- Riga di prova nel database: `prova@leonida.test` (si può cancellare dal Table Editor).

## 4p. Scadenza dei trofei (v0.39.0, 18/11)
- Ogni trofeo ha `timing`: `{ story: true }` per quelli della storia, altrimenti `{ from: capitolo da cui si sblocca | assente, until: capitolo entro cui farlo | null, note?, warn? }`. In lista la nota si vede solo se `warn` o `until`; nella scheda sempre.
- Fonti: guide PowerPyx/stampa già usate per `guide` e per la roadmap. Unico trofeo con scadenza: Mentalità positiva (meditazione del capitolo 1). Quando le guide ne trovano altri, si aggiorna `until`.

## 4q. Armi: ruota filtrata e confronto (v0.40.0, 18/11)
- I numeri della ruota (`counts` in `armi.js`) seguono il filtro `?have=`; il centro somma solo gli spicchi (79 armi, senza l'equipaggiamento).
- Confronto (rifatto in v0.41.0 dopo il giro di Mike: la modalità «scegli nella lista» era poco intuitiva): niente più stato nell'indirizzo. `data-cmp-open="<id>"` è su ogni riga (`.wrow__cmp`), in alto (`.wtools`, id vuoto) e nella scheda. Apre `compareSheet(start)`: di partenza l'arma toccata più le 2 più potenti dello zaino nella stessa categoria (`startSet`); dal bottone in alto le 3 più potenti dello zaino. Dentro il foglio si toglie con la × e si aggiunge dalla carta «Aggiungi» (elenco: zaino, stessa categoria, le altre; con ricerca). Massimo 3 (`CMP_MAX`), solo armi con `stats` complete. «Nel complesso» = media delle quattro barre. Per i veicoli si può riusare lo stesso schema (classi `.cmp*`).
- Ricerca armi: `#/armi?q=…` (nome, produttore, modello reale, categoria; senza accenti). Con la ricerca attiva ruota e filtro spariscono e i risultati ignorano categoria e filtro.

## 4r. Rilettura dei testi (v0.42.0, 18/11)
- 681 testi riscritti per chiarezza (regola di Mike: «riscrivi ciò che non ha senso», modello: la descrizione delle auto di Wyman). Stessi fatti, niente nomi nuovi (controllo automatico sui titoli delle missioni e sui personaggi).
- Strumento: `applica-testi.py` nello scratchpad (patch `{file, key: id|slug, old, new}`, ricerca in ampiezza perché in luoghi.json le liste «nearby» ripetono gli slug).
- «Professional» del profilo criminale resta in inglese finché non si conosce il nome italiano del gioco.
- v0.43.0, giro guide sulle contraddizioni (regola di Mike: una sola versione in tutte le sezioni, la più probabile, segnata «da verificare» se non c'è conferma doppia; frasi senza senso rifatte dall'originale inglese, in inglese se resta il dubbio). 234 correzioni + modifiche a mano:
  - Risolte: cambio protagonista (destra + R1, dal capitolo 2; ognuno ha il suo inventario), posti auto iniziali (1), mira (assistita classica spenta, aiuto leggero regolabile), microtransazioni (niente valuta; GTA+, Ultimate, Vintage Pack a pagamento), livelli del Profilo criminale in inglese («Professional», «Hardened», «Violent», «Psycho», «Irredeemable»), viaggio rapido (taxi/RydeMe, 100 $), poligoni (2, 12 sfide, 42 ori), Kenton (5 set su 7 per la voce «Set», 7 per le 33 scoperte), animali (255, 60 uccelli), meditazioni (18 = 1 + 8×2 + 1), cartucce di inchiostro, Ambrosia nella contea di Kelly, Petra direttrice operativa, Bayside, Vice Beach città separata, Gloriana/Catalan Key, Le Mans, Drifter (affiancate), Rancher (K5 Blazer), Contender = Karin, grafie WAiNK, RydeMe, «la Snap Gun», «i Grassrivers».
  - Auto di Wyman: tolte col-wyman-sirius/-riata/-mamba/-deviant (restano le 5 posizioni), col-wyman-1 rinominata «Auto per Wyman (Key Lento)».
  - Fonti: 63 link gta.fandom.com → gta.wiki/w/ (stessa pagina). I crediti delle immagini restano su Fandom (le immagini sono ospitate lì).
- Ancora aperti (segnati «da verificare»): 20.000 $ (tetto dei contanti, da anteprime); cosa fa il livello «Hardened» (PowerPyx contro PC Gamer/Insider); isola dell'Ajax Gym; se la meditazione del capitolo 1 conta per il trofeo; poligoni 12 o 14 sfide; Randy nella lista degli Sconosciuti e folli e 16 o 18 auto; caveau fine capitolo 4 o 5; quale auto di Wyman sta in col-wyman-3/4; Waxman Island = Watson Island; bar dei Final Chapter (contea di Leonard ma sotto Ambrosia); Cesar CEO di Megamundo; Moreland 850 (produttore); nomi provvisori di luoghi non sulla mappa (Peanut Island, Osborn Reef, Bay Harbor…).

## 4s. Radio: canzoni e «La mia playlist» (v0.45.0, 18/11)
- `docs/js/views/playlist.js`: `allSongs()` unisce `tracks` e `highlights` di radio.json, id stabile `sng-<stazione>-<artista>-<titolo>`. Tre schede in `#/cultura` (`?v=canzoni`, `?v=playlist`). Il cuore salva in `progress.playlist` (campo nuovo in emptyState, niente migrazione: `migrate` completa i campi mancanti), quindi viaggia anche con il profilo online. Canzoni aggiunte a mano: `custom: true`.
- Apple Music: solo link di ricerca (una playlist vera richiederebbe MusicKit e l'accesso all'account). «Copia l'elenco» / «Condividi» per passare la lista ad altre app.

## 4t. Radio come giradischi (v0.47.0, 18/11)
- `docs/js/views/radio.js`: scheda «Stazioni» = giradischi (`.deck`: disco `.disc` che gira, braccio, «In onda» con equalizzatore, nome in Pricedown al neon, sintonia prev/next, scaletta con le prime 8 canzoni e il resto in «Altre N canzoni») + cassa dei dischi (`.crate` / `.sleeve`: copertina quadrata col vinile che sporge e scivola fuori al passaggio). La stazione scelta sta in `?st=` e in localStorage (`leonida:radio:last`); `#/cultura/<id stazione>` apre il giradischi su quella stazione.
- Colore della stazione: campo `color` in radio.json se c'è, altrimenti la tabella COLORS in radio.js. Logo assente → iniziali in Pricedown sull'etichetta.

## 4u. Caccia alle cose mancanti (v0.48–0.50, 18/11 notte)
- Otto squadre (brief in scratchpad/caccia/BRIEF.md e compiti/): musica, trucchi/sfide/segreti, missioni, mappa e Mondo, personaggi, collezionabili, Come si gioca, arsenale. Prima giro su Fable interrotto dal limite: rilanciate con Opus.
- Aggiunti: `mec-trucchi` (61 trucchi), 8 `act-sfide-*` (80 sfide), 28 missioni (serie di Andy, Billy 3-5, Kirk, Pilot Pete, tappe brevi `kind: compito`), 37 personaggi (gruppi in `GROUPS` di editoriale.js), 47 canzoni e stazione The Sniper of La Perle, 6 animali + varianti, 4 schede di meccaniche (salvataggi, mappa, impostazioni, bonus edizioni), 15 consigli (tip-prime-10), 221 POI, 32 voci Mondo, 100 veicoli verificati.
- Tolti: chr-kai, chr-n3on; 11 armi/oggetti dei leak (wpn-micro-smg, wpn-shrewsbury-pump, wpn-hl-pistol, wpn-lock-pick, wpn-immobilizer-bypass, wpn-tracker-jammer, wpn-fire-bottle, wpn-zipties, wpn-usb-drive, wpn-backpack, wpn-face-wrap); veh-ocelot-jagular, veh-hvy-dozer, veh-mtl-fire-truck; poi-st-belville-train-station, poi-gsm-stockyard-clothing (Millport spostata in dis-mount-kalaga).
- Spoiler: «Starting From Zero» (brano dell'album = missione del capitolo 4) tolto da brd-the-album e da una news. «Ocean Beach», «Coffee Break», «Tyrone», «Welcome to Vice City», «Sinfrontera National Bank» sono anche nomi di luoghi/persone/slogan: il controllo anti-spoiler li segnala, ma non sono spoiler.
- Ordine delle missioni: rinumerato per atto (interi) dopo l'inserimento delle nuove.
- POI nelle regioni raggruppati per famiglia (`poiGroups` in atlante.js) sopra le 14 voci.
- Ancora da fare: soluzioni capitoli 4-5 (nessuna guida al 18/11 notte), 5 trofei segreti, posizioni di fenicotteri/stili/canestri/salti/sotto i ponti, ~350 carte, titoli italiani delle missioni, loghi di 13 stazioni, xy dei POI nuovi. Fonti migliori per ripartire: API REST di PowerPyx (`/wp-json/wp/v2/posts?search=gta%206`), DayOne (playday.one), API di gta.wiki (Radio Stations in GTA VI, categorie), feed RSS di GameSpot (testo intero).

## 4v. Da non perdere, trucchi a parte, giro di caccia ogni 12 ore (v0.51.0, 19/11 notte)
- Missioni: `chapterMissables` in missioni.js mette in cima a ogni capitolo iniziato «Da non perdere in questo capitolo»: `acts[].missables` (bonus/soldi del capitolo, campo nuovo in missions.json), trofei con `timing.until`, collezionabili con `missable`+`chapter`, avvisi delle missioni (quelli delle missioni non ancora iniziate in una sottosezione chiusa e sotto l'inchiostro).
- Trucchi: `mec-trucchi` è fuori dall'indice di Come si gioca; pagina `#/trucchi` (Altro › Trucchi) dietro un avviso (sessionStorage `leonida:trucchi:visti`).
- Radio: tolta la banda della sintonia; frecce con il nome della stazione prima/dopo.
- Giro di caccia: kit in `scripts/caccia/` (README con procedura e fonti). Il promemoria delle 12 ore (`trig_01Q3XBNUHuyUn74MzqGTGLgA`) è stato **cancellato il 20/11** dalla chat Caccia e news su richiesta di Mike: il giro parte solo quando lo dice lui, nessun promemoria da ricreare.

## 4w. Community: La banda e Scatti (v0.52.0, 19/11)
- SQL in `scripts/supabase/community.sql` (Mike lo incolla nel SQL Editor): funzione `banda(p_email)` (nick + missioni/collezionabili/trofei/attività, niente email né appunti; esclude chi ha `settings.banda = false`); tabelle `scatti`, `scatti_like`, `scatti_commenti` chiuse da RLS, funzioni `scatto_nuovo`, `scatti_lista`, `scatto_togli` (nasconde), `scatto_piace`, `scatto_commenta`, `scatto_commenti`, `commento_togli`; bucket pubblico `scatti` (solo jpeg, max 2 MB) con policy di sola scrittura per anon.
- App: `docs/js/views/banda.js` (`summary()` calcola i progressi sui dati della guida; per «tu» usa lo stato locale), `docs/js/views/scatti.js` (rimpicciolisce a 1600 px JPEG 0.82, carica con `cloud.uploadPhoto`, poi `scatto_nuovo`). `cloud.call(fn, body)` aggiunge l'email del profilo.
- Spoiler: della banda si vedono solo i numeri delle missioni; foto con `spoiler` > capitolo raggiunto sfocate finché non le tocchi.
- Limiti: con l'accesso solo email chiunque abbia l'app può caricare. Le foto «tolte» restano nel bucket (si cancellano dal pannello Storage di Supabase).

- v0.52.1: su richiesta di Mike gli Scatti non sono più una sezione a sé ma un blocco in fondo alla pagina della banda (`galleryBlock()` in scatti.js, `#scatti`; la rotta `#/scatti` apre la banda e scorre lì). Ordine della barra: … Collezionabili, Trofei, La banda, Radio, Mondo, News, Appunti.

## 4x. Secondo giro di caccia e pre-release 1.0 (v0.52.2, 19/11 mattina)
- Dieci squadre (le otto più `news` e `controllo-missioni`; compiti in `scripts/caccia/compiti/`, sempre con Opus). Mike ha trovato giocando che il Prologo aveva passi inventati: da qui la squadra di controllo che rilegge Prologo e capitoli 1-2 contro due guide (53 missioni corrette o confermate).
- Applicato: 15 news + 7 aggiornate; 77 missioni toccate (Prologo, Clear Skies, Home Sweet Home, Cartel Heist corretti; 16 missioni dei capitoli 4-5 ridotte al solo obiettivo di partenza perché i passi venivano dai riassunti di PC Gamer); ordine capitolo 1 (Clean Up After Donnie prima di Buck Me) e capitolo 2 (Ambulance Chaser dopo Painkiller Supplier); `acts[].missables` con `id` e `title`; 856 collezionabili nuovi (480 carte, 100 canestri, 202 ponti, 108 WAiNK, 112 AHOL, 15 rottami di Wyman, 7 scambi di libri); radio 462 canzoni; `stats` di 111 veicoli con gli assi veri (`speed, accel, handling, offroad, strength`); 40 immagini nuove in `scripts/immagini.json` (20 ritratti); 3 personaggi; 22 voci Mondo; 9 POI spostati di regione.
- Tolte perché deboli: la pista UFO di Sportskeeda e l'indizio da un commento su TrueAchievements nei trofei segreti; il logo di WKTT preso da GTA IV; i nomi di missione dai `relatedIds` di `tip-fine-capitolo-1`.
- Immagini: 179 file elencati in `scripts/immagini.json` non sono ancora scaricati (l'app usa la copia online). Mike deve lanciare `node scripts/scarica-immagini.mjs` sul Mac prima della 1.0.
- Cosa manca e fonti nuove: `scripts/caccia/README.md` («Cosa manca alla fine del giro del 19/11», «Fonti nuove»).

## 4y. Giro errori, ultima pre-release prima della 1.0 (v0.52.3, 19/11)
- I tre errori di Mike: (1) Prologo sbagliato → squadra `controllo-missioni` (4x); (2) volti mancanti → `face(x)` e `monogram(x)` in shared.js (foto locale → `imageUrl` online → iniziali; app.js mette le iniziali se la foto non si carica, `data-mono`), in Home entrano tutti i personaggi con `firstMissionId`; (3) «Da non perdere» illeggibile → `chapterMissables` riscritto: lista con sezioni «Prima che il capitolo finisca» / «Nelle missioni» / avvisi futuri sotto inchiostro / missioni già fatte, chiuso di partenza (stato in sessionStorage `leonida:dnp:<act>`), spunte automatiche (trofeo, collezionabile, missione) e manuali solo per `acts[].missables` (`progress.toggleCheck`, mappa `checks` nello stato), collezionabili con lo stesso motivo in una riga con le pillole.
- specs.js: assi dei veicoli `speed, accel, handling, offroad, strength`; niente più barre di esempio (se mancano i dati, «In arrivo: barre delle statistiche»).
- collezionabili.js: le card mostrano `fatti / total del gioco` + «N posizioni note».
- Controllo automatico (script nello scratchpad `rc/crawl.cjs`): apre tutte le pagine raggiungibili dai link (3.620) e cerca errori JS, «undefined/NaN/null», pagine vuote, immagini 404. Pulito, a parte le 179 immagini da scaricare.
- **La 1.0 si pubblica solo quando Mike conferma.** Prima deve lanciare `node scripts/scarica-immagini.mjs` sul Mac (poi `git add -A`, commit, push).

## 4z. Terzo giro (v0.52.4, 19/11 pomeriggio)
- Nove squadre, solo sulle novità uscite dopo le 07 UTC (BRIEF con la sezione «Oggi»; compiti con la riga «STATO AL … giro 3»). Nuovo `scripts/caccia/dopo.py` (news in testa, immagini, elenco delle cose da fare a mano).
- Applicato: 11 news; 170 collezionabili (salti 129/130, voli 40/40, lanci 25/25); armi riconciliate con la tabella di IGN (7 nuove, 8 tolte: wpn-coil-shocker, wpn-duke-ar15, wpn-mp9, wpn-smoke, wpn-golf-ball, wpn-golf-club, wpn-pipe-wrench, wpn-hl-knife), varianti uniche negli `extras`; 11 veicoli nuovi, `price` = registrazione e valore di vendita; 115 + 38 `imageUrl` passati da Fandom a gta.wiki; interpreti di 25 personaggi; mis-ring-the-bell; «Kolts» → «Kolt» ovunque; 7 POI spostati (6 a Vice Beach), tolta poi-st-redhill-train-station.
- Ancora aperto: vedi «Cosa manca alla fine del giro del 19/11 pomeriggio» in `scripts/caccia/README.md`.

## 5. Versione 1.0 (19/11 pomeriggio)
- Mike ha confermato la v0.52.4 e ha chiesto di pubblicare la 1.0 per darla ai colleghi. È la stessa guida della v0.52.4 con il numero 1.0.0 e il changelog per chi arriva nuovo. Da qui in poi le versioni sono 1.x: 1.0.1, 1.0.2… per giri di dati e correzioni, 1.1.0 per una funzione nuova (per esempio il confronto delle auto).
- Nella banda c'è già Lollo, un collega di Mike: da ora i profili su Supabase non sono più solo di prova. Niente test che scrivano nel database vero; il profilo `prova@leonida.test` resta nascosto dalla banda.

## 5b. Anteprima: Mike approva prima che vada online (dal 19/11 sera)
Da quando la guida è pubblica (colleghi che la usano), **niente va su `main` in `docs/` senza il via libera di Mike**, soprattutto la grafica. Le eccezioni le decide lui (per esempio i giri di soli dati).
- **Dove si lavora** (dal 20/11): sul ramo condiviso `sviluppo` (attraverso il ramo di sessione `claude/…`, vedi CLAUDE.md «Le chat di Leonida»). `main` resta alla versione online.
- **Come si fa vedere**: `node scripts/anteprima.mjs <nome> --radice <checkout di main>` copia `docs/` (css, js, data, index) in `docs/anteprima/<nome>/` di un checkout separato di `main` (`git worktree add <scratchpad>/main-wt origin/main`), con i percorsi di immagini/font/icone riscritti (`../../`), senza service worker e con la fascetta gialla «Anteprima». Lì si fa commit e `git push origin HEAD:main`: su `main` arriva solo la cartella `anteprima/` (più eventuali immagini nuove), non il codice della guida. Indirizzo: `https://mike3am-dev.github.io/leonida/anteprima/<nome>/`.
- **Nome nuovo a ogni giro** (`1.0.1-a`, `1.0.1-b`…): il telefono tiene in memoria i file già visti. Lo script cancella le anteprime vecchie.
- **Insieme al link** si mandano a Mike gli screenshot (iPhone 393×852 e Duo 703×1000, chiaro e scuro) con SendUserFile.
- **Via libera** (Mike dice «pubblica»): su `sviluppo` `git merge origin/main`, si cancella `docs/anteprima/`, si alza la versione (sw.js, app.js, meta.json), validazione, controllo delle pagine, e solo allora `git push origin HEAD:main`.
- L'anteprima usa gli stessi progressi (se aperta nello stesso browser) e lo stesso Supabase della guida vera: in un'anteprima non si cambia il formato dei progressi e non si lanciano SQL nuovi che rompano l'app online (le funzioni nuove si aggiungono, le vecchie restano).
- Le miniature (`python3 scripts/miniature.py`, serve Pillow: si lancia in sessione) vanno rifatte dopo che Mike ha scaricato immagini nuove.

## 5c. Versione 1.0.1 (online dal 19/11 sera)
Passata da tre anteprime (`1.0.1-a`, `-b`, `-c`); Mike ha detto «pubblica la 1.0.1» dopo la terza. Dentro:
- **Mappa**: i segnaposto e le Polaroid usano le miniature (`mini()` in shared.js, `scripts/miniature.py`); foto in memoria da ~315 MB a ~37 MB. Da far provare a Dada su iPhone.
- **Home**: `storyHero()` in sessione.js, un banner solo (missione, capitolo, «N di X», barra, Apri la missione + Compiuta grandi uguali); niente striscia «Ora stai giocando» in Home, nell'elenco Missioni e nella pagina di quella missione.
- **Missioni (richieste di Mike sull'anteprima a)**: titoli in chiaro per il capitolo in cui sei (`spoiler.missionNamed`, `reachedAct`; i capitoli futuri restano coperti; in modalità vergine restano coperti tutti); righe nuove `missionRow` (Fatta / In corso / La prossima a parole, la missione in corso è l'unica evidenziata); «Dove eravamo rimasti» (`recap`: riassunto dell'ultima missione fatta + «Prima ancora») al posto di «La storia», che resta solo per chi non ha iniziato; il «Da non perdere» non è più nell'elenco: gli avvisi della missione stanno in cima alla sua pagina e le scadenze del capitolo in un riquadro chiuso in fondo alla pagina della missione.
- **Scheda della missione**: i consigli stanno nel taccuino PRIMA di «Cosa devi fare»; i consigli che anticipano la trama iniziano con `[spoiler] ` nei dati (59 su 409, classificati da una squadra) e si vedono sotto l'inchiostro. Regola per i giri: un consiglio che rivela un evento della missione va scritto con quel prefisso.
- **Titoli**: formato «italiano (inglese)» (`titleHtml`). Capitolo 1 tutto in italiano: 10 titoli con due o più fonti (video di giocatori italiani + trofei PSN), 4 con due fonti di cui una GTABase.it, 6 con una fonte sola (`titleNote` nei dati: Armi in spalla, Tasche bucate, Ripulisci le tracce di Donnie, Nel fango fino al collo, Ricalibrarsi, Dimissioni anticipate): da confermare a schermo. La lista che Mike ha preso da GTABase.it è una traduzione letterale (ha anche le alternative con la barra) e in più punti è smentita dal gioco («Chi dorme…» è nel testo del trofeo): non usata dove c'è la prova. Capitoli in italiano dai nomi dei trofei. Le facoltative del capitolo 1 sono ancora in inglese.
- **Scatti**: `scatto_cancella` (autore o admin, cancella anche il file), `scatto_modifica`, `commento_cancella`, admin con codice (`scripts/supabase/admin-codice.sql` + `scatti-admin.sql`, da lanciare da Mike). Il primo codice scelto da Mike è finito in uno screenshot in chat: deve sceglierne un altro.
- **Screenshot per Mike**: sempre Duo aperto (703×1000) e iPhone Pro Max (440×956), con `scratchpad/rc/vedi.cjs` (da portare in `scripts/`).

## 5d. Versione 1.1.0: barra a quattro voci (online dal 19/11 sera, con l'OK di Mike)
Provata nelle anteprime `1.1-a` … `1.1-h`, pubblicata come v1.1.0 insieme ai dati del giro di caccia della sera (capitolo 4, cast, radio, carte, pesci, garage, 21 luoghi della mappa ufficiale, nomi dei veicoli). Monogrammi: le iniziali saltano i soprannomi tra «» («Francisco «Cisco» Delgado» → FD). Grafico di completezza: `--ieri` confronta con l'ultima riga del giorno prima (74,2% contro 46,7%). Solo per i telefoni (`html[data-posture="closed"]`): sul Duo aperto la fila a sinistra non cambia.
- Barra: Home · Game · Social · News (`navHtml` in app.js). Game = tutte le sezioni di gioco (`game.isGamePath`), Social = La banda con gli Scatti (poi i Thread), News = News.
- Pagina `#/game` (`docs/js/views/game.js`): un tassello per sezione con un numero vivo, tutti uguali (il «Riprendi da» è stato tolto su richiesta di Mike); in fondo Trucchi e Cerca. La pagina «Altro» resta raggiungibile ma non è più nella barra.
- Dentro una sezione di gioco, sui telefoni, in alto a sinistra al posto di «GTA VI» c'è il pulsante «‹ Game» (`gameBack` in app.js) che riporta SEMPRE ai tasselli; le schede che scivolano da destra partono sotto la barra in alto, così il pulsante resta toccabile. Sui telefoni lo scorrimento col dito NON torna più indietro tra le pagine (Mike: «si comporta in modo strano»); chiude solo i fogli. Sul Duo tutto come prima.
- Ordine dei tasselli: quello della fila del Duo (Mike). I Thread andranno in Social.
- Mappa ufficiale di Rockstar (Mike, 19/11 sera; originale stampabile 5775×7900 CMYK in `mappa-ufficiale.jpg` alla radice, fuori da docs): allineata con le coste della base del gioco (`scripts/allinea-mappa-ufficiale.py`, somiglianza 0,96) e riproiettata in `docs/assets/img/mappa/leonida-ufficiale.webp` (2896×3700, 1,6 MB). Nella Mappa c'è la scelta «Mappa del gioco / Mappa ufficiale» (`BASES.ufficiale`, niente tessere). `riquadro(xy)` in mapboard.js dà il riquadro della griglia ufficiale (A-M × 1-9): compare nel foglio del punto e nella scheda del POI. Controllato su Port Gellhorn (E3), Ambrosia (E5), Waning Sands (E7), Capri (G3), Vice Beach (G8), Key Lento (L6).
- Anteprima 1.1-f (correzioni chieste da Mike, valgono anche sul Duo): tolta la striscia «Ora stai giocando» ovunque (la missione in corso sta in Home); meno spazio sopra il titolo delle pagine (`.page--top:empty + .page`, padding del telefono 16 px); il «bordino» delle testate con la foto era la foto che passava sotto il bordo semitrasparente (ora `background-clip: padding-box`) e la lineetta al neon a sinistra stava sotto il velo scuro (ora sopra); riquadro del capitolo in Missioni ridisegnato (`chapterCard`: foto del capitolo dietro, anello, titolo, «N di 21 · ne mancano», barra a segmenti, facoltative, pulsante con la missione in corso o la prossima).
- Corretto insieme: i trattini del capitolo nella pagina Missioni uscivano dal riquadro sugli iPhone.
- Controllo dei difetti grafici sugli iPhone (19/11 sera, script `scratchpad/rc/fuori.cjs`: 439 pagine a 393 e 440 px, cerca cose che escono dallo schermo o dal riquadro e testo che non va a capo). Corretti: titoli grandi delle sezioni tagliati dal contatore (il contatore va sotto), schede «a colpo d'occhio» dei luoghi con le etichette lunghe che schiacciavano il valore (etichetta sopra il valore), indirizzi web che uscivano dal bordo (`overflow-wrap: anywhere`), riga «Capitolo raggiunto» delle Impostazioni (la tendina va sotto; prima si chiamava «Atto raggiunto»). Restano segnalati solo falsi allarmi: le strisce che scorrono di lato (regioni in Home, luoghi vicini, legami dei personaggi). Il controllo va rifatto prima di ogni rilascio grafico.

## 5e. Veicoli come nel gioco (anteprima 1.2-a, 20/11) e regola «il gioco di Mike batte tutto»
- Mike ha mandato le schermate del gioco (cartella `Screenshot/`, 19 foto della schermata Statistiche e della pagina Progresso / Veicoli). Regola nuova: le sue schermate e informazioni battono qualsiasi fonte (CLAUDE.md). Trascrizione e termini ufficiali in `scripts/caccia/gioco-mike.md`.
- Sezione **Veicoli** (prima «Garage»): `vehicles.json → groups` con le 6 schede del gioco e le classi con i totali esatti (557 = 277 + 280 «Veicoli di spicco» negli Speciali). Ogni veicolo ha `class` = id di classe (`coupe`, `muscle`, …, `sp-lowrider`) o `fuori-elenco` (treni, traghetto…: non contano). Riclassificazione del 20/11: 183 dall'elenco DayOne con le classi del gioco, 114 a mano, 42 dalla classe vecchia. `rating` = «Valutazione» del gioco (due numeri).
- Vista `veicoli.js`: schede, classi con «Scoperti X / Y» (il conto non supera mai il totale del gioco), ricerca, chiave del garage su ogni foto, «Aggiungi al garage» per i veicoli che nella guida non ci sono (`progress.myVehicles`, finiscono nel Pacchetto per Claude). Scheda: «Statistiche del modello base» con i nomi italiani e il valore.
- Da fare: classi con più voci del totale del gioco (doppioni, varianti che sono Veicoli di spicco): affidato al giro di caccia 5. Pubblicare come 1.2.0 con l'OK di Mike.

**Rilascio 1.2 (Mike, 20/11 sera):** non chiedere più l'OK per pubblicare: la 1.2 ha ancora molte cose da fare prima. Si lavora in anteprima e si pubblica solo quando lo dice Mike.

**«Come si gioca» è il posto dove finisce quello che scopriamo (Mike, 20/11 sera):** niente pagina «Statistiche» a parte e niente contatori dettagliati da compilare (né nei personaggi né altrove). Le statistiche del gioco e tutto ciò che scopriamo man mano arricchiscono, correggono o confermano le descrizioni delle schede di «Come si gioca» (`meccaniche.json`).

**Mappa (decisione di Mike, 20/11 sera):** niente coordinate prese da gtasixmap/IGN («troppe cose, la mappa ce l'ho nel gioco»). La mappa NON si tocca più finché Mike non decide come implementarla. Il file `mappa-mondo-xy-gtasixmap.json` del giro 5 è scartato.

## 5f. Bug: Safari si chiude su iPhone, mappa e Veicoli (chat Bug, 20/11 sera)
Segnalazione di Mike: Dada (iPhone 17 Pro Max, iOS 27.2) ha ancora il crash di Safari quando sblocca la mappa per esplorare e quando è in Veicoli. Entrambi sono memoria piena (non si riproduce su Chromium: corretto per ragionamento, da far provare a Dada).
- **Veicoli**: le schede e le righe della ricerca caricavano la foto intera (259 foto, ~92 megapixel ≈ 370 MB decodificati). Ora usano le miniature (`thumb()` in `veicoli.js`: `mini-m` 480 px nelle schede, `mini` 160 px nelle righe, poi foto locale e copia online). `scripts/miniature.py` fa anche quelle dei veicoli (7 MB in tutto, già nel repo): rilanciarlo dopo ogni scaricamento di immagini nuove.
- **Mappa**: su iPhone/iPad (`IOS` in `mapboard.js`) la mappa si muove con una trasformazione 2D (`panzoom(..., { flat: true })`, niente `translate3d`), zoom massimo 5 invece di 7, tessere fino al livello 5 e chieste solo quando il dito si ferma (220 ms; prima a ogni fotogramma del pizzico). Tolti tutti i `filter` dentro la mappa (ombra del filo rosso, colori delle Polaroid, grigio dei segnaposto «da trovare» e dei badge), che ingranditi diventano immagini enormi; a zoom alto le Polaroid hanno un'ombra netta invece che sfumata. Regola: **niente `filter` né ombre sfumate grandi dentro `.mapboard__content`**.
- Su `sviluppo` (anteprima `1.2-c`). Va online con la prossima versione, che porta la chat Pubblicazione.

## 5g. Veicoli più puliti (chat Bug, 20/11 sera, anteprima 1.2-d)
Richieste di Mike sulla sezione Veicoli:
- La fila delle schede (Auto, Motocicli…) non salta più quando tocchi: `render` legge dove era la fila prima di ridisegnare e la rimette lì in un microtask (prima che la pagina venga disegnata). Le schede hanno solo il nome, senza «x/y».
- Filtro della classe: **Tutti / Scoperti** («Nel garage» confondeva, «Mi mancano» tolto). Resta la chiave sulle foto.
- Celle delle classi: «x / y» in alto a destra, allineato al titolo; via la barra e «xx nella guida»; sotto una descrizione di massimo due righe (`groups[].classes[].note` in `vehicles.json`). Coupé e Veicoli muscle hanno il testo del gioco; le altre 41 le ho scritte io: **da sostituire con il testo del gioco** quando Mike manda le schermate.
- Schede dei veicoli: via la marca sulla foto (c'è già nel nome). Regola di Mike: niente ripetizioni, se un'informazione è già chiara non si riscrive.

## 5h. Profilo criminale dichiarato (chat Grafica, 20/11 sera)
Richiesta di Mike: l'utente dice quale dei 4 profili è, e la banda lo vede a colpo d'occhio in classifica. Schermate mandate a Mike (regola degli schizzi, CLAUDE.md): approvato («sì mi piace»). Su `sviluppo`, anteprima `1.2-e`.
- Dati: `meccaniche.json → mec-profilo-criminale.profileTypes` (id, name, color del diavoletto del gioco, short). Progressi: `state.crime` = id (campo facoltativo, niente migrazione).
- `docs/js/views/criminale.js`: riquadro in Home sotto «I tuoi progressi» (4 pulsanti col diavoletto, uno acceso; ritocco = spento), `tag()` per l'etichetta in classifica e nel confronto della banda.
- Banda: gli altri si leggono da `progressi.crime`. La funzione `banda` di `scripts/supabase/community.sql` passa anche `crime` dentro `progressi`: **Mike l'ha rilanciata in Supabase il 20/11 sera (fatto)**. Gli altri compaiono quando hanno la versione nuova e scelgono il loro.
- Decisione di Mike (20/11 sera): per ora un profilo solo per giocatore; se Jason e Lucia ne hanno uno a testa «poi capiremo». Quinto livello («Irredeemable») non incluso: manca il nome italiano.
- Nelle prove con Playwright le chiamate a Supabase vanno intercettate con `p.route(/supabase\.co/, …)` (il motivo a glob `**/supabase.co/**` NON le ferma).

## 6. Strumenti e verifiche prima di ogni push
- **Lezione del 18/11 (v0.44.0):** il rilascio (alzare VERSION/`__LEONIDA_VERSION__`, meta.json) NON va mai incatenato con `&&` dietro la prova nel browser: se il server locale si è spento la catena si ferma in silenzio e si pubblicano i dati senza il numero nuovo. Prima del commit controllare sempre `grep -o "__LEONIDA_VERSION__ = '[^']*'" docs/js/app.js`.
**Fine di ogni aggiornamento (richiesta di Mike, 18/11):** `node scripts/completezza.mjs --salva "vX.Y.Z"` e poi `node scripts/grafico-completezza.mjs <scratchpad>/completezza.png`, e mandare il PNG a Mike (SendUserFile): barre per sezione, in rosa chiaro la crescita rispetto all'aggiornamento prima. I totali delle categorie dei collezionabili stanno in `collectibles.categories[].total`.
**Attenzione (12/11):** controllare il codice di uscita di `node scripts/validate.mjs` (deve essere 0), non solo l'ultima riga: gli errori «✗» stanno sopra il riepilogo. Le proposte dei giri news a volte usano `"append: …"` dentro un campo (testo da accodare, id da aggiungere, oggetto JSON per `extras`): vanno interpretati, non scritti così.
`node scripts/validate.mjs` · `node --input-type=module --check < file.js` per ogni JS toccato · screenshot con Playwright (`/opt/node-tools/node_modules/playwright/index.js`, server locale `python3 -m http.server 8080 --directory docs`, script di esempio nello scratchpad della sessione, viewport 703×1000) · commit `git -c user.name="Mike" -c user.email="frodob1987@gmail.com"` · push su main · attesa del deploy e verifica con `curl -s https://mike3am-dev.github.io/leonida/js/app.js | grep __LEONIDA_VERSION__` (GitHub Pages a volte fallisce: rilanciare i job falliti del run «pages build and deployment»; se il rilancio resta «queued» a lungo, un nuovo commit fa partire un build nuovo che lo sostituisce). Se il push è rifiutato, Mike ha fatto commit di foto: `git pull --no-rebase` e ripush.
