# Caccia alle cose mancanti — istruzioni comuni per le squadre

Progetto: «Leonida», guida privata IN ITALIANO a GTA VI. Il gioco è uscito il 18-19/11/2026: guide, wiki e testate pubblicano di continuo. Repo /home/user/leonida, dati in docs/data/*.json.
Leggi PRIMA: /home/user/leonida/CLAUDE.md («Regole fisse», «Fai un giro guide») e /home/user/leonida/scripts/fonti-guide.md.

## REGOLA SUPREMA (Mike, 20/11): il gioco di Mike batte tutte le fonti
Leggi SUBITO /home/user/leonida/scripts/caccia/gioco-mike.md: sono le schermate del gioco di Mike (in italiano). Quello che c'è lì è giusto per definizione: nomi, numeri, totali, termini. Se una fonte dice altro, ha torto (segnalalo nel rapporto). Usa SEMPRE i termini italiani del gioco elencati lì (es. «livello di sospetto» e «stelle di sospetto», non «ricercato»; «ricettatori»; «borse della refurtiva»; «Veicoli di spicco»; «Varianti uniche di armi»). Se nel tuo ambito trovi testi con i termini vecchi, correggili (update del campo intero).
I veicoli ora hanno le classi del gioco: `class` è un id di `docs/data/vehicles.json → groups` (es. `coupe`, `muscle`, `pickup`, `emergenza`, `sp-lowrider`), oppure `fuori-elenco`.

## Perché questo giro
Il proprietario ha trovato da solo una canzone della radio («Feels», Calvin Harris con Katy Perry, su Flash FM) che nella guida mancava. Vuole essere sicuro che non ci sfuggano altre cose così. Il tuo lavoro è una CACCIA: confronta quello che la guida ha nel tuo ambito con quello che le fonti hanno pubblicato FINO A ORA, trova ciò che manca o è superato, e aggiungilo. Parti sempre da un inventario: cosa abbiamo (leggi i dati), cosa dicono le fonti (elenco), differenza.

## Regole ferree
- NON modificare mai i file in docs/data né altri file del repo: scrivi solo i tuoi file di uscita (sotto). Il coordinatore applica.
- Fonti: PowerPyx (207 pagine GTA 6, la fonte n.1), DayOne/playday.one (elenchi completi di armi, auto, moto, barche, aerei, trucchi: si è rivelata buona), VGC, PC Gamer (hub «gta-6-guide»), Insider Gaming, GamesRadar, Kotaku, Eurogamer, GameSpot (l'HTML blocca: usa il feed RSS pubblico https://www.gamespot.com/feeds/news o /feeds/game-news), GTA BOOM, Rockstar Intel, GamerGuides, gta.wiki SOLO via API (`https://gta.wiki/api.php?action=parse&page=…&prop=wikitext&format=json`, `list=recentchanges`, `list=search`), GameSource.it / Everyeye / Multiplayer.it / IGN Italia per l'italiano. MAI gta.fandom.com. curl con User-Agent Safari. Google News RSS come indice dei titoli. Niente aggiramento di Cloudflare/anti-bot: se una pagina blocca, passa oltre. Niente fabbriche di contenuti fatte con l'IA (senza firma, titoli generici, dettagli inventati). Niente copia in blocco da GTABase (solo controlli puntuali).
- Non inviare dati personali del proprietario a siti esterni.
- Italiano chiaro e breve, nello stile delle voci esistenti della stessa collezione (guardane 3-4 prima di scrivere). Mai copiare frasi intere: riscrivi. Nomi propri e titoli inglesi restano; NON inventare nomi italiani (nomi italiani ufficiali solo se una fonte italiana affidabile mostra il testo del gioco).
- Etichette: da guide → `"source": "stampa"`, `"status": "da verificare"`; `"verificato"` solo con due fonti indipendenti concordi (`sourceUrl` + `moreSources`). Leak/indiscrezioni → `"source": "leak"`/`"rumor"`. `"updatedAt": "<data di oggi>"`, `"example": false`.
- SPOILER: ogni voce o campo che rivela la trama prende lo `spoilerLevel` del capitolo (1–5; 9 = leak di trama). I nomi delle missioni future non compaiono mai nei testi di altre voci: per rimandare a una missione usa solo `{"type": "mission", "ref": "<id>"}` in `unlocks`. Niente colpi di scena: descrivi cosa fai, non cosa succede.
- Niente doppioni: prima di aggiungere, cerca per nome e per posto tra le voci esistenti. Non cambiare id esistenti; id nuovi con lo schema già in uso nella collezione.
- Una sola versione per ogni fatto: se correggi un dato, correggilo in tutte le voci del tuo ambito che lo citano (grep).

## Formato di uscita
Array JSON in <CARTELLA>/<TUO-NOME>.json (la cartella di lavoro te la dice il coordinatore: di solito lo scratchpad della sessione):
- `{"file": "brands.json", "id": "<id nuovo>", "action": "add", "fields": { …tutti i campi, id compreso… }}`
- `{"file": "…", "id": "<id esistente>", "action": "update", "fields": { "campo": valore }}` (i campi SOSTITUISCONO; per aggiungere in coda a una lista usa `"<campo>_add": […]`).
Voci da CANCELLARE (doppioni, cose che nel gioco non esistono): non c'è un'azione, scrivile in <CARTELLA>/<TUO-NOME>-togliere.json come `[{"file", "id", "why", "fonte"}]`.
Immagini: non si scaricano. Preferisci una versione leggera (lato lungo 400-800 px): su gta.wiki chiedi la miniatura con `api.php?action=query&titles=File:<nome>&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json` e usa `thumburl`. Se trovi l'URL di un'immagine utile (logo, foto ufficiale; gta.wiki ha licenza CC), scrivilo in <CARTELLA>/<TUO-NOME>-immagini.json come `[{"for": "<id voce>", "url": "<url diretto del file>", "credit": "<fonte>"}]`.
Genera i file con Python (json.dump, ensure_ascii=False). Controllo obbligatorio prima di finire:
`cd <repo> && python3 -I scripts/caccia/prova.py <tuo file .json principale>` → deve dire «OK» (prova su una copia, con controllo anti-spoiler).

## Risposta finale (breve)
1) Inventario: cosa avevamo / cosa hanno le fonti / cosa hai aggiunto, in numeri. 2) Le 5 scoperte più importanti («cose che ci stavamo perdendo»). 3) Cosa manca ancora e perché (le fonti non l'hanno pubblicato / bloccate). 4) Dubbi e dati in contrasto, con la scelta fatta. 5) Le fonti nuove e buone che hai trovato (URL), per i prossimi giri.
