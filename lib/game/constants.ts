export const STATE_VERSION = 1;

/** Buchstaben, aus denen gewuerfelt wird. Q, X und Y fliegen raus -
 *  damit findet sich fast immer fuer jede Kategorie etwas. */
export const LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "R", "S", "T", "U", "V", "W", "Z",
];

/** Alle Zeiten in Millisekunden. */
export const TIMING = {
  /** Wie lange die Wuerfel-Animation lokal laeuft, bevor der
   *  Buchstabe wirklich angezeigt wird. */
  roll: 1400,
} as const;

export const MIN_CATEGORIES = 3;

/** 100 Vorschlaege zum Schnell-Hinzufuegen. Eigene Kategorien
 *  koennen zusaetzlich frei eingetippt werden. */
export const CATEGORY_SUGGESTIONS: string[] = [
  "Stadt", "Land", "Fluss", "Vorname", "Nachname", "Tier", "Beruf", "Pflanze", "Farbe", "Automarke",
  "Filmtitel", "Serie", "Marke", "Sportart", "Band oder Musiker", "Getränk", "Süßigkeit", "Obst", "Gemüse", "Möbelstück",
  "Kleidungsstück", "Körperteil", "Insekt", "Vogel", "Fisch", "Musikinstrument", "Insel", "Gebirge", "Planet", "Zeichentrickfigur",
  "Superheld", "App", "Website", "YouTuber", "Fußballverein", "Sportler", "Erfindung", "Schulfach", "Studienfach", "Universität",
  "Stadtteil", "Bundesland", "Hauptstadt", "Sprache", "Comic", "Videospiel", "Spielkonsole", "Zahl (ausgeschrieben)", "Chemisches Element", "Haustier",
  "Dinosaurier", "Märchenfigur", "Weihnachtsbegriff", "Halloween-Begriff", "Fast-Food-Kette", "Restaurant-Kette", "Filmregisseur", "Schauspieler", "Sängerin oder Sänger", "Musikalbum",
  "Song-Titel", "Tanzstil", "Brettspiel", "Kartenspiel", "Spielzeug", "Motorradmarke", "Fahrradmarke", "Werkzeug", "Küchengerät", "Gewürz",
  "Kraut", "Baum", "Blume", "Wetterphänomen", "Sternzeichen", "Feiertag", "Festival", "Zeitschrift", "Fernsehsender", "Filmgenre",
  "Musikgenre", "Kochshow", "Quizshow", "Reality-Show", "Kinderserie", "Betriebssystem", "Programmiersprache", "Social-Media-App", "Handymarke", "Modemarke",
  "Parfum- oder Kosmetikmarke", "Sportartikelmarke", "Biersorte", "Cocktail", "Comicverlag", "Zeichner oder Autor", "Universitätsstadt", "Naturwunder", "Weltwunder", "Sagengestalt",
];
