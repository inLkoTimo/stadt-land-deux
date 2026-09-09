"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LETTERS } from "@/lib/game/constants";
import type { GameRow, GameState, Player } from "@/lib/game/types";
import { otherPlayer, playerKey } from "@/lib/game/types";

function ScoreStrip({
  game,
  state,
  me,
}: {
  game: GameRow;
  state: GameState;
  me: Player;
}) {
  const opponent = otherPlayer(me);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-bold text-teal-200">
          Runde {state.round}
        </span>
      </div>
      <div className="flex items-center gap-4 font-bold">
        <span className={me === 1 ? "text-teal-300" : "text-amber-300"}>
          {playerKey(me) === "player1" ? game.player1_name : game.player2_name}{" "}
          {state.scores[playerKey(me)]}
        </span>
        <span className="text-slate-600">:</span>
        <span className={opponent === 1 ? "text-teal-300" : "text-amber-300"}>
          {state.scores[playerKey(opponent)]}{" "}
          {playerKey(opponent) === "player1"
            ? game.player1_name
            : game.player2_name}
        </span>
      </div>
    </div>
  );
}

function useDebouncedSave(delay: number) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  return (key: string, fn: () => void) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key]);
    }
    timers.current[key] = setTimeout(fn, delay);
  };
}

export function RoundScreen({
  game,
  state,
  me,
  onWriteAnswer,
  onStop,
  onLeave,
}: {
  game: GameRow;
  state: GameState;
  me: Player;
  onWriteAnswer: (category: string, text: string) => void;
  onStop: () => void;
  onLeave: () => void;
}) {
  const rollUntil = state.rollUntil ?? 0;
  const [now, setNow] = useState(() => Date.now());
  const rolling = now < rollUntil;

  useEffect(() => {
    if (!rolling) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 70);
    return () => clearInterval(id);
  }, [rolling]);

  const [spinLetter, setSpinLetter] = useState(state.letter ?? "?");

  useEffect(() => {
    if (rolling) {
      setSpinLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    } else if (state.letter) {
      setSpinLetter(state.letter);
    }
  }, [now, rolling, state.letter]);

  const myKey = playerKey(me);
  const myAnswers = state.answers[myKey];

  const [local, setLocal] = useState<Record<string, string>>(myAnswers);

  // Wenn eine neue Runde beginnt (neue Kategorien-Belegung leer),
  // lokale Eingaben zuruecksetzen.
  useEffect(() => {
    setLocal(myAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.round]);

  const debounce = useDebouncedSave(350);

  const opponentKey = playerKey(otherPlayer(me));
  const opponentProgress = useMemo(() => {
    const answers = state.answers[opponentKey];
    const filled = state.categories.filter(
      (category) => (answers[category] ?? "").trim().length > 0,
    ).length;
    return { filled, total: state.categories.length };
  }, [state.answers, opponentKey, state.categories]);

  const myProgress = state.categories.filter(
    (category) => (local[category] ?? "").trim().length > 0,
  ).length;

  return (
    <main className="min-h-[100dvh] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10">
        <ScoreStrip game={game} state={state} me={me} />

        <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.04] py-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            {rolling ? "Buchstabe wird gewürfelt..." : "Euer Buchstabe"}
          </div>
          <div
            className={
              rolling
                ? "mt-2 text-7xl font-black text-slate-500 sm:text-8xl"
                : "mt-2 text-7xl font-black text-teal-300 sm:text-8xl"
            }
          >
            {spinLetter}
          </div>
        </div>

        {!rolling && (
          <>
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <span>
                Du: {myProgress}/{state.categories.length}
              </span>
              <span>
                Gegner: {opponentProgress.filled}/{opponentProgress.total}
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              {state.categories.map((category) => (
                <div key={category} className="flex flex-col gap-1">
                  <label className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {category}
                  </label>
                  <input
                    value={local[category] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setLocal((prev) => ({ ...prev, [category]: value }));
                      debounce(category, () =>
                        onWriteAnswer(category, value),
                      );
                    }}
                    onBlur={() =>
                      onWriteAnswer(category, local[category] ?? "")
                    }
                    placeholder={`${state.letter ?? ""}...`}
                    maxLength={60}
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none focus:border-teal-400/50"
                  />
                </div>
              ))}
            </div>

            <div className="sticky bottom-4 flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={onLeave}
                className="rounded-2xl border border-white/10 bg-[#04100f]/90 px-6 py-3 text-sm text-slate-400 hover:border-white/30 hover:text-white sm:w-36"
              >
                Verlassen
              </button>
              <button
                type="button"
                onClick={onStop}
                className="flex-1 rounded-2xl btn-glow bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-lg font-black text-slate-950 transition hover:brightness-110"
              >
                🛑 Stopp!
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
