import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildChatSystemPrompt } from "@/lib/chat-system-prompt";
import { checkRate, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  locale: z.enum(["ar", "en"]).optional(),
  messages: z.array(messageSchema).min(1).max(20),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "chat_offline", message: "AI chat is not configured." },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const rate = checkRate(ip);
  if (!rate.ok) {
    return Response.json(
      { error: "rate_limited", retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Trim to last 12 turns to bound prompt size.
  const trimmed = parsed.messages.slice(-12);
  if (trimmed[0]?.role !== "user") {
    return Response.json(
      { error: "invalid_request", detail: "First message must be user." },
      { status: 400 },
    );
  }

  const systemPrompt = await buildChatSystemPrompt();
  const localeNote =
    parsed.locale === "en"
      ? "\n\n# Current visitor context\n\nThe visitor is browsing the English site. Default to English unless they write in Arabic."
      : "\n\n# Current visitor context\n\nThe visitor is browsing the Arabic site. Default to Arabic unless they write in English.";

  const client = new Anthropic();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const messageStream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 1024,
          thinking: { type: "disabled" },
          system: systemPrompt + localeNote,
          messages: trimmed.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        messageStream.on("text", (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });

        await messageStream.finalMessage();
        controller.close();
      } catch (err) {
        console.error("chat stream error", err);
        controller.enqueue(
          encoder.encode("\n\n[A connection error interrupted the reply.]"),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
