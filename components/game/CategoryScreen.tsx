"use client";

import { useMemo, useState } from "react";
import { CATEGORY_SUGGESTIONS, MIN_CATEGORIES } from "@/lib/game/constants";
import { canStartFirstRound } from "@/lib/game/state";
import type { GameState } from "@/lib/game/types";

export function CategoryScreen({
  state,
  isHost,
  loading,
  onAdd,
  onRemove,
  onStart,
  onLeave,
}: {
  state: GameState;
  isHost: boolean;
  loading: boolean;
  onAdd: (label: string) => void;
  onRemove: (label: string) => void;
  onStart: () => void;
  onLeave: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [custom, setCustom] = useState("");

  const chosen = new Set(state.categories.map((item) => item.toLowerCase()));

  const suggestions = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) {
      return CATEGORY_SUGGESTIONS;
    }
    return CATEGORY_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(query),
    );
  }, [filter]);

  const canStart = canStartFirstRound(state);

  const addCustom = () => {
    const label = custom.trim();
    if (!label) {
      return;
    }
    onAdd(label);
    setCustom("");
  };

  return (
    <main className="min-h-[100dvh] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <div className="text-center">
          <div className="text-3xl">🗺️</div>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            Kategorien auswählen
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Mindestens {MIN_CATEGORIES} - beide können hinzufügen und
            entfernen.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-300">
            Ausgewählt ({state.categories.length})
          </div>

          {state.categories.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Noch keine Kategorie ausgewählt.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {state.categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onRemove(category)}
                  className="group flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1.5 text-sm font-semibold text-teal-100 ring-1 ring-teal-400/30 hover:bg-red-500/15 hover:text-red-100 hover:ring-red-400/30"
                  title="Entfernen"
                >
                  {category}
                  <span className="text-teal-300/60 group-hover:text-red-300">
                    ✕
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <input
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Eigene Kategorie eintippen..."
              maxLength={40}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-teal-400/50"
            />
            <button
              type="button"
              onClick={addCustom}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-teal-100"
            >
              + Hinzufügen
            </button>
          </div>
        </div>

        <div className="mt-4 flex-1 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
              100 Vorschläge
            </div>
          </div>

          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Vorschläge durchsuchen..."
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-white/30"
          />

          <div className="mt-4 flex max-h-80 flex-wrap gap-2 overflow-y-auto pr-1 sm:max-h-96">
            {suggestions.map((label) => {
              const active = chosen.has(label.toLowerCase());
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => (active ? onRemove(label) : onAdd(label))}
                  className={
                    active
                      ? "rounded-full bg-teal-500 px-3 py-1.5 text-sm font-semibold text-slate-950"
                      : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:border-white/30"
                  }
                >
                  {active ? "✓ " : "+ "}
                  {label}
                </button>
              );
            })}

            {suggestions.length === 0 ? (
              <p className="text-sm text-slate-500">Nichts gefunden.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onLeave}
            className="rounded-2xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:border-white/30 hover:text-white sm:w-40"
          >
            Verlassen
          </button>

          {isHost ? (
            <button
              type="button"
              disabled={!canStart || loading}
              onClick={onStart}
              className="flex-1 rounded-2xl btn-glow bg-gradient-to-r from-teal-300 via-white to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-110 disabled:opacity-40 disabled:grayscale"
            >
              {canStart
                ? "Runde 1 starten ⚡"
                : `Noch ${Math.max(
                    0,
                    MIN_CATEGORIES - state.categories.length,
                  )} Kategorie(n) fehlen`}
            </button>
          ) : (
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm text-slate-400">
              Wartet, bis Spieler 1 startet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
