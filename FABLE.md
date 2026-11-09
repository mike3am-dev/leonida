# Lavori per Fable 5.2 — dal 22 novembre

Idea di Mike (9/11): tre giorni dopo l'uscita il web sarà pieno di guide, mappe e dati. A quel punto si passa a **Fable 5.2** per i lavori lunghi e pesanti, dove rende molto più di Opus 5.5. Opus resta per i giri news e le modifiche quotidiane.

**Budget:** nel piano di Mike Fable può usare al massimo metà del consumo settimanale. Si usa solo per le voci qui sotto, una alla volta, con un obiettivo chiaro.

**Come si lavora:**
- Ogni voce si lancia in una sessione dedicata. Il prompt è il titolo della voce più «leggi CLAUDE.md, STATO.md e FABLE.md».
- Regole fisse che valgono sempre: etichette, scudo spoiler (`spoiler.missionName`), niente copia in blocco da database protetti (STATO 4n), niente aggiramento di blocchi anti-bot.

## In ordine di priorità

### 1. La grande ingestione (giorno 22)
Obiettivo: riempire la guida in un colpo solo, incrociando le fonti.
- **Missioni:** elenco completo, capitoli con i titoli veri, protagonista, regione, `contact`, `objectives[]`, `choice.irreversible`, `extraObjectives` (medaglie), `tips`. I nomi delle missioni future non devono comparire da nessuna parte.
- **Trofei:** lista ufficiale con `scripts/importa-trofei.mjs`, se non è già stata importata, più i consigli su come ottenerli.
- **Collezionabili:** riempire le categorie vuote (Relitti, Riviste, Salti, Murales…) con la riga «zona: punto preciso», le coordinate `xy` e quanti ne servono per il 100%.
- **Struttura del 100%:** progettarla solo adesso, quando la lista vera è nota (era stata rimandata di proposito).
- **Colpi:** capire come funzionano in GTA VI (approcci, squadra, preparazioni) e solo dopo disegnare la «lavagna» (rimandata dall'arbitro).
- **Fonti:** la tabella «giro guide» in CLAUDE.md. Due guide che concordano → `verificato`.

### 2. Foto dello schermo → dati
Mike fotografa la TV con il telefono e manda le foto; il modello legge e riempie le schede.
- Esempi: obiettivi della missione, schermata delle statistiche (100%), barre di un'arma o di un'auto, menu dell'Ammu-Nation con i prezzi, lista dei trofei, messaggi del telefono di gioco.
- Da preparare: decidere come Mike manda le foto (in chat, oppure in una cartella condivisa) e uno schema fisso da riempire.

### 3. Dove sono? Una foto al posto giusto sulla mappa
Da uno screenshot si riconosce il punto di Leonida e si piazza sulla mappa (collezionabile, luogo trovato, Polaroid). Va provato su 10 foto con posizione nota, prima di usarlo davvero.

### 4. Riordino della grafica senza regressioni
`docs/css/components.css` è cresciuto a strati (oltre 1.800 righe di regole che si sovrascrivono). Va consolidato in file per sezione.
- **Vincolo:** sul Duo aperto (703×1000) e sull'iPhone (430×932) non cambia un pixel.
- **Controllo:** prima e dopo si fanno gli screenshot di tutte le pagine con Playwright e si confrontano automaticamente.

### 5. Mappa in 3D (esperimento, solo se le prime quattro sono fatte)
Tre strade, dalla più realistica alla più ambiziosa:
- **a) Mappa inclinata «2.5D».** La mappa attuale vista in prospettiva, con un leggero rilievo, i grattacieli di Vice City come blocchi estrusi e il «volo» verso una regione. Costo basso, regge sull'iPhone, nessun dato nuovo da trovare. È la strada consigliata.
- **b) Rilievo vero.** Serve una mappa delle altezze di Leonida. Dopo l'uscita i dataminer di solito la ricavano dal gioco: se esce ed è usabile (licenza), si costruisce un terreno 3D con three.js, che va messo nel repo per funzionare offline. La mappa diventa lo strato sopra, con nebbia leggera, acqua e pin.
- **c) Il percorso della missione in volo.** Una camera che segue il tragitto sul terreno 3D, dal Taccuino. Richiede (b) e i tragitti delle missioni.

**Rischi:** peso e batteria sull'iPhone (andare piano, la versione 2D resta), la licenza dei dati e il tempo di sviluppo. Si decide dopo un prototipo di (a) da mostrare a Mike.

## Altre idee da valutare il 22
- Confronto e ordinamento in Garage e Armi con le statistiche vere («Ordina per»), rimandato alla seconda settimana.
- Trofei PSN automatici con Supabase e il codice NPSSO di Mike: idea già approvata, da fare dopo la lista ufficiale.
- Supabase per sincronizzare i progressi tra iPhone e Mac.
