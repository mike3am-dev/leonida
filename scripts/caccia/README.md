# Giro di caccia — come si fa

**Cos'è.** Una passata a tappeto per trovare quello che manca nella guida o che è superato: otto squadre in parallelo, una per ambito, che confrontano i dati con tutto ciò che le fonti hanno pubblicato fino a quel momento. Nata il 18/11/2026 notte, quando Mike ha trovato da solo «Feels» su Flash FM e la guida non ce l'aveva: quel giro ha portato 61 trucchi, 80 sfide, 28 missioni, 37 personaggi, 221 punti d'interesse e ha scovato uno spoiler già online.

**Quando.** Ogni 12 ore finché la guida non è esaustiva (Mike, 18/11). C'è un promemoria programmato che lo ricorda; il giro parte solo quando Mike dice sì. Momenti in cui le fonti esplodono: l'uscita in America (sera del 18/11 ora italiana) e il primo weekend (21-23/11).

## Procedura (coordinatore)
1. **Prima di partire**: leggi CLAUDE.md, STATO.md (sezioni 4u e successive: cosa è stato fatto e cosa manca), lancia `node scripts/completezza.mjs` per avere i numeri attuali.
2. **Aggiorna i compiti**: in `compiti/*.md` le righe di stato («Stato: … 56/255 …», «due ore fa nessuna guida aveva…») sono di un giro vecchio: riscrivile con i numeri di oggi e con l'elenco «ancora da fare» di STATO.
3. **Cartella di lavoro**: crea `<scratchpad>/caccia/` e copiaci `BRIEF.md` sostituendo `<CARTELLA>` con il percorso vero.
4. **Lancia le otto squadre in parallelo** (Agent, in background, modello Opus se il limite di Fable è vicino: il primo giro si è fermato tutto insieme sul limite). Prompt di ognuna: «Leggi e segui `<scratchpad>/caccia/BRIEF.md` e il tuo compito `<repo>/scripts/caccia/compiti/<nome>.md`. Il tuo nome file di uscita è `<nome>`.»
   Squadre: `musica`, `trucchi-segreti`, `missioni`, `mappa-mondo`, `personaggi`, `collezionabili`, `come-si-gioca`, `arsenale`.
5. **Quando una squadra finisce**, leggi il rapporto e controlla le scelte dubbie (nomi nuovi, «verificato» con una sola fonte, testi che citano titoli di missioni, trucchi come spazi speciali per eludere il controllo anti-spoiler: vanno tolti).
6. **Applica** tutte le squadre insieme, da repo:
   - unisci i file in uno: le update sullo stesso id di squadre diverse si sostituiscono (i campi interi: liste comprese) → guarda i doppioni prima;
   - `python3 -I scripts/caccia/prova.py <unione.json>` → «OK»;
   - `python3 -I scripts/caccia/applica.py scripts/caccia/vuoto.json <unione.json>`;
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

## Cosa mancava alla fine del giro del 18/11 (da ricontrollare per primo)
Soluzioni dei capitoli 4 e 5; metodo dei 5 trofei segreti; posizioni di fenicotteri (22/125), stili (11/79), canestri (8/100), salti (24/130), sotto i ponti, voli tra i palazzi, lanci col paracadute, scoperte subacquee e set di Kenton; ~350 carte; elenco dei 255 animali; titoli italiani delle missioni; loghi di 13 stazioni radio; coordinate `xy` dei POI nuovi; prezzi delle armi comuni e potenziamenti; cast dei doppiatori (riservatezza fino al 19/11).
