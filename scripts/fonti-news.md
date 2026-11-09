# Fonti del giro news, 9/11 mattina

| Fonte | Metodo | Esito |
|---|---|---|
| Rockstar Newswire | RSS `/newswire/rss` | ✗ 404 (non esiste). WebSearch sul dominio: ultimo post GTA VI quello del preload (3/11), niente di nuovo |
| Rockstar Newswire (pagina) | WebFetch | ✗ pagina JS vuota |
| Rockstar Support (FAQ preload) | WebSearch | ✓ solo snippet, nessuna modifica dopo il 3/11 |
| Eurogamer | RSS `/feed` | ✓ (nessun pezzo GTA dopo il 6/11) |
| VG247 | RSS `/feed` | ✓ risponde ma è fermo a giugno 2026 (feed abbandonato) |
| Insider Gaming | RSS `/feed/` | ✓ (solo guide «trucco Nuova Zelanda» e tracker, già coperti) |
| GameSpot | RSS `/feeds/news` | ✓ (ultimo pezzo GTA 6/11) — l'HTML resta ✗ |
| Spaziogames | Atom `/feed` | ✓ (solo Amazon annulla preordini, già coperto) — l'HTML resta ✗ |
| Everyeye | RSS `feed_news_rss.asp` | ✓ (attenzione: ripubblica pezzi vecchi con data nuova, es. Justice 908691, 12 immagini Edge 908755) |
| Kotaku | RSS `/rss` | ✓ |
| Push Square | RSS `/feeds/latest` | ✓ |
| GamingBolt | RSS `/feed` | ✓ (niente GTA nel weekend) |
| Game Rant | RSS `/feed/` | ✓ (feed corto, 10 voci, niente GTA) |
| TheGamer | RSS `/feed/` | ✓ (niente GTA) |
| Polygon | RSS | ✓ (niente GTA) |
| Dexerto | RSS `/feed/` | ✓ |
| PC Gamer | RSS `/rss/` | ✓ |
| GamesRadar+ | RSS `/rss/` | ✓ |
| Rock Paper Shotgun | RSS `/feed` | ✓ |
| IGN | RSS feedburner `ign/all` | ✓ (nessuna voce GTA nelle ultime 20) |
| Sportskeeda | RSS `/feed/gta` | ✓ |
| GTA BOOM | RSS `/feed` + HTML (WebFetch) | ✓ |
| Vice Central | RSS `/feed/` (testo integrale) | ✓ fonte principale del giro |
| Rockstar Intel | RSS `/feed` | ✓ (fermo al 7/11) |
| iGrandTheftAuto | HTML `/gta6/news` | ✓ (niente di nuovo oltre il già coperto) |
| Multiplayer.it | RSS `/feed/rss/` | ✗ 404; raggiunto via Google News + WebSearch |
| GTAForums | RSS | ✗ 404 sull'URL provato |
| GTABase | HTML diretto (curl, UA Safari), es. `https://www.gtabase.com/it/gta-6/` e `/notizie/ /veicoli/ /armi/ /missioni/ /missioni-secondarie/ /proprieta/ /bande/` | ✓ 200 (il feed RSS non c'è, le pagine sì) |
| thegtaplace | RSS | ✗ 404 |
| Reddit r/GTA6 | Atom `/new/.rss` e `/top/.rss?t=day` | ✓ (titoli; corpo vuoto nei post con sole immagini) |
| Google News IT/EN | RSS search `GTA 6 when:1d` e `"GTA VI" when:2d` | ✓ ~350 titoli; link non risolvibili senza JS, usati come indice |
| WebSearch | ricerche mirate | ✓ (Stocktwits, Multiplayer, Malwarebytes, Beebom, ecc.) |
| Stocktwits | curl HTML | ✓ |
| gta6bible.com | REST API `wp-json/wp/v2/posts` con curl | ✗ 403 Cloudflare: lasciato stare |
| gtasixmap.com/updates | curl | ✓ ultimo aggiornamento datato 7/10 (i 14 punti del 7/11 sono già in news) |
| leonidastate.guide | — | non toccato (divieto esplicito) |

## Scartati perché già in news.json o vecchi
Trofei 55, scatola PS5 230 GB, poster A3, Amazon Italia, Jelous, Greensboro, Kodak Black, West Coast Customs, Miami Heat «Vice City», pilota in Arkansas, preordini 7,7 M/751 M $ (Sensor Tower), Wedbush/BTIG, Selfridges, Justice score (Everyeye ripubblicato), Netflix +100.000 abbonati (Multiplayer, articolo dell'11/9), Miami Beach 3 M $ (settembre), Lewis Hamilton (luglio 2025), Jerry Fort (morto il 29/10, notizia del 2/11: si può aggiungere se Mike vuole), truffe «accesso anticipato» (tema ricorrente, nessun fatto nuovo).

## Non verificati (non inseriti)
The Sun: «83.000 giorni di ferie, 12 M £» nel Regno Unito; KOB 4: «1,4 M $ di salari persi nel New Mexico»; HotCars «autodromo e mud club» (solo riassunto di cose note); Burger King Nuova Zelanda (post Reddit con sola immagine); musica della schermata PS5 (post Reddit senza testo); «primo sguardo alla scatola del DualSense» (Reddit).
