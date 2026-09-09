"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createGameRoom,
  fetchGame,
  joinGameRoom,
  saveState,
  subscribeToGame,
  withLatestState,
  writeAnswerField,
} from "@/lib/firebase/games";
import {
  addCategory,
  callStop,
  createCategoryState,
  endGame,
  isGameState,
  nextRound,
  removeCategory,
  startFirstRound,
  toggleInvalid,
} from "@/lib/game/state";
import type { GameRow, Player } from "@/lib/game/types";
import { playerKey } from "@/lib/game/types";

export type Screen = "home" | "create" | "join" | "lobby" | "game";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Buendelt alles, was mit der Partie zu tun hat: Verbindung,
 * Live-Updates und die Aktionen der Spieler. Die Komponenten
 * bekommen daraus fertige Funktionen und muessen weder Supabase
 * noch die Spielregeln kennen.
 */
export function useGameRoom() {
  const [menuScreen, setScreen] = useState<Screen>("home");
  const [game, setGame] = useState<GameRow | null>(null);
  const [playerNumber, setPlayerNumber] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const gameId = game?.id ?? null;

  const state = useMemo(
    () => (game && isGameState(game.game_state) ? game.game_state : null),
    [game],
  );

  const isHost = playerNumber === 1;

  // Sobald eine Partie verbunden ist, bestimmt deren Status den
  // Bildschirm - abgeleitet statt gespeichert, damit beide Geraete
  // nie auseinanderlaufen koennen.
  const screen: Screen = game
    ? game.status === "playing" || game.status === "finished"
      ? "game"
      : "lobby"
    : menuScreen;

  // --- Live-Verbindung ------------------------------------------------

  useEffect(() => {
    if (!gameId) {
      return;
    }

    return subscribeToGame(gameId, setGame);
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    const refresh = () => {
      if (document.visibilityState === "visible") {
        void fetchGame(gameId).then((row) => {
          if (row) {
            setGame(row);
          }
        });
      }
    };

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [gameId]);

  // --- Aktionen ---------------------------------------------------------

  const createRoom = useCallback(async (rawName: string) => {
    const playerName = rawName.trim();

    if (!playerName) {
      setError("Bitte gib deinen Namen ein.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const row = await createGameRoom(playerName);
      setGame(row);
      setPlayerNumber(1);
      setScreen("lobby");
    } catch (err) {
      setError(errorMessage(err, "Spiel konnte nicht erstellt werden."));
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (rawName: string, rawCode: string) => {
    const playerName = rawName.trim();
    const code = rawCode.trim().toUpperCase();

    if (!playerName) {
      setError("Bitte gib deinen Namen ein.");
      return;
    }

    if (!code) {
      setError("Bitte gib den Spielcode ein.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const row = await joinGameRoom(code, playerName);
      setGame(row);
      setPlayerNumber(2);
      setScreen("lobby");
    } catch (err) {
      setError(errorMessage(err, "Beitreten hat nicht funktioniert."));
    } finally {
      setLoading(false);
    }
  }, []);

  const startMatch = useCallback(async () => {
    if (!game || !game.player2_name || !isHost) {
      return;
    }

    setLoading(true);

    try {
      setGame(await saveState(game.id, createCategoryState(), "playing"));
    } catch (err) {
      setError(errorMessage(err, "Spiel konnte nicht gestartet werden."));
    } finally {
      setLoading(false);
    }
  }, [game, isHost]);

  const addCategoryAction = useCallback(
    async (label: string) => {
      if (!gameId) {
        return;
      }

      try {
        const row = await withLatestState(gameId, (latest) =>
          addCategory(latest, label),
        );
        if (row) {
          setGame(row);
        }
      } catch (err) {
        setError(errorMessage(err, "Kategorie konnte nicht hinzugefügt werden."));
      }
    },
    [gameId],
  );

  const removeCategoryAction = useCallback(
    async (label: string) => {
      if (!gameId) {
        return;
      }

      try {
        const row = await withLatestState(gameId, (latest) =>
          removeCategory(latest, label),
        );
        if (row) {
          setGame(row);
        }
      } catch (err) {
        setError(errorMessage(err, "Kategorie konnte nicht entfernt werden."));
      }
    },
    [gameId],
  );

  const startRound = useCallback(async () => {
    if (!gameId || !isHost) {
      return;
    }

    try {
      const row = await withLatestState(gameId, (latest) =>
        startFirstRound(latest),
      );
      if (row) {
        setGame(row);
      }
    } catch (err) {
      setError(errorMessage(err, "Runde konnte nicht gestartet werden."));
    }
  }, [gameId, isHost]);

  const writeAnswer = useCallback(
    async (category: string, text: string) => {
      if (!gameId || !playerNumber) {
        return;
      }

      try {
        // Direktes Feld-Update statt Transaktion - siehe Kommentar
        // bei writeAnswerField. Der Live-Abgleich via
        // subscribeToGame holt die Bestaetigung automatisch nach.
        await writeAnswerField(gameId, playerKey(playerNumber), category, text);
      } catch {
        // Ein einzelner verlorener Tastenanschlag ist kein Drama -
        // der naechste Sync gleicht das automatisch wieder an.
      }
    },
    [gameId, playerNumber],
  );

  const stop = useCallback(async () => {
    if (!gameId || !playerNumber) {
      return;
    }

    try {
      const row = await withLatestState(gameId, (latest) =>
        callStop(latest, playerNumber),
      );
      if (row) {
        setGame(row);
      }
    } catch (err) {
      setError(errorMessage(err, "Stopp konnte nicht gesendet werden."));
    }
  }, [gameId, playerNumber]);

  const toggleAnswerInvalid = useCallback(
    async (target: Player, category: string) => {
      if (!gameId) {
        return;
      }

      try {
        const row = await withLatestState(gameId, (latest) =>
          toggleInvalid(latest, target, category),
        );
        if (row) {
          setGame(row);
        }
      } catch {
        // still - kein Punktestand haengt am ersten Versuch.
      }
    },
    [gameId],
  );

  const advance = useCallback(async () => {
    if (!gameId || !isHost) {
      return;
    }

    try {
      const row = await withLatestState(gameId, (latest) =>
        nextRound(latest),
      );
      if (row) {
        setGame(row);
      }
    } catch (err) {
      setError(errorMessage(err, "Nächste Runde konnte nicht starten."));
    }
  }, [gameId, isHost]);

  const finish = useCallback(async () => {
    if (!gameId || !isHost) {
      return;
    }

    try {
      const row = await withLatestState(
        gameId,
        (latest) => endGame(latest),
        "finished",
      );
      if (row) {
        setGame(row);
      }
    } catch (err) {
      setError(errorMessage(err, "Spiel konnte nicht beendet werden."));
    }
  }, [gameId, isHost]);

  const leave = useCallback(() => {
    setGame(null);
    setPlayerNumber(null);
    setError("");
    setScreen("home");
  }, []);

  return {
    screen,
    setScreen,
    game,
    state,
    playerNumber,
    isHost,
    loading,
    error,
    setError,
    actions: {
      createRoom,
      joinRoom,
      startMatch,
      addCategory: addCategoryAction,
      removeCategory: removeCategoryAction,
      startRound,
      writeAnswer,
      stop,
      toggleAnswerInvalid,
      advance,
      finish,
      leave,
    },
  };
}

export type GameRoom = ReturnType<typeof useGameRoom>;
