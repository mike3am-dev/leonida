# Controlli prima di pubblicare (chat «Pubblicazione»)

La chat Pubblicazione è l'unica che porta il lavoro online. Le altre chat salvano su `sviluppo` e fanno le loro anteprime; questa prende **l'ultimo `sviluppo`**, lo controlla da cima a fondo, fa l'anteprima di rilascio e, **solo quando Mike dice «pubblica»**, lo mette su `main`.

## 1. Prendere l'ultimo sviluppo
`git fetch origin sviluppo main` · porta il ramo di sessione su `origin/sviluppo` · `git merge --no-edit origin/main` (le anteprime e le istruzioni copiate su main).

## 2. Controlli (tutti, ogni volta)
1. **Dati**: `node scripts/validate.mjs` → codice di uscita 0 (gli errori «✗» stanno sopra il riepilogo).
2. **Sintassi**: `for f in docs/js/*.js docs/js/*/*.js; do node --input-type=module --check < $f || echo ERRORE $f; done` (sw.js: `node --check docs/sw.js`).
3. **Server locale**: `python3 -m http.server 8080 --directory docs` (in background).
4. **Tutte le pagine**: `node scripts/controlli/pagine.cjs 430 932 5000 > pagine.json` → errori JS, testi rotti (undefined, NaN, null…), pagine vuote, link morti, immagini mancanti.
   Falsi allarmi noti: `#/impostazioni` «Capitolo 1 · Capitolo 1» (la riga del capitolo raggiunto); la notizia `new-20261105-upgrade-alla-ultimate-…` («non esiste» nel testo). Le immagini mancanti (`img404`) sono quelle che Mike non ha ancora scaricato sul Mac: l'app usa la copia online.
5. **Grafica sugli iPhone**: `node scripts/controlli/grafica.cjs 393 852 500` e `… 440 956 500` → cose che escono dallo schermo o dal riquadro. Si confronta con il giro prima: contano solo i problemi nuovi. Falsi allarmi noti: le strisce che scorrono di lato (regioni in Home, luoghi vicini, legami dei personaggi), 1-4 px.
6. **Spoiler**: nessun titolo di missione dei capitoli ≥ 2 nei testi con `spoilerLevel` più basso (vedi `scripts/caccia/README.md` punto 7; falsi positivi: Ocean Beach, Coffee Break, Tyrone, Welcome to Vice City, Sinfrontera National Bank, Sunset).
7. **Screenshot**: `node scripts/controlli/screenshot.cjs <cartella>` → Pro, Pro Max, Duo di Home, Game, Missioni, una missione, Veicoli, Mappa; si guardano e si mandano a Mike.

## 3. Anteprima di rilascio
`node scripts/anteprima.mjs rilascio-N --radice <checkout di main>` (STATO 5b), commit e push su `main` (tocca solo `docs/anteprima/`). A Mike: link, screenshot, elenco delle novità (quello che andrà nel changelog), problemi trovati e come sono stati risolti, grafico di completezza (`node scripts/completezza.mjs` + `node scripts/grafico-completezza.mjs <png> "Completezza della guida" --ieri`).

## 4. Pubblicazione (solo dopo «pubblica» di Mike)
Su `sviluppo`: `git merge origin/main`, cancella `docs/anteprima/`, alza la versione in `docs/sw.js` (VERSION), `docs/js/app.js` (`__LEONIDA_VERSION__`), `docs/data/meta.json` (`dataVersion` + voce in testa a `changelog`, frasi semplici per i colleghi), `node scripts/completezza.mjs --salva "vX.Y.Z"`, ripeti i controlli 1-2, commit (con l'autore indicato in CLAUDE.md), push su `sviluppo`, `git push origin HEAD:main`, poi verifica live: `curl -s https://mike3am-dev.github.io/leonida/js/app.js | grep __LEONIDA_VERSION__` (GitHub Pages ci mette 1-3 minuti). Infine aggiorna STATO.md (versione online, cosa è uscito) e di' a Mike «vedi vX.Y.Z».
