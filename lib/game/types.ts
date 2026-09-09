// Alle geteilten Typen des Spiels an einem Ort.
// Bewusst frei von React/Supabase, damit die Spiellogik
// unabhaengig von UI und Datenbank testbar bleibt.

export type Player = 1 | 2;

export type PlayerMap<T> = {
  player1: T;
  player2: T;
};

export type GamePhase = "categories" | "writing" | "scoring" | "finished";

/** Antworten einer Person in einer Runde: Kategorie -> eingetippter Text. */
export type CategoryAnswers = Record<string, string>;

export type RoundResult = {
  round: number;
  letter: string;
  categories: string[];
  answers: PlayerMap<CategoryAnswers>;
  points: PlayerMap<Record<string, number>>;
  roundPoints1: number;
  roundPoints2: number;
  total1: number;
  total2: number;
};

export type GameState = {
  version: number;

  phase: GamePhase;

  // Kategorien fuers ganze Spiel - einmal vor Runde 1 festgelegt.
  categories: string[];

  round: number;
  letter: string | null;
  usedLetters: string[];

  // Ab wann der gewuerfelte Buchstabe angezeigt wird (Client-Zeit,
  // wie bei Two Wizards' revealUntil) - bis dahin laeuft lokal die
  // Wuerfel-Animation, ohne dass dafuer ein DB-Roundtrip noetig ist.
  rollUntil: number | null;

  answers: PlayerMap<CategoryAnswers>;

  // Von Hand als ungueltig markierte Antworten (z. B. falsche
  // Stadt, die es nicht gibt) - beide Spieler duerfen das fuer
  // beide Seiten umschalten, es geht ja gemeinsam ums Punkten.
  invalid: PlayerMap<string[]>;

  stoppedBy: Player | null;

  scores: PlayerMap<number>;
  history: RoundResult[];
};

export type WaitingState = {
  version: number;
  waiting: true;
};

export type StoredState = GameState | WaitingState;

export type GameStatus = "waiting" | "ready" | "playing" | "finished";

export type GameRow = {
  id: string;
  code: string;
  player1_name: string;
  player2_name: string | null;
  status: GameStatus;
  game_state: StoredState;
  created_at: string;
  updated_at: string;
};

export function otherPlayer(player: Player): Player {
  return player === 1 ? 2 : 1;
}

export function playerKey(player: Player): "player1" | "player2" {
  return player === 1 ? "player1" : "player2";
}
