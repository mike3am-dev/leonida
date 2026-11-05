# Leonida — Guida di campo per GTA VI

Guida interattiva personale, non ufficiale, per Grand Theft Auto VI. Una web app in HTML, CSS e JavaScript puro, senza framework e senza build, pubblicata su GitHub Pages dalla cartella `docs/` e installabile sull'iPhone come app dalla schermata Home.

**Uso personale.** Non è affiliata a Rockstar Games o Take-Two Interactive.

---

## Come è fatta

```
docs/            ← il sito pubblicato (GitHub Pages)
  index.html     ← l'unica pagina
  css/           ← design (tokens, base, layout, componenti)
  js/            ← app, router, ricerca, scudo spoiler, viste
  data/*.json    ← TUTTI i contenuti della guida
  assets/img/    ← le immagini che aggiungi tu (vedi il README lì dentro)
  fonts/, icons/ ← font locali (Fraunces, Inter Tight) e icone originali
  sw.js          ← service worker (offline + aggiornamenti)
scripts/
  validate.mjs   ← controlla i JSON e dice in italiano cosa non va
```

**Regola d'oro:** i contenuti vivono solo in `docs/data/*.json`. Il codice legge e mostra. Per aggiungere una missione non si tocca una riga di JavaScript.

## Il flusso quotidiano (dal 19 novembre)

1. Giochi. Tra una missione e l'altra tocchi **Appunto rapido** e scrivi quello che hai scoperto.
2. A fine serata apri **Diario → Pacchetto per Claude** e tocchi **Copia tutto**.
3. Incolli il blocco in una chat con Claude. Ricevi i JSON aggiornati.
4. Sostituisci i file in `docs/data/`, lanci la validazione, fai commit e push.
5. Alla prossima apertura l'app scarica i dati nuovi da sola.

## Aggiornare i contenuti

Ogni voce dei JSON ha sempre questi campi:

| Campo | Valori | Significato |
|---|---|---|
| `status` | `segnaposto`, `da verificare`, `verificato` | quanto ti fidi della voce |
| `source` | `trailer`, `gioco-mike`, `community` | da dove viene |
| `spoilerLevel` | numero | l'atto dopo il quale si può leggere senza rischi (0 = sempre) |
| `example` | `true` / `false` | voce finta per vedere il design; il titolo deve contenere «ESEMPIO» |
| `image` | percorso o `null` | immagine opzionale, per esempio `assets/img/jason.jpg` |

I prefissi degli id: `mis-` missioni, `dis-` distretti, `col-` collezionabili, `act-` attività, `chr-` personaggi, `rad-` radio, `brd-` marchi, `tip-` consigli.

Quando cambi i dati, aggiorna anche `meta.json` (`dataVersion`, `updatedAt`, una riga nel `changelog`).

## Validare

Serve Node.js (versione 18 o più recente). Dal Terminale, dentro la cartella del progetto:

```bash
node scripts/validate.mjs
```

Se tutto è a posto vedi «✓ Tutti i dati sono validi». Altrimenti ti dice file, voce e campo del problema, in italiano.

## Pubblicare

Ogni push su `main` aggiorna il sito. Quando cambi il **codice** (non i dati) alza anche `VERSION` in `docs/sw.js`, così i telefoni ricevono la versione nuova: compare l'avviso «Aggiornamento disponibile».

Prima volta soltanto, per accendere GitHub Pages:
1. Vai su github.com → repository `leonida` → **Settings** → **Pages**.
2. In *Build and deployment* scegli **Deploy from a branch**.
3. Branch: `main`, cartella: `/docs`. Salva.
4. Dopo un paio di minuti il sito è su `https://mike3am-dev.github.io/leonida/`.

Per provare in locale, dal Terminale nella cartella del progetto:

```bash
python3 -m http.server 8080 --directory docs
```

poi apri `http://localhost:8080` nel browser.

## Installare sull'iPhone

1. Apri l'indirizzo del sito in **Safari** (non in Chrome o altri).
2. Tocca il pulsante **Condividi** (il quadrato con la freccia in su).
3. Scorri e tocca **Aggiungi alla schermata Home**, poi **Aggiungi**.
4. Apri «Leonida» dalla schermata Home: parte a tutto schermo, senza barra di Safari, e funziona anche offline.

Sul Duo l'app cambia forma da sola: chiuso vedi una colonna con la tab bar in basso, aperto vedi il libro a doppia pagina.

## Backup dei progressi

I progressi (missioni, collezionabili, appunti, impostazioni) sono salvati sul dispositivo. **L'app installata e Safari hanno memorie separate**: quello che fai in una non si vede nell'altra.

- **Esportare:** Impostazioni → *Esporta backup (.json)*. Salvalo su iCloud Drive o mandatelo via AirDrop.
- **Importare:** Impostazioni → *Importa backup* → scegli il file. Vedi un'anteprima e confermi.

Fallo ogni tanto, e sempre prima di cambiare telefono.

## Dati ESEMPIO

Alcune voci sono finte e marcate «ESEMPIO»: servono solo a vedere il design popolato. Si nascondono da Impostazioni → *Mostra i dati ESEMPIO*. Quando avrai contenuti veri puoi cancellarle dai JSON.
