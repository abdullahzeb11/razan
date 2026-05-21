import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(8).max(1000),
});

// Naive in-memory rate limit (per cold start). Swap to Upstash in production —
// see UPSTASH_REDIS_REST_URL in .env.example.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 5;

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // Persist via Prisma in turn 2 (model: ContactMessage already designed).
  // For now we accept the message and let the WhatsApp admin alert hook fire.
  console.log("[contact] new message", parsed.data);

  return NextResponse.json({ ok: true });
}
