"use client";

import { useMemo } from "react";
import { scoreRound } from "@/lib/game/state";
import type { GameRow, GameState, Player } from "@/lib/game/types";
import { playerKey } from "@/lib/game/types";

function AnswerCell({
  text,
  points,
  valid,
  accent,
  onToggleInvalid,
}: {
  text: string;
  points: number;
  valid: boolean;
  accent: "teal" | "amber";
  onToggleInvalid: () => void;
}) {
  const empty = text.trim().length === 0;
  const color = accent === "teal" ? "text-teal-200" : "text-amber-200";

  return (
    <div className="flex flex-1 items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2">
      <span
        className={
          empty
            ? "italic text-slate-600"
            : valid
              ? `font-semibold ${color}`
              : "text-slate-500 line-through"
        }
      >
        {empty ? "—" : text}
      </span>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">+{points}</span>
        {!empty && (
          <button
            type="button"
            onClick={onToggleInvalid}
            title={valid ? "Als ungültig markieren" : "Wieder gültig machen"}
            className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-400 hover:border-white/30 hover:text-white"
          >
            {valid ? "ungültig?" : "gültig machen"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ScoringScreen({
  game,
  state,
  me,
  isHost,
  onToggleInvalid,
  onAdvance,
  onFinish,
  onLeave,
}: {
  game: GameRow;
  state: GameState;
  me: Player;
  isHost: boolean;
  onToggleInvalid: (target: Player, category: string) => void;
  onAdvance: () => void;
  onFinish: () => void;
  onLeave: () => void;
}) {
  const letter = state.letter ?? "";

  const result = useMemo(
    () => scoreRound(state.categories, letter, state.answers, state.invalid),
    [state.categories, letter, state.answers, state.invalid],
  );

  const stoppedByName =
    state.stoppedBy === 1 ? game.player1_name : game.player2_name;

  return (
    <main className="min-h-[100dvh] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Runde {state.round} beendet - {stoppedByName} hat Stopp gerufen
          </div>
          <h1 className="mt-2 text-4xl font-black text-teal-300">
            Buchstabe {letter}
          </h1>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <span className="font-bold text-teal-300">
            {game.player1_name}: +{result.total1}
          </span>
          <span className="font-bold text-amber-300">
            {game.player2_name}: +{result.total2}
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {state.categories.map((category) => (
            <div
              key={category}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                {category}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <AnswerCell
                  text={state.answers.player1[category] ?? ""}
                  points={result.points.player1[category] ?? 0}
                  valid={!state.invalid.player1.includes(category)}
                  accent="teal"
                  onToggleInvalid={() => onToggleInvalid(1, category)}
                />
                <AnswerCell
                  text={state.answers.player2[category] ?? ""}
                  points={result.points.player2[category] ?? 0}
                  valid={!state.invalid.player2.includes(category)}
                  accent="amber"
                  onToggleInvalid={() => onToggleInvalid(2, category)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onLeave}
            className="rounded-2xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:border-white/30 hover:text-white sm:w-36"
          >
            Verlassen
          </button>

          {isHost ? (
            <>
              <button
                type="button"
                onClick={onAdvance}
                className="flex-1 rounded-2xl btn-glow bg-gradient-to-r from-teal-300 via-white to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-110"
              >
                Nächste Runde ⚡
              </button>
              <button
                type="button"
                onClick={onFinish}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black text-slate-300 hover:border-white/30"
              >
                Spiel beenden
              </button>
            </>
          ) : (
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm text-slate-400">
              {playerKey(me) === "player1"
                ? game.player2_name
                : game.player1_name}{" "}
              entscheidet, wie es weitergeht.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
