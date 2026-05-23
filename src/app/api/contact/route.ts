import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { escapeHtml, emailShell, sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  phone: z
    .string()
    .min(8, "Phone number is too short")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Phone number looks invalid"),
  email: z
    .string()
    .email("Email looks invalid")
    .optional()
    .or(z.literal("")),
  message: z.string().min(8, "Message is too short").max(1000),
});

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

async function sendContactEmail(data: {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}) {
  const body = `
<table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
  <tr><td style="padding:6px 0; color:#666; width:96px;">From</td><td style="padding:6px 0;"><strong>${escapeHtml(data.name)}</strong></td></tr>
  <tr><td style="padding:6px 0; color:#666;">Phone</td><td style="padding:6px 0;"><a href="tel:${escapeHtml(data.phone)}" style="color:#0E6E5A; text-decoration:none;">${escapeHtml(data.phone)}</a></td></tr>
  ${data.email ? `<tr><td style="padding:6px 0; color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#0E6E5A; text-decoration:none;">${escapeHtml(data.email)}</a></td></tr>` : ""}
  <tr><td style="padding:6px 0; color:#666;">Ref</td><td style="padding:6px 0; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:#888;">${escapeHtml(data.id)}</td></tr>
</table>
<div style="border-left:3px solid #C9A961; background:#fafaf7; padding:14px 16px; border-radius:6px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(data.message)}</div>`;

  await sendEmail({
    subject: `New website message from ${data.name}`,
    html: emailShell({
      eyebrow: "Contact form",
      title: "New message from the website",
      bodyHtml: body,
    }),
    replyTo: data.email || undefined,
  });
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

  const { name, phone, email, message } = parsed.data;

  const record = await prisma.contactMessage.create({
    data: {
      name,
      phone,
      email: email || null,
      message,
      source: "landing",
    },
    select: { id: true },
  });

  // Fire-and-forget email; don't block the response on it.
  void sendContactEmail({
    id: record.id,
    name,
    phone,
    email: email || "",
    message,
  });

  return NextResponse.json({ ok: true, id: record.id });
}
