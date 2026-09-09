# Stadt, Land, Deux

Stadt-Land-Fluss in Echtzeit für zwei - kein Warten aufeinander:
Kategorien vorher gemeinsam festlegen, Buchstabe würfeln, beide
schreiben gleichzeitig, wer zuerst fertig ist ruft Stopp. Next.js
im Frontend, Firebase (Firestore) für Räume und Live-Updates -
im gleichen Stil wie [Two Wizards](../two-wizards), nur mit Firebase
statt Supabase (unbegrenzt viele kostenlose Projekte).

## Loslegen

```bash
npm install
cp .env.example .env.local   # Werte aus der Firebase-Konsole eintragen
npm run dev
```

Dann [http://localhost:3000](http://localhost:3000) öffnen. Zum
Testen zu zweit: einmal normal, einmal im privaten Fenster - Spiel
erstellen, Code kopieren, beitreten.

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build |
| `npm run test` | Tests der Spielregeln (Node-eigener Test-Runner) |
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint |

## Spielablauf

1. Person 1 erstellt ein Spiel, bekommt einen Code; Person 2 tritt bei.
2. Beide wählen gemeinsam Kategorien - aus 100 Vorschlägen per
   Klick oder frei eingetippt (mindestens 3).
3. Person 1 startet die erste Runde: ein Buchstabe wird gewürfelt.
4. Beide schreiben gleichzeitig los. Wer fertig ist, ruft Stopp -
   das beendet die Runde sofort für beide.
5. Auswertung: haben beide eine gültige Antwort = 10 Punkte für
   beide (egal ob gleich oder verschieden), hat nur eine Person eine
   gültige Antwort = 20 Punkte für diese Person, leer oder falscher
   Buchstabe = 0. Offensichtlich falsche Antworten lassen sich von
   Hand als ungültig markieren.
6. Person 1 startet die nächste Runde oder beendet das Spiel.

## Aufbau

```
app/
  page.tsx              Startseite
components/
  StadtLandDeuxApp.tsx  verteilt auf die Bildschirme
  game/                 Kategorien, Runde, Auswertung, Spielende
  screens/               Start, Erstellen, Beitreten, Lobby
lib/
  game/                  Regeln und Spielzustand - reine Funktionen, ohne React
  firebase/              Datenbankzugriff (Firestore) an einer Stelle gebündelt
  hooks/                 Live-Verbindung und Spieler-Aktionen
tests/                   Tests der Spielregeln
firestore.rules          Zugriffsregeln für Firestore
```

## Datenbank (Firebase)

1. [console.firebase.google.com](https://console.firebase.google.com) ->
   "Projekt hinzufügen" -> eigenes Projekt anlegen (z. B.
   "stadt-land-deux").
2. Im Projekt links auf "Build" -> "Firestore Database" ->
   "Datenbank erstellen" -> Produktionsmodus, Standort egal.
3. Danach im Reiter "Regeln" den Inhalt von `firestore.rules`
   einfügen und veröffentlichen.
4. Zurück im Projekt: Zahnrad oben links -> "Projekteinstellungen"
   -> unten bei "Deine Apps" auf das Web-Symbol (`</>`) -> App
   registrieren -> die angezeigten Werte in `.env.local` eintragen.

Ein ehrlicher Hinweis steht auch in `firestore.rules`: die App
schreibt ohne Login direkt in die Datenbank. Für den Freundeskreis
ist das in Ordnung.

## Veröffentlichen

1. Projekt zu GitHub pushen.
2. Auf [vercel.com](https://vercel.com) importieren (Next.js wird erkannt).
3. Unter *Settings → Environment Variables* die sechs Werte aus
   `.env.local` eintragen.
4. Deploy. Änderungen an `main` gehen danach automatisch live.
