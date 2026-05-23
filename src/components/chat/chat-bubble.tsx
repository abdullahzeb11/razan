"use client";

import * as React from "react";
import { Link as I18nLink } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./use-chat";

/**
 * Minimal markdown-ish renderer for chat replies.
 * Supports: **bold**, paragraph breaks, bullet lists, in-app links to /ar/book and /en/book.
 * No HTML parsing — we tokenize the model output and emit React nodes only.
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match **bold**, /(ar|en)/(book|blog|account)... in-app links, and external URLs.
  const re =
    /(\*\*[^*]+\*\*)|(\/(?:ar|en)\/(?:book|blog|account)[a-zA-Z0-9/_-]*)|(\bhttps?:\/\/[^\s)]+)/g;
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(re)) {
    const idx = match.index!;
    if (idx > last) nodes.push(text.slice(last, idx));
    const [whole, bold, internal, external] = match;
    if (bold) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {bold.slice(2, -2)}
        </strong>,
      );
    } else if (internal) {
      // Strip the locale prefix — i18n Link adds it back.
      const stripped = internal.replace(/^\/(ar|en)/, "");
      nodes.push(
        <I18nLink
          key={key++}
          href={stripped || "/"}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
        >
          {internal}
        </I18nLink>,
      );
    } else if (external) {
      nodes.push(
        <a
          key={key++}
          href={external}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
        >
          {external}
        </a>,
      );
    }
    last = idx + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderBody(text: string): React.ReactNode {
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs.map((para, i) => {
    const lines = para.split("\n").filter(Boolean);
    const allBullets =
      lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
    if (allBullets) {
      return (
        <ul key={i} className="space-y-1 ps-5 [&>li]:list-disc">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^\s*[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="whitespace-pre-line">
        {renderInline(para)}
      </p>
    );
  });
}

export function ChatBubble({
  message,
  locale,
  errorText,
}: {
  message: ChatMessage;
  locale: "ar" | "en";
  errorText?: string;
}) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isStreamingEmpty =
    isAssistant && message.pending && !message.content && !message.error;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        locale === "ar" ? "" : "",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-ee-md bg-primary text-primary-foreground"
            : "rounded-es-md bg-secondary text-foreground",
          message.error && "border border-destructive/30 bg-destructive/5 text-destructive",
        )}
      >
        {isStreamingEmpty ? (
          <span className="inline-flex items-center gap-1.5 py-1">
            <Dot delay={0} />
            <Dot delay={150} />
            <Dot delay={300} />
          </span>
        ) : message.error ? (
          <span>{errorText ?? "Something went wrong."}</span>
        ) : (
          <div className="space-y-3">{renderBody(message.content)}</div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="block h-1.5 w-1.5 animate-chat-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
