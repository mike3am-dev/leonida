# Fonti nuove per il giro guide — controllo del 18/11/2026 (pomeriggio UTC)

Metodo: `curl -L` con UA Safari 18, nessun aggiramento (niente JS, niente cookie, niente retry contro Cloudflare). ✓ = 200 con contenuto; ✗ = 403 Cloudflare / 429 / 404. «Già usata» = il dominio compare già nei `sourceUrl` di `docs/data/*.json`.

Fatti emersi controllando le fonti (incidono sui campi): **non ci sono medaglie d'oro in missione e nemmeno il replay delle missioni** (lo dicono PowerPyx e GTABase) → `extraObjectives` resterà vuoto. La storia è divisa in 5 capitoli, il 100% vale circa il 60% del gioco (PowerPyx). Il «Progress Database» del gioco conta circa 3000 voci: 557 veicoli (277 modelli base), 255 animali, 125 fenicotteri alla cocaina (ne servono 100), carte collezionabili a set.

## 1. Guide e wiki (inglese)

| Fonte | Lingua | Cosa ha (al 18/11) | Raggiungibile | Qualità | Uso consigliato |
|---|---|---|---|---|---|
| **PowerPyx** — `powerpyx.com/gta-6-collectible-guide-progress-database/`, `/gta-6-100-completion-checklist-guide/`, ~40 pagine `gta-6-all-…-locations/` | EN | Missioni (walkthrough completo + circa 100 pagine singole), **collezionabili** (fenicotteri, set di carte, riviste/libri/fumetti, salti, scansioni Waink/curiosità/sculture/luoghi famosi, playlist, effigi), attività (rapine in banca, Payday Loans, Smash 'n' Grab, laboratori, operazioni delle gang, gare, droni, biliardo), negozi (Ammu-Nation, garage, mod shop, Pay 'n' Spray…), trofei + roadmap, trucchi | ✓ curl diretto | Ottima: firmata, datata 18/11, numeri coerenti con il gioco | Fonte n.1 per i collezionabili e il 100%. Finora l'abbiamo usata solo in `missions.json`: **le pagine dei collezionabili sono tutte da sfruttare** |
| **gta.wiki** (Weird Gloop) — API MediaWiki `gta.wiki/api.php` (`action=parse&prop=wikitext`, `list=recentchanges`) | EN | Pagine singole delle missioni in arrivo proprio ora (Lab Fees, Just a Scratch, Gear Up, Gone Fishing (GTA VI)…), veicoli, luoghi, strade; «Missions in GTA VI» aggiornata il 18/11 | ✓ (anche l'API JSON); licenza CC, robots ok | Buona, comunitaria con note e riferimenti; i contenuti ancora scarni crescono di ora in ora | Già usata (196 voci). Novità: usare l'**API** al posto dell'HTML: `recentchanges` per vedere cosa è cambiato dall'ultimo giro, wikitext per veicoli/modello reale voce per voce |
| **GTABase** — `/gta-6/missions/` (+ `/it/`), `/gta-6/map/`, `/gta-6/animals/` | EN (+IT/DE/ES/FR/PT tradotte) | Lista missioni con riassunto senza spoiler; **mappa con 202 luoghi in 30 categorie** (aggiornata il 18/11); lista animali; veicoli e armi | ✓ (alcune pagine 503 se si interroga troppo in fretta: rallentare) | Buona, ma **l'italiano è tradotto in automatico** («Sono andato a pescare» per *Gone Fishing*, mentre il nome ufficiale è «Chi dorme…»); il divieto di copiare il database in blocco resta | Già usata. Novità: mappa e animali, solo per controlli puntuali. **Mai i titoli italiani da `/it/`** |
| **VGC (Video Games Chronicle)** — `videogameschronicle.com/guide/gta-6-…-walkthrough/` | EN | Walkthrough missione per missione del capitolo 1 (Gone Fishing, Lab Fees, Just a Scratch, Unwanted Attention, Pipework, Hey Arnold, Island Dreams…), guide di sistema (vestiti, allarmi delle auto) | ✓ curl + RSS `/feed/` | Buona (firma di Jordan Middler, redazione vera) | **Nuova.** Seconda fonte per gli `objectives` → serve per arrivare a `verificato` (due guide che concordano) |
| **PC Gamer** — `/games/grand-theft-auto/gta-6-guide/`, `gta-6-mission-list/`, `gta-6-achievements-list/`, `gta-6-romance-jason-lucia/` | EN | Lista di missioni e capitoli, obiettivi, relazione Jason/Lucia, trucchi, bonus Ultimate | ✓ curl + RSS `/rss/` | Buona | **Nuova come guida.** Controllo incrociato di elenco/ordine missioni e del sistema di relazione |
| **Insider Gaming** — `/gta-6-guides-walkthroughs/`, `/gta-6-challenges/`, `/all-criminal-profiles-explained-gta-6/`, `/how-fitness-works-gta-6-strength-cardio-focus/`, `/gta-6-full-weapons-guide-types-and-how-to-buy/` | EN | Sfide, Profilo criminale, forma fisica, armi; la pagina radio è ancora quella di prima dell'uscita | ✓ | Buona (Tom Henderson e redazione) | Già usata per le news. Novità: **sfide e Profilo criminale** → `activities`, aiuti in Home |
| **GamerGuides** — `/grand-theft-auto-vi/psn-trophies/overview` | EN | Lista dei 55 trofei; walkthrough, mappa e database «non ancora live» | ✓ | Media: le stime (28-42 h, 6/10) non tornano con PowerPyx (200 h, 4/10), quindi sono generiche | Solo per controllare i trofei; ripassare fra qualche giorno per walkthrough e mappa |
| **IGN Wiki** — `ign.com/wikis/gta-6/…` | EN | Liste veicoli, armi, attività secondarie, luoghi, Profilo criminale: **ferme a prima dell'uscita** (ultimo aggiornamento tra giugno e agosto). Nessuna pagina Walkthrough (404) | ✓ HTML (prima era segnata ✗ in STATO) | Buona redazione, ma per ora vecchia | Ricontrollare dal 20/11; oggi niente di utile |
| **Game8** — `game8.co/games/GTA-6` | EN | Solo 15 articoli di prima dell'uscita + recensione 96/100; ha uno strumento di mappa interattiva generico | ✓ | Buona di solito; per ora vuota | Ricontrollare dal 20/11 |
| **Fextralife** — `gta6.wiki.fextralife.com` | EN | Wiki di prima dell'uscita («What We Want for Missions», teorie) | ✓ | Bassa per ora, speculativa | Non usare finché non ha dati di gioco |
| **GTA BOOM** — `/grand-theft-auto-6-588b/wiki`, `/every-gta-6-trophy-and-achievement-at-launch…` | EN | Wiki (personaggi, luoghi, veicoli, armi, attività), trofei, «Map & Checklist» (l'URL `/map` dà 404) | ✓ + RSS | Media | Già usata per le news; wiki solo come terza fonte |
| **Sportskeeda** — `/gta/all-gta-6-chapters-missions` | EN | 5 capitoli, 91 missioni, guide brevi | ✓ + RSS `/feed/gta` | Media-bassa (tanto volume, articoli rifatti) | Solo per confronto, mai come fonte unica |
| **Game Rant / TheGamer** | EN | Guide brevi «come fare» (rinfoderare l'arma, togliere la nebbia dalla mappa, salvare, locale di strip) | HTML ✗ (pagine di categoria 404), RSS ✓ | Media, articoli corti | Solo dall'RSS per i consigli (`tips`) |
| **Dexerto** — `/gta/gta-6-best-guides-for-launch-3429247/` | EN | Elenco di guide per il lancio | ✓ | Media | Indice, niente di più |
| **Eurogamer / Polygon** | EN | Nessuna guida di GTA 6 trovata (Eurogamer solo news; il feed di Polygon è vuoto) | Eurogamer ✓ HTML+RSS; Polygon ✗ RSS vuoto, guida 404 | — | Ricontrollare dal 20/11 |
| **gta6bible.com** | EN | (non ricontrollato) | ✗ con curl (Cloudflare); REST API solo con Playwright a JS spento, come da CLAUDE.md | Sottoinsieme delle altre | Invariato |

## 2. Mappe

| Fonte | Cosa ha | Raggiungibile | Note / uso |
|---|---|---|---|
| **GTABase mappa** `/gta-6/map/` | 202 luoghi in 30 categorie (negozi, banche, rifugi, porti turistici, palestre, Hidden Package…), aggiornata il 18/11 | ✓ (la mappa richiede JS, l'elenco delle categorie no) | Controllo puntuale delle posizioni (diritti sul database: niente importazioni in blocco) |
| **PowerPyx** «Full World Map Revealed» + pagine dei luoghi | Mappa completa e un elenco di luoghi per ogni tipo | ✓ | Il riferimento migliore per righe del tipo «zona: punto preciso» |
| **gtasixmap.com/updates** | Ultimo aggiornamento del 7/10 (le 44 schede riscritte); niente dopo l'uscita | ✓ | Ricontrollare: per ora niente di nuovo |
| **map.stateofleonida.net** | Mappa di base con coordinate X/Y, collegata a gtadb e gta.wiki | ✓ | Invariata |
| **gtadb.org** (`map.`, `leonida.`, `markers.`) | Mappe dei punti di riferimento; repo GitHub `rolux/gtadb.org` | ✓ i siti; ✗ GitHub dal proxy della sessione (403: va chiesto con `add_repo` in sola lettura) | Invariata |
| **MapGenie** | Nessuna pagina GTA VI (`/gta-6`, `/grand-theft-auto-vi`, `/gta-vi` → 404) | — | Ricontrollare dal 20/11 |
| **IGN mappe interattive** | Solo GTA V (`/maps/gta-5`); `/maps/gta-6/leonida` → 404 | — | Ricontrollare |
| **GamerGuides mappa** | «isn't live yet» | ✓ | Ricontrollare |

## 3. Siti di trofei

| Fonte | Raggiungibile | Note |
|---|---|---|
| PSNProfiles | ✗ 403 Cloudflare «Attention Required» | Ancora bloccato |
| Exophase | ✗ 403 «Just a moment» | Ancora bloccato |
| TrueTrophies / TrueAchievements | ✗ 403 Cloudflare | Ancora bloccato |
| PlaystationTrophies.org | ✗ 403 «Just a moment» | Ancora bloccato |
| **CoPlaNet.it** `/trofei/lista-trofei-di-grand-theft-auto-vi` | ✓ | **Nomi italiani ufficiali** dei trofei, i nascosti segnalati. Già in uso (55 voci) |
| PowerPyx trophy guide & roadmap | ✓ | Già in uso; difficoltà 4/10, circa 200 h, 1 trofeo perdibile (la prima meditazione nel capitolo 1) |
| GamerGuides, GTA BOOM, PC Gamer, Insider Gaming | ✓ | Copie in inglese, utili per controllare |

## 4. Altre lingue e paesi

| Fonte | Lingua | Cosa ha | Raggiungibile | Qualità / uso |
|---|---|---|---|---|
| **GameSource.it** `/trucchi/gta-6-guida-100-percento-checklist/`, `/trucchi/trucchi-gta-6-codici/` | IT | **Guida al 100% in italiano** (firmata da Enrico Andreuccetti, 18/11): fenicotteri, carte, Waink, riviste, meditazione, rapine, gare, poligoni, biliardo; trucchi | ✓ | Buona, ricalca PowerPyx ma **con i nomi italiani** delle categorie → nuova, utile per le etichette italiane |
| **CoPlaNet.it** | IT | Trofei PS5 e obiettivi Xbox in italiano | ✓ | Già in uso |
| IGN Italia `it.ign.com/grand-theft-auto-vi` (+ `.xml` feed) | IT | Solo news e recensione, nessuna guida | ✓ | News |
| Multiplayer.it | IT | Solo news (la scheda del gioco dà 404, il feed RSS dà 404) | HTML ✓ | News, via Google News |
| Everyeye.it | IT | — | ✗ HTML 403 Cloudflare (nuovo blocco); RSS ✓ come prima | Solo RSS |
| Spaziogames | IT | «Quante missioni ha GTA 6?» (via Google News) | ✗ HTML 403; Atom ✓ | Solo feed |
| Eurogamer.it | IT | **Chiuso**: rimanda a eurogamer.net | — | Togliere dagli elenchi |
| Player.it, The Games Machine, GameLife (ex GameSoul) | IT | News e recensione | ✓ / ✓ / ✗ 403 | Solo news |
| games.gg, Kotaworld, Italia Top Games, Videogiochitalia | IT | Decine di pezzi generici al giorno | (via Google News) | **Sospette fabbriche di contenuti**: scartare (regola anti-bufale) |
| Vandal | ES | Indice guide senza GTA 6 | ✓ | — |
| 3DJuegos / 3DJuegos Guías | ES | News e «guide» di lancio, niente walkthrough | ✓ | News |
| MeriStation (as.com) | ES | Recensione 10/10, durata e numero di missioni | Home ✓, pagina del gioco ✗ 403 | News |
| Jeuxvideo.com | FR | — | ✗ 403 Cloudflare | Non usare |
| Millenium (MGG) | FR | Nessuna pagina GTA 6 trovata | ✓ home | — |
| Gamekult | FR | Solo news | ✓ | News |
| **vice-central.com** | FR | News, dossier, riepiloghi della settimana; ancora niente guide di gioco | ✓ + RSS integrale | Già fonte principale; ricontrollare per guide/fauna dopo l'uscita |
| GameStar / GamePro | DE | — | ✗ 403 Cloudflare | Non usare |
| PC Games (pcgames.de `/GTA-6-Spiel-55239/`) | DE | News e rubriche | ✓ | News |
| Mein-MMO `/gta-6/` | DE | News, trucchi, consigli | ✓ | News e consigli |
| TecMundo / Voxel (ora su estadao.com.br) | PT-BR | News, trucchi, maratona dal vivo | ✓ | News |
| **Game8.jp** `/gta6` | JA | Guide di prima del lancio (veicoli, armi, trucchi, polizia), già organizzate per tipo | ✓ | Buona struttura; da ricontrollare dopo il 19 (di solito Game8 JP riempie in fretta) |
| GameWith `/gta6/` | JA | Elenco veicoli, protagonisti, consigli | ✓ | Come sopra |
| Famitsu | JA | Recensione e intervista (85 ore) | ✓ | Fonte primaria per le interviste |
| GRYOnline `/poradniki/grand-theft-auto-vi/` | PL | Poradnik (guida) appena aperto: edizioni, versione polacca | ✓ | Di solito fa walkthrough completi con mappe: ricontrollare dal 20/11 |
| StopGame | RU | Pagina del gioco 404 | ✓ home | — |

## 5. Comunità

| Fonte | Raggiungibile | Note |
|---|---|---|
| Reddit r/GTA6 (RSS `/.rss`, `/new/.rss`, ricerca `.rss`) | ✗ oggi 429 (troppe richieste) e 404 sulla ricerca | Riprovare più tardi con una sola richiesta; resta Rumor/Community |
| YouTube RSS `youtube.com/feeds/videos.xml?channel_id=…` | ✓ | **GTA Series Videos** `UCuWcjpKbIDAbZfHoru1toFg` (walkthrough 100% in diretta in 4K, intro); **MrBossFTW** `UC0PMQXAwF6O6aeTpv962miA` (impostazioni, notizie); **PowerPyx** `UCWBA1-H9A5IldSb3tNwQmtQ` (jet militare, carro armato, aereo all'inizio). Servono per controllare, non per i testi |

## 6. Proposta: righe aggiornate della tabella «giro guide» in CLAUDE.md (solo testo)

```
Raggiungibilità controllata il 18/11 con curl (UA Safari): ✓ = risponde, ✗ = blocca (passare da chi lo riprende). Nel gioco non ci sono medaglie d'oro né il replay delle missioni: `extraObjectives` resta vuoto.

| Dato | Campi | Fonti, in ordine |
|---|---|---|
| Elenco missioni, ordine, capitoli | `missions.items` (title, actId, order, protagonist, districtId), `acts` | PowerPyx «full walkthrough all missions» ✓, gta.wiki (API `api.php`) ✓, GTABase `/gta-6/missions/` ✓ (solo i titoli inglesi: l'italiano è tradotto a macchina), PC Gamer «mission list» ✓; IGN Wiki e Game8 ancora vuoti il 18/11 |
| Cosa fare in missione | `contact`, `objectives[]` (frasi brevi, parafrasate), `choice.irreversible`, `tips`, `unlocks` | PowerPyx ✓, VGC `/guide/gta-6-…-walkthrough/` ✓ (seconda fonte per `verificato`), gta.wiki ✓; YouTube GTA Series Videos (RSS) per controllo |
| Trofei | `trophies.json` (già ufficiali, nomi italiani da CoPlaNet) | CoPlaNet ✓ (italiano), PowerPyx roadmap ✓, GamerGuides ✓, PC Gamer ✓; PSNProfiles/Exophase/TrueTrophies/PlaystationTrophies ✗ (Cloudflare, 18/11) |
| Collezionabili (posizioni, quanti per il 100%) | `collectibles.items` nelle categorie esistenti + nuove solo se il gioco le ha (fenicotteri, carte, Waink), riga «zona: punto preciso», `xy` | PowerPyx «collectible guide – progress database» e pagine `gta-6-all-…-locations` ✓, GameSource.it «guida 100%» ✓ (nomi italiani), GTABase mappa ✓ (solo controllo); MapGenie, IGN mappa, GamerGuides mappa non ancora online il 18/11 |
| 100%: categorie e pesi | struttura da disegnare ora che la lista è nota | PowerPyx «100% completion checklist» ✓, GameSource.it ✓, statistiche dai Pacchetti di Mike |
| Veicoli: prezzo, dove, statistiche | `price`, `whereToFind`, `stats` | gta.wiki (API) ✓, GTABase ✓ (voce per voce), PowerPyx progress database (conteggi per classe) ✓, Game8.jp/GameWith ✓ come controllo |
| Armi: prezzo, negozio, potenziamenti, statistiche | `price`, `whereToBuy`, `upgrades`, `stats`, `caliber`, `magazine` | gta.wiki ✓, GTABase ✓, Insider Gaming «weapons guide» ✓, PowerPyx Ammu-Nation ✓ |
| Attività, incontri, personaggi secondari | `activities` (requirements, rewards, steps), `characters` (firstMissionId) | PowerPyx (Strangers & Freaks, rapine, Payday Loans, gare, droni, laboratori, operazioni delle gang) ✓, Insider Gaming «challenges» ✓, gta.wiki ✓; IGN Wiki/Game8/GamerGuides da ricontrollare |
| Radio | `radio.json` scalette | gta.wiki ✓, Apple Music/Spotify; Insider Gaming radio ancora di prima dell'uscita |
| Mappa e luoghi | `districts.pois`, `luoghi.json` | gtasixmap (Updates) ✓, gtadb ✓, GTABase mappa ✓ (controllo), PowerPyx pagine dei luoghi ✓ |
| Notizie e recensioni | `news.json` | IGN ✓, Eurogamer ✓, VGC ✓, PC Gamer ✓, Push Square ✓, Dexerto ✓, RPS ✓, Insider Gaming ✓, IGN Italia ✓, GameSource ✓, CoPlaNet ✓; Everyeye e Spaziogames solo RSS (HTML ✗), GameSpot ✗, Reddit ✗ (429), Eurogamer.it chiuso; scartare games.gg e simili (fabbriche di contenuti) |
```
