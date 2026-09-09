import assert from "node:assert/strict";
import { test } from "node:test";

import { LETTERS } from "../lib/game/constants";
import {
  addCategory,
  callStop,
  canStartFirstRound,
  createCategoryState,
  endGame,
  nextRound,
  removeCategory,
  scoreRound,
  setAnswer,
  startFirstRound,
  toggleInvalid,
  winner,
} from "../lib/game/state";
import type { GameState } from "../lib/game/types";

function withCategories(labels: string[]): GameState {
  let state = createCategoryState();
  for (const label of labels) {
    state = addCategory(state, label) ?? state;
  }
  return state;
}

/** Runde starten und den gewuerfelten Buchstaben auf einen festen
 *  Wert setzen - Tests sollen nicht vom Zufall abhaengen. */
function startRoundWithLetter(state: GameState, letter: string): GameState {
  const started = startFirstRound(state)!;
  return { ...started, letter };
}

// --- Kategorien ---------------------------------------------------------

test("Kategorien lassen sich hinzufuegen, Duplikate werden ignoriert", () => {
  let state = createCategoryState();
  state = addCategory(state, "Stadt") ?? state;
  state = addCategory(state, "stadt") ?? state; // gleiches Wort, andere Gross-/Kleinschreibung
  assert.deepEqual(state.categories, ["Stadt"]);
});

test("leere oder zu lange Kategorien werden abgelehnt", () => {
  const state = createCategoryState();
  assert.equal(addCategory(state, "   "), null);
  assert.equal(addCategory(state, "x".repeat(41)), null);
});

test("Kategorien lassen sich wieder entfernen", () => {
  let state = withCategories(["Stadt", "Land", "Fluss"]);
  state = removeCategory(state, "Land")!;
  assert.deepEqual(state.categories, ["Stadt", "Fluss"]);
});

test("vor Rundenstart braucht es mindestens drei Kategorien", () => {
  assert.equal(canStartFirstRound(withCategories(["Stadt", "Land"])), false);
  assert.equal(
    canStartFirstRound(withCategories(["Stadt", "Land", "Fluss"])),
    true,
  );
});

// --- Runde starten -------------------------------------------------------

test("Rundenstart wuerfelt einen gueltigen Buchstaben und wechselt die Phase", () => {
  const state = startFirstRound(
    withCategories(["Stadt", "Land", "Fluss"]),
  )!;

  assert.equal(state.phase, "writing");
  assert.equal(state.round, 1);
  assert.ok(state.letter && LETTERS.includes(state.letter));
  assert.deepEqual(state.answers.player1, {
    Stadt: "",
    Land: "",
    Fluss: "",
  });
});

test("ohne genug Kategorien startet keine Runde", () => {
  assert.equal(startFirstRound(withCategories(["Stadt"])), null);
});

// --- Schreiben & Stopp -----------------------------------------------------

test("Antworten werden nur fuer den schreibenden Spieler gesetzt", () => {
  let state = startFirstRound(withCategories(["Stadt", "Land", "Fluss"]))!;
  state = setAnswer(state, 1, "Stadt", "Berlin")!;

  assert.equal(state.answers.player1.Stadt, "Berlin");
  assert.equal(state.answers.player2.Stadt, "");
});

test("Stopp beendet das Schreiben fuer beide sofort", () => {
  let state = startFirstRound(withCategories(["Stadt", "Land", "Fluss"]))!;
  state = callStop(state, 2)!;

  assert.equal(state.phase, "scoring");
  assert.equal(state.stoppedBy, 2);
  assert.equal(setAnswer(state, 1, "Stadt", "Berlin"), null);
});

// --- Punkte --------------------------------------------------------------

test("haben beide eine gueltige Antwort, gibt es 10 Punkte fuer beide - egal ob gleich oder verschieden", () => {
  const result = scoreRound(
    ["Stadt"],
    "B",
    { player1: { Stadt: "Berlin" }, player2: { Stadt: "Bremen" } },
    { player1: [], player2: [] },
  );

  assert.equal(result.points.player1.Stadt, 10);
  assert.equal(result.points.player2.Stadt, 10);
});

test("das gilt auch, wenn beide woertlich dieselbe Antwort haben", () => {
  const result = scoreRound(
    ["Stadt"],
    "B",
    { player1: { Stadt: "Berlin" }, player2: { Stadt: "berlin " } },
    { player1: [], player2: [] },
  );

  assert.equal(result.points.player1.Stadt, 10);
  assert.equal(result.points.player2.Stadt, 10);
});

test("leere oder falsch beginnende Antworten geben 0 Punkte", () => {
  const result = scoreRound(
    ["Stadt"],
    "B",
    { player1: { Stadt: "" }, player2: { Stadt: "Amsterdam" } },
    { player1: [], player2: [] },
  );

  assert.equal(result.points.player1.Stadt, 0);
  assert.equal(result.points.player2.Stadt, 0);
});

test("nur eine gueltige Antwort gibt dieser Person 20 Punkte", () => {
  const result = scoreRound(
    ["Stadt"],
    "B",
    { player1: { Stadt: "Berlin" }, player2: { Stadt: "" } },
    { player1: [], player2: [] },
  );

  assert.equal(result.points.player1.Stadt, 20);
  assert.equal(result.points.player2.Stadt, 0);
});

test("von Hand als ungueltig markierte Antworten zaehlen nicht", () => {
  const result = scoreRound(
    ["Stadt"],
    "B",
    { player1: { Stadt: "Berlin" }, player2: { Stadt: "" } },
    { player1: ["Stadt"], player2: [] },
  );

  assert.equal(result.points.player1.Stadt, 0);
});

test("toggleInvalid schaltet nur waehrend der Auswertung", () => {
  let state = startFirstRound(withCategories(["Stadt", "Land", "Fluss"]))!;
  assert.equal(toggleInvalid(state, 1, "Stadt"), null);

  state = callStop(state, 1)!;
  const toggled = toggleInvalid(state, 1, "Stadt")!;
  assert.deepEqual(toggled.invalid.player1, ["Stadt"]);

  const untoggled = toggleInvalid(toggled, 1, "Stadt")!;
  assert.deepEqual(untoggled.invalid.player1, []);
});

// --- Rundenwechsel & Spielende --------------------------------------------

test("naechste Runde zaehlt Punkte gut und wuerfelt neu", () => {
  let state = startRoundWithLetter(
    withCategories(["Stadt", "Land", "Fluss"]),
    "B",
  );
  state = setAnswer(state, 1, "Stadt", "Berlin")!;
  state = setAnswer(state, 2, "Stadt", "Bremen")!;
  state = callStop(state, 1)!;

  const next = nextRound(state)!;

  assert.equal(next.phase, "writing");
  assert.equal(next.round, 2);
  assert.equal(next.scores.player1, 10);
  assert.equal(next.scores.player2, 10);
  assert.equal(next.history.length, 1);
  assert.equal(next.answers.player1.Stadt, "");
  assert.equal(next.usedLetters.length, 2);
});

test("endGame beendet das Spiel und rechnet die letzte Runde ab", () => {
  let state = startRoundWithLetter(
    withCategories(["Stadt", "Land", "Fluss"]),
    "B",
  );
  state = setAnswer(state, 1, "Stadt", "Berlin")!;
  state = callStop(state, 1)!;

  const finished = endGame(state)!;

  assert.equal(finished.phase, "finished");
  assert.equal(finished.scores.player1, 20);
  assert.equal(winner(finished), 1);
});

test("Buchstaben wiederholen sich erst, wenn alle einmal dran waren", () => {
  let state = startFirstRound(withCategories(["Stadt", "Land", "Fluss"]))!;

  for (let i = 0; i < LETTERS.length - 1; i++) {
    state = callStop(state, 1)!;
    state = nextRound(state)!;
  }

  assert.equal(new Set(state.usedLetters).size, state.usedLetters.length);
  assert.ok(state.usedLetters.length <= LETTERS.length);
});
