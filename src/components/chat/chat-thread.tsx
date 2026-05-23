"use client";

import * as React from "react";
import { ChatBubble } from "./chat-bubble";
import type { ChatMessage } from "./use-chat";

export function ChatThread({
  messages,
  locale,
  errorText,
  emptyState,
}: {
  messages: ChatMessage[];
  locale: "ar" | "en";
  errorText?: string;
  emptyState?: React.ReactNode;
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const lastLengthRef = React.useRef(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = messages.length > lastLengthRef.current;
    lastLengthRef.current = messages.length;
    // Always scroll to bottom on new message; respect user scroll while streaming.
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (grew || nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Re-scroll while the last bubble streams in.
  React.useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last?.pending) return;
    const el = scrollRef.current;
    if (!el) return;
    const id = setInterval(() => {
      el.scrollTo({ top: el.scrollHeight });
    }, 250);
    return () => clearInterval(id);
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      {messages.length === 0 ? (
        emptyState
      ) : (
        messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            locale={locale}
            errorText={errorText}
          />
        ))
      )}
    </div>
  );
}
