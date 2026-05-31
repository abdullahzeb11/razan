"use client";

import * as React from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
  error?: boolean;
};

type Status = "idle" | "streaming" | "error";

const STORAGE_KEY = "razan.chat.v1";
const MAX_PERSIST_MESSAGES = 24;

function makeId() {
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}

export function useChat({ locale }: { locale: "ar" | "en" }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const hydratedRef = React.useRef(false);

  // Hydrate from localStorage once on mount.
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.messages)) {
        setMessages(
          parsed.messages.filter(
            (m: unknown): m is ChatMessage =>
              typeof m === "object" &&
              m !== null &&
              "role" in m &&
              "content" in m,
          ),
        );
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist after every change (debounced via micro-task).
  React.useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const slim = messages.slice(-MAX_PERSIST_MESSAGES).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: slim }));
    } catch {
      // storage might be full / disabled
    }
  }, [messages]);

  const send = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "streaming") return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
      };
      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: "",
        pending: true,
      };

      // Build the messages payload from the *current* state plus the new user
      // turn (don't rely on the post-setState `messages` here — it's stale).
      const payload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStatus("streaming");
      setErrorCode(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale, messages: payload }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, pending: false, error: true, content: "" }
                : m,
            ),
          );
          setErrorCode(err.error ?? "unknown");
          setStatus("error");
          return;
        }

        if (!res.body) throw new Error("no_body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: acc, pending: true }
                : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, pending: false } : m,
          ),
        );
        setStatus("idle");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, pending: false } : m,
            ),
          );
          setStatus("idle");
          return;
        }
        console.error(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, pending: false, error: true, content: "" }
              : m,
          ),
        );
        setErrorCode("network");
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [messages, status, locale],
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("idle");
    setErrorCode(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { messages, status, errorCode, send, stop, reset };
}
