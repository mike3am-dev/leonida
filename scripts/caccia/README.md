# Giro di caccia — come si fa

**Cos'è.** Una passata a tappeto per trovare quello che manca nella guida o che è superato: otto squadre in parallelo, una per ambito, che confrontano i dati con tutto ciò che le fonti hanno pubblicato fino a quel momento. Nata il 18/11/2026 notte, quando Mike ha trovato da solo «Feels» su Flash FM e la guida non ce l'aveva: quel giro ha portato 61 trucchi, 80 sfide, 28 missioni, 37 personaggi, 221 punti d'interesse e ha scovato uno spoiler già online.

**Quando.** Ogni 12 ore finché la guida non è esaustiva (Mike, 18/11). C'è un promemoria programmato che lo ricorda; il giro parte solo quando Mike dice sì. Momenti in cui le fonti esplodono: l'uscita in America (sera del 18/11 ora italiana) e il primo weekend (21-23/11).

## Procedura (coordinatore)
1. **Prima di partire**: leggi CLAUDE.md, STATO.md (sezioni 4u e successive: cosa è stato fatto e cosa manca), lancia `node scripts/completezza.mjs` per avere i numeri attuali.
2. **Aggiorna i compiti**: in `compiti/*.md` le righe di stato («Stato: … 56/255 …», «due ore fa nessuna guida aveva…») sono di un giro vecchio: riscrivile con i numeri di oggi e con l'elenco «ancora da fare» di STATO.
3. **Cartella di lavoro**: crea `<scratchpad>/caccia/` e copiaci `BRIEF.md` sostituendo `<CARTELLA>` con il percorso vero.
4. **Lancia le otto squadre in parallelo** (Agent, in background, modello Opus se il limite di Fable è vicino: il primo giro si è fermato tutto insieme sul limite). Prompt di ognuna: «Leggi e segui `<scratchpad>/caccia/BRIEF.md` e il tuo compito `<repo>/scripts/caccia/compiti/<nome>.md`. Il tuo nome file di uscita è `<nome>`.»
   Squadre: `musica`, `trucchi-segreti`, `missioni` (capitoli 3-5), `controllo-missioni` (Prologo e capitoli 1-2: solo controllo con due guide), `mappa-mondo`, `personaggi`, `collezionabili`, `come-si-gioca`, `arsenale`, `news` (il giro news di CLAUDE.md). Dieci in tutto dal 19/11.
5. **Quando una squadra finisce**, leggi il rapporto e controlla le scelte dubbie (nomi nuovi, «verificato» con una sola fonte, testi che citano titoli di missioni, trucchi come spazi speciali per eludere il controllo anti-spoiler: vanno tolti).
6. **Applica** tutte le squadre insieme, da repo:
   - unisci i file in uno: le update sullo stesso id di squadre diverse si sostituiscono (i campi interi: liste comprese) → guarda i doppioni prima;
   - `python3 -I scripts/caccia/prova.py <unione.json>` → «OK»;
   - `python3 -I scripts/caccia/applica.py scripts/caccia/vuoto.json <unione.json>`;
   - `python3 -I scripts/caccia/dopo.py <cartella del giro>`: porta in testa le notizie nuove, collega le immagini dei file `*-immagini.json` (voce + `scripts/immagini.json`) ed elenca ciò che resta da fare a mano;
   - file `*-togliere.json`: le cancellazioni le fai a mano (controlla i riferimenti con grep: relatedIds, GROUPS in `docs/js/views/editoriale.js`);
   - file `*-immagini.json`: metti `image` (percorso locale) + `imageUrl` (fallback) nella voce e aggiungi la riga in `scripts/immagini.json`;
   - personaggi nuovi → aggiungili ai gruppi `GROUPS` di `editoriale.js`; missioni nuove → rinumera `order` per atto con interi.
7. **Controllo spoiler globale**: cerca in tutti i file (non missions.json) i titoli delle missioni dei capitoli ≥ 2 dentro testi con `spoilerLevel` più basso. Falsi positivi noti: Ocean Beach, Coffee Break, Tyrone, Welcome to Vice City, Sinfrontera National Bank (luoghi, persone, slogan).
8. **Rilascio** come da CLAUDE.md (versione, changelog, validazione, prova nel browser NON incatenata con `&&` al rilascio, commit, push, verifica live), poi grafico di completezza e riepilogo a Mike con le 5 cose più importanti «che ci stavamo perdendo».

## Fonti che hanno funzionato (18/11)
- **PowerPyx** — fonte n.1. L'API REST restituisce tutte le pagine GTA 6 in 3 richieste: `https://www.powerpyx.com/wp-json/wp/v2/posts?search=gta%206&per_page=100&page=1..3&_fields=slug,link,modified,title,content` (ordina per `modified` per vedere cosa è nuovo). Feed: `/feed/`. Righe «Reward:» e «Quest Giver» nelle missioni.
- **DayOne (playday.one)** — elenchi completi e firmati: armi con barre, auto/moto/barche/aerei/servizi con statistiche, equipaggiamento, trucchi, caccia (animali con habitat e arma). Indice dal feed `https://playday.one/feed/?paged=N`.
- **gta.wiki (solo API, mai gta.fandom.com)** — `Radio Stations in GTA VI` (scalette dal gioco), categorie `Characters_in_GTA_VI`, `Vehicles_in_GTA_VI`, `Businesses_in_GTA_VI`, `Real-world_people_credited_on_GTA_VI`; `list=recentchanges` per le novità.
- **GameSpot** — l'HTML blocca (403), ma i feed `https://www.gamespot.com/feeds/news/`, `/feeds/game-news`, `/feeds/mashup/` hanno il testo completo.
- **VGC** — walkthrough del capitolo 1 e guide di sistema: hub `https://www.videogameschronicle.com/guide/grand-theft-auto-6-complete-walkthrough-hub/` (feed: `/feed/`).
- **PC Gamer** — `/games/grand-theft-auto/gta-6-…` (cheats-list, mission list, criminal profile, romance, steal cars, slim-jim, snap-gun, clone-keys, military base, safe codes, save game).
- **Insider Gaming** — 100%, sfide, profili criminali, forma fisica, comandi, armi, elenco missioni (`every-chapter-story-mission-in-gta-6-game-length-explained`).
- **GTA BOOM** — walkthrough firmati con prezzi e codici (sitemap `https://www.gtaboom.com/sitemap-editorial-0.xml`), feed `/rss`.
- **Kotaku** — prove sul campo (mappa a piedi, benzina), 32 consigli senza spoiler, diretta del lancio con i segreti.
- **GamesRadar, Eurogamer, Push Square, Mashable, Rock Paper Shotgun** — conferme e seconde fonti; **The Big Lead** per i collezionabili (fermo dal 18/11 pomeriggio).
- Musica: gta.wiki (sopra), Pulse Nigeria (AfroBank), HotNewHipHop, Loudwire, Billboard (album), pagina musica di Rockstar `https://www.rockstargames.com/VI/music`.
- Italiano: GameSource.it (100%), CoPlaNet (nomi dei trofei). Nessuna fonte italiana dà ancora i titoli italiani delle missioni.

**Da scartare** (fabbriche di contenuti o dati inventati): alcasthq, techwiser, leonidaverse, gmtreks, ggexplore, gamerfuzion, ofzenandcomputing, cultr, games.gg, GameLuster, New Music Magazine (220 canzoni senza fonte), siti `*.pages.dev`, thegameswiki.com, nettoge.com. Bloccati: Everyeye (anche il feed), ProGameGuides, PSNProfiles/Exophase.

## Fonti nuove del giro del 19/11
- **IGN Wiki** (ora viva, si scarica con curl): `https://www.ign.com/wikis/gta-6/<Pagina>` — `Walkthrough`, `Optional_Missions`, `All_Chapter_1_Missables`, `Collectible_Cards` (+18 pagine dei set), `Basketball_Hoop_Locations`, `Under_the_Bridge`, `Ahol_Street_Art`, `Landmarks`, `Sculptures`, `Curiosities`, `NoFlusher_Tags`, `PeeWee_Billboards`, `WAiNK_Locations`, `Kenton%27s_Treasures`, `Book_Swaps`, `GTA_6_100_Percent_Guide`. Ancora 404: `BASE_Jumps`, `Knife_Flights`, `Stunt_Jumps`, `Fishing`. La mappa `ign.com/maps/gta-6/leonida` dà i conteggi per categoria nel `__NEXT_DATA__`; le coordinate stanno in un servizio interno: NON interrogarlo senza il permesso di Mike.
- **Eurogamer** — hub firmato dei walkthrough `https://www.eurogamer.net/gta-6-walkthrough` (capitoli 1-2 e inizio del 3; seconda fonte per le missioni), indice `https://www.eurogamer.net/feed/guides`.
- **Push Square** — `https://www.pushsquare.com/guides/gta-6-guide` (~35 guide firmate: lista di Randy, Moses, WAiNK, relitti di Kenton, consigli).
- **GamesRadar** — 22 guide «come fare» (`gamesradar.com/games/grand-theft-auto/gta-6-…`: indice della mappa, soldi, bancomat, cuffie e podcast, rifornimento e riparazioni).
- **Polygon** (trucchi con sequenze), **GameRant** (lista lunga delle canzoni: va incrociata, ha errori di stazione), **Kotaku** (diretta del lancio), **Vice Central** RSS `https://vice-central.com/feed/`, **Metacritic** (`__NUXT_DATA__` nell'HTML: voto, numero di recensioni, testate).
- **DayOne** via API REST (`https://playday.one/wp-json/wp/v2/posts?slug=…`): gang con scheda di gioco, Ammu-Nation per zona, veicoli con le 5 barre (`speed, accel, handling, offroad, strength`).
- **gta.wiki**: registro dei caricamenti per trovare i ritratti (`list=logevents&letype=upload`), miniature con `iiurlwidth=600`, categoria `Businesses_in_GTA_VI` (454 aziende), marker di gtasixmap (`…workers.dev/markers`, stesso sistema `xy` dei nostri POI).
- Da scartare (aggiunte): eGamers.io, games.gg, Music Mundial, cwibc, demokratis; Sportskeeda mai da sola.

## Cosa manca alla fine del giro del 19/11 mattina (da ricontrollare per primo)
- **Missioni:** passi di 11 missioni (Tyrone, Get Your Wheels, Ocean Beach, Another Life, Tie Up Loose Ends, Rafa's Kidnapping, Heist Plans in Place, Starting From Zero, Taking Liberties, Unfinished Business, The End of the Road) e soluzioni vere di quasi tutti i capitoli 4-5 (16 missioni hanno solo l'obiettivo di partenza: i passi dedotti dai riassunti sono stati tolti). Seconda fonte per il capitolo 3 (oggi solo PowerPyx). Da verificare: Deposit Cash, Save for the Future, Clock Out, Donnie's Lost Drugs, Pick Up a Gun, Impounded Vehicle, Checking Out (chi è in moto). IGN elenca «Mandy's Dark Secret» e «Ring the Bell!» (capitolo 1): pagine ancora vuote. Titoli italiani: nessuna fonte.
- **Trofei:** metodo dei 5 segreti (nessuna guida); 41 sequenze dei trucchi su 61.
- **Collezionabili:** salti 24/130, voli tra i palazzi 0/40, lanci 0/25, fenicotteri 22/125, stili 11/79, animali 63/255 (e gli 8 unici di Bret), scoperte subacquee 6/33, riviste 23/27, 5 murales 1010, 3 carte senza posizione.
- **Personaggi:** 35 senza ritratto da nessuna parte (usano le iniziali); doppiatori (solo Lucia, Jason, Brian); schede di Nate, Rafa, Vinny, Raina, Kordell, Lorena (servono le guide dei capitoli 4-5).
- **Arsenale:** prezzi di pistole, mitra, fucili e accessori; nomi delle 9 armi bianche; barre di barche e aerei; auto 11-22 di Randy; i 280 veicoli «Standout». Molte immagini dei veicoli hanno ancora `imageUrl` su static.wikia.nocookie.net (Fandom): da sostituire con gta.wiki.
- **Radio:** 13 loghi; scalette di The Vault e The Sniper of La Perle; playlist ufficiali.
- **Mappa:** `xy` di ~390 POI; 6 palestre e 5 club dell'elenco IGN; 6 operazioni delle gang; stazioni forse doppie (ne abbiamo 32, PowerPyx 25, IGN 21).
- **Dubbi aperti (una versione scelta, «da verificare»):** conti correnti separati e solo il Risparmio Familiare in comune (GamesRadar); Squalo solo nel capitolo 4 (PowerPyx; Eurogamer dice «dal capitolo 4»); RydeMe dal capitolo 2 (PowerPyx) o 1 (GamesRadar); No Flusher 15 (IGN) o 23 (PowerPyx); ambulanza Declasse o Interstate; armi dei leak ancora in elenco (Coil Shocker, fucile subacqueo, AR-15, MP9).

## (Storico) Cosa mancava alla fine del giro del 18/11
Soluzioni dei capitoli 4 e 5; metodo dei 5 trofei segreti; posizioni di fenicotteri (22/125), stili (11/79), canestri (8/100), salti (24/130), sotto i ponti, voli tra i palazzi, lanci col paracadute, scoperte subacquee e set di Kenton; ~350 carte; elenco dei 255 animali; titoli italiani delle missioni; loghi di 13 stazioni radio; coordinate `xy` dei POI nuovi; prezzi delle armi comuni e potenziamenti; cast dei doppiatori (riservatezza fino al 19/11).
