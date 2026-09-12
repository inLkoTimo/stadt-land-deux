"use client";

import { useEffect, useRef, useState } from "react";
import { REACTIONS } from "@/lib/game/constants";
import type { ChatMessage, Player } from "@/lib/game/types";

export function ChatPanel({
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
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <aside className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1512]">
      <div className="shrink-0 border-b border-white/10 px-4 py-2.5 text-center text-sm font-black text-white">
        💬 Chat
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="pt-6 text-center text-xs text-slate-600">
            Noch keine Nachrichten - schreib was!
          </div>
        )}

        {messages.map((message) => {
          const own = message.player === me;

          return (
            <div
              key={message.id}
              className={own ? "text-right" : "text-left"}
            >
              <div className="mb-1 text-[10px] text-slate-500">
                {message.player === 1 ? player1Name : player2Name}
              </div>

              <div
                className={[
                  "inline-block max-w-[90%] break-words rounded-2xl px-3 py-2 text-sm",
                  own
                    ? "bg-teal-500/25 text-teal-100"
                    : "bg-amber-500/15 text-amber-100",
                ].join(" ")}
              >
                {message.text}
              </div>
            </div>
          );
        })}

        <div ref={bottom} />
      </div>

      <div className="shrink-0 border-t border-white/10 p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) {
              onSend(text);
              setText("");
            }
          }}
          className="flex gap-2"
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Nachricht..."
            maxLength={120}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-400/50"
          />

          <button
            type="submit"
            aria-label="Nachricht senden"
            className="rounded-xl bg-gradient-to-r from-teal-400 to-amber-400 px-3 text-lg text-slate-950 hover:brightness-110"
          >
            ➤
          </button>
        </form>

        <div className="mt-2 flex flex-wrap gap-1">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSend(emoji, "reaction")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-base hover:bg-white/10"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
