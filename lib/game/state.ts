import { LETTERS, MIN_CATEGORIES, STATE_VERSION, TIMING } from "./constants";
import {
  type CategoryAnswers,
  type GamePhase,
  type GameState,
  type Player,
  type PlayerMap,
  type RoundResult,
  type StoredState,
  otherPlayer,
  playerKey,
} from "./types";

export function isGameState(
  value: StoredState | null | undefined,
): value is GameState {
  return Boolean(value && "phase" in value && "categories" in value);
}

export function createWaitingState() {
  return { version: STATE_VERSION, waiting: true as const };
}

export function createCategoryState(): GameState {
  return {
    version: STATE_VERSION,
    phase: "categories",
    categories: [],
    round: 0,
    letter: null,
    usedLetters: [],
    rollUntil: null,
    answers: { player1: {}, player2: {} },
    invalid: { player1: [], player2: [] },
    stoppedBy: null,
    scores: { player1: 0, player2: 0 },
    history: [],
  };
}

function normalizeCategory(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

/** Kategorie hinzufuegen (Grossschreibung/Leerzeichen egal fuer
 *  den Duplikat-Check) - beide Spieler duerfen das, solange noch
 *  ausgewaehlt wird. */
export function addCategory(
  state: GameState,
  rawLabel: string,
): GameState | null {
  if (state.phase !== "categories") {
    return null;
  }

  const label = normalizeCategory(rawLabel);

  if (!label || label.length > 40) {
    return null;
  }

  const exists = state.categories.some(
    (item) => item.toLowerCase() === label.toLowerCase(),
  );

  if (exists) {
    return null;
  }

  if (state.categories.length >= 30) {
    return null;
  }

  return { ...state, categories: [...state.categories, label] };
}

export function removeCategory(
  state: GameState,
  label: string,
): GameState | null {
  if (state.phase !== "categories") {
    return null;
  }

  if (!state.categories.includes(label)) {
    return null;
  }

  return {
    ...state,
    categories: state.categories.filter((item) => item !== label),
  };
}

/** Naechsten Buchstaben ziehen. Sind alle schon dran gewesen,
 *  faengt der Vorrat wieder von vorn an. */
function rollLetter(usedLetters: string[]): { letter: string; used: string[] } {
  const pool = LETTERS.filter((letter) => !usedLetters.includes(letter));
  const source = pool.length > 0 ? pool : LETTERS;
  const nextUsed = pool.length > 0 ? usedLetters : [];

  const letter = source[Math.floor(Math.random() * source.length)];

  return { letter, used: [...nextUsed, letter] };
}

function emptyAnswers(categories: string[]): PlayerMap<CategoryAnswers> {
  const blank: CategoryAnswers = {};
  for (const category of categories) {
    blank[category] = "";
  }
  return { player1: { ...blank }, player2: { ...blank } };
}

export function canStartFirstRound(state: GameState): boolean {
  return (
    state.phase === "categories" && state.categories.length >= MIN_CATEGORIES
  );
}

export function startFirstRound(state: GameState): GameState | null {
  if (!canStartFirstRound(state)) {
    return null;
  }

  const { letter, used } = rollLetter(state.usedLetters);

  return {
    ...state,
    phase: "writing",
    round: 1,
    letter,
    usedLetters: used,
    rollUntil: Date.now() + TIMING.roll,
    answers: emptyAnswers(state.categories),
    invalid: { player1: [], player2: [] },
    stoppedBy: null,
  };
}

export function setAnswer(
  state: GameState,
  player: Player,
  category: string,
  text: string,
): GameState | null {
  if (state.phase !== "writing" || state.stoppedBy) {
    return null;
  }

  if (!state.categories.includes(category)) {
    return null;
  }

  const key = playerKey(player);
  const limited = text.slice(0, 60);

  return {
    ...state,
    answers: {
      ...state.answers,
      [key]: { ...state.answers[key], [category]: limited },
    },
  };
}

/** Jemand ruft "Stopp!" - die Runde wird fuer beide sofort
 *  eingefroren und zur Auswertung freigegeben. */
export function callStop(state: GameState, player: Player): GameState | null {
  if (state.phase !== "writing" || state.stoppedBy) {
    return null;
  }

  return { ...state, phase: "scoring", stoppedBy: player };
}

export function toggleInvalid(
  state: GameState,
  target: Player,
  category: string,
): GameState | null {
  if (state.phase !== "scoring") {
    return null;
  }

  const key = playerKey(target);
  const current = state.invalid[key];
  const has = current.includes(category);

  return {
    ...state,
    invalid: {
      ...state.invalid,
      [key]: has
        ? current.filter((item) => item !== category)
        : [...current, category],
    },
  };
}

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

function startsWithLetter(value: string, letter: string): boolean {
  return value.trim().toUpperCase().startsWith(letter.toUpperCase());
}

export type RoundScore = {
  points: PlayerMap<Record<string, number>>;
  total1: number;
  total2: number;
};

/** Reine Punkte-Funktion, unabhaengig von React/Supabase -
 *  20 Punkte fuer eine einzigartige gueltige Antwort, 10 wenn
 *  beide dasselbe haben, 0 wenn ungueltig oder leer. */
export function scoreRound(
  categories: string[],
  letter: string,
  answers: PlayerMap<CategoryAnswers>,
  invalid: PlayerMap<string[]>,
): RoundScore {
  const points: PlayerMap<Record<string, number>> = {
    player1: {},
    player2: {},
  };

  let total1 = 0;
  let total2 = 0;

  for (const category of categories) {
    const raw1 = answers.player1[category] ?? "";
    const raw2 = answers.player2[category] ?? "";

    const valid1 =
      raw1.trim().length > 0 &&
      startsWithLetter(raw1, letter) &&
      !invalid.player1.includes(category);
    const valid2 =
      raw2.trim().length > 0 &&
      startsWithLetter(raw2, letter) &&
      !invalid.player2.includes(category);

    let p1 = 0;
    let p2 = 0;

    if (valid1 && valid2) {
      const same = normalizeAnswer(raw1) === normalizeAnswer(raw2);
      p1 = same ? 10 : 20;
      p2 = same ? 10 : 20;
    } else if (valid1) {
      p1 = 20;
    } else if (valid2) {
      p2 = 20;
    }

    points.player1[category] = p1;
    points.player2[category] = p2;
    total1 += p1;
    total2 += p2;
  }

  return { points, total1, total2 };
}

function finalizeRound(state: GameState): {
  scores: PlayerMap<number>;
  history: RoundResult[];
} {
  if (!state.letter) {
    return { scores: state.scores, history: state.history };
  }

  const { points, total1, total2 } = scoreRound(
    state.categories,
    state.letter,
    state.answers,
    state.invalid,
  );

  const scores = {
    player1: state.scores.player1 + total1,
    player2: state.scores.player2 + total2,
  };

  const history: RoundResult[] = [
    ...state.history,
    {
      round: state.round,
      letter: state.letter,
      categories: state.categories,
      answers: state.answers,
      points,
      roundPoints1: total1,
      roundPoints2: total2,
      total1: scores.player1,
      total2: scores.player2,
    },
  ];

  return { scores, history };
}

export function nextRound(state: GameState): GameState | null {
  if (state.phase !== "scoring") {
    return null;
  }

  const { scores, history } = finalizeRound(state);
  const { letter, used } = rollLetter(state.usedLetters);

  return {
    ...state,
    phase: "writing",
    round: state.round + 1,
    letter,
    usedLetters: used,
    rollUntil: Date.now() + TIMING.roll,
    answers: emptyAnswers(state.categories),
    invalid: { player1: [], player2: [] },
    stoppedBy: null,
    scores,
    history,
  };
}

export function endGame(state: GameState): GameState | null {
  if (state.phase !== "scoring") {
    return null;
  }

  const { scores, history } = finalizeRound(state);

  return { ...state, phase: "finished", scores, history };
}

export function winner(state: GameState): Player | "draw" {
  if (state.scores.player1 === state.scores.player2) {
    return "draw";
  }
  return state.scores.player1 > state.scores.player2 ? 1 : 2;
}

export function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case "categories":
      return "Kategorien wählen";
    case "writing":
      return "Schreiben";
    case "scoring":
      return "Auswertung";
    case "finished":
      return "Beendet";
  }
}

export { otherPlayer };
