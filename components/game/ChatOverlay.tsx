"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "./ChatPanel";
import type { ChatMessage, Player } from "@/lib/game/types";

/**
 * Schwebender Chat-Knopf, der ueber jedem Spielbildschirm liegt -
 * so muss keiner der einzelnen Screens (Kategorien, Schreiben,
 * Auswertung, Ende) selbst ein Chat-Layout kennen. Zeigt eine
 * kleine Zahl an ungelesenen Nachrichten, solange er geschlossen
 * ist.
 */
export function ChatOverlay({
  messages,
  me,
  player1Name,
  player2Name,
  onSend,
}: {
  messages: ChatMessage[];
  me: Player;
  player1Name: string;
  player2Name: string;
  onSend: (text: string, kind?: "chat" | "reaction") => void;
}) {
  const [open, setOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(messages.length);

  useEffect(() => {
    if (open) {
      setSeenCount(messages.length);
    }
  }, [open, messages.length]);

  const unread = open ? 0 : Math.max(0, messages.length - seenCount);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Chat öffnen"
        className="btn-glow fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-300 via-white to-amber-300 text-2xl text-slate-950 shadow-2xl transition hover:brightness-110"
      >
        💬
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-[78dvh] flex-col p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mx-auto sm:w-full sm:max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mx-auto mb-2 w-28 rounded-full bg-white/20 py-1 text-xs text-white"
            >
              schließen
            </button>

            <ChatPanel
              messages={messages}
              me={me}
              player1Name={player1Name}
              player2Name={player2Name}
              onSend={onSend}
            />
          </div>
        </div>
      )}
    </>
  );
}
