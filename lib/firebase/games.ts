"use client";

import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "./client";
import { isGameState } from "@/lib/game/state";
import { STATE_VERSION } from "@/lib/game/constants";
import type {
  GameRow,
  GameState,
  GameStatus,
  WaitingState,
} from "@/lib/game/types";

// Alle Datenbankzugriffe des Spiels liegen in dieser Datei.
// Die Oberflaeche kennt keine Firestore-Aufrufe - das macht
// spaetere Aenderungen zu einer Aenderung an genau einer Stelle.

const COLLECTION = "sld_games";

function asError(err: unknown, fallback: string): Error {
  return err instanceof Error ? err : new Error(fallback);
}

function createRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function toGameRow(id: string, data: DocumentData): GameRow {
  return {
    id,
    code: data.code,
    player1_name: data.player1_name,
    player2_name: data.player2_name ?? null,
    status: data.status,
    game_state: data.game_state,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function fetchGame(id: string): Promise<GameRow | null> {
  const snap = await getDoc(doc(getDb(), COLLECTION, id));

  if (!snap.exists()) {
    return null;
  }

  return toGameRow(snap.id, snap.data());
}

export async function createGameRoom(playerName: string): Promise<GameRow> {
  const waiting: WaitingState = { version: STATE_VERSION, waiting: true };
  const db = getDb();
  const now = new Date().toISOString();
  const ref = doc(collection(db, COLLECTION));

  try {
    await runTransaction(db, async (tx) => {
      tx.set(ref, {
        code: createRoomCode(),
        player1_name: playerName,
        player2_name: null,
        status: "waiting" satisfies GameStatus,
        game_state: waiting,
        created_at: now,
        updated_at: now,
      });
    });
  } catch (err) {
    throw asError(err, "Spiel konnte nicht erstellt werden.");
  }

  const row = await fetchGame(ref.id);

  if (!row) {
    throw new Error("Spiel konnte nicht erstellt werden.");
  }

  return row;
}

export async function joinGameRoom(
  code: string,
  playerName: string,
): Promise<GameRow> {
  const db = getDb();

  const found = await getDocs(
    query(collection(db, COLLECTION), where("code", "==", code), limit(1)),
  );

  if (found.empty) {
    throw new Error("Kein Spiel mit diesem Code gefunden.");
  }

  const ref = found.docs[0].ref;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data();

      if (!data) {
        throw new Error("Kein Spiel mit diesem Code gefunden.");
      }

      if (data.player2_name) {
        throw new Error("Dieses Spiel hat bereits zwei Spieler.");
      }

      tx.update(ref, {
        player2_name: playerName,
        status: "ready" satisfies GameStatus,
        updated_at: new Date().toISOString(),
      });
    });
  } catch (err) {
    throw asError(err, "Beitreten hat nicht funktioniert.");
  }

  const row = await fetchGame(ref.id);

  if (!row) {
    throw new Error("Beitreten hat nicht funktioniert.");
  }

  return row;
}

export async function saveState(
  id: string,
  state: GameState,
  status?: GameStatus,
): Promise<GameRow> {
  const ref = doc(getDb(), COLLECTION, id);

  try {
    await updateDoc(ref, {
      game_state: state,
      ...(status ? { status } : {}),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    throw asError(err, "Spielstand konnte nicht gespeichert werden.");
  }

  const row = await fetchGame(id);

  if (!row) {
    throw new Error("Spielstand konnte nicht gespeichert werden.");
  }

  return row;
}

/** Liest den aktuellen Stand innerhalb einer Firestore-Transaktion,
 *  wendet die Aenderung darauf an und schreibt zurueck. Gibt
 *  `update` null zurueck, passiert nichts - so bleiben doppelt
 *  ausgeloeste Aktionen (zwei Clients, zwei Eingaben gleichzeitig)
 *  folgenlos. Die Transaktion sorgt zusaetzlich dafuer, dass zwei
 *  gleichzeitige Aenderungen sich nicht gegenseitig ueberschreiben. */
export async function withLatestState(
  id: string,
  update: (state: GameState) => GameState | null,
  status?: GameStatus,
): Promise<GameRow | null> {
  const db = getDb();
  const ref = doc(db, COLLECTION, id);
  let changed = false;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    if (!data || !isGameState(data.game_state)) {
      return;
    }

    const next = update(data.game_state);

    if (!next) {
      return;
    }

    tx.update(ref, {
      game_state: next,
      ...(status ? { status } : {}),
      updated_at: new Date().toISOString(),
    });
    changed = true;
  });

  if (!changed) {
    return null;
  }

  return fetchGame(id);
}

export function subscribeToGame(
  id: string,
  onChange: (row: GameRow) => void,
): () => void {
  return onSnapshot(doc(getDb(), COLLECTION, id), (snap) => {
    if (snap.exists()) {
      onChange(toGameRow(snap.id, snap.data()));
    }
  });
}
