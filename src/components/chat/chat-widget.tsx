"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, RotateCcw, Sparkles } from "lucide-react";
import { useChat } from "./use-chat";
import { ChatThread } from "./chat-thread";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const t = useTranslations("Chat");
  const locale = useLocale() as "ar" | "en";
  const [open, setOpen] = React.useState(false);
  const { messages, status, errorCode, send, stop, reset } = useChat({ locale });

  const starters = [
    t("starter1"),
    t("starter2"),
    t("starter3"),
    t("starter4"),
  ];

  const errorText =
    errorCode === "rate_limited"
      ? t("errorRateLimit")
      : errorCode === "chat_offline"
        ? t("errorOffline")
        : t("errorGeneric");

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold text-foreground">
          {t("greetingTitle")}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("greetingBody")}
        </p>
      </div>
      <div className="flex w-full flex-col gap-1.5">
        {starters.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => send(s)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-start text-xs text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Floating launcher — sits above the WhatsApp float */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        initial={{ opacity: 0, scale: 0.8, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 22 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "fixed bottom-[88px] end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_-6px_hsl(var(--primary-deep)/0.55)] ring-4 ring-primary/20 transition-shadow hover:shadow-[0_16px_36px_-6px_hsl(var(--primary-deep)/0.6)]",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={t("title")}
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="fixed bottom-[160px] end-5 z-40 flex w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-primary-deep/15 sm:bottom-[164px] sm:end-5 max-h-[min(640px,calc(100vh-200px))]"
          >
            {/* Header */}
            <header className="flex items-center justify-between gap-2 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {t("title")}
                  </p>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    {t("subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={reset}
                    aria-label={t("reset")}
                    title={t("reset")}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("close")}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <ChatThread
              messages={messages}
              locale={locale}
              errorText={errorText}
              emptyState={emptyState}
            />

            <ChatInput
              onSend={send}
              onStop={stop}
              disabled={status === "streaming"}
              streaming={status === "streaming"}
              placeholder={t("placeholder")}
              sendLabel={t("send")}
              stopLabel={t("stop")}
              locale={locale}
            />

            <footer className="border-t border-border bg-card/40 px-4 py-2">
              <p className="text-center text-[10px] text-muted-foreground">
                {t("disclaimer")}
              </p>
            </footer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
