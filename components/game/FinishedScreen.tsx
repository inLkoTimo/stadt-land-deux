"use client";

import { winner } from "@/lib/game/state";
import type { GameRow, GameState } from "@/lib/game/types";

export function FinishedScreen({
  game,
  state,
  onLeave,
}: {
  game: GameRow;
  state: GameState;
  onLeave: () => void;
}) {
  const result = winner(state);
  const winnerName =
    result === "draw"
      ? null
      : result === 1
        ? game.player1_name
        : game.player2_name;

  return (
    <main className="min-h-[100dvh] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center px-5 py-10 text-center">
        <div className="text-6xl">{result === "draw" ? "🤝" : "🏆"}</div>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          {result === "draw" ? "Unentschieden!" : `${winnerName} gewinnt!`}
        </h1>

        <div className="mt-8 flex w-full items-center justify-around rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-teal-300">
              {game.player1_name}
            </div>
            <div className="mt-1 text-4xl font-black">
              {state.scores.player1}
            </div>
          </div>
          <div className="text-2xl text-slate-600">:</div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
              {game.player2_name}
            </div>
            <div className="mt-1 text-4xl font-black">
              {state.scores.player2}
            </div>
          </div>
        </div>

        {state.history.length > 0 && (
          <div className="mt-6 w-full space-y-2 text-left">
            <div className="px-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              Rundenverlauf
            </div>
            {state.history.map((round) => (
              <div
                key={round.round}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2 text-sm"
              >
                <span className="text-slate-400">
                  Runde {round.round} · {round.letter}
                </span>
                <span className="font-bold text-teal-300">
                  +{round.roundPoints1}
                </span>
                <span className="font-bold text-amber-300">
                  +{round.roundPoints2}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onLeave}
          className="mt-8 w-full rounded-2xl btn-glow bg-gradient-to-r from-teal-300 via-white to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-110"
        >
          Neues Spiel
        </button>
      </div>
    </main>
  );
}
