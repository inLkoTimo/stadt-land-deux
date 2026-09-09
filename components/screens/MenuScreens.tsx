"use client";

import { useState } from "react";
import type { GameRow } from "@/lib/game/types";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center px-5 py-10 sm:px-6">
        {children}
      </div>
    </main>
  );
}

function ErrorNote({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}

export function HomeScreen({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <main className="min-h-[100dvh] text-white">
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-4xl sm:text-6xl">🗺️ ⚡ 🧭</div>

        <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.3em] text-teal-300 sm:text-sm sm:tracking-[0.35em]">
          Echtzeit-Duell zu zweit
        </div>

        <h1 className="mt-3 text-5xl font-black sm:text-7xl lg:text-8xl text-glow-gradient">
          Stadt, Land, Deux
        </h1>

        <p className="mt-5 max-w-md text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          Buchstabe gewürfelt, eigene Kategorien, beide schreiben
          gleichzeitig.
          <br />
          Wer zuerst fertig ist, ruft Stopp.
        </p>

        <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreate}
            className="flex-1 rounded-2xl btn-glow bg-gradient-to-r from-teal-300 via-white to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-110"
          >
            Spiel erstellen
          </button>

          <button
            type="button"
            onClick={onJoin}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black hover:border-white/30"
          >
            Spiel beitreten
          </button>
        </div>
      </div>
    </main>
  );
}

export function CreateScreen({
  name,
  onNameChange,
  onBack,
  onSubmit,
  loading,
  error,
}: {
  name: string;
  onNameChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <Shell>
      <button
        type="button"
        onClick={onBack}
        className="mb-8 self-start text-sm text-slate-500 hover:text-white"
      >
        ← Zurück
      </button>

      <div className="text-4xl sm:text-5xl">🧭</div>

      <h1 className="mt-4 text-3xl font-black sm:text-4xl">Spiel erstellen</h1>

      <p className="mt-2 text-slate-400">
        Gib deinen Namen ein – danach bekommst du einen Code zum Teilen.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Dein Name"
          maxLength={24}
          autoFocus
          className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg outline-none focus:border-teal-400/50"
        />

        <ErrorNote message={error} />

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-2xl btn-glow bg-gradient-to-r from-teal-300 via-white to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-110 disabled:opacity-50 disabled:grayscale"
        >
          {loading ? "Wird erstellt..." : "Spiel erstellen ⚡"}
        </button>
      </form>
    </Shell>
  );
}

export function JoinScreen({
  name,
  code,
  onNameChange,
  onCodeChange,
  onBack,
  onSubmit,
  loading,
  error,
}: {
  name: string;
  code: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <Shell>
      <button
        type="button"
        onClick={onBack}
        className="mb-8 self-start text-sm text-slate-500 hover:text-white"
      >
        ← Zurück
      </button>

      <div className="text-4xl sm:text-5xl">🗺️</div>

      <h1 className="mt-4 text-3xl font-black sm:text-4xl">Spiel beitreten</h1>

      <p className="mt-2 text-slate-400">Name und Spielcode eingeben.</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Dein Name"
          maxLength={24}
          autoFocus
          className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg outline-none focus:border-amber-400/50"
        />

        <input
          value={code}
          onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          autoCapitalize="characters"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-amber-400/50"
        />

        <ErrorNote message={error} />

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-amber-500/20 px-6 py-4 font-black text-amber-100 ring-1 ring-amber-400/40 disabled:opacity-50"
        >
          {loading ? "Beitritt..." : "Spiel beitreten 🧭"}
        </button>
      </form>
    </Shell>
  );
}

export function LobbyScreen({
  game,
  isHost,
  loading,
  error,
  onStart,
  onLeave,
}: {
  game: GameRow;
  isHost: boolean;
  loading: boolean;
  error: string;
  onStart: () => void;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const ready = Boolean(game.player2_name);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(game.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-[100dvh] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-9">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl">🗺️ ⚡ 🧭</div>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Euer Duell
            </h1>

            <p className="mt-2 text-slate-400">
              {ready
                ? "Beide sind bereit."
                : "Warte auf die zweite Person..."}
            </p>
          </div>

          <div className="mt-7 rounded-3xl bg-black/30 p-5 text-center sm:p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              Spielcode
            </div>

            <div className="mt-2 text-4xl font-black tracking-[0.2em] text-teal-200 sm:text-5xl sm:tracking-[0.25em]">
              {game.code}
            </div>

            <button
              type="button"
              onClick={copyCode}
              className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs hover:border-white/30"
            >
              {copied ? "Kopiert ✓" : "Code kopieren"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-teal-500/10 p-4 sm:p-5">
              <div className="text-xs text-teal-300">Spieler 1</div>

              <div className="mt-1 truncate text-lg font-bold sm:text-xl">
                {game.player1_name}
              </div>
            </div>

            <div className="rounded-2xl bg-amber-500/10 p-4 sm:p-5">
              <div className="text-xs text-amber-300">Spieler 2</div>

              <div className="mt-1 truncate text-lg font-bold sm:text-xl">
                {game.player2_name ?? "Warte..."}
              </div>
            </div>
          </div>

          <ErrorNote message={error} />

          {isHost ? (
            <button
              type="button"
              disabled={!ready || loading}
              onClick={onStart}
              className="mt-6 w-full rounded-2xl btn-glow bg-gradient-to-r from-teal-300 via-white to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:brightness-110 disabled:opacity-40 disabled:grayscale"
            >
              {ready ? "Kategorien auswählen 🗺️" : "Warte auf Spieler 2..."}
            </button>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm text-slate-400">
              {game.player1_name} startet das Spiel.
            </div>
          )}

          <button
            type="button"
            onClick={onLeave}
            className="mt-3 w-full rounded-2xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:border-white/30 hover:text-white"
          >
            Verlassen
          </button>
        </div>
      </div>
    </main>
  );
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-pulse text-5xl">🧭</div>
        <div className="mt-4 text-lg font-black">{label}</div>
      </div>
    </main>
  );
}
